import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import ReactTooltip from "react-tooltip";
import { AiFillQuestionCircle, AiOutlineInfoCircle } from "react-icons/ai";
import theme from "./theme";
import { processID } from "./Utils";

export const Checkbox = ({
  className,
  groupname,
  label,
  options,
  style,
  checked,
  latestRetrievedForm,
  instructions,
  requiredOptions,
}) => {
  const {
    register,
    watch,
    formState: { errors },
    getValues,
  } = useFormContext();
  // console.log(options);
  // console.log(watch(groupname + '.' + 'Other'));
  // const [isChecked, setIsChecked] = useState(false);

  // const handleOnChange = () => {
  //   setIsChecked(!isChecked);
  // };
  // function Test() {
  //   options.forEach(({ name }, index) => {
  //     console.log(name);
  //     console.log(name.replace(/,/g, "-"));
  //   });
  //   return <div></div>;
  // }
  const highlightColor = theme.highlightColor;

  let latestValue = null;

  if (latestRetrievedForm) {
    latestValue = latestRetrievedForm[groupname];
    // console.log('latestValue', latestValue)
    // options.map(({ name }, index) => {
    //   console.log(name, latestValue[processID(name)] == name);
    // })
  }
  // let parentChecked = watch(parentQuestionID);
  const otherCodeWords = [
    "Federal grant. Please specify:",
    "Other",
    "Other services provided to students",
    "Part of Other Campus Division (Please Specify)",
  ];
  const [firstInteraction, setFirstInteraction] = useState(false);
  console.log("requiredOptions", requiredOptions);
  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      // console.log(value, name, type);

      setFirstInteraction(true);
    });
    return () => subscription.unsubscribe();
  }, [firstInteraction, watch]);
  useEffect(() => {
    // console.log(firstInteraction)
  }, [firstInteraction]);
  const handleChange = (e) => {
    console.log(e.target);
  };

  return (
    <div className={className || "col mb-3"}>
      <ReactTooltip backgroundColor={highlightColor} />

      {/* <Test></Test> */}
      {/* <div style = {style}>{label}</div> */}
      {label != "" && (
        <label
          htmlFor={groupname}
          style={
            errors[groupname] ? { color: "red", fontWeight: "bold" } : style
          }
          className={`form-label`}
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
      {options &&
        options.map(({ name }, index) => (
          <div key={`${index}`} className="form-check">
            {otherCodeWords.includes(name) ? (
              <>
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={groupname + ".check" + processID(name)}
                  /* value={name} */
                  defaultChecked={
                    !firstInteraction
                      ? latestValue &&
                        latestValue["check" + processID(name)] === true
                      : watch(groupname + ".check" + processID(name))
                  }
                  // defaultChecked={
                  //   checked && checked["check" + name.match(/\w+/g).join("_")]
                  // }
                  {...register(
                    groupname + ".check" + processID(name)
                    /*   onChange: handleOnChange */
                  )}
                />
                <label
                  className="form-check-label"
                  htmlFor={groupname + ".check" + processID(name)}
                >
                  {name} {requiredOptions.includes(name) && "*"}
                </label>
                {/* <div>{(latestValue["check" + name.match(/\w+/g).join("_")] === true)? "true" : "false"} </div>
                <div>{(firstInteraction === true)? "true" : "false"} </div>
                <div>{watch(groupname + ".check" + name.match(/\w+/g).join("_")) ? "true" : "false"} </div> */}

                {/* {watch(groupname + ".check" + name.match(/\w+/g).join("_")) === true  && */}
                {!firstInteraction
                  ? latestValue &&
                    latestValue["check" + processID(name)] === true && (
                      <input
                        type="text"
                        id={`${index}`}
                        className="form-control"
                        // defaultValue={
                        //   checked && checked["other" + name.match(/\w+/g).join("_")]
                        // }
                        defaultValue={
                          latestValue && latestValue["other" + processID(name)]
                        }
                        {...register(groupname + ".other" + processID(name))}
                      />
                    )
                  : watch(groupname + ".check" + processID(name)) && (
                      <input
                        type="text"
                        id={`${index}`}
                        className="form-control"
                        // defaultValue={
                        //   checked && checked["other" + name.match(/\w+/g).join("_")]
                        // }
                        defaultValue={
                          latestValue && latestValue["other" + processID(name)]
                        }
                        {...register(groupname + ".other" + processID(name))}
                      />
                    )}
              </>
            ) : (
              <>
                {/* <div>{latestValue && latestValue[name]}</div> */}
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={groupname + "." + processID(name)}
                  // value={true}
                  value={name}
                  // checked = {name === latestValue[name]}
                  defaultChecked={
                    latestValue && latestValue[processID(name)] == name
                  }
                  // defaultChecked={checked && checked[name]}

                  {...register(groupname + "." + processID(name))}
                />
                {/* {console.log(Object.keys(checked))} */}
                <label
                  className={`form-check-label ${
                    requiredOptions.includes(name) &&
                    errors[groupname] &&
                    watch(groupname + "." + processID(name)) == false &&
                    "text-danger"
                  }`}
                  htmlFor={groupname + "." + processID(name)}
                >
                  {name} {requiredOptions.includes(name) && "*"}{" "}
                  {requiredOptions.includes(name) && (
                    <AiOutlineInfoCircle
                      style={{
                        marginLeft: "2px",
                        marginBottom: "3px",
                        color: highlightColor,
                        fontSize: "17px",
                      }}
                      data-tip={"Required"}
                    />
                  )}
                </label>
              </>
            )}
          </div>
        ))}

      <div className="text-danger">{errors[groupname]?.message}</div>
    </div>
  );
};
