import * as Yup from "yup";
import React, { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import Form from "react-bootstrap/Form";
import { yupResolver } from "@hookform/resolvers/yup";
import { db } from "../../../firebasedb";
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
import { Button, Card, Dropdown } from "react-bootstrap";
import ReactTooltip from "react-tooltip";
import { AiFillQuestionCircle, AiFillCloseCircle } from "react-icons/ai";
// import theme from "../Components/theme";
import { Input } from "../../../components/Input";
import Loading from "../../../components/Loading";


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
  const validationSchema = Yup.object().shape({
    formTitle: Yup.string()
      .required("Cannot be empty!")
      .test(
        "Required",
        "Another form with this name already exists!",
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
  });
  const [formLibrary, setFormLibrary] = useState([]);
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

  const writeTemplateToFirebase = async (
    data,
    oldShardNum = 0,
    merge = false,
    limit = 200,
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
    limit = 200,
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
        userID: data.userID,
        editedAt: data.editedAt,
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

    if (formData) {
      formData = {
        ...formData,
        formTitle,
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
    <>
      {/* <p>Form Title: {formTitle}</p> */}
      {/* <ReactTooltip backgroundColor={theme.highlightColor} /> */}

      {/* <div className="card m-5 border-light"> */}
      <Card mb-5>
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
              </div>

              <div className="row d-flex justify-content-center my-3">
                <div className="form-group">
                  <Button
                    type="submit"
                  >
                    Upload
                  </Button>
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
              {/* <small className="text-muted">
                By clicking the 'Upload' button, you confirm that you accept our
                Terms of use and Privacy Policy.
              </small> */}
            </form>
          </FormProvider>
        </div>
        </Card>
    </>
  );
};
