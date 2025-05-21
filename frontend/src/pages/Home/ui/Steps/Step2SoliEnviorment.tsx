// src/components/SmartFarmAdvisor/steps/Step2SoilEnvironment.tsx
import { FC } from "react";
import { StepProps } from "../../../../types/interface";
import { SOIL_OPTIONS } from "../../../../constants/farmOptions";
import SelectField from "../components/SelectField";
import InputField from "../components/InputField";
import EducationalSnippet from "../components/EducationalTip";

const Step2SoilEnvironment: FC<StepProps> = ({
  formData,
  handleChange,
  errors,
  disabled,
}) => (
  <div className="space-y-6">
    <h3 className="text-xl font-semibold text-sky-300">
      Step 2: Soil & Environment Details
    </h3>
    <p className="text-sm text-gray-400">
      Describe your soil and local conditions for the best fertilizer match.
    </p>
    <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 md:grid-cols-3">
      <SelectField
        id="Soil_color"
        name="Soil_color"
        label="Soil Color"
        value={formData.Soil_color}
        options={SOIL_OPTIONS}
        onChange={handleChange}
        error={errors.Soil_color}
        disabled={disabled}
        required
      />
      <InputField
        id="Nitrogen"
        name="Nitrogen"
        label="Nitrogen (N)"
        value={formData.Nitrogen}
        placeholder="e.g., 75 kg/ha"
        onChange={handleChange}
        error={errors.Nitrogen}
        disabled={disabled}
        required
      />
      <InputField
        id="Phosphorus"
        name="Phosphorus"
        label="Phosphorus (P)"
        value={formData.Phosphorus}
        placeholder="e.g., 50 kg/ha"
        onChange={handleChange}
        error={errors.Phosphorus}
        disabled={disabled}
        required
      />
      <InputField
        id="Potassium"
        name="Potassium"
        label="Potassium (K)"
        value={formData.Potassium}
        placeholder="e.g., 100 kg/ha"
        onChange={handleChange}
        error={errors.Potassium}
        disabled={disabled}
        required
      />
      <InputField
        id="pH"
        name="pH"
        label="Soil pH"
        value={formData.pH}
        placeholder="e.g., 6.5"
        step="0.1"
        onChange={handleChange}
        error={errors.pH}
        disabled={disabled}
        required
      />
      <InputField
        id="Rainfall_Fert"
        name="Rainfall_Fert"
        label="Typical Rainfall (mm)"
        value={formData.Rainfall_Fert}
        placeholder="e.g., 700"
        helpText="For fertilizer context."
        onChange={handleChange}
        error={errors.Rainfall_Fert}
        disabled={disabled}
        required
      />
      <InputField
        id="Temperature"
        name="Temperature"
        label="Avg. Temperature (°C)"
        value={formData.Temperature}
        placeholder="e.g., 25"
        onChange={handleChange}
        error={errors.Temperature}
        disabled={disabled}
        required
      />
    </div>
    <div className="mt-3 text-sm text-gray-300">
      Nutrient Roles:
      <EducationalSnippet title="Nitrogen (N)">
        Vital for lush leaf growth and overall plant greenness.
      </EducationalSnippet>
      <EducationalSnippet title="Phosphorus (P)">
        Key for strong root development, flowering, and fruiting.
      </EducationalSnippet>
      <EducationalSnippet title="Potassium (K)">
        Boosts overall plant health, disease resistance, and fruit quality.
      </EducationalSnippet>
    </div>
  </div>
);

export default Step2SoilEnvironment;
