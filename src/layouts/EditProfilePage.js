import React, { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
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
  updateDoc,
  serverTimestamp,
  onSnapshot,
  collection,
  query,
} from "firebase/firestore";
import { writeInstitutions } from "../Fixed Sources/institutions";
import Dropdown from "react-bootstrap/Dropdown";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import "./Style.css";
import theme from "../Theme/theme";
import { faker } from "@faker-js/faker";
import {
  AiTwotoneUnlock,
  AiOutlineUnlock,
  AiTwotoneLock,
  AiFillQuestionCircle,
  AiFillCloseCircle,
  AiOutlineInfoCircle,
  AiOutlineLock,
} from "react-icons/ai";
import ReactTooltip from "react-tooltip";

import {
  allRolesCompat,
  atypeOptions,
  isHubLead,
  isStudentOrMentor,
  specialAccounts,
} from "../Fixed Sources/accountTypes";
import { base64Decode, base64Encode } from "@firebase/util";
import { CustomMenu, FakeNameDropDown } from "../Automatic Forms/Utils";

const EditProfilePage = () => {
  const [validationSchema, setValidationSchema] = useState({
    firstName: Yup.string().required("Required"),
    lastName: Yup.string().required("Required"),
    atype: Yup.string().typeError("Please enter your account type!"),
    institution: Yup.string().required("Institution Required"),
  });

  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [lastUpdatedDateString, setLastUpdatedDateString] = useState(null);
  const [isBlinking, setIsBlinking] = useState(false);

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
    if (isBlinking) {
      const timer = setTimeout(() => {
        setIsBlinking(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isBlinking]);
  useEffect(() => {
    if (user) {
      const docRef = doc(db, "Users", user.uid);
      onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          console.log("Document data:", docSnap.data());
          const data = docSnap.data();
          setUserData(data);
          setValue("firstName", data.firstName);
          setValue("lastName", data.lastName);
          setValue("atype", data.atype);
          if (isStudentOrMentor(data.atype)) {
            if (data.nickname) setValue("nickname", data.nickname);
            setValidationSchema({
              ...validationSchema,
              nickname: Yup.string().required("Nickname Required"),
            });
          } else {
            setValidationSchema({
              firstName: Yup.string().required("Required"),
              lastName: Yup.string().required("Required"),
              atype: Yup.string().typeError("Please enter your account type!"),
              institution: Yup.string().required("Institution Required"),
            });
          }

          if (isHubLead(data.atype)) {
            setValue("atype", "hub-lead-admin");
          }
          if (data.institution) {
            setCurrentEventKey(data.institution);
            setValue("institution", data.institution);
          }
          if (data.lastUpdated) {
            const createdDate = data.lastUpdated.toDate().toDateString();
            const createdTime = data.lastUpdated
              .toDate()
              .toLocaleTimeString("en-US");
            setLastUpdatedDateString(`${createdDate}, ${createdTime}`);
            setIsBlinking(true);
          }
          setRedirectDestination("/");

          // setShouldRedirect(true);
        } else {
          // doc.data() will be undefined in this case
          console.log("No such document!");
          setRedirectDestination("/");
        }
      });
    }
  }, [user]);
  // writeInstitutions();
  const [institutionsList, setInstitutionsList] = useState([]);
  useEffect(() => {
    const docRef = doc(db, "information_sources", "institutions");
    onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        // console.log(data)
        setInstitutionsList(data["institution_list"]);
      } else {
      }
    });
  }, []);
  const formOptions = {
    resolver: yupResolver(Yup.object().shape(validationSchema)),
  };
  const methods = useForm(formOptions);
  const {
    handleSubmit,
    reset,
    watch,
    register,
    unregister,
    setValue,
    clearErrors,
    setError,
    formState: { errors },
  } = methods;

  const handleRegistration = (data, e) => {
    e.preventDefault();
    // console.log('here')
    console.log(isStudentOrMentor(userData.atype) && currentShowHide);
    // data['institutionID'] = institutionsList[data['institution']]
    if (specialAccounts.includes(userData.email)) {
      if (isStudentOrMentor(data.atype)) {
        if (currentShowHide) {
          data = {
            ...data,
            firstName: base64Encode(data.firstName),
            lastName: base64Encode(data.lastName),
            encrypted: true,
          };
        } else {
          data.encrypted = true;
        }
      } else {
        data.encrypted = false;
      }
    } else if (isStudentOrMentor(userData.atype) && currentShowHide) {
      data = {
        ...data,
        firstName: base64Encode(data.firstName),
        lastName: base64Encode(data.lastName),
        encrypted: true,
      };
      // console.log('encrypt')
    }
    // console.log('data to write', data);
    console.log(validationSchema);
    if (!data.nickname) {
      data.nickname = "";
      if (isStudentOrMentor(data.atype)) {
        console.log("here0");

        setError("nickname", { type: "custom", message: "Nickname required" });
      } else {
        console.log("here");

        // clearError('nickname')
      }
    }
    console.log("data to write", data);

    // writeInstitutions();
    if (user) {
      const docRef = doc(db, "Users", user.uid);
      // Update the timestamp field with the value from the server
      updateDoc(docRef, {
        ...data,
        lastUpdated: serverTimestamp(),
      }).then(() => {
        console.log("Data Updated Successfully");
        setCurrentShowHide(false);
      });
    }
  };
  function writeToFirebase(data) {
    setDoc(doc(db, "Users", data.userID), {
      firstName: base64Encode(data.firstName),
      lastName: base64Encode(data.lastName),
      email: data.email,
      atype: data.atype,
      userID: data.userID,
    }).then(() => {});
  }
  // console.log(institutionsList)
  const allInstitutions = institutionsList;
  const [currentEventKey, setCurrentEventKey] = useState(null);
  register("institution", { required: true });
  register("nickname", { required: true });
  const atype = watch("atype");
  const firstName = watch("firstName");
  const lastName = watch("lastName");
  useEffect(() => {
    console.log("atype", atype);
    if (userData && atype) {
      console.log("userData", userData.atype);
      console.log(userData.atype, "->", atype);

      if (isStudentOrMentor(atype) && !isStudentOrMentor(userData.atype)) {
        // Switch from Hub Lead to Student
        setValue("firstName", base64Encode(firstName));
        setValue("lastName", base64Encode(lastName));

        setValue("nickname", "");
        setCurrentShowHide(false);
      } else if (
        !isStudentOrMentor(atype) &&
        !isStudentOrMentor(userData.atype)
      ) {
        //Not Switching
        setValue("firstName", userData.firstName);
        setValue("lastName", userData.lastName);
        // setValue('nickname', userData.nickname)
        // console.log(userData.nickname)
        setCurrentShowHide(false);
      } else if (
        isStudentOrMentor(atype) &&
        isStudentOrMentor(userData.atype)
      ) {
        //Not Switching
        setValue("firstName", userData.firstName);
        setValue("lastName", userData.lastName);
        setValue("nickname", userData.nickname);
        console.log(userData.nickname);
        setCurrentShowHide(false);
      } else if (
        !isStudentOrMentor(atype) &&
        isStudentOrMentor(userData.atype)
      ) {
        //Switch from student Lead to hub lead
        setValue("firstName", base64Decode(firstName));
        setValue("lastName", base64Decode(lastName));
        setCurrentShowHide(false);
        // console.log('student -> hub-lead')

        setValue("nickname", "unknown");
        clearErrors("nickname");
      }
    }
  }, [userData, atype]);

  // console.log(errors)
  const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
    <Button
      variant={
        errors["institution"] && !currentEventKey
          ? "outline-danger"
          : "outline-info"
      }
      href=""
      ref={ref}
      onClick={(e) => {
        e.preventDefault();
        onClick(e);
      }}
    >
      {children}
      &#x25bc;
    </Button>
  ));
  console.log(errors);
  const firstNameEncrypted = "";
  const lastNameEncrypted = "";
  const [currentShowHide, setCurrentShowHide] = useState(false);
  const lockIcon = (
    <AiTwotoneLock
      style={{
        marginLeft: "2px",
        marginBottom: "3px",
        color: "green",
        fontSize: "19px",
      }}
      data-tip={`Real names will be hidden.`}
    />
  );
  const unlockIcon = (
    <AiTwotoneUnlock
      style={{
        marginLeft: "3px",
        marginBottom: "3px",
        color: "red",
        fontSize: "19px",
      }}
      data-tip={`Real names will be exposed.`}
    />
  );
  return (
    <div className="container">
      <hr />
      <div className="row d-flex justify-content-center align-items-center h-100">
        <div className="card m-3 border-light">
          <header class="card-header">
            <p class="float-end">
              Last Updated:{" "}
              <i
                className={isBlinking ? "blinking" : ""}
                style={
                  isBlinking
                    ? { backgroundColor: "limegreen" }
                    : { fontWeight: "bold" }
                }
              >
                {lastUpdatedDateString ? lastUpdatedDateString : "Never"}
              </i>
            </p>
            <h4 class="card-title mt-2">Edit Profile</h4>
          </header>

          {userData && (
            <div className="card-body">
              <FormProvider {...methods}>
                <form onSubmit={handleSubmit(handleRegistration)}>
                  {/* <form onSubmit={handleRegistration}> */}

                  <div className="form-group">
                    {isStudentOrMentor(watch("atype")) && (
                      <Button
                        className="col-md-2"
                        variant={
                          currentShowHide ? "outline-secondary" : "warning"
                        }
                        onClick={() => {
                          setCurrentShowHide(!currentShowHide);
                          if (currentShowHide) {
                            //if showing names => hide names now
                            setValue("firstName", base64Encode(firstName));
                            setValue("lastName", base64Encode(lastName));
                          } else {
                            //if hiding real names, show now

                            setValue("firstName", base64Decode(firstName));
                            setValue("lastName", base64Decode(lastName));
                          }
                        }}
                      >
                        {currentShowHide ? "Hide Names" : "Show Names"}
                        {currentShowHide ? lockIcon : unlockIcon}
                      </Button>
                    )}
                  </div>
                  <div className="row">
                    <Input
                      name="firstName"
                      label="First Name"
                      className="mb-3 col-xl-6"
                      required
                      disabled={
                        !currentShowHide && isStudentOrMentor(watch("atype"))
                      }
                      additionalIcons={
                        currentShowHide && isStudentOrMentor(watch("atype"))
                          ? [unlockIcon]
                          : [lockIcon]
                      }
                    />

                    <Input
                      name="lastName"
                      label="Last Name"
                      className="mb-3 col-xl-6"
                      required
                      disabled={
                        !currentShowHide && isStudentOrMentor(watch("atype"))
                      }
                      additionalIcons={
                        currentShowHide && isStudentOrMentor(watch("atype"))
                          ? [unlockIcon]
                          : [lockIcon]
                      }
                      // defaultValue='holle'
                    />
                  </div>
                  {currentShowHide && (
                    <div className="row">
                      <div className="col-md-6">
                        <p>
                          Encrypted First Name:{" "}
                          <b>
                            {watch("firstName") &&
                              base64Encode(watch("firstName"))}
                          </b>
                        </p>
                      </div>
                      <div className="col-md-6">
                        <p>
                          Encrypted Last Name:{" "}
                          <b>
                            {watch("lastName") &&
                              base64Encode(watch("lastName"))}
                          </b>
                        </p>
                      </div>
                    </div>
                  )}
                  {userData &&
                    userData.email &&
                    specialAccounts.includes(userData.email) && (
                      <div
                        className="row"
                        style={{
                          margin: 2,
                          backgroundColor: "lightgray",
                          borderStyle: "dashed",
                        }}
                      >
                        <h5>
                          <b>
                            Special Features (granted for{" "}
                            <i>{userData.email} </i> only)
                          </b>
                        </h5>
                        <RadioGroup
                          label="Account Type"
                          name="atype"
                          options={atypeOptions}
                        />
                      </div>
                    )}
                  {userData && isStudentOrMentor(watch("atype")) && (
                    <FakeNameDropDown
                      userData={userData}
                      errors={errors}
                      setValue={setValue}
                    />
                  )}

                  <div>
                    <Dropdown
                      className="col-md-6 mt-2 "
                      onSelect={(eventKey, event) => {
                        setValue("institution", eventKey);
                        setCurrentEventKey(eventKey);
                      }}
                    >
                      <Dropdown.Toggle
                        as={CustomToggle}
                        id="dropdown-custom-components"
                      >
                        Select Your Institution: <b>{currentEventKey}</b>
                      </Dropdown.Toggle>

                      <Dropdown.Menu as={CustomMenu}>
                        {allInstitutions.map((institute) => {
                          return (
                            <Dropdown.Item
                              eventKey={institute}
                              active={institute == currentEventKey}
                            >
                              {institute}
                            </Dropdown.Item>
                          );
                        })}
                      </Dropdown.Menu>
                    </Dropdown>
                    <div className="is-invalid">
                      {/* <div className="invalid-feedback">hello22</div> */}
                    </div>
                    <div className="invalid-feedback mb-2">
                      {errors["institution"] && !currentEventKey
                        ? errors["institution"].message
                        : ""}
                    </div>
                  </div>
                  <div className="row d-flex justify-content-center mb-3">
                    <div className="form-group">
                      <button type="submit" className="btn btn-primary mr-1">
                        Apply Changes
                      </button>
                      <Button
                        href={redirectDestination}
                        className="mx-2"
                        variant="outline-secondary"
                      >
                        Back
                      </Button>
                    </div>
                  </div>
                  {/* <small className="text-muted">
                                    By clicking the 'Register' button, you confirm that you accept
                                    our Terms of use and Privacy Policy.
                                </small> */}
                </form>
              </FormProvider>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default EditProfilePage;
