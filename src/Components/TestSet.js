// import React from "react";
// import {
//   vals1,
//   vals2,
//   vals3,
//   vals_intern,
//   vals_research,
//   vals_transcript,
//   vals_understand,
//   vals_participation,
//   vals_awareness,
//   vals_project,
//   vals_institute,
//   keys1,
//   keys2,
//   keys3,
//   keys_intern,
//   keys_research,
//   keys_transcript,
//   keys_understand,
//   keys_awareness,
//   keys_participation,
//   keys_project,
//   keys_institute,
//   labels_mentor,
//   labels_transcript,
//   labels_participate,
//   labels_institute,
//   Steps,
//   ModifySteps
// } from "../Chatbot/StepGenerate";
// import {
//   useForm,
//   FormProvider,
//   useFormContext,
//   useFieldArray
// } from "react-hook-form";

// const TestSet = props => {
//   // const {
//   //   register,
//   //   formState: { errors },
//   //   setValue,
//   //   control
//   // } = useFormContext();

//   // const { update, append } = useFieldArray({ control, name: "race" });

//   const Compare = (A, B) => {
//     let out = A.filter(v => B.includes(v));
//     return out;
//   };
//   return (
//     <div>
//       {console.log(
//         Compare(Object.keys(labels_mentor), Object.keys(labels_transcript))
//       )}
//       {console.log(
//         Compare(Object.values(labels_mentor), Object.values(labels_transcript))
//       )}

//       {console.log(
//         Compare(Object.keys(labels_mentor), Object.keys(labels_participate))
//       )}
//       {console.log(
//         Compare(Object.values(labels_mentor), Object.values(labels_participate))
//       )}
//       {console.log(
//         Compare(Object.keys(labels_transcript), Object.keys(labels_participate))
//       )}
//       {console.log(
//         Compare(
//           Object.values(labels_transcript),
//           Object.values(labels_participate)
//         )
//       )}

//       {/* <button */}
//       {/*   type="button" */}
//       {/*   onClick={() => setValue("race.3", true)} */}
//       {/*   /\* onClick={() => append(["white"])} *\/ */}
//       {/* > */}
//       {/*   setValue */}
//       {/* </button> */}
//     </div>
//   );
// };

// export default TestSet;
