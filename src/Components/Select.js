import React from "react";
import { useFormContext } from "react-hook-form";
import ReactTooltip from "react-tooltip";
import { AiFillQuestionCircle } from "react-icons/ai";
import theme from "./theme";

export const Select = ({
  name,
  label,
  className,
  labelClass,
  inputClass = "form-control",
  options,
  instructions,
  ...rest
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const highlightColor = theme.highlightColor;

  return (
    <div className={className}>
      <ReactTooltip backgroundColor={highlightColor} />

      <label
        htmlFor={name}
        aria-label={label}
        className={`form-label ${labelClass}`}
      >
        {label}
        {instructions && (
          <AiFillQuestionCircle
            style={{
              marginLeft: "2px",
              marginBottom: "3px",
              color: highlightColor,
              fontSize: "17px",
            }}
            data-tip={instructions}
          />
        )}
      </label>
      <select
        id={name}
        className={`${inputClass} ${errors[name] ? "is-invalid" : ""}`}
        {...register(name)}
        {...rest}
      >
        <option></option>
        {options.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
      <div className="invalid-feedback">{errors[name]?.message}</div>
    </div>
  );
};
