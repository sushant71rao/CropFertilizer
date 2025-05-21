// src/components/SmartFarmAdvisor/steps/Step1CropLocation.tsx
import { FC } from "react";
import { StepProps } from "../../../../types/interface";
import {
  CROP_OPTIONS,
  STATE_OPTIONS,
  SEASON_OPTIONS,
} from "../../../../constants/farmOptions";
import SelectField from "../components/SelectField";
import ContextualTip from "../components/ContextualTip";

const Step1CropLocation: FC<StepProps> = ({
  formData,
  handleChange,
  errors,
  disabled,
}) => (
  <div className="space-y-6">
    <h3 className="text-xl font-semibold text-sky-300">
      Step 1: Crop & Location
    </h3>
    <p className="text-sm text-gray-400">
      Let's start planning! Tell us about your crop and farm location.
    </p>
    <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 md:grid-cols-3">
      <SelectField
        id="Crop"
        name="Crop"
        label="Crop"
        value={formData.Crop}
        options={CROP_OPTIONS}
        onChange={handleChange}
        error={errors.Crop}
        disabled={disabled}
        required
      />
      <SelectField
        id="State"
        name="State"
        label="State"
        value={formData.State}
        options={STATE_OPTIONS}
        onChange={handleChange}
        error={errors.State}
        disabled={disabled}
        required
      />
      <SelectField
        id="Season"
        name="Season"
        label="Season"
        value={formData.Season}
        options={SEASON_OPTIONS}
        onChange={handleChange}
        error={errors.Season}
        disabled={disabled}
        required
      />
    </div>
    {formData.Crop &&
      formData.State &&
      formData.Season &&
      !errors.Crop &&
      !errors.State &&
      !errors.Season && (
        <ContextualTip>
          For {formData.Crop} in {formData.State} during {formData.Season},
          ensure proper seed treatment to boost early vigor.
        </ContextualTip>
      )}
  </div>
);

export default Step1CropLocation;
