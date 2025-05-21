// src/components/SmartFarmAdvisor/ui/InputField.tsx
import React, { FC } from "react";
import { InputFieldProps } from "../../../../types/interface";

const InputField: FC<InputFieldProps> = React.memo(
  ({
    id,
    name,
    label,
    value,
    onChange,
    type = "number",
    placeholder,
    error,
    helpText,
    disabled = false,
    required = true,
    ...rest
  }) => (
    <div className="flex flex-col">
      <label
        htmlFor={id}
        className="mb-1 block text-sm font-medium text-gray-300"
      >
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`w-full rounded-lg border bg-gray-800 p-2.5 text-white focus:ring-1 disabled:opacity-60 ${
          error
            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
            : "border-gray-600 focus:border-sky-500 focus:ring-sky-500"
        }`}
        {...rest}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      {!error && helpText && (
        <p className="mt-1 text-xs text-gray-400">{helpText}</p>
      )}
    </div>
  ),
);

export default InputField;
