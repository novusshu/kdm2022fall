import React from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "./Input";

export const InputGroups = ({ options, suffix = "", ...rest }) => {
  const {
    register,
    // formState: { errors }
  } = useFormContext();

  return (
    options &&
    options.map(option => (
      <Input
        key={option.name + suffix}
        label={option.label}
        {...register(option.name + suffix)}
        {...rest}
      />
    ))
  );
};
