import React, { useState, useEffect, useRef } from "react";
import { db } from "../Firebase/firebasedb";
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
  deleteDoc,
} from "firebase/firestore";
// import { Button } from "react-bootstrap";
import { useParams } from "react-router-dom";
// import { AutomaticTable } from "./AutomaticComponents";
import CreateGrid from "./CreateGrid";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { Modal, Button } from "react-bootstrap";
// import "./automatic_form.css";
import { isCampusLead, isHubLead } from "../Fixed Sources/accountTypes";
import Loading from "../Components/Loading";

export default function TableFormRendering() {
  const [renderPage, setRenderPage] = useState(true);
  const highlightColor = "#6E48AA";
  const { formId } = useParams();
  const [formContent, setFormContent] = useState([]);
  const [formMetadata, setFormMetadata] = useState(null);
  const [submissionData, setSubmissionData] = useState(null);
  const [isLoading, setIsLoading] = useState(null);

  const onSubmit = (data) => {
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

  const [submitSuccessfully, setSubmitSuccessfully] = useState(null);
  useEffect(() => {
    if (submitSuccessfully) {
      // setShow(true);
    }
  }, [submitSuccessfully]);
  const [showLatestFormConsent, setShowLatestFormConsent] = useState(false);
  const [formRetrieveConsent, setFormRetrieveConsent] = useState(null);
  const handleNoLatestForm = () => {
    setShowLatestFormConsent(false);
    setFormRetrieveConsent(false);
  };
  const handleYesLatestForm = () => {
    setShowLatestFormConsent(false);
    setFormRetrieveConsent(true);
  };

  const [show, setShow] = useState(false);

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
    limit = 300,
    collectionName = "table_library"
  ) => {
    console.log("data from writeTemplateToFirebase: ", data);
    const shardNum = Math.ceil(data.length / limit);
    let tempData = {
      // ...data,
      shardNum: shardNum,
      lastEditedBy: user.uid ? user.uid : "anonymous",
      editedAt: currentTime,
      lastEditorEmail: user.email,
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
      .catch((err) => {
        console.log(err);
        alert(err);
        // setFileProcessedSuccessfully(Date.now());
      });
  };
  const writeAllToFirebase = async (
    data,
    currentTime,
    collectionName = "automatic_table_submissions",
    limit = 300
  ) => {
    console.log(data);
    setIsLoading(true);
    let docSnapshot = await getDoc(doc(db, "table_library", formId));
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
        lastEditorEmail: user.email,
      };
      await setDoc(doc(db, collectionName, formId + "_" + i), tempData, {
        merge: true,
      })
        .then(() => {
          if (i === shardNum - 1) {
            if (i < currentShardNum - 1) {
              for (let j = shardNum; j < currentShardNum; j++) {
                console.log("j: ", j);
                deleteDoc(
                  doc(db, "automatic_table_submissions", formId + "_" + j)
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
        .catch((err) => {
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

  const [latestRetrievedForm, setLatestRetrievedForm] = useState(null);

  const [formRetrieved, setFormRetrieved] = useState(null);

  //Authentication Parameters
  const [userData, setUserData] = useState(null);

  const auth = getAuth();
  const [user, setUser] = useState(null);
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
          setUserData(data);
          console.log(data.atype);
        }
      });
    }
  }, [user]);

  const thisform = useRef();

  useEffect(() => {
    const docRef = doc(db, "table_library", formId);
    onSnapshot(docRef, (doc) => {
      // console.log("Current data: ", doc.data());
      if (doc.exists()) {
        const data = doc.data();
        const formDomain = data.formDomain ? data.formDomain : "Common";
        const allowedRoles = data.allowedRoles ? data.allowedRoles : [];
        const allowedInstitutions = data.allowedInstitutions
          ? data.allowedInstitutions
          : [];
        let renderPage = false;
        if (formDomain === "Specific") {
          if (userData) {
            if (allowedInstitutions.includes(userData.institution)) {
              if (allowedRoles.includes(userData.atype)) {
                renderPage = true;
              }
            }
          }
        } else {
          renderPage = true;
        }
        setRenderPage(renderPage);
        // console.log("Document data:", data);
        setFormContent(
          (({ form_header, form_content }) => ({
            form_header,
            form_content,
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
      const formUploadRef = collection(db, "automatic_table_submissions");
      const q = query(
        formUploadRef,
        // where("userID", "==", user.uid),
        where("formID", "==", formId),
        orderBy("createdAt", "desc")
      );
      console.log(user.uid, formId);
      const latestRetrievedForm = [];
      getDocs(q).then((querySnapshot) => {
        if (querySnapshot.size > 0) {
          querySnapshot.forEach((doc) => {
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

  function validatePermission(userData) {
    let passed = false;
    if (formMetadata.status == "published") {
      if (
        formMetadata.allowedRoles &&
        formMetadata.allowedRoles.includes(userData.atype)
      ) {
        if (formMetadata.formDomain == "Common") {
          passed = true;
        } else if (formMetadata.formDomain == "Specific") {
          console.log(
            "formMetadata.allowedInstitutions",
            formMetadata.allowedInstitutions
          );
          if (formMetadata.allowedInstitutions && userData.institution) {
            formMetadata.allowedInstitutions.forEach((institution) => {
              if (institution.includes(userData.institution)) {
                passed = true;
              }
            });
          }
        }
      } else if (isHubLead(userData.atype) || isCampusLead(userData.atype)) {
        if (formMetadata.formDomain == "Common") {
          passed = true;
        } else if (formMetadata.formDomain == "Specific") {
          console.log(
            "formMetadata.allowedInstitutions",
            formMetadata.allowedInstitutions
          );

          if (formMetadata.allowedInstitutions && userData.institution) {
            if (formMetadata.allowedInstitutions && userData.institution) {
              formMetadata.allowedInstitutions.forEach((institution) => {
                if (institution.includes(userData.institution)) {
                  passed = true;
                }
              });
            }
          }
        }
      }
      // console.log('condition 1', passed)
    } else if (
      formMetadata.status == "awaiting-approval" ||
      formMetadata.status == "unpublished"
    ) {
      if (isHubLead(userData.atype)) {
        passed = true;
      } else if (isCampusLead(userData.atype)) {
        passed = true;
      }
      // console.log('condition 2', passed)
    }
    if (formMetadata.userID == user.uid) {
      passed = true;
    }

    // // console.log('passed', passed)
    return passed;
  }

  return (
    <>
      {renderPage === true && (
        <main>
          {submitSuccessfully === null &&
            formRetrieved === true &&
            latestRetrievedForm && (
              <Modal
                size="lg"
                show={showLatestFormConsent}
                onHide={handleNoLatestForm}
                backdrop="static"
                keyboard={false}
              >
                <Modal.Header closeButton>
                  <Modal.Title>Warning</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <p>
                    This data form is last edited by{" "}
                    <b>{latestRetrievedForm.lastEditorEmail}</b> on{" "}
                    <b>{latestRetrievedForm.editedDateTime}</b>. Any new changes
                    you make will overwrite the current table content.
                  </p>
                </Modal.Body>
                <Modal.Footer>
                  {/* <Button variant="secondary" onClick={handleNoLatestForm}>
                    No, I will fill a new data form 
                  </Button> */}
                  <Button variant="primary" onClick={handleYesLatestForm}>
                    I understand. Please proceed.
                  </Button>
                </Modal.Footer>
              </Modal>
            )}
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
          <h2>
            Automatic Form (ID: <i>auto-{formId}</i>)
          </h2>
          <div>
            {!user && (
              <h2>YOU ARE NOT LOGGED IN! Please Login to fill out the form!</h2>
            )}
            {isLoading && <Loading />}
            {user &&
            formContent &&
            formMetadata &&
            userData &&
            formRetrieved &&
            validatePermission(userData) ? (
              /* <form onSubmit={handleSubmit(onSubmit)} ref={thisform}> */
              <div>
                {/* {console.log("consent: ", formRetrieveConsent)} */}
                <h2>Data Form Name: {formMetadata.formTitle}</h2>
                <p></p>
                <span>Last Editor: {latestRetrievedForm.lastEditorEmail}</span>
                <p>Last Edited On: {latestRetrievedForm.editedDateTime} </p>
                <div className="form-group d-grid gap-2 d-md-flex justify-content-md-end">
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
                    overflow: "scroll",
                  }}
                >
                  {
                    <div>
                      {/* {console.log("consent given")} */}
                      <CreateGrid
                        // key={formRetrieveConsent}
                        formContent={formContent}
                        latestRetrievedForm={latestRetrievedForm}
                        setSubmissionData={setSubmissionData}
                      />
                    </div>
                  }
                </div>
              </div>
            ) : (
              <h2>
                FORM DOES NOT EXIST OR YOU DON'T HAVE PERMISSION TO VIEW THIS
                FORM!
              </h2>
            )}
          </div>
        </main>
      )}
    </>
  );
}
