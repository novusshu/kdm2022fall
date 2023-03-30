import { useFormContext } from "react-hook-form";
// import ReactTooltip from "react-tooltip";
import {
  AiFillQuestionCircle,
} from "react-icons/ai";
import { CRow, CFormInput, CFormLabel, CCol } from "@coreui/react";

export const Input = ({
  // labelStyle,
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
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <CRow className="mb-3">
      {/* <ReactTooltip backgroundColor={highlightColor} /> */}

      <CFormLabel
        htmlFor={name}
        // style={errors[name] ? { color: "red", fontWeight: "bold" } : labelStyle}
        className={`form-label col-sm-3 ${labelClass} ${
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
      </CFormLabel>
      <CCol className="col-sm-9">
        <CFormInput
          type={type || "text"}
          className={` ${inputClass} ${errors[name] ? "is-invalid border border-danger" : ""}`}
          id={name}
          placeholder={inputPlaceholder}
          {...register(name)}
          {...rest}
          // autoFocus
        />
      <div className="invalid-feedback">{errors[name]?.message}</div>
      </CCol>
    </CRow>
  );
};
