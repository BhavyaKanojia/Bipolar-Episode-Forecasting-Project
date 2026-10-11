import pandas as pd
import pickle
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

# 🔹 Load dataset (YOUR FILE NAME)
df = pd.read_csv("bipolar_dataset.csv")

print("Dataset Loaded Successfully")
print("Shape:", df.shape)

# 🔹 Drop Patient Number column
df = df.drop("Patient Number", axis=1)

# 🔹 Clean Optimisim column (convert "4 From 10" → 4)
df["Optimisim"] = df["Optimisim"].str.extract(r'(\d+)').astype(int)


# 🔹 Separate features and target
X = df.drop("Expert Diagnose", axis=1)
y = df["Expert Diagnose"]

# 🔹 Convert categorical features into numbers
X = pd.get_dummies(X)

# 🔹 Encode target labels
label_encoder = LabelEncoder()
y_encoded = label_encoder.fit_transform(y)

# 🔹 Train/Test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded, test_size=0.2, random_state=42
)

# 🔹 Train model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# 🔹 Evaluate
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)

print("\nModel Accuracy:", accuracy)
print("\nClassification Report:\n")
print(classification_report(y_test, y_pred))

# 🔹 Visualize and Save Model Accuracy (Bar Graph)
plt.figure(figsize=(6, 5))
metrics = ['Accuracy', 'Error']
values = [accuracy, 1 - accuracy]
colors = ['#4CAF50', '#F44336'] # Green for accuracy, Red for error

bars = plt.bar(metrics, values, color=colors, width=0.5)
plt.ylim(0, 1.1)
plt.title('Model Accuracy Performance')
plt.ylabel('Percentage')

# Add percentage labels on top of bars
for bar in bars:
    yval = bar.get_height()
    plt.text(bar.get_x() + bar.get_width()/2, yval + 0.02, f"{yval:.2%}", ha='center', fontsize=12, fontweight='bold')

plt.savefig('model_accuracy_graph.png', bbox_inches='tight')
print("\nModel accuracy graph saved as 'model_accuracy_graph.png'")
plt.show()

# 🔹 Save model and encoder
pickle.dump(model, open("model.pkl", "wb"))
pickle.dump(label_encoder, open("label_encoder.pkl", "wb"))

print("\nModel and Label Encoder Saved Successfully!")