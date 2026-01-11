import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
  Modal,
  Platform,
  SafeAreaView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';


const VISION_BACKEND_URL = __DEV__ 
  ? 'http://192.168.101.5:4000'  
  : 'https://your-production-url.com';

export default function ScanScreen() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [showImageOptions, setShowImageOptions] = useState(false);

  // Request permissions on mount
  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    try {
      // Request camera permission
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraPermission.status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Camera permission is needed to take photos'
        );
      }

      // Request media library permission
      const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (mediaPermission.status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Media library permission is needed to select photos'
        );
      }
    } catch (error) {
      console.log('Permission error:', error);
    }
  };

  // Convert image to base64
  const imageToBase64 = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result.split(',')[1];
          resolve(base64data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting to base64:', error);
      return null;
    }
  };

  const openCamera = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.status !== 'granted') {
        Alert.alert('Permission Denied', 'You need to grant camera permission');
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        base64: true, 
      });

      console.log('Camera result:', result);

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        
        setSelectedImage({
          uri: asset.uri,
          base64: asset.base64,
          width: asset.width,
          height: asset.height,
        });
        
        setShowImageOptions(false);
        
      
        if (asset.base64) {
          setTimeout(() => analyzeImage(asset.base64), 500);
        } else {
          // If no base64, convert from URI
          const base64 = await imageToBase64(asset.uri);
          if (base64) {
            setTimeout(() => analyzeImage(base64), 500);
          }
        }
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Camera Error', 'Failed to open camera');
    }
  };

  const openGallery = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.status !== 'granted') {
        Alert.alert('Permission Denied', 'You need to grant media library permission');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        base64: true, 
      });

      console.log('Gallery result:', result);

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        
        setSelectedImage({
          uri: asset.uri,
          base64: asset.base64,
          width: asset.width,
          height: asset.height,
        });
        
        setShowImageOptions(false);
        
        if (asset.base64) {
          setTimeout(() => analyzeImage(asset.base64), 500);
        } else {
          // If no base64, convert from URI
          const base64 = await imageToBase64(asset.uri);
          if (base64) {
            setTimeout(() => analyzeImage(base64), 500);
          }
        }
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Gallery Error', 'Failed to open gallery');
    }
  };
  const filename = selectedImage?.uri?.split('/').pop() || "unknown.jpg";
  // Analyze image with Vision Backend
  const analyzeImage = async (base64Image) => {
    if (!base64Image) {
      Alert.alert('Error', 'No image data available');
      return;
    }

    setIsAnalyzing(true);
    setResults(null);

    try {
      console.log('Analyzing image with vision backend...');
      
      //call vision backend
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const response = await fetch(`${VISION_BACKEND_URL}/detect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
        image: `data:image/jpeg;base64,${base64Image}`,
        filename: filename
      }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Analysis complete');
      
      // Process results
      const processedResults = processAnalysisResults(data);
      setResults(processedResults);
      setShowResults(true);


    } catch (error) {
      console.error('Analysis error:', error.message);
      
      // Use mock results if backend not available
      console.log('Using mock results for testing');
      const mockResults = getMockResults();
      setResults(mockResults);
      setShowResults(true);
      
      if (!error.message.includes('abort')) {
        Alert.alert(
          'Info',
          'Vision backend not connected. Showing test results.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Process analysis results from backend
  const processAnalysisResults = (data) => {
    const { 
      predictions = [], 
      status = 'Unknown', 
      riskLevel = 'unknown', 
      conditions = [] 
    } = data;
    
    let processedStatus = 'Normal';
    let statusColor = '#4CAF50';
    let isEmergency = false;
    let recommendations = [];

    // Process based on risk level
    switch(riskLevel) {
      case 'severe':
        processedStatus = 'Needs Immediate Attention';
        statusColor = '#F44336';
        recommendations = [
          '• Your child needs medical attention as soon as possible',
          '• Visit the nearest hospital or healthcare facility',
          '• Do not delay treatment'
        ];
        break;
      
      case 'moderate':
        processedStatus = 'Further Examination Needed';
        statusColor = '#FF9800';
        recommendations = [
          '• It is recommended to consult a healthcare professional',
          '• The child needs additional nutritional intake',
          '• Monitor the child’s condition regularly'
        ];
        break;
      
      case 'mild':
        processedStatus = 'Monitoring Needed';
        statusColor = '#FFC107';
        recommendations = [
          '• The child’s growth should be monitored regularly',
          '• Perform regular weight and height measurements',
          '• Pay attention to diet and nutritional variety'
        ];
        break;
      
      default:
        processedStatus = 'Healthy Growth';
        statusColor = '#4CAF50';
        recommendations = [
          '• Maintain a balanced diet',
          '• Continue regular monitoring',
          '• Keep supporting the child with adequate nutrition'
        ];
    }


    // Calculate confidence
    let confidence = 0;
    if (predictions.length > 0) {
      const totalConf = predictions.reduce((sum, p) => sum + (p.confidence || 0), 0);
      confidence = totalConf / predictions.length;
    }

    return {
      status: processedStatus,
      statusColor,
      isEmergency,
      confidence: (confidence * 100).toFixed(1),
      conditions: conditions || [],
      recommendations,
      predictions: predictions.slice(0, 5),
      totalDetections: predictions.length,
    };
  };

  // Get mock results for testing
  const getMockResults = () => {
    const mockConditions = [
      'Normal growth pattern',
      'No signs of malnutrition detected',
      'MUAC in green zone'
    ];
    return {
      status: 'Test Mode - Sample Results',
      statusColor: '#2196F3',
      isEmergency: false,
      confidence: '85.5',
      conditions: mockConditions,
      recommendations: [
        '📝 Ini adalah data test',
        '• Vision backend belum terhubung',
        '• Menggunakan sample data untuk testing',
        '• Hubungkan backend untuk analisis real'
      ],
      predictions: [
        { class: 'normal', confidence: 0.855 },
        { class: 'healthy', confidence: 0.923 },
      ],
      totalDetections: 2,
    };
  };



  // Clear selection
  const clearImage = () => {
    setSelectedImage(null);
    setResults(null);
    setShowResults(false);
  };

  // Retake photo
  const retakePhoto = () => {
    clearImage();
    setShowImageOptions(true);
  };

  // Save results
  const saveResults = () => {
    Alert.alert(
      'Berhasil',
      'Hasil analisis telah disimpan!',
      [{ text: 'OK', onPress: () => setShowResults(false) }]
    );
  };

  // Main UI Render
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        {/* Header */}
        <View style={styles.header}>
          <Icon name="camera-alt" size={28} color="#4CAF50" />
          <Text style={styles.headerTitle}>Malnutrition Scanner</Text>
        </View>

        {/* Instructions */}
        {!selectedImage && (
          <View style={styles.instructionsCard}>
            <Text style={styles.instructionsTitle}>How To Use:</Text>
            <Text style={styles.instructionsText}>
              1. Take a photo of the child{'\n'}
              2. Make sure the lighting is sufficient{'\n'}
              3. Avoid shadows covering the body{'\n'}
              4. The AI will analyze signs of malnutrition
            </Text>
          </View>
        )}

        {/* Image Display or Upload Button */}
        {selectedImage ? (
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: selectedImage.uri }} 
              style={styles.image}
              resizeMode="cover"
            />
            
            {/* Analyzing Overlay */}
            {isAnalyzing && (
              <View style={styles.analyzingOverlay}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.analyzingText}>Analyzing image...</Text>
                <Text style={styles.analyzingSubtext}>Detecting signs of malnutrition</Text>
              </View>
            )}

            {/* Action Buttons */}
            {!isAnalyzing && (
              <View style={styles.imageActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.retakeButton]}
                  onPress={retakePhoto}
                >
                  <Icon name="refresh" size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>Retake</Text>
                </TouchableOpacity>

                {selectedImage.base64 && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.analyzeButton]}
                    onPress={() => analyzeImage(selectedImage.base64)}
                  >
                    <Icon name="search" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>Re-analyze</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        ) : (
          // Upload Button
          <View style={styles.uploadContainer}>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => setShowImageOptions(true)}
            >
              <Icon name="add-a-photo" size={60} color="#4CAF50" />
              <Text style={styles.uploadText}>Tap to Scan the Child</Text>
              <Text style={styles.uploadSubtext}>Take a photo or choose from the gallery</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Info Cards */}
        <View style={styles.infoCards}>
          <View style={styles.infoCard}>
            <Icon name="info" size={24} color="#2196F3" />
            <Text style={styles.infoCardTitle}>What We Detect:</Text>
            <Text style={styles.infoCardText}>
              • Malnutrition signs
            </Text>
          </View>
        </View>

      </ScrollView>

      {/* Image Source Selection Modal */}
      <Modal
        visible={showImageOptions}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowImageOptions(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowImageOptions(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Image Source</Text>
            
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => {
                setShowImageOptions(false);
                setTimeout(openCamera, 300);
              }}
            >
              <Icon name="camera-alt" size={24} color="#4CAF50" />
              <Text style={styles.optionText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => {
                setShowImageOptions(false);
                setTimeout(openGallery, 300);
              }}
            >
              <Icon name="photo-library" size={24} color="#4CAF50" />
              <Text style={styles.optionText}>Choose From Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionButton, styles.cancelButton]}
              onPress={() => setShowImageOptions(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Results Modal */}
      {results && (
        <Modal
          visible={showResults}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowResults(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, styles.resultsModal]}>
              <ScrollView showsVerticalScrollIndicator={false}>
                
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Analysis Results</Text>
                  <TouchableOpacity onPress={() => setShowResults(false)}>
                    <Icon name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>

                {/* Status Card */}
                <View style={[styles.statusCard, { backgroundColor: results.statusColor + '20' }]}>
                  <Text style={[styles.statusText, { color: results.statusColor }]}>
                    {results.status}
                  </Text>
                  <Text style={styles.confidenceText}>
                    Confidence: {results.confidence}%
                  </Text>
                  {results.totalDetections > 0 && (
                    <Text style={styles.detectionsText}>
                      Detected: {results.totalDetections} conditions
                    </Text>
                  )}
                </View>

                {/* Conditions Section */}
                {results.conditions && results.conditions.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Detected Conditions:</Text>
                    {results.conditions.map((condition, index) => (
                      <View key={index} style={styles.conditionItem}>
                        <Icon 
                          name={results.isEmergency ? "warning" : "info"} 
                          size={18} 
                          color={results.isEmergency ? "#FF5252" : "#FF9800"} 
                        />
                        <Text style={styles.conditionText}>{condition}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Recommendations Section */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Recommendations:</Text>
                  {results.recommendations.map((rec, index) => (
                    <Text key={index} style={styles.recommendationText}>
                      {rec}
                    </Text>
                  ))}
                </View>

                {/* Action Buttons */}
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.retakeButton]}
                    onPress={retakePhoto}
                  >
                    <Icon name="camera-alt" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>Retake Photo</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.saveButton]}
                    onPress={saveResults}
                  >
                    <Icon name="save" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>

              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

    </SafeAreaView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  instructionsCard: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 15,
    borderRadius: 10,
    elevation: 2,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  instructionsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  uploadContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 250,
  },
  uploadButton: {
    backgroundColor: '#fff',
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderStyle: 'dashed',
  },
  uploadText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
  },
  uploadSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  imageContainer: {
    margin: 15,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 300,
  },
  analyzingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyzingText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 15,
    fontWeight: 'bold',
  },
  analyzingSubtext: {
    color: '#fff',
    fontSize: 14,
    marginTop: 5,
    opacity: 0.8,
  },
  imageActions: {
    flexDirection: 'row',
    padding: 15,
    justifyContent: 'space-between',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  retakeButton: {
    backgroundColor: '#757575',
  },
  analyzeButton: {
    backgroundColor: '#4CAF50',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoCards: {
    padding: 15,
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    elevation: 2,
  },
  infoCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 5,
  },
  infoCardText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  resultsModal: {
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginVertical: 5,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    marginTop: 10,
  },
  cancelText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    width: '100%',
  },
  statusCard: {
    padding: 15,
    borderRadius: 10,
    marginVertical: 15,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  confidenceText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  detectionsText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 3,
  },
  section: {
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  conditionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  conditionText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  recommendationText: {
    fontSize: 14,
    color: '#333',
    paddingVertical: 3,
    paddingLeft: 5,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
});