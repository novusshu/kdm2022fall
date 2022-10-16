import React from "react";
import { useFormContext } from "react-hook-form";

export const UnderstandingInput = ({ name, label, className, type, ...rest }) => {
  const {
    register,
    formState: { errors }
  } = useFormContext();

  return (
                <div className="form-row">
              <label htmlFor="item2" className="col-10 col-form-label">
                {list_items[1]}
              </label>
              <div className="col-2">
                <input
                  className="form-control"
                  type="text"
                  placeholder="Initials"
                  id="item2"
                />
              </div>
            </div>

    <div className={className}>
      <label htmlFor={name} className="form-label">
        {label}
      </label>
      <input
        type={type || "text"}
        className={`form-control ${errors[name] ? "is-invalid" : ""}`}
        {...register(name)}
        {...rest}
      />
      <div className="invalid-feedback">{errors[name]?.message}</div>
    </div>
  );
};
