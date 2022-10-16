import React, { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "./Input";
// import { AutomaticQuestion } from "./AutomaticComponents";
import ReactTooltip from "react-tooltip";
import { AiFillQuestionCircle } from "react-icons/ai";
import theme from "./theme";
export const CheckboxFollowup = ({
  className,
  questions,
  style,
  currentFormDisplayQuestion,
  latestRetrievedForm,
  instructions,
}) => {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext();

  function Test() {
    questions.map((q) => {
      if (q.question_type == "checkbox_followup") {
        return (
          <Input
            name={q.questionID}
            label={q.question_text}
            type="checkbox"
            className="form-check col"
            labelClass="form-check-label"
            inputClass="form-check-input"
          />
        );
      }
    });
    return <div></div>;
  }
  const highlightColor = theme.highlightColor;
  const parentQuestionID = questions[0].questionID;
  // let parentChecked = watch(parentQuestionID);
  //   console.log(parentChecked);
  let latestValue = "";

  let [parentChecked, setParentChecked] = useState(watch(parentQuestionID));
  const [firstInteraction, setFirstInteraction] = useState(false);

  useEffect(() => {
    if (latestRetrievedForm && !firstInteraction) {
      setParentChecked(latestRetrievedForm[questions[0].questionID] === true);
    }
    const subscription = watch((value, { name, type }) => {
      // console.log(value, name, type);
      setFirstInteraction(true);
      if (name == questions[0].questionID) setParentChecked(watch(name));
    });
    return () => subscription.unsubscribe();
  }, [watch]);
  useEffect(() => {
    console.log(parentChecked);
  }, [parentChecked]);

  return (
    <div>
      {/* <Test></Test> */}
      <ReactTooltip backgroundColor={highlightColor} />

      {questions.map((q) => {
        if (q.question_type === "checkbox_followup") {
          // console.log(style)
          return (
            <Input
              labelStyle={style}
              name={q.questionID}
              label={q.question_text}
              type="checkbox"
              className="form-check col"
              labelClass="form-check-label"
              inputClass="form-check-input"
              defaultChecked={
                latestRetrievedForm
                  ? latestRetrievedForm[q.questionID] === true
                  : false
              }
              instructions={instructions}
            />
          );
        }
      })}
      {/* <div className="row"> */}
      {/*     {/\* <div>{parentChecked? "true": "false"}</div> */}
      {/*     <div>{firstInteraction? "true": "false"}</div> *\/} */}
      {/*     {parentChecked && questions.map(followup_q => { */}
      {/*         // console.log(followup_q.parent_questionID, parentQuestionID) */}

      {/*         if (followup_q.parent_questionID === parentQuestionID) { */}
      {/*             const independentQ = JSON.parse(JSON.stringify(followup_q)); */}
      {/*             independentQ.parent_questionID = ""; */}
      {/*             return <AutomaticQuestion */}
      {/*                 q = {independentQ} */}
      {/*                 currentFormDisplayQuestion = {currentFormDisplayQuestion} */}
      {/*                 latestRetrievedForm = {latestRetrievedForm} */}
      {/*             /> */}
      {/*             // return <p>checked</p> */}
      {/*         } */}
      {/*         // else { */}
      {/*         //     return <p>{followup_q.questionID}</p> */}
      {/*         // } */}
      {/*     })} */}
      {/* </div> */}
    </div>
  );
};
