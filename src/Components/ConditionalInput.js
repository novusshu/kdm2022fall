import React, { useEffect, useState } from "react";
// import ReactDOM from "react-dom";
import { useFormContext } from "react-hook-form";

export const ConditionalInput = () => {
  const { setValue, register, unregister } = useFormContext();
  const [value, setReactSelect] = useState("");
  const handleChange = (selectedOption) => {
    setValue("reactSelect", selectedOption);
    setReactSelect({ selectedOption });
  };

  useEffect(() => {
    register({ name: "Interests" }, { required: true });
    return () => {
      unregister("interests");
    };
  }, [register, unregister]);

  return (
    <div>
      <label>"interests"</label>
      <input
        type="text"
        defaultValue={value}
        name="interests"
        onChange={handleChange}
      />
    </div>
  );
};
