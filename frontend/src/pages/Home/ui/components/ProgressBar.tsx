// src/components/SmartFarmAdvisor/ui/ProgressBar.tsx
import React, { FC } from "react";
import { ProgressBarProps } from "../../../../types/interface";

const ProgressBar: FC<ProgressBarProps> = ({ currentStep, totalSteps }) => {
  const actualTotalStepsForProgress = totalSteps;
  const displayStep =
    currentStep > actualTotalStepsForProgress
      ? actualTotalStepsForProgress
      : currentStep;
  // Ensure denominator is not zero for progress calculation, default to 1 if totalSteps is 1.
  const denominator =
    actualTotalStepsForProgress > 1 ? actualTotalStepsForProgress - 1 : 1;
  const progressPercentage = ((displayStep - 1) / denominator) * 100;

  const stepNames = [
    "Crop & Location",
    "Soil & Environment",
    "Cultivation Practices",
    "Analysis Results",
  ];
  const currentStepName =
    currentStep <= stepNames.length
      ? stepNames[currentStep - 1]
      : stepNames[stepNames.length - 1];

  return (
    <div className="mb-8">
      <div className="mb-1 flex justify-between text-sm font-medium text-gray-400">
        <span>
          {currentStep <= actualTotalStepsForProgress
            ? `Step ${displayStep} of ${actualTotalStepsForProgress}`
            : "Results"}
        </span>
        <span>{currentStepName}</span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-gray-700">
        <div
          className="h-2.5 rounded-full bg-sky-500 transition-all duration-500 ease-out"
          style={{
            width: `${
              currentStep > actualTotalStepsForProgress
                ? 100
                : progressPercentage
            }%`,
          }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
