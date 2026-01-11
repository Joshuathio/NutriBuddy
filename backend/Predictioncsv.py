import os
import base64
import requests
import pandas as pd
from tqdm import tqdm

# === CONFIG ===
BACKEND_URL = "http://localhost:4000/detect"
IMAGE_DIR = "images"
LABEL_CSV = "labels.csv"
OUTPUT_CSV = "logs/predictions.csv"

# Load labels
labels = pd.read_csv(LABEL_CSV)

results = []

print("\n🚀 Batch testing started...\n")

for idx, row in tqdm(labels.iterrows(), total=len(labels)):
    filename = row["filename"]
    img_path = os.path.join(IMAGE_DIR, filename)

    if not os.path.exists(img_path):
        print("❌ Missing:", filename)
        continue

    # Read image
    with open(img_path, "rb") as f:
        base64_img = base64.b64encode(f.read()).decode("utf-8")

    # Send to backend
    res = requests.post(BACKEND_URL, json={
        "image": "data:image/jpeg;base64," + base64_img,
        "filename": filename   # 🔥 THIS IS THE KEY
    })

    if res.status_code != 200:
        print("❌ Failed:", filename)
        continue

    data = res.json()
    pred = data["predictions"][0]["class"]
    conf = data["predictions"][0]["confidence"]

    print(f"✅ {filename} -> {pred}")

    results.append({
        "filename": filename,
        "prediction": pred,
        "confidence": conf
    })

# Save predictions
pd.DataFrame(results).to_csv(OUTPUT_CSV, index=False)
print("\n🎯 DONE! predictions.csv created with filenames")
