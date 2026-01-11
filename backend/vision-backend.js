const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const app = express();
app.use(cors());
app.use(express.json({ limit: '100mb' }));


//Configuration
const PORT = 4000;
const ROBOFLOW_API_KEY = process.env.ROBOFLOW_API_KEY;
const MODEL_ID = process.env.MODEL_ID ;

const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}
function logPrediction(filename,prediction, confidence) {
    const timestamp = new Date().toISOString();
    const logEntry = {
        filename: filename,
        timestamp: timestamp,
        date: timestamp.split('T')[0],
        time: timestamp.split('T')[1].split('.')[0],
        class: prediction,
        confidence: confidence,
        class_simple: prediction.toLowerCase().includes('severe') ? 'severe' :
                      prediction.toLowerCase().includes('moderate') ? 'moderate' :
                      prediction.toLowerCase().includes('mild') ? 'mild' : 'normal'
    };
    
    //Append to CSV file
   const csvLine = `${logEntry.filename},${logEntry.timestamp},${logEntry.class_simple},${logEntry.confidence}\n`;
    const logFile = path.join(logsDir, 'predictions.csv');
    
    //Create header if file doesn't exist
    if (!fs.existsSync(logFile)) {
        fs.writeFileSync(logFile, 'filename,timestamp,class,confidence\n');
    }
    
    // Append new prediction
    fs.appendFileSync(logFile, csvLine);
    
    // Also save as JSON for more detailed analysis
    const jsonFile = path.join(logsDir, 'predictions.json');
    let jsonData = [];
    
    if (fs.existsSync(jsonFile)) {
        const fileContent = fs.readFileSync(jsonFile, 'utf8');
        if (fileContent) {
            jsonData = JSON.parse(fileContent);
        }
    }
    
    jsonData.push(logEntry);
    
    // Keep only last 1000 predictions to avoid huge files
    if (jsonData.length > 1000) {
        jsonData = jsonData.slice(-1000);
    }
    
    fs.writeFileSync(jsonFile, JSON.stringify(jsonData, null, 2));
}



//Main detection endpoint
app.post('/detect', async (req, res) => {
    try {
        let { image, filename } = req.body;

        if (!filename) {
            filename = `upload_${Date.now()}.jpg`;
        }
        
        if (!image) {
            return res.status(400).json({ 
                success: false,
                error: 'No image provided' 
            });
        }

        console.log(`[${new Date().toLocaleTimeString()}] Analyzing image...`);

        //Remove data URI prefix if present
        if (image.includes('base64,')) {
            image = image.split('base64,')[1];
        }

        //Call Roboflow API
        const roboflowUrl = `https://serverless.roboflow.com/${MODEL_ID}`;
        
        try {
            const response = await axios({
                method: 'POST',
                url: roboflowUrl,
                params: {
                    api_key: ROBOFLOW_API_KEY
                },
                data: image,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                timeout: 30000
            });

            console.log('Roboflow response:', JSON.stringify(response.data, null, 2));

        
            let predictions = [];
            let topPrediction = null;
            let confidenceValue = 0;
            
            if (response.data.predictions) {
                for (const [className, conf] of Object.entries(response.data.predictions)) {
                    const confNumber = Number(conf.confidence) || 0;
                    predictions.push({
                        class: className,
                        confidence: confNumber
                    });
                }
                predictions.sort((a, b) => b.confidence - a.confidence);
                topPrediction = predictions[0];
                confidenceValue = topPrediction.confidence;
            }
            else if (response.data.top && response.data.confidence !== undefined) {
                confidenceValue = parseFloat(response.data.confidence) || 0;
                topPrediction = {
                    class: response.data.top,
                    confidence: confidenceValue
                };
                predictions = [topPrediction];
            }
            else {
                topPrediction = {
                    class: 'unknown',
                    confidence: 0
                };
                predictions = [topPrediction];
            }

            //Calculate confidence percentage
            const confidencePercent = Math.round(confidenceValue * 100);
            console.log(`Top class: ${topPrediction.class}, Confidence: ${confidencePercent}%`);
            
            logPrediction(filename, topPrediction.class, confidencePercent);
            //Determine status based on class name
            const className = topPrediction.class.toLowerCase();
            let status = '';
            let riskLevel = '';
            let conditions = [];
            let recommendations = [];
            
            if (className.includes('severe')) {
                status = '🔴 CRITICAL - Severe Malnutrition';
                riskLevel = 'severe';
                conditions = [`Severe malnutrition detected (${confidencePercent}% confidence)`];
                recommendations = [
                    '🚨 SEGERA bawa ke Rumah Sakit',
     
                ];
            } 
            else if (className.includes('moderate')) {
                status = '🟠 WARNING - Moderate Malnutrition';
                riskLevel = 'moderate';
                conditions = [`Moderate malnutrition detected (${confidencePercent}% confidence)`];
                recommendations = [

                ];
            } 
            else if (className.includes('mild')) {
                status = '🟡 CAUTION - Mild Malnutrition';
                riskLevel = 'mild';
                conditions = [`mild malnutrition detected (${confidencePercent}% confidence)`];
                recommendations = [
        
                ];
            } 
            else if (className.includes('normal')) {
                status = '🟢 GOOD - Normal Malnutrition';
                riskLevel = 'normal';
                conditions = [`Normal malnutrition detected (${confidencePercent}% confidence)`];
                recommendations = [
                ];
            }
            

            
            res.json({
                success: true,
                status: status,
                statusColor: riskLevel === 'severe' ? '#F44336' : 
                            riskLevel === 'moderate' ? '#FF9800' :
                            riskLevel === 'mild' ? '#FFC107' : '#4CAF50',
                riskLevel: riskLevel,
                confidence: confidencePercent.toString(), 
                conditions: conditions,
                recommendations: recommendations,
                predictions: [{
                    class: topPrediction.class,
                    confidence: confidenceValue
                }],
                totalDetections: 1,
                isEmergency: riskLevel === 'severe'
            });

        } catch (error) {
            console.error('Roboflow Error:', error.message);
            
    
            return res.json({
                success: true,
                status: 'Test Mode',
                statusColor: '#2196F3',
                riskLevel: 'low',
                confidence: '0',
                conditions: ['Unable to analyze - using test mode'],
                recommendations: ['Please try again'],
                predictions: [{
                    class: 'test',
                    confidence: 0
                }],
                totalDetections: 0,
                isEmergency: false
            });
        }

    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({
            success: false,
            error: 'Analysis failed'
        });
    }
});

//Health check
app.get('/', (req, res) => {
    res.json({
        status: 'online',
        service: 'Vision Backend',
        port: PORT
    });
});

//Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`
✅ Vision Server Running
📍 http://localhost:${PORT}

Confidence parsing: FIXED ✓
NaN issue: RESOLVED ✓
    `);
});