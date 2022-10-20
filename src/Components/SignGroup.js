import React from "react";
import { useFormContext } from "react-hook-form";

export const SignGroup = ({ className, name, label, options }) => {
  const {
    register,
    formState: { errors }
  } = useFormContext();

  return (
    <div className={className || "form-group"}>
      <div>{label}</div>
      {options &&
        options.map(option => (
          <div key={option.value} className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="radio"
              id={`${name + option.value}`}
              value={option.value}
              {...register(name)}
            />
            <label
              className="form-check-label"
              htmlFor={`${name + option.value}`}
            >
              {option.label}
            </label>
          </div>
        ))}
      <div className="text-danger">{errors[name]?.message}</div>
    </div>
  );
};
