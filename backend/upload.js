const fs = require("fs");
const path = require("path");
const axios = require("axios");

const IMAGE_FOLDER = path.join(__dirname, "images");
const API_URL = "http://localhost:4000/detect";

async function sendImage(filePath) {
    const imgBuffer = fs.readFileSync(filePath);
    const base64 = imgBuffer.toString("base64");

    try {
        const res = await axios.post(API_URL, {
            image: base64
        }, {
            maxBodyLength: Infinity
        });

        console.log("✅", path.basename(filePath), "->", res.data.status);
    } catch (err) {
        console.error("❌", path.basename(filePath), err.message);
    }
}

async function run() {
    const files = fs.readdirSync(IMAGE_FOLDER);

    console.log(`Found ${files.length} images`);

    for (const file of files) {
        const fullPath = path.join(IMAGE_FOLDER, file);

        if (!file.toLowerCase().match(/\.(jpg|jpeg|png)$/)) continue;

        await sendImage(fullPath);

        // delay biar Roboflow gak rate-limit
        await new Promise(r => setTimeout(r, 800));
    }

    console.log("\n🎯 DONE. Check logs/predictions.csv");
}

run();