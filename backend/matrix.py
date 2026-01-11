import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.metrics import confusion_matrix, ConfusionMatrixDisplay, accuracy_score

# =============================
# LOAD DATA
# =============================
labels = pd.read_csv("labels.csv")
preds = pd.read_csv("logs/predictions.csv")

print("Labels:", len(labels))
print("Predictions:", len(preds))

# =============================
# CONVERT ONE-HOT LABEL → CLASS
# =============================
def decode_label(row):
    if row["severe_malnutrition"] == 1:
        return "severe"
    if row["moderate_malnutrition"] == 1:
        return "moderate"
    if row["mild_malnutrition"] == 1:
        return "mild"
    if row["normal_malnutrition"] == 1:
        return "normal"
    return "unknown"

labels["true_class"] = labels.apply(decode_label, axis=1)

# =============================
# CLEAN PREDICTION LABEL
# =============================
preds["pred_class"] = preds["prediction"].str.replace("_malnutrition","")

# =============================
# MERGE BY FILENAME
# =============================
merged = pd.merge(labels, preds, on="filename")

print("\nMerged rows:", len(merged))
print(merged[["filename","true_class","pred_class"]].head())

# =============================
# BUILD CONFUSION MATRIX
# =============================
y_true = merged["true_class"]
y_pred = merged["pred_class"]

labels_order = ["normal","mild","moderate","severe"]

cm = confusion_matrix(y_true, y_pred, labels=labels_order)
acc = accuracy_score(y_true, y_pred)

# =============================
# PLOT
# =============================
disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=labels_order)

plt.figure(figsize=(6,6))
disp.plot(cmap="Blues", values_format="d")
plt.title(f"Malnutrition Model Confusion Matrix\nAccuracy: {acc*100:.2f}%")
plt.savefig("confusion_matrix.png", dpi=300)
plt.show()

print("\nAccuracy:", acc*100, "%")
print("\nConfusion Matrix:")
print(cm)
