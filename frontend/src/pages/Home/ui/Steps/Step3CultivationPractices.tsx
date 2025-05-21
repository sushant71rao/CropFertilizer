// src/components/SmartFarmAdvisor/steps/Step3CultivationPractices.tsx
import React, { FC } from "react";
import { StepProps } from "../../../../types/interface";
import InputField from "../components/InputField";
import ContextualTip from "../components/ContextualTip";

const Step3CultivationPractices: FC<StepProps> = ({
  formData,
  handleChange,
  errors,
  disabled,
}) => (
  <div className="space-y-6">
    <h3 className="text-xl font-semibold text-sky-300">
      Step 3: Cultivation Practices
    </h3>
    <p className="text-sm text-gray-400">
      Detail your planned area and management for yield estimation.
    </p>
    <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
      <InputField
        id="Area"
        name="Area"
        label="Area to Cultivate (Hectares)"
        value={formData.Area}
        placeholder="e.g., 10.5"
        onChange={handleChange}
        error={errors.Area}
        disabled={disabled}
        required
      />
      <InputField
        id="Annual_Rainfall_Yield"
        name="Annual_Rainfall_Yield"
        label="Expected Annual Rainfall (mm)"
        value={formData.Annual_Rainfall_Yield}
        placeholder="e.g., 1200"
        helpText="For yield context."
        onChange={handleChange}
        error={errors.Annual_Rainfall_Yield}
        disabled={disabled}
        required
      />
      <InputField
        id="Fertilizer_Quantity"
        name="Fertilizer_Quantity"
        label="Planned Fertilizer Quantity (Total kg)"
        value={formData.Fertilizer_Quantity}
        placeholder="e.g., 150"
        helpText="Total NPK product for the area."
        onChange={handleChange}
        error={errors.Fertilizer_Quantity}
        disabled={disabled}
        required
      />
      <InputField
        id="Pesticide"
        name="Pesticide"
        label="Planned Pesticide Quantity (Total kg or L)"
        value={formData.Pesticide}
        placeholder="e.g., 2.5"
        onChange={handleChange}
        error={errors.Pesticide}
        disabled={disabled}
        required
      />
    </div>
    <ContextualTip>
      The fertilizer quantity here is your planned application. We'll provide a
      specific fertilizer type recommendation in the analysis.
    </ContextualTip>
  </div>
);

export default Step3CultivationPractices;
