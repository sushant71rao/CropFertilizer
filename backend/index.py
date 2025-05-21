# main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import joblib
import numpy as np
import uvicorn
from sklearn.exceptions import NotFittedError
from fastapi.middleware.cors import CORSMiddleware
import os # Added for os.path.join, if not already present

# --- Add these imports ---
from dotenv import load_dotenv
from services import gemini_services as gemini_service
# -------------------------

app = FastAPI()

# --- Add this line at the top if not already present ---
load_dotenv() # Loads variables from .env file (for GEMINI_API_KEY in gemini_service.py)
# -------------------------------------------------------


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or restrict to ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Load models (Your existing code - UNCHANGED) ---
try:
    # Using os.path.join for better path handling if your structure is complex
    base_dir = os.path.dirname(os.path.abspath(__file__)) # Gets directory of main.py
    models_path = os.path.join(base_dir, "models")
    encoders_path = os.path.join(base_dir, "encoders")
    scalers_path = os.path.join(base_dir, "scalers")

    xgb_yield_bundle = joblib.load(os.path.join(models_path, "xgb_yield_model.joblib"))
    yield_model = xgb_yield_bundle["model"]
    yield_features = xgb_yield_bundle["features"] # These are likely encoded feature names

    fert_bundle = joblib.load(os.path.join(models_path, "rf_fertilizer_model.joblib"))
    fert_model = fert_bundle["model"]
    fert_features = fert_bundle["features"] # These are likely encoded feature names

    # Encoders & Scalers
    le_crop = joblib.load(os.path.join(encoders_path, "le_crop.joblib"))
    le_state = joblib.load(os.path.join(encoders_path, "le_state.joblib"))
    # Assuming le_season.joblib was saved by your training script based on your payload
    try:
        le_season = joblib.load(os.path.join(encoders_path, "le_season.joblib"))
    except FileNotFoundError:
        print("Warning: le_season.joblib not found. 'Season' encoding might fail.")
        le_season = None # Handle gracefully or raise error if critical

    le_crop_fert = joblib.load(os.path.join(encoders_path, "le_crop_fert.joblib"))
    le_soil_color = joblib.load(os.path.join(encoders_path, "le_soil_color.joblib"))
    # Assuming this is the encoder for the TARGET fertilizer name
    le_fert_name = joblib.load(os.path.join(encoders_path, "le_fert_name.joblib"))

    scaler_yield = joblib.load(os.path.join(scalers_path, "yield_scaler.joblib"))
    # Assuming a scaler for fertilizer model features was also saved if used
    # scaler_fert = joblib.load(os.path.join(scalers_path, "fert_scaler.joblib"))
except Exception as load_err:
    print(f"FATAL: Error loading model files: {load_err}")
    raise RuntimeError(f"Error loading model files: {load_err}")

# --- Helper function (Your existing code - UNCHANGED) ---
def safe_label_encode(le, val):
    """
    Safely encodes a value using a LabelEncoder.
    If the value is unseen, it extends the encoder's classes.
    This is a common approach for development/prototyping.
    For production, consider how to handle truly novel unseen categories
    (e.g., map to a special token if model trained for it, or return error).
    """
    # Ensure val is a string if the encoder expects strings
    # (LabelEncoder typically handles mixed types but explicit conversion can be safer)
    str_val = str(val)
    if str_val not in le.classes_:
        # print(f"Warning: Value '{str_val}' not seen by LabelEncoder. Extending classes.")
        le.classes_ = np.append(le.classes_, str_val)
    return le.transform([str_val])[0]

# --- Input Schemas (Your existing code - UNCHANGED) ---
class YieldInput(BaseModel):
    Crop: str
    Season: str
    State: str
    Area: Optional[float] = 0.0 # Changed from 0 to 0.0 for float consistency
    Production: Optional[float] = 0.0
    Annual_Rainfall: Optional[float] = 0.0
    Fertilizer: Optional[float] = 0.0
    Pesticide: Optional[float] = 0.0

class FertilizerInput(BaseModel):
    Crop: str
    Soil_color: str
    Nitrogen: Optional[float] = 0.0
    Phosphorus: Optional[float] = 0.0
    Potassium: Optional[float] = 0.0
    pH: Optional[float] = 0.0
    Rainfall: Optional[float] = 0.0
    Temperature: Optional[float] = 0.0

# --- NEW Input Schema for Gemini ---
class GeminiInput(BaseModel):
    prompt: str
    model_name: Optional[str] = "gemini-1.5-flash-latest"
# ---------------------------------

@app.post("/predict/yield") # Your existing code - UNCHANGED
def predict_yield(payload: YieldInput):
    try:
        data = payload.model_dump() # Use model_dump() for Pydantic v2+

        # Prepare features for the model as it was trained
        # The 'yield_features' from the joblib bundle are the names of the columns
        # the model expects *after* encoding.
        # Your `yieldfertilizer.py` used:
        # yield_features_for_model = ['Crop_encode', 'State_encode', 'Area', 'Production', 'Annual_Rainfall', 'Fertilizer', 'Pesticide']
        # And potentially 'Season_encode'.
        # We need to construct this array.

        # Create a dictionary for processed features
        processed_features = {}
        processed_features['Crop_encode'] = safe_label_encode(le_crop, data["Crop"])
        if le_season: # Check if season encoder is loaded
             processed_features['Season_encode'] = safe_label_encode(le_season, data["Season"])
        # else: if season is mandatory and le_season is None, it will fail at feature ordering

        processed_features['State_encode'] = safe_label_encode(le_state, data["State"])
        
        # Add numerical features directly
        numerical_keys = ['Area', 'Production', 'Annual_Rainfall', 'Fertilizer', 'Pesticide']
        for key in numerical_keys:
            processed_features[key] = data.get(key, 0.0)
            
        # Order features according to how the scaler and model were trained.
        # `yield_features` from joblib bundle should represent this order of (encoded) features.
        # Example: if yield_features from bundle is ['Crop_encode', 'Season_encode', 'State_encode', 'Area', ...]
        input_values = [processed_features.get(f, 0.0) for f in yield_features] # yield_features from loaded bundle
        
        input_array = np.array(input_values).reshape(1, -1)
        input_scaled = scaler_yield.transform(input_array)
        prediction = yield_model.predict(input_scaled)[0]

        return {"predicted_yield": round(float(prediction), 2)}

    except NotFittedError as nfe:
        raise HTTPException(status_code=500, detail=f"Model or scaler not fitted: {str(nfe)}")
    except KeyError as ke: # If a feature name in yield_features is not in processed_features
        raise HTTPException(status_code=400, detail=f"Feature mismatch or missing data for yield prediction: {str(ke)}")
    except Exception as e:
        # It's good to log the actual error on the server for debugging
        print(f"Error in /predict/yield: {type(e).__name__} - {str(e)}")
        # For the client, a more generic message might be better unless it's a client-fixable error
        raise HTTPException(status_code=400, detail=f"Yield prediction error: {str(e)}")


@app.post("/predict/fertilizer") # Your existing code - UNCHANGED
def recommend_fertilizer(payload: FertilizerInput):
    try:
        data = payload.model_dump()

        # Similar to yield, prepare features as per model training
        # fert_features from joblib bundle are the names of the columns
        # the model expects *after* encoding.
        # Your `yieldfertilizer.py` used:
        # fert_features_for_model = ['Crop_encode', 'Soil_color_encode', 'Nitrogen', 'Phosphorus', 'Potassium', 'pH', 'Rainfall', 'Temperature']

        processed_features = {}
        processed_features['Crop_encode'] = safe_label_encode(le_crop_fert, data["Crop"])
        processed_features['Soil_color_encode'] = safe_label_encode(le_soil_color, data["Soil_color"])
        
        numerical_keys_fert = ['Nitrogen', 'Phosphorus', 'Potassium', 'pH', 'Rainfall', 'Temperature']
        for key in numerical_keys_fert:
            processed_features[key] = data.get(key, 0.0)

        # Order features according to how the model was trained.
        # `fert_features` from loaded bundle should represent this order.
        input_values = [processed_features.get(f, 0.0) for f in fert_features] # fert_features from loaded bundle
        
        input_array = np.array(input_values).reshape(1, -1)
        # Apply scaling if it was part of your fertilizer model training
        # if scaler_fert:
        #    input_array = scaler_fert.transform(input_array)

        prediction_class = fert_model.predict(input_array)[0]
        prediction_label = le_fert_name.inverse_transform([int(prediction_class)])[0]

        return {"recommended_fertilizer": prediction_label}

    except NotFittedError as nfe:
        raise HTTPException(status_code=500, detail=f"Model or scaler not fitted: {str(nfe)}")
    except KeyError as ke:
        raise HTTPException(status_code=400, detail=f"Feature mismatch or missing data for fertilizer recommendation: {str(ke)}")
    except Exception as e:
        print(f"Error in /predict/fertilizer: {type(e).__name__} - {str(e)}")
        raise HTTPException(status_code=400, detail=f"Fertilizer recommendation error: {str(e)}")


# --- NEW ROUTE for Gemini API ---
@app.post("/generate/gemini_text", summary="Generate Text with Gemini API")
async def generate_gemini_text_endpoint(payload: GeminiInput):
    """
    Generates text using the Google Gemini API via the gemini_service.
    - **prompt**: The text prompt to send to the API.
    - **model_name**: (Optional) The Gemini model to use (e.g., "gemini-1.5-flash-latest").
    """
    try:
        generated_text = await gemini_service.generate_text_from_gemini_api(
            prompt=payload.prompt,
            model_name=payload.model_name
        )
        return {"generated_text": generated_text}
    except gemini_service.GeminiServiceError as e:
        # Handle custom errors from the service, which include status codes
        raise HTTPException(status_code=e.status_code, detail=str(e))
    except Exception as e:
        # Catch any other unexpected errors
        print(f"Unexpected error in /generate/gemini_text endpoint: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred while communicating with Gemini service.")
# ---------------------------------

@app.get("/", include_in_schema=False) # Optional: hide from OpenAPI docs if it's just for quick check
def read_root():
    return {"message": "AgroTech API is running."}


if __name__ == "__main__":
    # Ensure your main.py is in the root of your project or adjust "main:app"
    # For example, if main.py is in a subdirectory 'app', it might be "app.main:app"
    # Assuming main.py is in the root for this command.
    print(f"Gemini API configured in service: {gemini_service.genai_configured}")
    uvicorn.run("index:app", host="0.0.0.0", port=8000, reload=True)