import React from "react";
import { useFormContext } from "react-hook-form";
import ReactTooltip from "react-tooltip";
import { AiFillQuestionCircle } from "react-icons/ai";
import theme from "./theme";

export const Textarea = ({
  name,
  label,
  labelStyle,
  className,
  type,
  labelClass,
  inputClass,
  inputPlaceholder,
  instructions,
  required,
  minHeight = 200,
  ...rest
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  // let labelStyle = {}
  // if ({...rest}.style && Object.keys({...rest}.style).length > 0 ) {
  //   labelStyle = {color: 'aqua', fontWeight: 'bold'}
  // }
  const highlightColor = theme.highlightColor;

  return (
    <div className={className}>
      <ReactTooltip backgroundColor={highlightColor} />

      <label
        htmlFor={name}
        style={errors[name] ? { color: "red", fontWeight: "bold" } : labelStyle}
        className={`form-label ${labelClass}`}
      >
        {label} {required ? "*" : <i>(Optional)</i>}
        {instructions && (
          <AiFillQuestionCircle
            style={{ margin: "2px", color: highlightColor, fontSize: "17px" }}
            data-tip={instructions}
          />
        )}
      </label>
      <textarea
        type={type || "text"}
        style={{ minHeight: minHeight }}
        className={`form-control ${inputClass} ${
          errors[name] ? "is-invalid" : ""
        }`}
        id={name}
        placeholder={inputPlaceholder}
        {...register(name)}
        {...rest}
      />
      <div className="invalid-feedback">{errors[name]?.message}</div>
    </div>
  );
};
