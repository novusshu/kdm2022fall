import React, { useEffect, useState } from "react";
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { Input, RadioGroup } from "../Components";
import { Link } from "react-router-dom";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { db } from "../Firebase/firebasedb";
import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  query,
  collection,
} from "firebase/firestore";
import Dropdown from "react-bootstrap/Dropdown";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { useSearchParams } from "react-router-dom";
import {
  atypeOptions,
  decodeInviteCode,
  encodeInviteCode,
} from "../Fixed Sources/accountTypes";
import {
  AiTwotoneLock,
  AiFillQuestionCircle,
  AiFillCloseCircle,
  AiOutlineInfoCircle,
  AiOutlineLock,
} from "react-icons/ai";
import ReactTooltip from "react-tooltip";

const validationSchema = Yup.object().shape({
  firstName: Yup.string().required("Required"),
  lastName: Yup.string().required("Required"),
  password: Yup.string()
    .required("Required")
    // .min(8, "Password is too short - should be 8 chars minimum.")
    .matches(
      /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/,
      "Password must contain at least 8 characters, one lowercase, one uppercase, one number and one special case character"
    ),
  // atype: Yup.string().typeError("Please enter your account type!"),
  email: Yup.string().required("Required").email("Email is invalid"),
  // institution: Yup.string().required("Institution Required"),
});

const RegisterForm = () => {
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [user, setUser] = useState(null);

  const [redirectDestination, setRedirectDestination] = useState("/");
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    if (shouldRedirect) {
      navigate(redirectDestination);
    }
  }, [shouldRedirect, redirectDestination, navigate]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        // const uid = user.uid;
        // ...
        setUser(user);
      } else {
      }
    });
    return () => unsubscribe();
  }, [auth]);
  useEffect(() => {
    if (user) {
      const docRef = doc(db, "Users", user.uid);
      getDoc(docRef).then((docSnap) => {
        if (docSnap.exists()) {
          console.log("Document data:", docSnap.data());
          const data = docSnap.data();
          // setUserData(data);
          setRedirectDestination("/");
          setShouldRedirect(true);
        } else {
          // doc.data() will be undefined in this case
          console.log("No such document!");
          setRedirectDestination("/");
        }
      });
    }
  }, [user]);

  const formOptions = { resolver: yupResolver(validationSchema) };
  const methods = useForm(formOptions);
  const {
    handleSubmit,
    reset,
    register,
    setValue,
    formState: { errors },
    watch,
    getValues,
  } = methods;

  const handleRegistration = (data, e) => {
    console.log(data);

    createUserWithEmailAndPassword(auth, data.email, data.password)
      .then((userCredential) => {
        // Signed in
        // const user = userCredential.user;
        console.log("User successfully created and signed in!");
        console.log(userCredential);
        data.userID = userCredential.user.uid;
        writeToFirebase(data);
        setRedirectDestination("/");
        setShouldRedirect(true);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        alert(errorCode + ": " + errorMessage);
        // setShouldRedirect(true);
      });
  };
  function writeToFirebase(data) {
    setDoc(doc(db, "Users", data.userID), {
      ...data,
    }).then(() => {});
  }
  const [currentEventKey, setCurrentEventKey] = useState(null);

  console.log(errors);
  const [searchParams, setSearchParams] = useSearchParams();
  const inviteCode = searchParams.get("inviteCode");
  console.log(inviteCode);
  // console.log(encodeInviteCode('faculty||hub-lead-admin'))
  let aTypeOptionsFiltered = [];
  let filteredRoles = ["student", "student-mentor"];
  if (inviteCode) {
    const inviteRoles = decodeInviteCode(inviteCode).split("||");
    filteredRoles = inviteRoles.length > 0 ? inviteRoles : filteredRoles;
  }
  // // aTypeOptionsFiltered = atypeOptions
  // aTypeOptionsFiltered = atypeOptions.filter(atype => {
  //   if (filteredRoles.includes(atype.value)) {
  //     // setValue('atype', atype.value)
  //     return atype
  //   }
  // })
  return (
    <div className="container">
      <hr />
      <div className="row d-flex justify-content-center align-items-center h-100">
        <div className="card m-3 border-light">
          <header class="card-header">
            <Link class="float-end btn btn-outline-primary" to="/login">
              Log in
            </Link>
            <h4 class="card-title mt-2">Sign up</h4>
          </header>
          <div className="card-body">
            <FormProvider {...methods}>
              <form onSubmit={handleSubmit(handleRegistration)}>
                <div className="row">
                  <Input
                    name="firstName"
                    label="First Name"
                    className="mb-3 col-xl-6"
                    required={true}
                  />
                  <Input
                    name="lastName"
                    label="Last Name"
                    className="mb-3 col-xl-6"
                    required={true}
                  />
                </div>
                <div className="row">
                  <Input
                    name="email"
                    label="Email"
                    className="mb-3 col-12"
                    required={true}
                  />
                </div>
                <div className="row">
                  <Input
                    name="password"
                    label="Password"
                    className="mb-3 col-12"
                    type="password"
                    required={true}
                  />
                </div>
                {/* <div className="row"> */}
                {/*   <RadioGroup */}
                {/*     label="Account Type" */}
                {/*     name="atype" */}
                {/*     options={aTypeOptionsFiltered} */}
                {/*   /> */}
                {/* </div> */}
                {/* <InstitutionDropDown errors={errors} setValue={setValue} /> */}
                <div className="row d-flex justify-content-center mb-3">
                  <div className="form-group">
                    <button type="submit" className="btn btn-primary mr-1">
                      Register
                    </button>
                    <button
                      type="button"
                      onClick={() => reset()}
                      className="btn btn-secondary"
                    >
                      Reset
                    </button>
                  </div>
                </div>
                <small className="text-muted">
                  By clicking the 'Register' button, you confirm that you accept
                  our Terms of use and Privacy Policy.
                </small>
              </form>
            </FormProvider>
          </div>
          <div className="border-top card-body text-center">
            Have an account? <Link to="/login">Log in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default RegisterForm;
