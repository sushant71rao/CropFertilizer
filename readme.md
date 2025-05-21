# 🌱 Smart AgroTech Advisor

## Version

1.0.0 (As of May 2025)

## 📝 Project Overview

The Smart AgroTech Advisor is a web application designed to assist farmers in making informed agricultural decisions. It provides crop yield predictions and tailored fertilizer recommendations based on various factors like crop type, soil conditions, and environmental data. The project consists of:

- **Backend Machine Learning Pipeline:** Python scripts for training two core machine learning models: one for crop yield prediction and another for fertilizer recommendation.
- **Frontend User Interface:** An interactive user interface built with React and TypeScript, allowing users to input necessary parameters and receive analysis.

## ✨ Features

**Backend:**

- **Crop Yield Prediction Model:**
  - Utilizes an XGBoost Regressor.
  - Predicts potential crop yield based on factors like crop type, state, area, rainfall, fertilizer quantity, and pesticide quantity.
  - Handles missing data through imputation.
  - Applies label encoding for categorical features and standard scaling for numerical features.
- **Fertilizer Recommendation Model:**
  - Employs a Random Forest Classifier.
  - Recommends fertilizer types based on crop, soil color, NPK values, pH, rainfall, and temperature.
  - Handles missing data by dropping rows.
  - Applies label encoding for categorical features (including the target variable) and standard scaling.
- **Model & Preprocessor Persistence:** Saves trained models, scalers, and encoders using `joblib` for later use in a serving environment.

**Frontend:**

- **Multi-Step Guided Input (Smart Farm Advisor):**
  - User-friendly wizard guides users through three input steps:
    1.  Crop & Location Details
    2.  Soil & Environment Specifics
    3.  Cultivation & Management Practices
  - Contextual tips and educational snippets provided at each step.
- **Integrated Results Dashboard:**
  - Displays both fertilizer recommendations and crop yield predictions in a unified view.
  - Provides actionable insights and next steps.
- **Modular & Type-Safe Code:**
  - Built with React and TypeScript for robustness and maintainability.
  - Components are structured modularly (UI primitives, step components, results dashboard).
- **Inline Validation:** Provides immediate feedback for required fields.
- **Responsive Design:** Styled with Tailwind CSS for adaptability across devices.

## 🛠️ Tech Stack

**Backend (Machine Learning Model Training):**

- Python 3.x
- Pandas: For data manipulation and analysis.
- NumPy: For numerical operations.
- Scikit-learn: For preprocessing (SimpleImputer, LabelEncoder, StandardScaler), and Random Forest model.
- XGBoost: For the crop yield prediction model (XGBRegressor).
- Joblib: For saving and loading trained models and preprocessors.
- _(Note: TensorFlow was imported in the original script but not directly used for the core model training logic detailed for the yield and fertilizer models.)_

**Frontend:**

- React 17+ (or 18+)
- TypeScript
- Tailwind CSS: For utility-first styling.
- (Assumed) Node.js & npm/yarn for development.

**Data Source:**

- `crop_yield.csv`: Used for training the yield prediction model.
- `Crop and fertilizer dataset.csv` (referred to as `Fertilizer.csv` in the Python script): Used for training the fertilizer recommendation model.

## ⚙️ Setup and Installation

### Backend (Model Training)

1.  **Prerequisites:**
    - Python 3.7+ installed.
    - `pip` (Python package installer).
2.  **Clone the repository (if applicable) and navigate to the backend directory.**
3.  **Create a virtual environment (recommended):**
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```
4.  **Install dependencies:**
    Create a `requirements.txt` file in your backend directory with the following content:
    ```txt
    pandas
    numpy
    scikit-learn
    xgboost
    joblib
    # tensorflow # Optional, if other parts of the script use it
    ```
    Then run:
    ```bash
    pip install -r requirements.txt
    ```

5.  **Run the script to start the server:**
    - Execute the script:
      ```bash
      python index.py
      ```
    - The project already has all the joblib files and all the scalare and label encoders so we do not have to explicitly add them.

6.  **Prerequisites:**
    - Node.js (which includes npm) or Yarn installed. (LTS version recommended)
7.  **Navigate to the frontend project directory.**
8.  **Install dependencies:**
    ```bash
    npm install
    # OR
    yarn install
    ```
9. **Set up API connection:**
    - The frontend's API calls are defined in `src/api/farmPredictions.ts`.
    - To connect to a live backend API that serves your trained models, update this file to make actual HTTP requests (e.g., using `Workspace` or `axios`) to your API endpoints. The expected request/response structures are defined in `src/types/farmAdvisorTypes.ts`.
10. **Run the development server:**
    ```bash
    npm start
    # OR
    yarn start
    ```
    This will typically open the application in your default web browser at `http://localhost:3000`.

## 🚀 Usage

Once the frontend application is running:

1.  The "Smart AgroTech Advisor" page will be displayed.
2.  **Follow the multi-step wizard:**
    - **Step 1: Crop & Location:** Select your crop, state, and season. Contextual tips may appear.
    - **Step 2: Soil & Environment Details:** Input details about your soil (color, NPK values, pH) and local climate (typical rainfall, temperature). Educational snippets are available for nutrient roles.
    - **Step 3: Cultivation Practices:** Provide information on your farming area, expected annual rainfall for yield, planned fertilizer quantity, and pesticide usage.
3.  **Input Validation:** The application will display inline error messages if required fields are missed before proceeding to the next step.
4.  **Get Analysis:** After completing Step 3, click "Get Farm Analysis ✓".
5.  **View Results:** The integrated dashboard will display:
    - 🧪 Fertilizer Recommendation: The type of fertilizer suggested.
    - 🌾 Crop Yield Estimation: The potential yield in units/hectare.
    - Rationale, important notes, and actionable next steps.
6.  **Start Over:** Use the "Start New Farm Plan" button to reset the form and begin a new analysis.

## 🔮 Future Enhancements

- **Real API Integration:** Develop and deploy a backend API (e.g., using Flask or FastAPI) to serve the trained machine learning models.
- **User Authentication & Profiles:** Allow users to create accounts and save their farm details/past analyses.
- **Database Integration:** Store user data, farm profiles, and potentially historical prediction data.
- **Advanced "What-If" Scenarios:** Allow users to more dynamically tweak inputs and see immediate changes in predictions.
- **Location-Based Climate Data:** Integrate with weather APIs to pre-fill or suggest climate data based on selected location.
- **Detailed Soil Analysis Input:** Allow more granular soil test report inputs.
- **Expanded Knowledge Base:** More detailed information about crops, fertilizers, and farming practices.
- **Visualization:** Add charts or graphs to display historical trends or compare scenarios.
- **Multilingual Support.**
