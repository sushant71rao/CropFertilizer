import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from sklearn.metrics import accuracy_score, recall_score, precision_score, f1_score, classification_report
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.impute import SimpleImputer
from tensorflow.keras.utils import to_categorical

# Load datasets
crop_fertilizer_df = pd.read_csv("backend/mnt/data/Fertilizer.csv")
crop_yield_df = pd.read_csv("backend/mnt/data/crop_yield.csv")

# Handle missing values for numerical columns by imputing the mean
numerical_columns_yield = ['Area', 'Production', 'Annual_Rainfall', 'Fertilizer', 'Pesticide', 'Yield']
imputer = SimpleImputer(strategy='mean')
crop_yield_df[numerical_columns_yield] = imputer.fit_transform(crop_yield_df[numerical_columns_yield])

# Encode categorical columns using Label Encoding
label_encoders = {}
for column in ['Crop', 'State', 'Season']:
    le = LabelEncoder()
    crop_yield_df[column] = le.fit_transform(crop_yield_df[column])
    label_encoders[column] = le

# Function to remove outliers using Z-score method
def remove_outliers(df, columns, threshold=3):
    for col in columns:
        z_scores = np.abs((df[col] - df[col].mean()) / df[col].std())
        df = df[z_scores < threshold]
    return df

# Apply outlier removal
crop_yield_df = remove_outliers(crop_yield_df, numerical_columns_yield)

# Standardize numerical features
scaler = StandardScaler()
crop_yield_df[numerical_columns_yield] = scaler.fit_transform(crop_yield_df[numerical_columns_yield])

# Split data into training and testing sets
X = crop_yield_df.drop(['Yield'], axis=1)
y = crop_yield_df['Yield']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train XGBoost Regressor
xgb_model = xgb.XGBRegressor(objective='reg:squarederror', n_estimators=100, learning_rate=0.1, max_depth=3, random_state=42)
xgb_model.fit(X_train, y_train)

# Predict using XGBoost
y_pred_xgb = xgb_model.predict(X_test)

# Evaluate XGBoost model
mse_xgb = mean_squared_error(y_test, y_pred_xgb)
rmse_xgb = np.sqrt(mse_xgb)
r2_xgb = r2_score(y_test, y_pred_xgb)
mae_xgb = mean_absolute_error(y_test, y_pred_xgb)

print(f"XGBoost Accuracy (R2 Score): {r2_xgb:.2f}")

# Handle missing values in crop_fertilizer_df
numerical_columns_fertilizer = ['Nitrogen', 'Phosphorus', 'Potassium', 'pH', 'Rainfall', 'Temperature']
crop_fertilizer_df[numerical_columns_fertilizer] = imputer.fit_transform(crop_fertilizer_df[numerical_columns_fertilizer])

# Encode categorical variables
categorical_columns_fertilizer = ['District_Name', 'Soil_color', 'Crop', 'Fertilizer']
for column in categorical_columns_fertilizer:
    le = LabelEncoder()
    crop_fertilizer_df[column] = le.fit_transform(crop_fertilizer_df[column])
    label_encoders[column] = le

# Drop unnecessary columns if present
if 'Link' in crop_fertilizer_df.columns:
    crop_fertilizer_df.drop(columns=['Link'], inplace=True)

# Standardize numerical features
crop_fertilizer_df[numerical_columns_fertilizer] = scaler.fit_transform(crop_fertilizer_df[numerical_columns_fertilizer])

# Prepare data for classification
X_fertilizer = crop_fertilizer_df.drop('Fertilizer', axis=1)
y_fertilizer = to_categorical(crop_fertilizer_df['Fertilizer'])  # Convert labels to categorical format

# Split data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X_fertilizer, y_fertilizer, test_size=0.2, random_state=42)

# Train Random Forest Classifier
rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
rf_model.fit(X_train, y_train)

# Convert categorical labels back to class indices
y_test = np.argmax(y_test, axis=1)
y_pred = rf_model.predict(X_test)
y_pred = np.argmax(y_pred, axis=1)

# Evaluate Random Forest model
accuracy = accuracy_score(y_test, y_pred)

print(f"Random Forest Accuracy: {accuracy:.2f}")

import pickle
pickle.dump(xgb_model, open("xgb_model.pkl", "wb"))
pickle.dump(rf_model, open("rf_model.pkl", "wb"))
