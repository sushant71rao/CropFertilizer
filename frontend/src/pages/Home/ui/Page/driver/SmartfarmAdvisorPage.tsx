// src/components/SmartFarmAdvisor/SmartFarmAdvisorPage.tsx
import React, {
  useState,
  useCallback,
  useMemo,
  FC,
  ChangeEvent,
  FormEvent,
} from "react";
import {
  FormData,
  FormErrors,
  ResultsState,
  ApiYieldData,
  ApiFertilizerData,
} from "../../../../../types/interface";
// Updated to use the new generateAiTextViaApi function
import {
  predictYield,
  recommendFertilizer,
  generateAiTextViaApi,
} from "../../../../../api";

import Step1CropLocation from "../../Steps/Step1CropLocation";
import Step2SoilEnvironment from "../../Steps/Step2SoliEnviorment";
import Step3CultivationPractices from "../../Steps/Step3CultivationPractices";
import ResultsDashboard from "../../Steps/ResultDashboard";
import ProgressBar from "../../components/ProgressBar";

const SmartFarmAdvisorPage: FC = () => {
  const TOTAL_INPUT_STEPS = 3;
  const RESULTS_STEP = TOTAL_INPUT_STEPS + 1;

  const [currentStep, setCurrentStep] = useState<number>(1);
  const initialFormData = useMemo<FormData>(
    () => ({
      Crop: "",
      State: "",
      Season: "",
      Soil_color: "",
      Nitrogen: "",
      Phosphorus: "",
      Potassium: "",
      pH: "",
      Rainfall_Fert: "",
      Temperature: "",
      Area: "",
      Annual_Rainfall_Yield: "",
      Fertilizer_Quantity: "",
      Pesticide: "",
    }),
    [],
  );
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  // Updated ResultsState structure
  const [results, setResults] = useState<ResultsState>({
    yieldPredictionRaw: null,
    fertilizerRecommendationRaw: null,
    yieldPredictionAISummary: null,
    fertilizerRecommendationAISummary: null,
    error: null,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>("Analyzing...");

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target as (
        | HTMLInputElement
        | HTMLSelectElement
      ) & { name: keyof FormData };
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: undefined }));
      }
    },
    [errors],
  );

  const validateCurrentStep = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;
    const currentRequiredFieldsMap: Partial<
      Record<number, (keyof FormData)[]>
    > = {
      1: ["Crop", "State", "Season"],
      2: [
        "Soil_color",
        "Nitrogen",
        "Phosphorus",
        "Potassium",
        "pH",
        "Rainfall_Fert",
        "Temperature",
      ],
      3: ["Area", "Annual_Rainfall_Yield", "Fertilizer_Quantity", "Pesticide"],
    };
    const fieldsToValidate = currentRequiredFieldsMap[currentStep];
    if (fieldsToValidate) {
      fieldsToValidate.forEach((field) => {
        if (!formData[field] || formData[field].trim() === "") {
          newErrors[field] = `${field
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase())} is required.`;
          isValid = false;
        }
      });
    }
    setErrors(newErrors);
    return isValid;
  }, [currentStep, formData]);

  const nextStep = () => {
    if (!validateCurrentStep()) return;
    if (currentStep < TOTAL_INPUT_STEPS) {
      setCurrentStep((prev) => prev + 1);
    } else if (currentStep === TOTAL_INPUT_STEPS) {
      handleGetAnalysis();
    }
  };

  const prevStep = () => currentStep > 1 && setCurrentStep((prev) => prev - 1);

  const handleGetAnalysis = async () => {
    if (!validateCurrentStep()) return;
    setLoading(true);
    setLoadingMessage("Fetching ML predictions...");
    setResults({
      yieldPredictionRaw: null,
      fertilizerRecommendationRaw: null,
      yieldPredictionAISummary: null,
      fertilizerRecommendationAISummary: null,
      error: null,
    });

    const yieldApiData: ApiYieldData = {
      Crop: formData.Crop,
      Season: formData.Season,
      State: formData.State,
      Area: parseFloat(formData.Area) || 0,
      Production: 1, // Production hardcoded as per earlier design
      Annual_Rainfall: parseFloat(formData.Annual_Rainfall_Yield) || 0,
      Fertilizer: parseFloat(formData.Fertilizer_Quantity) || 0,
      Pesticide: parseFloat(formData.Pesticide) || 0,
    };
    const fertilizerApiData: ApiFertilizerData = {
      Crop: formData.Crop,
      Soil_color: formData.Soil_color,
      Nitrogen: parseFloat(formData.Nitrogen) || 0,
      Phosphorus: parseFloat(formData.Phosphorus) || 0,
      Potassium: parseFloat(formData.Potassium) || 0,
      pH: parseFloat(formData.pH) || 0,
      Rainfall: parseFloat(formData.Rainfall_Fert) || 0,
      Temperature: parseFloat(formData.Temperature) || 0,
    };

    let tempYieldPrediction: number | null = null;
    let tempFertilizerRecommendation: string | null = null;

    try {
      const yieldRes = await predictYield(yieldApiData);
      tempYieldPrediction = yieldRes.data.predicted_yield;

      const fertilizerRes = await recommendFertilizer(fertilizerApiData);
      tempFertilizerRecommendation = fertilizerRes.data.recommended_fertilizer;

      setResults((prev) => ({
        ...prev,
        yieldPredictionRaw: tempYieldPrediction,
        fertilizerRecommendationRaw: tempFertilizerRecommendation,
      }));

      // Now, generate AI summaries
      setLoadingMessage("Generating AI summaries...");

      let yieldAISummary: string | null = null;
      if (tempYieldPrediction !== null) {
        const yieldPrompt = `
          Given the following farm conditions and inputs for ${
            formData.Crop
          } in ${formData.State} (${formData.Season} season):
          - Area: ${formData.Area} Hectares
          - Annual Rainfall: ${formData.Annual_Rainfall_Yield} mm
          - Planned Fertilizer Quantity: ${formData.Fertilizer_Quantity} kg
          - Planned Pesticide Quantity: ${formData.Pesticide} kg/L
          The ML model predicted a yield of: ${tempYieldPrediction.toFixed(
            2,
          )} units/hectare.
          Please provide a brief, insightful summary (2-3 sentences) explaining this prediction in simple terms for a farmer. Mention key contributing factors if possible and any general advice.
          (Note: The model used a reference 'Production' value of 1, so 'units/hectare' is relative).
        `;
        try {
          const aiYieldRes = await generateAiTextViaApi({
            prompt: yieldPrompt,
          });
          yieldAISummary = aiYieldRes.data.generated_text;
        } catch (aiError: any) {
          console.error("AI Yield Summary Error:", aiError);
          yieldAISummary =
            "Could not generate AI summary for yield: " + aiError.message;
        }
      }

      let fertilizerAISummary: string | null = null;
      if (tempFertilizerRecommendation) {
        const fertPrompt = `
          For a ${formData.Crop} crop with the following soil and climate conditions:
          - Soil Color: ${formData.Soil_color}
          - Nitrogen: ${formData.Nitrogen} kg/ha
          - Phosphorus: ${formData.Phosphorus} kg/ha
          - Potassium: ${formData.Potassium} kg/ha
          - Soil pH: ${formData.pH}
          - Typical Rainfall: ${formData.Rainfall_Fert} mm
          - Average Temperature: ${formData.Temperature}°C
          The ML model recommended the fertilizer: "${tempFertilizerRecommendation}".
          Please provide a brief, insightful summary (2-3 sentences) explaining this recommendation in simple terms for a farmer. Why might this fertilizer be suitable?
        `;
        try {
          const aiFertRes = await generateAiTextViaApi({ prompt: fertPrompt });
          fertilizerAISummary = aiFertRes.data.generated_text;
        } catch (aiError: any) {
          console.error("AI Fertilizer Summary Error:", aiError);
          fertilizerAISummary =
            "Could not generate AI summary for fertilizer: " + aiError.message;
        }
      }

      setResults((prev) => ({
        ...prev, // This keeps raw predictions
        yieldPredictionAISummary: yieldAISummary,
        fertilizerRecommendationAISummary: fertilizerAISummary,
      }));
      setCurrentStep(RESULTS_STEP);
    } catch (err: any) {
      console.error("Error getting ML analysis:", err);
      setResults({
        yieldPredictionRaw: tempYieldPrediction, // Show raw ML result even if AI fails later
        fertilizerRecommendationRaw: tempFertilizerRecommendation,
        yieldPredictionAISummary: null,
        fertilizerRecommendationAISummary: null,
        error: err.message || "An error occurred during ML model prediction.",
      });
      setCurrentStep(RESULTS_STEP); // Still go to results step to show error and any partial results
    } finally {
      setLoading(false);
      setLoadingMessage("Analyzing..."); // Reset loading message
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setErrors({});
    setResults({
      yieldPredictionRaw: null,
      fertilizerRecommendationRaw: null,
      yieldPredictionAISummary: null,
      fertilizerRecommendationAISummary: null,
      error: null,
    });
    setCurrentStep(1);
  };

  const renderContent = () => {
    const stepProps = { formData, handleChange, errors, disabled: loading };
    if (currentStep === 1) return <Step1CropLocation {...stepProps} />;
    if (currentStep === 2) return <Step2SoilEnvironment {...stepProps} />;
    if (currentStep === 3) return <Step3CultivationPractices {...stepProps} />;
    if (currentStep === RESULTS_STEP)
      return (
        <ResultsDashboard
          results={results}
          formData={formData}
          onReset={resetForm}
          loading={loading}
        />
      ); // Pass loading for dashboard's own loading state
    return <p>Unknown step.</p>;
  };

  return (
    <div className="rounded-xl bg-gray-900 p-6 shadow-2xl ring-1 ring-gray-700/50 sm:p-8">
      <ProgressBar currentStep={currentStep} totalSteps={TOTAL_INPUT_STEPS} />
      <form
        onSubmit={(e: FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          if (currentStep === TOTAL_INPUT_STEPS) nextStep();
        }}
      >
        <div className="min-h-[300px]">{renderContent()}</div>
      </form>
      {currentStep <= TOTAL_INPUT_STEPS && (
        <div className="mt-8 flex items-center justify-between border-t border-gray-700 pt-6">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1 || loading}
            className="rounded-lg bg-gray-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50"
          >
            Back
          </button>
          <button
            type="button"
            onClick={nextStep}
            disabled={loading}
            className="rounded-lg bg-gradient-to-r from-sky-500 to-cyan-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50"
          >
            {loading
              ? currentStep === TOTAL_INPUT_STEPS
                ? loadingMessage
                : "Loading..."
              : currentStep === TOTAL_INPUT_STEPS
              ? "Get Farm Analysis ✓"
              : "Next Step →"}
          </button>
        </div>
      )}
    </div>
  );
};

export default SmartFarmAdvisorPage;
