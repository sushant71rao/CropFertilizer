// src/components/SmartFarmAdvisor/ResultsDashboard.tsx
import { FC } from "react";
import { ResultsDashboardProps } from "../../../../types/interface";
const ResultsDashboard: FC<ResultsDashboardProps> = ({
  results,
  formData,
  onReset,
  loading,
}) => {
  // The main loading state for API calls is handled by SmartFarmAdvisorPage.
  // This 'loading' prop could be used for internal dashboard transitions if any.
  // For now, we primarily rely on the presence of data in `results`.

  if (
    loading &&
    !results.yieldPredictionRaw &&
    !results.fertilizerRecommendationRaw &&
    !results.error
  ) {
    // This specific loading state is when SmartFarmAdvisorPage is fetching initial ML data
    // or subsequent AI summaries. The loadingMessage is shown there.
    // We can show a simpler loading here if needed, or rely on the parent.
    return (
      <div className="py-10 text-center">
        <p className="text-lg text-sky-400">Processing analysis...</p>
      </div>
    );
  }

  const hasAnyResult =
    results.yieldPredictionRaw !== null ||
    results.fertilizerRecommendationRaw !== null ||
    results.error;

  if (!hasAnyResult && !loading) {
    // Should not happen if logic is correct, but as a fallback
    return (
      <div className="py-10 text-center">
        <p className="text-lg text-gray-400">
          No analysis performed yet or an issue occurred.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-center text-2xl font-bold text-sky-300">
        Your Farm Analysis Results
      </h2>

      {results.error && (
        <div className="rounded-md border border-red-500 bg-red-700/30 p-4 text-red-300">
          <h3 className="font-semibold text-red-200">Analysis Error:</h3>
          <p>{results.error}</p>
        </div>
      )}

      {/* Fertilizer Recommendation Section */}
      {results.fertilizerRecommendationRaw && (
        <div className="rounded-xl bg-gray-800 p-6 shadow-lg ring-1 ring-gray-700">
          <h3 className="mb-1 text-xl font-semibold text-sky-400">
            🧪 Fertilizer Recommendation
          </h3>
          <p className="mb-2 text-2xl font-bold text-green-400">
            {results.fertilizerRecommendationRaw}
          </p>

          {results.fertilizerRecommendationAISummary ? (
            <div className="mt-3 rounded-md border border-purple-700 bg-purple-900/30 p-3">
              <h4 className="mb-1 text-sm font-semibold text-purple-300">
                AI Powered Insight:
              </h4>
              <p className="whitespace-pre-wrap text-sm text-gray-200">
                {results.fertilizerRecommendationAISummary}
              </p>
            </div>
          ) : (
            loading && (
              <p className="mt-2 text-sm text-purple-400">
                Generating AI summary for fertilizer...
              </p>
            )
            // Optionally show a placeholder or message if AI summary failed but raw result is present
          )}
          <p className="mt-3 text-xs text-gray-400">
            Input context: Crop ({formData.Crop}), Soil ({formData.Soil_color}),
            NPK ({formData.Nitrogen}-{formData.Phosphorus}-{formData.Potassium}
            ), pH ({formData.pH}).
          </p>
        </div>
      )}

      {/* Yield Prediction Section */}
      {results.yieldPredictionRaw !== null &&
        !isNaN(results.yieldPredictionRaw) && (
          <div className="rounded-xl bg-gray-800 p-6 shadow-lg ring-1 ring-gray-700">
            <h3 className="mb-1 text-xl font-semibold text-sky-400">
              🌾 Crop Yield Estimation
            </h3>
            <p className="mb-2 text-2xl font-bold text-green-400">
              {results.yieldPredictionRaw.toFixed(2)} units/hectare
            </p>

            {results.yieldPredictionAISummary ? (
              <div className="mt-3 rounded-md border border-purple-700 bg-purple-900/30 p-3">
                <h4 className="mb-1 text-sm font-semibold text-purple-300">
                  AI Powered Insight:
                </h4>
                <p className="whitespace-pre-wrap text-sm text-gray-200">
                  {results.yieldPredictionAISummary}
                </p>
              </div>
            ) : (
              loading && (
                <p className="mt-2 text-sm text-purple-400">
                  Generating AI summary for yield...
                </p>
              )
            )}
            <p className="mt-3 text-xs text-gray-400">
              Input context: Crop ({formData.Crop}), Area ({formData.Area} Ha),
              Rainfall ({formData.Annual_Rainfall_Yield} mm), Fertilizer (
              {formData.Fertilizer_Quantity} kg), Pesticide (
              {formData.Pesticide} kg/L).
            </p>
            <p className="mt-2 text-xs text-gray-500">
              Note: Yield model used a reference 'Production' value. Interpret
              'units/hectare' relatively.
            </p>
          </div>
        )}

      {/* General Next Steps - can be enhanced by AI too in a future iteration */}
      {(results.fertilizerRecommendationRaw ||
        results.yieldPredictionRaw !== null) &&
        !results.error && (
          <div className="rounded-xl bg-gray-800 p-6 shadow-lg ring-1 ring-gray-700">
            <h3 className="mb-3 text-xl font-semibold text-sky-400">
              💡 General Next Steps
            </h3>
            <ul className="list-inside list-disc space-y-2 text-sm text-gray-300">
              <li>Review application rates for any recommended fertilizer.</li>
              <li>
                Consult local agricultural extension services for tailored
                advice.
              </li>
              <li>
                Maintain good water management and pest control practices.
              </li>
            </ul>
          </div>
        )}

      <div className="mt-8 text-center">
        <button
          onClick={onReset}
          className="rounded-lg bg-gradient-to-r from-sky-600 to-cyan-600 px-8 py-3 font-semibold text-white transition hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-sky-800 disabled:opacity-50"
          disabled={loading} // Disable reset while any loading is happening
        >
          Start New Farm Plan
        </button>
      </div>
    </div>
  );
};

export default ResultsDashboard;
