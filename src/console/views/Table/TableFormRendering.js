import React, { useState, useEffect, useRef } from "react";
import {
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  query,
  where,
  collection,
  orderBy,
  getDoc,
  deleteDoc
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { Modal, Button } from "react-bootstrap";
// import { Button } from "react-bootstrap";
import { useParams } from "react-router-dom";
// import { AutomaticTable } from "./AutomaticComponents";
import { db } from "../../../firebasedb";
import CreateGrid from "./CreateGrid"
// import "./automatic_form.css";
import Loading from "../../../components/Loading";
import { useUserAuth } from "../../../context/UserAuthContext";

export default function TableFormRendering() {
  const { formId } = useParams();
  const { user, userData } = useUserAuth();

  const [formContent, setFormContent] = useState([]);
  const [formMetadata, setFormMetadata] = useState(null);
  const [submissionData, setSubmissionData] = useState(null);
  const [isLoading, setIsLoading] = useState(null);
  const [refresh, setRefresh] = useState(1)

  const [submitSuccessfully, setSubmitSuccessfully] = useState(null);

  const [showLatestFormConsent, setShowLatestFormConsent] = useState(false);
  const [formRetrieveConsent, setFormRetrieveConsent] = useState(null);
  const [show, setShow] = useState(false);
  const [latestRetrievedForm, setLatestRetrievedForm] = useState(null);

  const [formRetrieved, setFormRetrieved] = useState(null);


  const onSubmit = data => {
    // console.log(data);
    // console.log("submissionData: ", submissionData);
    const currentTime = serverTimestamp();
    writeAllToFirebase(data, currentTime);
    writeTemplateToFirebase(data, currentTime);
    // reset()
  };

  useEffect(() => {
    console.log("submissionData: ", submissionData);
  }, [submissionData]);


  const handleNoLatestForm = () => {
    setShowLatestFormConsent(false);
    setFormRetrieveConsent(false);
  };
  const handleYesLatestForm = () => {
    setShowLatestFormConsent(false);
    setFormRetrieveConsent(true);
  };



  const handleClose = () => {
    setShow(false);
    // navigate("/dashboardstudent");
  };
  const handleShow = () => {
    setShow(true);
  };

  const writeTemplateToFirebase = async (
    data,
    currentTime,
    merge = true,
    limit = 200,
    collectionName = "uploads_index"
  ) => {
    console.log("data from writeTemplateToFirebase: ", data);
    const shardNum = Math.ceil(data.length / limit);
    let tempData = {
      // ...data,
      shardNum: shardNum,
      lastEditedBy: user.uid ? user.uid : "anonymous",
      editedAt: currentTime,
      lastEditorEmail: user.email
      // form_content: [
      //   [
      //     ...data.form_header.map(e => {
      //       return { [e]: "" };
      //     })
      //   ].reduce((pre, cur) => {
      //     return { ...pre, ...cur };
      //   }, {})
      // ]
    };
    // const {form_content, ...tempData} =  data
    console.log("tempdata: ", tempData);
    // console.log(data.formID)

    await setDoc(doc(db, collectionName, formId), tempData, { merge: merge })
      .then(() => {
        // setFormID(data.formID);
        if (merge == false) {
          console.log(`Form ${formId} written to Firebase successfully`);
          // setBlinkingFormID(data.formID);
        } else {
          console.log(`Form ${formId} revised successfully`);
          // alert(`Form ${formId} revised successfully`);
          // setBlinkingFormID(data.formID);
        }

        // setFileProcessedSuccessfully(Date.now());
      })
      .catch(err => {
        console.log(err);
        alert(err);
        // setFileProcessedSuccessfully(Date.now());
      });
  };
  const writeAllToFirebase = async (
    data,
    currentTime,
    collectionName = "uploads_content",
    limit = 200
  ) => {
    console.log(data);
    setIsLoading(true);
    let docSnapshot = await getDoc(doc(db, "uploads_index", formId));
    const currentShardNum = docSnapshot.data().shardNum;
    // const creatorId = docSnapshot.data().creatorID
    console.log("currentShardNum: ", currentShardNum);
    const shardNum = Math.ceil(data.length / limit);
    for (let i = 0; i < shardNum; i++) {
      let tempData = {
        submitMode: "web",
        formID: formId,
        shard: i,
        shardNum: shardNum,
        form_content: data.slice(i * limit, i * limit + limit),
        lastEditedBy: user.uid ? user.uid : "anonymous",
        editedAt: currentTime,
        lastEditorEmail: user.email
      };
      await setDoc(doc(db, collectionName, formId + "_" + i), tempData, {
        merge: true
      })
        .then(() => {
          if (i === shardNum - 1) {
            if (i < currentShardNum - 1) {
              for (let j = shardNum; j < currentShardNum; j++) {
                console.log("j: ", j);
                deleteDoc(
                  doc(db, "uploads_content", formId + "_" + j)
                );
              }
            }
          }
          //  // delete existing copy first

          setIsLoading(false);
          console.log(`Form ${formId} written to Firebase successfully`);
          // alert(`Form ${formId} content updated to Firebase successfully`);
          // }
        })
        .catch(err => {
          // console.log(err);
          alert(err);
          // setFileProcessedSuccessfully(Date.now());
        });
    }
    // if (data.length < latestRetrievedForm.form_content.length) {
    //   for(let j = Math.ceil(data.length / limit); j < latestRetrievedForm.form_content.length/limit; j++){
    //     await deleteDoc(doc(db, collectionName, formId + '_' + j));
    //   }
    // }
    setSubmitSuccessfully(true);
    setShowLatestFormConsent(false);
    handleShow();
    return;
  };

  useEffect(() => {
    const docRef = doc(db, "uploads_index", formId);
    onSnapshot(docRef, doc => {
      // console.log("Current data: ", doc.data());
      if (doc.exists()) {
        const data = doc.data();
        // console.log("Document data:", data);
        setFormContent(
          (({ form_header, form_content }) => ({
            form_header,
            form_content
          }))(data)
        );
        setFormMetadata(data);

        // console.log(newValidationSchema)
        // const newRandomAnswers = generateRandomAnswers(data['form_content'])
        // setRandomAnswers(newRandomAnswers);
      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
        setFormContent(null);
      }
    });
    // getDoc(docRef).then((docSnap) => {});
    if (user) {
      const formUploadRef = collection(db, "uploads_content");
      const q = query(
        formUploadRef,
        // where("userID", "==", user.uid),
        where("formID", "==", formId),
        orderBy("createdAt", "desc")
      );
      console.log(user.uid, formId);
      const latestRetrievedForm = [];
      getDocs(q).then(querySnapshot => {
        if (querySnapshot.size > 0) {
          querySnapshot.forEach(doc => {
            // doc.data() is never undefined for query doc snapshots
            const rawData = doc.data();
            if (rawData.createdAt) {
              const createdDate = rawData.createdAt.toDate().toDateString();
              const createdTime = rawData.createdAt
                .toDate()
                .toLocaleTimeString("en-US");
              rawData.createdDateTime = `${createdDate}, ${createdTime}`;
            }
            if (rawData.editedAt) {
              const editedDate = rawData.editedAt.toDate().toDateString();
              const editedTime = rawData.editedAt
                .toDate()
                .toLocaleTimeString("en-US");
              rawData.editedDateTime = `${editedDate}, ${editedTime}`;
            }

            latestRetrievedForm.push(rawData);
          });
          // formUploadHistData.sort(function(x, y){
          //     return y.timeStamp - x.timeStamp; //sort y before x
          // })
          setLatestRetrievedForm(
            latestRetrievedForm.reduce((pre, cur) => {
              const { form_content: q1, ...rest1 } = pre;
              const { form_content: q2, ...rest2 } = cur;
              return { form_content: [...q2, ...q1], ...rest1 };
            })
          );
          // console.log("latestRetrievedForm", latestRetrievedForm);
          setFormRetrieved(true);
          if (submitSuccessfully === null) {
            // console.log(submitSuccessfully, formRetrieved, latestRetrievedForm);
            setShowLatestFormConsent(true);
            // console.log('setShowLatestTrue')
          } else {
            setShowLatestFormConsent(false);
          }
        } else {
          setFormRetrieveConsent(false);
          setFormRetrieved(false);
        }
      });
    }
  }, [formId, user, userData, formRetrieved, submitSuccessfully]);

  useEffect(() => {
    if (submitSuccessfully === true) {
      setShowLatestFormConsent(false);
    }
  }, [showLatestFormConsent, submitSuccessfully]);

  // console.log('formContent:',  formContent,
  //           'formMetadata: ',formMetadata,
  //           'userData: ', userData,
  //           'formRetrieved', formRetrieved )

  return (
    <>
      <main>
        <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Submission Successful!</Modal.Title>
          </Modal.Header>
          <Modal.Body>Your form has been submitted successfully!</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
        {/* <h2>
          File (ID: <i>auto-{formId}</i>)
        </h2> */}
        <div>
          {isLoading && <Loading />}
          { formContent &&
            formMetadata &&
            userData &&
            formRetrieved && (
            /* <form onSubmit={handleSubmit(onSubmit)} ref={thisform}> */
            <div>
              {console.log("consent: ", formRetrieveConsent)}
              <h2>File Name: {formMetadata.formTitle}</h2>
              <p></p>
              <p>Last Edited On: {latestRetrievedForm.editedDateTime} </p>

              <div className="form-group d-grid gap-2 d-md-flex justify-content-md-end">
                <button
                  onClick={() => window.location.reload(false)}
                  className="btn mr-1 btn-primary submit-btn-normal"
                >
                  {"Refresh"}
                </button>
                <button
                  type="submit"
                  onClick={() => onSubmit(submissionData)}
                  className="btn mr-1 btn-primary submit-btn-normal"
                >
                  {"Submit"}
                </button>
              </div>

              <div
                className="mb-3 mt-3"
                style={{
                  maxWidth: "100%",
                  maxHeight: "80vh",
                  overflow: "scroll"
                }}
              >
                {
                  <div>
                    {console.log("formMetadata:", formMetadata)}
                    {refresh &&
                      <CreateGrid
                        // key={formRetrieveConsent}
                        formContent={formContent}
                        latestRetrievedForm={latestRetrievedForm}
                        setSubmissionData={setSubmissionData}
                      />}
                  </div>
                }
              </div>
            </div>
          ) }
        </div>
      </main>
    </>
  );
}
