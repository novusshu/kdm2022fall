import React, { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { BsFillPlusCircleFill } from "react-icons/bs";
import ReactTooltip from "react-tooltip";
import { AiFillQuestionCircle } from "react-icons/ai";
import theme from "./theme";

const highlightColor = theme.highlightColor;

export const RadioGroup = ({
  className,
  name,
  label,
  options,
  labelClass,
  optionclass,
  otherlabelname,
  style,
  checked,
  checkedother,
  latestRetrievedForm,
  instructions,
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  // console.log(latestRetrievedForm);
  // const [latestValue, setLatestValue] = useState('Male') ;
  let latestValue = "";
  if (latestRetrievedForm)
    if (name.includes(".")) {
      //which means it's a rating bubble
      // const groupname = name.split('.')[0]
      // const statement = name.split('.')[1]
      const [groupname, statement] = name.split(".");
      // console.log(groupname, statement)
      latestValue = latestRetrievedForm[groupname][statement];
      console.log(latestValue);
    } else {
      latestValue = latestRetrievedForm[name];
    }
  // console.log(latestRetrievedForm)
  const processID = (rawID) => {
    return rawID.replaceAll(",", "-").replaceAll(".", "-");
  };
  return (
    <div className={className || "mb-3 col"}>
      <ReactTooltip backgroundColor={highlightColor} />

      {label.includes("Other, ") ? (
        <>
          <input
            type="text"
            className={labelClass}
            placeholder={label}
            key={label}
            /* defaultValue={checked[otherlabelname]} */
            {...register(name + "-key")}
          />
        </>
      ) : (
        <label
          htmlFor={name}
          style={errors[name] ? { color: "red", fontWeight: "bold" } : style}
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
      )}

      <div className={optionclass}>
        {options &&
          options.map((option) => (
            <div
              key={name + option.value}
              className="form-check form-check-inline"
            >
              <input
                className="form-check-input col form-check-inline"
                type="radio"
                id={`${name + option.value}`}
                value={option.value}
                // defaultChecked={option.value === checked}
                defaultChecked={option.value == latestValue}
                // checked = {option.value === latestValue}
                // defaultChecked = {true}
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
      </div>
      <div className="text-danger">{errors[name]?.message}</div>
    </div>
  );
};
