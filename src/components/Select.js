import React from "react";
import { useFormContext } from "react-hook-form";
import ReactTooltip from "react-tooltip";
import { AiFillQuestionCircle } from "react-icons/ai";
import theme from "./theme";
import { CFormLabel, CRow, CFormSelect, CCol } from "@coreui/react";

export const Select = ({
  name,
  label,
  // className,
  labelClass,
  inputClass = "form-control",
  options,
  instructions,
  readOnly,
  defaultValue,
  ...rest
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const highlightColor = theme.highlightColor;

  return (
    // <div className={className}>
    <CRow className="mb-3">
      <ReactTooltip backgroundColor={highlightColor} />

      <CFormLabel
        htmlFor={name}
        aria-label={label}
        className={`form-label col-sm-3 ${labelClass}`}
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
      </CFormLabel>
      <CCol className="col-sm-9">
      <CFormSelect
        id={name}
        className={`${inputClass} ${errors[name] ? "is-invalid" : ""}`}
        disabled={readOnly}
        defaultValue={defaultValue}
        {...register(name)}
        {...rest}
      >
        {/* <option></option> */}
        {options.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </CFormSelect>
      <div className="invalid-feedback">{errors[name]?.message}</div>
      </CCol>
    </CRow>
  );
};
