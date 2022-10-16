import * as Yup from "yup";

export const validationSchema_m = Yup.object().shape({
  firstName: Yup.string().required("Required"),
  middleName: Yup.string(),
  lastName: Yup.string().required("Required"),
  mailingAddress: Yup.string().required("Required"),
  city: Yup.string().required("Required"),
  state: Yup.string().required("Required"),
  zip: Yup.number()
    .integer()
    .typeError("Please use the correct Zip format")
    .nullable(true)
    .transform((_, val) => (val ? Number(val) : null))
    .required("Required"),
  email: Yup.string()
    .required("Required")
    .email("Email is invalid"),
  // telephone: Yup.number()
  //   .integer()
  //   .typeError("Only numbers are allowed")
  //   .nullable(true)
  //   .transform((_, val) => (val ? Number(val) : null)),
  callType: Yup.string().typeError("Required"),
  call: Yup.number()
    .integer()
    .typeError("Required, please enter only numbers")
    // .nullable(true)
    .transform((_, val) => (val ? Number(val) : null)),
  gender: Yup.string()
    .required("Select!")
    .typeError("Required"),
  dob: Yup.string()
    .required("Required")
    .matches(
      /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/,
      "Date of Birth must be a valid date in the format YYYY-MM-DD"
    ),
  year: Yup.string().typeError("Required"),
  transfer: Yup.string().typeError("Required"),
  veteran: Yup.string().typeError("Required"),
  citizen: Yup.string().nullable(),
  resident: Yup.string().nullable(),
  ethnicity: Yup.string().nullable(),
  major: Yup.string().required("Required"),
  interests: Yup.string(),
  gpa: Yup.number()
    .typeError("Please enter a number")
    .nullable(true)
    .transform((_, val) => (val ? Number(val) : null))
    .max(5)
    .min(0),
  // race: Yup.array(),
  degreeComplete: Yup.string()
    .required("Required")
    .matches(
      /^\d{4}-(0[1-9]|1[012])$/,
      "Degree completed date must be a valid date in the format YYYY-MM"
    ),
  maleDegree: Yup.string()
    .required("Select!")
    .typeError("Required"),
  femaleDegree: Yup.string()
    .required("Select!")
    .typeError("Required"),
  guardian: Yup.string(),
  permanentAddress: Yup.string(),
  signature: Yup.string().required("Required"),
  date: Yup.string().required("Required"),
  acceptTerms: Yup.bool().oneOf([true], "Accept Ts & Cs is required")
});

export const validationSchema_u = Yup.object().shape({
  initOne: Yup.bool()
    .transform((_, val) =>
      Boolean(
        ![
          false,
          "n",
          "nn",
          "nnn",
          "no",
          "nope",
          "",
          "false",
          undefined
        ].includes(val)
      )
    )
    .oneOf([true], "You must agree to proceed."),
  initTwo: Yup.bool()
    .transform((_, val) =>
      Boolean(
        ![
          false,
          "n",
          "nn",
          "nnn",
          "no",
          "nope",
          "",
          "false",
          undefined
        ].includes(val)
      )
    )
    .oneOf([true], "You must agree to proceed."),
  initThree: Yup.bool()
    .transform((_, val) =>
      Boolean(
        ![
          false,
          "n",
          "nn",
          "nnn",
          "no",
          "nope",
          "",
          "false",
          undefined
        ].includes(val)
      )
    )
    .oneOf([true], "You must agree to proceed."),
  initFour: Yup.bool()
    .transform((_, val) =>
      Boolean(
        ![
          false,
          "n",
          "nn",
          "nnn",
          "no",
          "nope",
          "",
          "false",
          undefined
        ].includes(val)
      )
    )
    .oneOf([true], "You must agree to proceed."),
  initFive: Yup.bool()
    .transform((_, val) =>
      Boolean(
        ![
          false,
          "n",
          "nn",
          "nnn",
          "no",
          "nope",
          "",
          "false",
          undefined
        ].includes(val)
      )
    )
    .oneOf([true], "You must agree to proceed."),
  initSix: Yup.bool()
    .transform((_, val) =>
      Boolean(
        ![
          false,
          "n",
          "nn",
          "nnn",
          "no",
          "nope",
          "",
          "false",
          undefined
        ].includes(val)
      )
    )
    .oneOf([true], "You must agree to proceed."),
  initSeven: Yup.bool()
    .transform((_, val) =>
      Boolean(
        ![
          false,
          "n",
          "nn",
          "nnn",
          "no",
          "nope",
          "",
          "false",
          undefined
        ].includes(val)
      )
    )
    .oneOf([true], "You must agree to proceed."),
  initEight: Yup.bool()
    .transform((_, val) =>
      Boolean(
        ![
          false,
          "n",
          "nn",
          "nnn",
          "no",
          "nope",
          "",
          "false",
          undefined
        ].includes(val)
      )
    )
    .oneOf([true], "You must agree to proceed."),
  initNine: Yup.bool()
    .transform((_, val) =>
      Boolean(
        ![
          false,
          "n",
          "nn",
          "nnn",
          "no",
          "nope",
          "",
          "false",
          undefined
        ].includes(val)
      )
    )
    .oneOf([true], "You must agree to proceed.")
});

export const validationSchema_t = Yup.object().shape({
  firstName: Yup.string().required("Required"),
  lastName: Yup.string().required("Required"),
  school: Yup.string().required("Required"),
  major: Yup.string().required("Required"),
  degree: Yup.string()
    .required("Select!")
    .typeError("Required"),
  degreeComplete: Yup.string()
    .required("Required")
    .matches(
      /^\d{4}-(0[1-9]|1[012])$/,
      "Degree completed date must be a valid date in the format YYYY-MM"
    ),
  academicyear: Yup.string()
    .required("Select!")
    .typeError("Required"),
  session: Yup.string()
    .required("Select!")
    .typeError("Required"),
  outcome: Yup.string()
    .required("Select!")
    .typeError("Required")
  // transcriptupload: Yup.mixed().test(
  //   "required",
  //   "You need to provide a file",
  //   value => {
  //     return value && value.length;
  //   }
  // )
});

export const validationSchema_p = Yup.object().shape({
  awareness_highschool: Yup.number()
    .integer()
    .max(5, "Choose a number betwen 1 to 5")
    .min(1, "Choose a number betwen 1 to 5")
    .typeError("Choose a number betwen 1 to 5"),
  awareness_precollegestem: Yup.number()
    .integer()
    .max(5, "Choose a number betwen 1 to 5")
    .min(1, "Choose a number betwen 1 to 5")
    .typeError("Choose a number betwen 1 to 5"),
  awareness_precollegebridge: Yup.number()
    .integer()
    .max(5, "Choose a number betwen 1 to 5")
    .min(1, "Choose a number betwen 1 to 5")
    .typeError("Choose a number betwen 1 to 5"),
  awareness_collegecounseling: Yup.number()
    .integer()
    .max(5, "Choose a number betwen 1 to 5")
    .min(1, "Choose a number betwen 1 to 5")
    .typeError("Choose a number betwen 1 to 5"),
  awareness_coaching: Yup.number()
    .integer()
    .max(5, "Choose a number betwen 1 to 5")
    .min(1, "Choose a number betwen 1 to 5")
    .typeError("Choose a number betwen 1 to 5"),
  awareness_partners: Yup.number()
    .integer()
    .max(5, "Choose a number betwen 1 to 5")
    .min(1, "Choose a number betwen 1 to 5")
    .typeError("Choose a number betwen 1 to 5"),
  awareness_community: Yup.number()
    .integer()
    .max(5, "Choose a number betwen 1 to 5")
    .min(1, "Choose a number betwen 1 to 5")
    .typeError("Choose a number betwen 1 to 5"),
  awareness_finaid: Yup.number()
    .integer()
    .max(5, "Choose a number betwen 1 to 5")
    .min(1, "Choose a number betwen 1 to 5")
    .typeError("Choose a number betwen 1 to 5"),
  awareness_si: Yup.number()
    .integer()
    .max(5, "Choose a number betwen 1 to 5")
    .min(1, "Choose a number betwen 1 to 5")
    .typeError("Choose a number betwen 1 to 5"),
  awareness_research: Yup.number()
    .integer()
    .max(5, "Choose a number betwen 1 to 5")
    .min(1, "Choose a number betwen 1 to 5")
    .typeError("Choose a number betwen 1 to 5"),
  awareness_abroad: Yup.number()
    .integer()
    .max(5, "Choose a number betwen 1 to 5")
    .min(1, "Choose a number betwen 1 to 5")
    .typeError("Choose a number betwen 1 to 5"),
  awareness_career: Yup.number()
    .integer()
    .max(5, "Choose a number betwen 1 to 5")
    .min(1, "Choose a number betwen 1 to 5")
    .typeError("Choose a number betwen 1 to 5"),
  awareness_disability: Yup.number()
    .integer()
    .max(5, "Choose a number betwen 1 to 5")
    .min(1, "Choose a number betwen 1 to 5")
    .typeError("Choose a number betwen 1 to 5"),
  awareness_careerfair: Yup.number()
    .integer()
    .max(5, "Choose a number betwen 1 to 5")
    .min(1, "Choose a number betwen 1 to 5")
    .typeError("Choose a number betwen 1 to 5"),
  // awareness_other_specify: Yup.string()
  awareness_other: Yup.number()
    .integer()
    .nullable()
    .max(5, "Choose a number betwen 1 to 5")
    .min(1, "Choose a number betwen 1 to 5")
    .typeError("Choose a number betwen 1 to 5"),
  participation_highschool: Yup.number()
    .integer()
    .max(5, "Choose a number betwen 1 to 5")
    .min(1, "Choose a number betwen 1 to 5")
    .typeError("Choose a number betwen 1 to 5"),
  participation_precollegestem: Yup.number()
    .integer()
    .max(5, "Choose a number betwen 1 to 5")
    .min(1, "Choose a number betwen 1 to 5")
    .typeError("Choose a number betwen 1 to 5"),
  participation_precollegebridge: Yup.number()
    .integer()
    .max(5, "Choose a number betwen 1 to 5")
    .min(1, "Choose a number betwen 1 to 5")
    .typeError("Choose a number betwen 1 to 5"),
  participation_collegecounseling: Yup.number()
    .integer()
    .max(5, "Choose a number betwen 1 to 5")
    .min(1, "Choose a number betwen 1 to 5")
    .typeError("Choose a number betwen 1 to 5"),
  participation_coaching: Yup.number()
    .integer()
    .max(5, "Choose a number betwen 1 to 5")
    .min(1, "Choose a number betwen 1 to 5")
    .typeError("Choose a number betwen 1 to 5"),
  participation_partners: Yup.number()
    .integer()
    .max(5, "Choose a number betwen 1 to 5")
    .min(1, "Choose a number betwen 1 to 5")
    .typeError("Choose a number betwen 1 to 5"),
  participation_community: Yup.number()
    .integer()
    .max(5, "Choose a number betwen 1 to 5")
    .min(1, "Choose a number betwen 1 to 5")
    .typeError("Choose a number betwen 1 to 5"),
  participation_finaid: Yup.number()
    .integer()
    .max(5, "Choose a number betwen 1 to 5")
    .min(1, "Choose a number betwen 1 to 5")
    .typeError("Choose a number betwen 1 to 5"),
  participation_si: Yup.number()
    .integer()
    .max(5, "Choose a number betwen 1 to 5")
    .min(1, "Choose a number betwen 1 to 5")
    .typeError("Choose a number betwen 1 to 5"),
  participation_research: Yup.number()
    .integer()
    .max(5, "Choose a number betwen 1 to 5")
    .min(1, "Choose a number betwen 1 to 5")
    .typeError("Choose a number betwen 1 to 5"),
  participation_abroad: Yup.number()
    .integer()
    .max(5, "Choose a number betwen 1 to 5")
    .min(1, "Choose a number betwen 1 to 5")
    .typeError("Choose a number betwen 1 to 5"),
  participation_career: Yup.number()
    .integer()
    .max(5, "Choose a number betwen 1 to 5")
    .min(1, "Choose a number betwen 1 to 5")
    .typeError("Choose a number betwen 1 to 5"),
  participation_disability: Yup.number()
    .integer()
    .max(5, "Choose a number betwen 1 to 5")
    .min(1, "Choose a number betwen 1 to 5")
    .typeError("Choose a number betwen 1 to 5"),
  participation_careerfair: Yup.number()
    .integer()
    .max(5, "Choose a number betwen 1 to 5")
    .min(1, "Choose a number betwen 1 to 5")
    .typeError("Choose a number betwen 1 to 5"),
  // participation_other_specify: Yup.string()
  participation_other: Yup.number()
    .integer()
    .nullable()
    .max(5, "Choose a number betwen 1 to 5")
    .min(1, "Choose a number betwen 1 to 5")
    .typeError("Choose a number betwen 1 to 5")
});

export const validationSchema_i = Yup.object().shape({
  school: Yup.string().required("Required"),
  nstudent: Yup.number()
    .typeError("Please enter a number")
    .nullable(true)
    .transform((_, val) => (val ? Number(val) : null)),
  nstudentstem: Yup.number()
    .typeError("Please enter a number")
    .nullable(true)
    .transform((_, val) => (val ? Number(val) : null)),
  nstudentDisable: Yup.number()
    .typeError("Please enter a number")
    .nullable(true)
    .transform((_, val) => (val ? Number(val) : null)),
  nstudentStemDisable: Yup.number()
    .typeError("Please enter a number")
    .nullable(true)
    .transform((_, val) => (val ? Number(val) : null)),
  latino: Yup.number()
    .typeError("Please enter a number")
    .nullable(true)
    .transform((_, val) => (val ? Number(val) : null)),
  nonlatino: Yup.number()
    .typeError("Please enter a number")
    .nullable(true)
    .transform((_, val) => (val ? Number(val) : null)),
  native: Yup.number()
    .typeError("Please enter a number")
    .nullable(true)
    .transform((_, val) => (val ? Number(val) : null)),
  asian: Yup.number()
    .typeError("Please enter a number")
    .nullable(true)
    .transform((_, val) => (val ? Number(val) : null)),
  black: Yup.number()
    .typeError("Please enter a number")
    .nullable(true)
    .transform((_, val) => (val ? Number(val) : null)),
  islander: Yup.number()
    .typeError("Please enter a number")
    .nullable(true)
    .transform((_, val) => (val ? Number(val) : null)),
  arab: Yup.number()
    .typeError("Please enter a number")
    .nullable(true)
    .transform((_, val) => (val ? Number(val) : null)),
  white: Yup.number()
    .typeError("Please enter a number")
    .nullable(true)
    .transform((_, val) => (val ? Number(val) : null)),
  multiple: Yup.number()
    .typeError("Please enter a number")
    .nullable(true)
    .transform((_, val) => (val ? Number(val) : null)),
  na: Yup.number()
    .typeError("Please enter a number")
    .nullable(true)
    .transform((_, val) => (val ? Number(val) : null)),
  latinoDisable: Yup.number()
    .typeError("Please enter a number")
    .nullable(true)
    .transform((_, val) => (val ? Number(val) : null)),
  nonlatinoDisable: Yup.number()
    .typeError("Please enter a number")
    .nullable(true)
    .transform((_, val) => (val ? Number(val) : null)),
  nativeDisable: Yup.number()
    .typeError("Please enter a number")
    .nullable(true)
    .transform((_, val) => (val ? Number(val) : null)),
  asianDisable: Yup.number()
    .typeError("Please enter a number")
    .nullable(true)
    .transform((_, val) => (val ? Number(val) : null)),
  blackDisable: Yup.number()
    .typeError("Please enter a number")
    .nullable(true)
    .transform((_, val) => (val ? Number(val) : null)),
  islanderDisable: Yup.number()
    .typeError("Please enter a number")
    .nullable(true)
    .transform((_, val) => (val ? Number(val) : null)),
  arabDisable: Yup.number()
    .typeError("Please enter a number")
    .nullable(true)
    .transform((_, val) => (val ? Number(val) : null)),
  whiteDisable: Yup.number()
    .typeError("Please enter a number")
    .nullable(true)
    .transform((_, val) => (val ? Number(val) : null)),
  multipleDisable: Yup.number()
    .typeError("Please enter a number")
    .nullable(true)
    .transform((_, val) => (val ? Number(val) : null)),
  naDisable: Yup.number()
    .typeError("Please enter a number")
    .nullable(true)
    .transform((_, val) => (val ? Number(val) : null)),
  //   service:
  // service.other":
  brain: Yup.number()
    .typeError("Please enter a number")
    .nullable(true)
    .transform((_, val) => (val ? Number(val) : null)),
  add: Yup.number()
    .typeError("Please enter a number")
    .nullable(true)
    .transform((_, val) => (val ? Number(val) : null)),
  blind: Yup.number()
    .typeError("Please enter a number")
    .nullable(true)
    .transform((_, val) => (val ? Number(val) : null)),
  deaf: Yup.number()
    .typeError("Please enter a number")
    .nullable(true)
    .transform((_, val) => (val ? Number(val) : null)),
  learning: Yup.number()
    .typeError("Please enter a number")
    .nullable(true)
    .transform((_, val) => (val ? Number(val) : null)),
  orthopedic: Yup.number()
    .typeError("Please enter a number")
    .nullable(true)
    .transform((_, val) => (val ? Number(val) : null)),
  psycho: Yup.number()
    .typeError("Please enter a number")
    .nullable(true)
    .transform((_, val) => (val ? Number(val) : null)),
  speech: Yup.number()
    .typeError("Please enter a number")
    .nullable(true)
    .transform((_, val) => (val ? Number(val) : null)),
  medical: Yup.number()
    .typeError("Please enter a number")
    .nullable(true)
    .transform((_, val) => (val ? Number(val) : null)),
  OtherS: Yup.number()
    .typeError("Please enter a number")
    .nullable(true)
    .transform((_, val) => (val ? Number(val) : null)),
  OtherN: Yup.number()
    .typeError("Please enter a number")
    .nullable(true)
    .transform((_, val) => (val ? Number(val) : null)),
  brainStem: Yup.number()
    .typeError("Please enter a number")
    .nullable(true)
    .transform((_, val) => (val ? Number(val) : null)),
  addStem: Yup.number()
    .typeError("Please enter a number")
    .nullable(true)
    .transform((_, val) => (val ? Number(val) : null)),
  blindStem: Yup.number()
    .typeError("Please enter a number")
    .nullable(true)
    .transform((_, val) => (val ? Number(val) : null)),
  deafStem: Yup.number()
    .typeError("Please enter a number")
    .nullable(true)
    .transform((_, val) => (val ? Number(val) : null)),
  learningStem: Yup.number()
    .typeError("Please enter a number")
    .nullable(true)
    .transform((_, val) => (val ? Number(val) : null)),
  orthopedicStem: Yup.number()
    .typeError("Please enter a number")
    .nullable(true)
    .transform((_, val) => (val ? Number(val) : null)),
  psychoStem: Yup.number()
    .typeError("Please enter a number")
    .nullable(true)
    .transform((_, val) => (val ? Number(val) : null)),
  speechStem: Yup.number()
    .typeError("Please enter a number")
    .nullable(true)
    .transform((_, val) => (val ? Number(val) : null)),
  medicalStem: Yup.number()
    .typeError("Please enter a number")
    .nullable(true)
    .transform((_, val) => (val ? Number(val) : null)),
  OtherSStem: Yup.number()
    .typeError("Please enter a number")
    .nullable(true)
    .transform((_, val) => (val ? Number(val) : null)),
  OtherNStem: Yup.number()
    .typeError("Please enter a number")
    .nullable(true)
    .transform((_, val) => (val ? Number(val) : null))
  // office
  // fte:
  // refer:
});

export const validationSchema_c = Yup.object().shape({
  CITY___0: Yup.string().required("Required"),
  INSTNM___0: Yup.number()
    .nullable(false)
    .typeError("Please enter a number"),
  UNITID___0: Yup.number()
    .nullable(false)
    .typeError("Please enter a number")
  // CITY___1: Yup.string().required("Required"),
  // INSTNM___1: Yup.number()
  //   .nullable(false)
  //   .typeError("Please enter a number"),
  // UNITID___1: Yup.number()
  //   .nullable(false)
  //   .typeError("Please enter a number"),
  // CITY___2: Yup.string().required("Required"),
  // INSTNM___2: Yup.number()
  //   .nullable(false)
  //   .typeError("Please enter a number"),
  // UNITID___2: Yup.number()
  //   .nullable(false)
  //   .typeError("Please enter a number")
});
