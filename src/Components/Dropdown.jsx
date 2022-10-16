import React, { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { useSelect } from "downshift";

export const Dropdown = ({
  name,
  options,
  label,
  initialValue,
  placeholder = "Select...",
  required,
  validation
}) => {
  const {
    register,
    setValue,
    getValues,
    errors,
    clearErrors
  } = useFormContext();
  const error = errors[name];

  const findInitialItem = () => {
    const defaultValue = initialValue || getValues()[name];
    if (defaultValue) {
      return options.find(o => o.value === defaultValue);
    }
  };

  const {
    isOpen,
    selectedItem,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    getItemProps
  } = useSelect({
    items: options,
    initialSelectedItem: findInitialItem()
  });

  useEffect(() => {
    if (selectedItem) {
      setValue(name, selectedItem.value);
      error && clearErrors(name);
    }
  }, [selectedItem, name, setValue, error, clearErrors]);

  return (
    <div>
      <button type="button" {...getToggleButtonProps()}>
        <label {...getLabelProps()}>{label}</label>
        <input type="hidden" name={name} ref={register({ required })} />
        <div>{selectedItem ? selectedItem.text : placeholder}</div>
      </button>
      <div {...getMenuProps()}>
        {isOpen &&
          options.map((item, index) => (
            <div
              key={`${item.value}${index}`}
              {...getItemProps({ item, index })}
            >
              {item.text}
            </div>
          ))}
      </div>
      {error && <i>{error.message}</i>}
    </div>
  );
};
