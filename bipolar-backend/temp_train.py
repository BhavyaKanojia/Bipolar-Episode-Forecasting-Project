import pandas as pd
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.svm import SVC
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import accuracy_score

df = pd.read_csv("bipolar_dataset.csv")
df = df.drop("Patient Number", axis=1)
df["Optimisim"] = df["Optimisim"].str.extract(r'(\d+)').astype(int)

X = df.drop("Expert Diagnose", axis=1)
y = df["Expert Diagnose"]

X = pd.get_dummies(X)

label_encoder = LabelEncoder()
y_encoded = label_encoder.fit_transform(y)

X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded, test_size=0.2, random_state=42
)

# Scale data for SVM
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

models = {
    "Random Forest": {
        "model": RandomForestClassifier(random_state=42),
        "params": {
            "n_estimators": [50, 100, 200],
            "max_depth": [None, 5, 10, 20],
            "min_samples_split": [2, 5, 10],
            "min_samples_leaf": [1, 2, 4]
        },
        "use_scaled": False
    },
    "Gradient Boosting": {
        "model": GradientBoostingClassifier(random_state=42),
        "params": {
            "n_estimators": [50, 100, 200],
            "learning_rate": [0.01, 0.1, 0.2],
            "max_depth": [3, 5, 7]
        },
        "use_scaled": False
    },
    "SVM": {
        "model": SVC(random_state=42),
        "params": {
            "C": [0.1, 1, 10, 100],
            "kernel": ["linear", "rbf", "poly"]
        },
        "use_scaled": True
    }
}

best_overall_acc = 0
best_model_name = ""
best_model_params = {}

for name, config in models.items():
    print(f"Training {name}...")
    X_tr = X_train_scaled if config["use_scaled"] else X_train
    X_te = X_test_scaled if config["use_scaled"] else X_test
    
    grid = GridSearchCV(config["model"], config["params"], cv=5, n_jobs=-1, scoring='accuracy')
    grid.fit(X_tr, y_train)
    
    y_pred = grid.predict(X_te)
    acc = accuracy_score(y_test, y_pred)
    print(f"Best params for {name}: {grid.best_params_}")
    print(f"Accuracy for {name}: {acc}\n")
    
    if acc > best_overall_acc:
        best_overall_acc = acc
        best_model_name = name
        best_model_params = grid.best_params_

print(f"Best overall model: {best_model_name} with accuracy {best_overall_acc}")
print(f"Params: {best_model_params}")
