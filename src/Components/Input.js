import React, { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import ReactTooltip from "react-tooltip";
import {
  AiFillLock,
  AiFillQuestionCircle,
  AiOutlineLock,
} from "react-icons/ai";

export const Input = ({
  labelStyle,
  name,
  label,
  className,
  type,
  labelClass,
  inputClass = "form-control",
  inputPlaceholder,
  instructions,
  required,
  encrypted,
  additionalIcons,
  ...rest
}) => {
  const {
    watch,
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className={className}>
      {/* <ReactTooltip backgroundColor={highlightColor} /> */}

      <label
        htmlFor={name}
        style={errors[name] ? { color: "red", fontWeight: "bold" } : labelStyle}
        className={`form-label ${labelClass} ${
          required && errors[name] && "text-danger"
        }`}
      >
        {label} 
        {instructions && (
          <AiFillQuestionCircle
            style={{
              marginLeft: "2px",
              marginBottom: "3px",
              // color: highlightColor,
              fontSize: "17px",
            }}
            data-tip={instructions}
          />
        )}
      </label>
        <input
          type={type || "text"}
          className={`${inputClass} ${errors[name] ? "is-invalid" : ""}`}
          id={name}
          placeholder={inputPlaceholder}
          {...register(name)}
          {...rest}
          // autoFocus
        />
      <div className="invalid-feedback">{errors[name]?.message}</div>
    </div>
  );
};
