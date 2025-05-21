// src/types/farmAdvisorTypes.ts
import { ChangeEvent } from "react";

export interface FormData {
  Crop: string;
  State: string;
  Season: string;
  Soil_color: string;
  Nitrogen: string;
  Phosphorus: string;
  Potassium: string;
  pH: string;
  Rainfall_Fert: string;
  Temperature: string;
  Area: string;
  Annual_Rainfall_Yield: string;
  Fertilizer_Quantity: string;
  Pesticide: string;
}

export type FormErrors = Partial<Record<keyof FormData, string>>;

export interface ApiYieldData {
  Crop: string;
  Season: string;
  State: string;
  Area: number;
  Production: number;
  Annual_Rainfall: number;
  Fertilizer: number;
  Pesticide: number;
}

export interface ApiFertilizerData {
  Crop: string;
  Soil_color: string;
  Nitrogen: number;
  Phosphorus: number;
  Potassium: number;
  pH: number;
  Rainfall: number;
  Temperature: number;
}

export interface YieldResponse {
  predicted_yield: number;
}

export interface FertilizerResponse {
  recommended_fertilizer: string;
}

export interface ResultsState {
  yieldPredictionRaw: number | null;
  fertilizerRecommendationRaw: string | null;
  yieldPredictionAISummary: string | null;
  fertilizerRecommendationAISummary: string | null;
  error: string | null;
}

export interface InputFieldProps {
  id: string;
  name: keyof FormData;
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  min?: string;
  step?: string;
  helpText?: string;
  disabled?: boolean;
  error?: string;
}

export interface SelectFieldProps {
  id: string;
  name: keyof FormData;
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
  required?: boolean;
  helpText?: string;
  disabled?: boolean;
  error?: string;
}

export interface ContextualTipProps {
  children: React.ReactNode;
}

export interface EducationalSnippetProps {
  title: string;
  children: React.ReactNode;
}

export interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export interface StepProps {
  formData: FormData;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  errors: FormErrors;
  disabled?: boolean;
}

export interface ResultsDashboardProps {
  results: ResultsState;
  formData: FormData;
  onReset: () => void;
  loading: boolean;
}
