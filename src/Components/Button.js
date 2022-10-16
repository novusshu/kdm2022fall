import React from "react";
import { useFormContext } from "react-hook-form";

export const Button = ({ children }) => {
  const {
    formState: { isDirty, isSubmitting }
  } = useFormContext();

  return (
    <button type="submit" disabled={!isDirty || isSubmitting}>
      {children}
    </button>
  );
};
