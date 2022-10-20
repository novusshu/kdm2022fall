import * as Yup from "yup";
import React, { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import Form from "react-bootstrap/Form";
import { yupResolver } from "@hookform/resolvers/yup";
import { db } from "../firebasedb";
import {
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  orderBy,
  serverTimestamp,
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { Button, Dropdown } from "react-bootstrap";
import ReactTooltip from "react-tooltip";
import { AiFillQuestionCircle, AiFillCloseCircle } from "react-icons/ai";
import theme from "../Components/theme";
import { Input, RadioGroup } from "../Components/Input";
import Loading from "../Components/Loading";

const CustomMenu = React.forwardRef(
  ({ children, style, className, "aria-labelledby": labeledBy }, ref) => {
    const [value, setValue] = useState("");

    return (
      <div
        ref={ref}
        style={style}
        className={className}
        aria-labelledby={labeledBy}
      >
        <Form.Control
          autoFocus
          className="mx-3 my-2 w-auto"
          placeholder="Type to filter..."
          onChange={(e) => setValue(e.target.value)}
          value={value}
        />
        <ul className="list-unstyled">
          {React.Children.toArray(children).filter(
            (child) =>
              !value ||
              child.props.children.toLowerCase().startsWith(value) ||
              child.props.children.startsWith(value)
          )}
        </ul>
      </div>
    );
  }
);

export const NewTableSummary = ({
  latestUnuploadedForm,
  formID,
  formId,
  sheetID,
  setFormID,
  fileInputRef,
  setBlinkingFormID,
}) => {
  console.log("latestUnuploadedForm", latestUnuploadedForm);
  const formdb = "table_library";
  const [currentAllowedRoles, setCurrentAllowedRoles] = useState([]);
  const roleOptionList = (({ "campus-lead": c, "hub-lead-admin": h }) => ({
    "campus-lead": c,
    "hub-lead-admin": h,
  }))(allRoles);
  const validationSchema = Yup.object().shape({
    formTitle: Yup.string()
      .required("Cannot be empty!")
      .test(
        "Required",
        "Another form with this name already exists! If the form is yours, please upload a revised version from the table below.",
        (result) => {
          let valid = true;
          if (formLibrary) {
            formLibrary.forEach((form) => {
              console.log(formID, form.formID);
              // if (formID == form.formID) {
              //     valid = true;
              //     // return true;
              // }
              if (
                formID != form.formID &&
                form.formTitle.toLowerCase() == result.toLowerCase()
              ) {
                // console.log('here')
                valid = false;
              }
            });
          }
          // if (result == 'Duplicate Form')
          //     return false;
          return valid;
        }
      ),
    allowedInstitutions: Yup.array().test(
      "Required",
      "Please choose at least one institution to share the form with!",
      (result) => {
        console.log(result);
        if (currentFormDomain == "Specific") {
          if (!result || result.length <= 0) return false;
        }
        return true;
      }
    ),
    allowedRoles: Yup.array().test(
      "Required",
      "At least one account type must be specified!",
      (result) => {
        // console.log(currentAllowedRoles)
        if (!result || result.length <= 0) {
          return false;
        }
        return true;
      }
    ),
  });
  const [formLibrary, setFormLibrary] = useState([]);
  const [currentEventKey, setCurrentEventKey] = useState(null);
  const [isLoading, setIsLoading] = useState(null);
  let formData;

  if (
    latestUnuploadedForm &&
    latestUnuploadedForm.filter((e) => e.formID == formID).length > 1
  ) {
    formData = latestUnuploadedForm.filter((e) => e.formID == formID)[sheetID];
  } else {
    formData = latestUnuploadedForm.filter((e) => e.formID == formID)[0];
  }

  // formUploadHistData
  useEffect(() => {
    const formLibraryRef = collection(db, formdb);
    const q = query(formLibraryRef);
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const formUploadHistData = [];
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        const rawData = doc.data();
        formUploadHistData.push({
          formID: rawData.formID,
          formTitle: rawData?.formTitle,
        });
      });
      setFormLibrary(formUploadHistData);
      console.log(formUploadHistData);
    });
  }, [formData]);

  const formOptions = { resolver: yupResolver(validationSchema) };
  const methods = useForm(formOptions);
  const {
    handleSubmit,
    reset,
    register,
    setValue,
    getValues,
    formState: { errors },
  } = methods;
  // console.log(errors);
  const [numberOfQuestions, setNumberOfQuestions] = useState(0);
  useEffect(() => {
    if (formData && formData.sheetName) {
      setValue("formTitle", formData.sheetName);
    }
    if (formData) setNumberOfQuestions(formData.form_content.length);
  }, [formData, formID]);
  const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
    <Button
      variant={
        errors["allowedInstitutions"] && currentAllowedInstitutions.length <= 0
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
  const writeTemplateToFirebase = async (
    data,
    oldShardNum = 0,
    merge = false,
    limit = 300,
    collectionName = "table_library"
  ) => {
    console.log("data from writeTemplateToFirebase: ", data);
    const shardNum = Math.ceil(data.form_content.length / limit) + oldShardNum;
    let tempData = {
      ...data,
      form_header: data.form_header.filter((e) => e !== ""),
      shardNum: shardNum,
      form_content: [
        [
          ...data.form_header
            .filter((e) => e !== "")
            .map((e) => {
              return { [e]: "" };
            }),
        ].reduce((pre, cur) => {
          return { ...pre, ...cur };
        }, {}),
      ],
    };
    // const {form_content, ...tempData} =  data
    console.log("tempdata: ", tempData);
    // console.log(data.formID)

    await setDoc(doc(db, collectionName, data.formID), tempData, {
      merge: merge,
    })
      .then(() => {
        // setFormID(data.formID);
        if (merge == false) {
          console.log(`Form ${data.formID} written to Firebase successfully`);
          setBlinkingFormID(data.formID);
        } else {
          console.log(`Form ${data.formID} revised successfully`);
          // alert(`Form ${data.formID} revised successfully`);
          setBlinkingFormID(data.formID);
        }

        // setFileProcessedSuccessfully(Date.now());
      })
      .catch((err) => {
        console.log(err);
        alert(err);
        // setFileProcessedSuccessfully(Date.now());
      });
  };

  const writeAllToFirebase = async (
    data,
    oldShardNum = 0,
    merge = false,
    limit = 300,
    collectionName = "automatic_table_submissions"
  ) => {
    console.log("oldShardNum ", oldShardNum);
    setIsLoading(true);
    const shardNum = Math.ceil(data.form_content.length / limit) + oldShardNum;

    for (let i = oldShardNum; i < shardNum; i++) {
      let tempData = {
        formID: data.formID,
        // formTitle: data.formTitle,
        shard: i,
        shardNum: shardNum,
        form_content: data.form_content.slice(
          (i - oldShardNum) * limit,
          (i - oldShardNum) * limit + limit
        ),
        lastEditedBy: data.lastEditedBy,
        editedAt: data.editedAt,
        lastEditorEmail: data.lastEditorEmail,
        createdAt: data.createdAt,
      };
      await setDoc(doc(db, collectionName, data.formID + "_" + i), tempData)
        .then(() => {
          console.log("i: ", i);
          if (i === shardNum - 1) {
            setIsLoading(false);
            if (merge == false) {
              console.log(
                `Form ${data.formID} written to Firebase successfully`
              );
              // alert(`Form ${data.formID} written to Firebase successfully`);
              setBlinkingFormID(data.formID);
            } else {
              console.log(`Form ${data.formID} revised successfully`);
              // alert(`Form ${data.formID} revised successfully`);
              setBlinkingFormID(data.formID);
            }
          }
          // setFormID(data.formID);
          // setFileProcessedSuccessfully(Date.now());
        })
        .catch((err) => {
          // console.log(err);
          alert(err);
          // setFileProcessedSuccessfully(Date.now());
        });
    }
  };

  const handleUpload = async (data, e) => {
    e.preventDefault();
    const formTitle = data.formTitle;
    const formDomain = data.formDomain ? data.formDomain : "Common";
    const allowedInstitutions = data.allowedInstitutions
      ? data.allowedInstitutions
      : [];
    const allowedRoles = data.allowedRoles ? data.allowedRoles : [];

    if (formData) {
      formData = {
        ...formData,
        formTitle,
        formDomain,
        allowedInstitutions,
        allowedRoles,
      };
    } else {
      console.log("File was not selected");
    }
    // console.log(data)

    if (formId) {
      let docSnapshot = await getDoc(doc(db, "table_library", formId));
      const oldShardNum = docSnapshot.data().shardNum;
      await writeTemplateToFirebase(formData, oldShardNum, true);
      if (formData.form_content.length > 0) {
        await writeAllToFirebase(formData, oldShardNum, false);
      }
      await alert(`Form ${formID} revised successfully`);
    } else {
      await writeTemplateToFirebase(formData);
      if (formData.form_content.length > 0) {
        await writeAllToFirebase(formData);
      }
      await alert(`Form ${formID} written to Firebase successfully`);
    }
  };

  return (
    <div>
      {/* <p>Form Title: {formTitle}</p> */}
      <ReactTooltip backgroundColor={theme.highlightColor} />

      <div className="card m-3 border-light">
        <div className="card-body">
          <h2>
            New Form Overview{" "}
            <span>
              (Form ID: <i>{formID}</i>)
            </span>
          </h2>
          {isLoading && <Loading />}
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(handleUpload)}>
              {/* <form onSubmit={handleRegistration}> */}

              <div className="row">
                <Input
                  name="formTitle"
                  label="Form Name"
                  className="mb-3 col-xl-6"
                />
                <p>Number of Rows: {numberOfQuestions}</p>
                <Dropdown
                  className=""
                  onSelect={(eventKey, event) => {
                    if (!currentAllowedRoles.includes(eventKey)) {
                      setValue("allowedRoles", [
                        ...currentAllowedRoles,
                        eventKey,
                      ]);
                      setCurrentAllowedRoles([
                        ...currentAllowedRoles,
                        eventKey,
                      ]);
                    }
                  }}
                >
                  <Dropdown.Toggle
                    variant={
                      errors["allowedRoles"] && currentAllowedRoles.length <= 0
                        ? "outline-danger"
                        : ""
                    }
                    className={
                      errors["allowedRoles"] && currentAllowedRoles.length <= 0
                        ? ""
                        : "button-outline-theme"
                    }
                    id="dropdown-basic"
                  >
                    Specify role level:
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    {Object.keys(roleOptionList).map((role) => {
                      return (
                        <Dropdown.Item eventKey={role}>
                          {allRoles[role]}
                        </Dropdown.Item>
                      );
                    })}
                  </Dropdown.Menu>
                  <AiFillQuestionCircle
                    style={{
                      marginLeft: "2px",
                      marginBottom: "3px",
                      color: theme.highlightColor,
                      fontSize: "17px",
                    }}
                    data-tip={
                      "Specify which account type can access this form."
                    }
                  />
                </Dropdown>
                <div className="my-2 col-md-6">
                  {Object.keys(allRoles).map((role) => {
                    if (currentAllowedRoles.includes(role)) {
                      return (
                        <Button className="mx-2" variant="secondary">
                          {allRoles[role]}
                          <AiFillCloseCircle
                            style={{
                              marginLeft: "5px",
                              marginBottom: "3px",
                              color: "white",
                              fontSize: "17px",
                            }}
                            onClick={() => {
                              let allowedRoles = currentAllowedRoles;
                              var index = allowedRoles.indexOf(role);
                              if (index !== -1) {
                                allowedRoles.splice(index, 1);
                                console.log(allowedRoles);
                                setValue("allowedRoles", [...allowedRoles]);
                                setCurrentAllowedRoles([...allowedRoles]);
                              }
                            }}
                          />{" "}
                        </Button>
                      );
                    }
                    return <></>;
                  })}

                  <div className="is-invalid"></div>
                  <div className="invalid-feedback mb-2">
                    {errors["allowedRoles"] && currentAllowedRoles.length <= 0
                      ? errors["allowedRoles"].message
                      : ""}
                  </div>
                </div>
                <Dropdown
                  className="mb-3"
                  onSelect={(eventKey, event) => {
                    setValue("formDomain", eventKey);
                    setCurrentFormDomain(eventKey);
                  }}
                >
                  <Dropdown.Toggle
                    className="button-outline-theme"
                    id="dropdown-basic"
                  >
                    Form Domain{" "}
                    {currentFormDomain ? `(${currentFormDomain}) ` : " "}
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    <Dropdown.Item eventKey="Common">Common</Dropdown.Item>
                    <Dropdown.Item eventKey="Specific">Specific</Dropdown.Item>
                  </Dropdown.Menu>
                  <AiFillQuestionCircle
                    style={{
                      marginLeft: "2px",
                      marginBottom: "3px",
                      color: theme.highlightColor,
                      fontSize: "17px",
                    }}
                    data-tip={
                      "Common: Available to all institutions.\nSpecific: available to one or more certain institutions."
                    }
                  />
                </Dropdown>

                {currentFormDomain == "Specific" && (
                  <div>
                    <Dropdown
                      className="col-md-6  mx-2"
                      onSelect={(eventKey, event) => {
                        setCurrentAllowedInstitutions([
                          ...currentAllowedInstitutions,
                          eventKey,
                        ]);
                        setValue("allowedInstitutions", [
                          ...currentAllowedInstitutions,
                          eventKey,
                        ]);
                        setCurrentEventKey(eventKey);
                      }}
                    >
                      <Dropdown.Toggle
                        as={CustomToggle}
                        id="dropdown-custom-components"
                      >
                        Add an Institution
                      </Dropdown.Toggle>

                      <Dropdown.Menu as={CustomMenu}>
                        {institutionsList.map((institute) => {
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
                    <div className="mb-2 col-md-6">
                      {institutionsList.map((institution) => {
                        const displayStyle =
                          currentAllowedInstitutions.includes(institution)
                            ? "block"
                            : "none";

                        return (
                          <Button
                            style={{ display: displayStyle }}
                            className="mx-4"
                            variant="secondary"
                          >
                            {institution}
                            <AiFillCloseCircle
                              style={{
                                marginLeft: "5px",
                                marginBottom: "3px",
                                color: "white",
                                fontSize: "17px",
                              }}
                              onClick={() => {
                                let allowedInstitutions =
                                  currentAllowedInstitutions;
                                var index =
                                  allowedInstitutions.indexOf(institution);
                                if (index !== -1) {
                                  allowedInstitutions.splice(index, 1);
                                  console.log(allowedInstitutions);
                                  setValue("allowedInstitutions", [
                                    ...allowedInstitutions,
                                  ]);
                                  setCurrentAllowedInstitutions([
                                    ...allowedInstitutions,
                                  ]);
                                }
                              }}
                            />{" "}
                          </Button>
                        );
                      })}
                      {/* <Button className="mx-1" variant='secondary'>Institution 1 <AiFillCloseCircle style={{
                                        marginLeft: '2px', marginBottom: '3px',
                                        color: 'white', fontSize: '17px'
                                    }} /> </Button>
                                    <Button className="mx-1" variant='secondary'>Institution 2 </Button> */}
                      <div className="is-invalid">
                        {/* <div className="invalid-feedback">hello22</div> */}
                      </div>
                      <div className="invalid-feedback mb-2">
                        {errors["allowedInstitutions"] &&
                        currentAllowedInstitutions.length <= 0
                          ? errors["allowedInstitutions"].message
                          : ""}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="row d-flex justify-content-center my-3">
                <div className="form-group">
                  <button
                    type="submit"
                    className={`btn ${
                      // formID ? "btn-warning" :
                      "button-fill-theme"
                    } mr-1`}
                  >
                    Upload New Form
                  </button>
                  {/* {formID ? (
                    <Button
                      className="mx-2"
                      variant="outline-secondary"
                      onClick={() => {
                        setFormID(null);
                        fileInputRef.current.value = "";
                      }}
                    >
                      Cancel Revision{" "}
                    </Button>
                  ) : ( */}
                  <Button
                    className="mx-2"
                    variant="outline-secondary"
                    onClick={() => {
                      setFormID(null);
                      fileInputRef.current.value = "";
                    }}
                  >
                    Cancel{" "}
                  </Button>
                  {/* )} */}
                </div>
              </div>
              <small className="text-muted">
                By clicking the 'Upload' button, you confirm that you accept our
                Terms of use and Privacy Policy.
              </small>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
};
