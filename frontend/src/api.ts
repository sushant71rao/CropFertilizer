import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
});

export const predictYield = (data: any) => API.post("/predict/yield", data);
export const recommendFertilizer = (data: any) =>
  API.post("/predict/fertilizer", data);

interface GeminiApiInput {
  prompt: string;
  model_name?: string;
}

interface GeminiApiResponse {
  generated_text: string;
}

export const generateAiTextViaApi = async (
  payload: GeminiApiInput,
): Promise<{ data: GeminiApiResponse }> => {
  // Ensure return type matches Axios response
  console.log("Frontend calling /generate/gemini_text with:", payload);
  // Axios automatically wraps the response in a `data` property.
  // The backend returns { "generated_text": "..." }
  // So, the structure after Axios will be response.data = { "generated_text": "..." }
  // We want to return it as { data: { generated_text: "..." } } to be consistent with other functions if needed,
  // or just response.data if the calling component expects the inner payload directly.
  // For consistency with your other functions that return Promise<{ data: ResponseType }>,
  // we can let Axios handle its default behavior. The component will access `response.data.generated_text`.
  const response = await API.post("/generate/gemini_text", payload);
  return response; // Axios response object already has `data` property with backend's JSON
};
