import { Table } from "./SampleGrid";
import theme from "../Components/theme";
import React, { useState, useEffect, useRef } from "react";
import { Modal, Button } from "react-bootstrap";

import { db } from "../Firebase/firebasedb";
import styled from "styled-components";

import {
  doc,
  setDoc,
  getDoc,
  orderBy,
  serverTimestamp,
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { AiFillLock } from "react-icons/ai";
// import "./automatic_form.css";
import {
  allRolesCompat,
  isHubLead,
  isCampusLead,
  getFirebaseDocumentID,
} from "../Fixed Sources/accountTypes";
import { parseMultiple2 } from "../Components/Utils";
import { Link } from "react-router-dom";
const Styles = styled.div`
  padding: 1rem;
  table {
    display: inline-block;
    border-spacing: 0;
    border: 1px solid black;
    word-wrap: break-word;

    tr {
      :last-child {
        .td {
          border-bottom: 0;
        }
      }
    }

    th,
    td {
      margin: 0;
      padding: 0.5rem;
      border-bottom: 1px solid black;
      border-right: 1px solid black;

      ${
        "" /* In this example we use an absolutely position resizer,
       so this is required. */
      }
      position: relative;

      :last-child {
        border-right: 0;
      }

      .resizer {
        display: inline-block;
        background: lightblue;
        width: 10px;
        height: 100%;
        position: absolute;
        right: 0;
        top: 0;
        transform: translateX(50%);
        z-index: 1;
        ${"" /* prevents from scrolling while dragging on touch devices */}
        touch-action:none;

        &.isResizing {
          background: red;
        }
      }
    }
  }
`;

const FormList = ({
  formUploadHistory,
  previousSubmissions,
  currentFormOrder = [],
  userData,
  excludedFormIDs = [],
}) => {
  console.log("currentFormOrder", currentFormOrder);
  console.log("excludedFormIDs", excludedFormIDs);
  const buttonStyles = [
    "primary",
    "secondary",
    "success",
    "warning",
    "info",
    "light",
  ];
  const latestFormHistory = formUploadHistory;
  let completed = 0;
  let incomplete = 0;
  //formUploadHistory can contain 90% of forms due to excluded;
  //currentFormOrder will contain original form order => needs revision;
  const revisedFormOrder = [];
  currentFormOrder.forEach((formInfo) => {
    if (!excludedFormIDs.includes(formInfo.id)) {
      revisedFormOrder.push(formInfo);
    }
  });
  const allOrderID = revisedFormOrder.map((form) => form.id);
  console.log("allOrderID", allOrderID);
  if (currentFormOrder.length > 0) {
    formUploadHistory.forEach((formData, index) => {
      const foundIndex = allOrderID.indexOf(formData.formID);
      if (foundIndex >= 0) {
        formData.sortIndex = foundIndex + 1;
      } else {
        formData.sortIndex = 10000 + index;
      }
    });
  }

  console.log("formUploadHistory", formUploadHistory);
  formUploadHistory.sort(function (x, y) {
    // console.log(y.currentPrerequisites.length, x.currentPrerequisites.length)
    return x.sortIndex - y.sortIndex; //sort y before x
  });
  const incompleteFormList = formUploadHistory.map((formData, index) => {
    formData.sortIndex = index + 1;

    if (
      userData &&
      formData.allowedRoles &&
      formData.allowedRoles.includes(userData.atype)
    ) {
      if (
        previousSubmissions &&
        !Object.keys(previousSubmissions).includes(formData.formID)
      ) {
        const allPreviousSubmissionsID = Object.keys(previousSubmissions);
        let currentPrerequisites = [];
        let currentPrerequisitesFull = [];
        let notSatisfied = false;
        console.log("revisedFormOrder", revisedFormOrder);

        if (
          revisedFormOrder.length > 0 &&
          allOrderID.includes(formData.formID)
        ) {
          currentPrerequisites =
            index > 0 ? [revisedFormOrder[index - 1].id] : [];
          currentPrerequisitesFull =
            index > 0 ? [revisedFormOrder[index - 1].content] : [];
        }

        incomplete += 1;

        currentPrerequisites.forEach((pre, index) => {
          if (!allPreviousSubmissionsID.includes(pre)) {
            notSatisfied = true;
          }
          // if (excludedFormIDs.includes(pre)){
          //   notSatisfied = false;
          // }
        });
        if (formData.startDate != "") {
          let startDate = new Date(formData.startDate);
          let todayDate = new Date();
          if (startDate > todayDate) {
            notSatisfied = true;
          }
        }
        // console.log('notSatisfied', notSatisfied)
        // console.log('allPreviousSubmissionsID', allPreviousSubmissionsID)
        // console.log('currentPrerequisites', currentPrerequisites)

        if (notSatisfied) {
          return <div></div>;
        }
        return (
          <Button
            style={{ margin: 3 }}
            href={!notSatisfied ? `/forms/${formData.formID}` : "#"}
            onClick={() => {
              if (notSatisfied) {
                alert(
                  "Please complete the required forms in order to open this form."
                );
              }
            }}
            disabled={notSatisfied} //satisfied = true => disabled = false
            variant={`${notSatisfied ? "outline-secondary" : "outline-theme"}`}
            // className={notSatisfied ? 'btn-outline-secondary' : 'button-outline-theme'}
          >
            {allOrderID.includes(formData.formID) &&
              revisedFormOrder.length > 0 &&
              formData.sortIndex &&
              formData.sortIndex < 10000 && (
                <small style={{ textDecoration: "underline" }}>
                  {`Step ${formData.sortIndex}`}
                  <br></br>
                </small>
              )}
            {notSatisfied && (
              <AiFillLock style={{ marginBottom: "3px", marginRight: 1 }} />
            )}
            {formData.formTitle} <br></br>
            {formData.startDate != "" ? (
              <p style={{ margin: 0, padding: 0 }}>
                Submission open: <b>{parseMultiple2(formData.startDate)}</b>
              </p>
            ) : (
              <p style={{ margin: 0, padding: 0 }}>
                Submission open: <b style={{ color: "green" }}>Always</b>
              </p>
            )}
            {formData.endDate != "" ? (
              <p style={{ margin: 0, padding: 0 }}>
                Submission closed: <b>{parseMultiple2(formData.endDate)}</b>
              </p>
            ) : (
              <p style={{ margin: 0, padding: 0 }}>
                Submission closed:{" "}
                <b style={{ color: theme.highlightColor }}>Never</b>
              </p>
            )}
            {notSatisfied && " (Locked)"}
          </Button>
        );
      }
    }

    return <div></div>;
  });
  const completedFormList = latestFormHistory.map((formData, index) => {
    if (
      previousSubmissions &&
      Object.keys(previousSubmissions).includes(formData.formID)
    ) {
      const createdDate = previousSubmissions[formData.formID].createdAt
        .toDate()
        .toDateString();
      const createdTime = previousSubmissions[formData.formID].createdAt
        .toDate()
        .toLocaleTimeString("en-US");
      completed += 1;
      return (
        <Button
          style={{ margin: 3 }}
          // disabled={true}
          href={`/forms/${formData.formID}`}
          variant={"outline-" + "success"}
        >
          {currentFormOrder.length > 0 &&
            formData.sortIndex &&
            formData.sortIndex < 10000 && (
              <small style={{ textDecoration: "underline" }}>
                {`Step ${formData.sortIndex}`}
                <br></br>
              </small>
            )}

          {formData.formTitle}
          <br></br>

          <small>
            <i>Completed: {`${createdDate}, ${createdTime}`}</i>
          </small>
        </Button>
      );
    }
    return <div></div>;
  });
  if (formUploadHistory.length > 0) {
    return (
      <div>
        <hr></hr>

        {incomplete > 0 && (
          <h3 style={{ paddingTop: 5 }}>
            <b>Pending Forms</b>
          </h3>
        )}
        {incompleteFormList}

        {completed > 0 && (
          <h3 style={{ paddingTop: 5 }}>
            <b>Completed Forms</b>
          </h3>
        )}
        {completedFormList}
        <hr></hr>
      </div>
    );
  }
  return <></>;
};
export default function AvailableTables({
  userID,
  accountType,
  userData,
  setFormMetadata,
}) {
  // console.log('accountType', accountType)

  //Form Order Retrieval
  const firebaseDocID = getFirebaseDocumentID(accountType);
  console.log("firebaseDocID", firebaseDocID);
  const formOrderRef = doc(db, "automatic_table_order", firebaseDocID);
  const [currentFormOrder, setCurrentFormOrder] = useState([]);

  //Form Upload History Retrieval
  const formUploadRef = collection(db, "table_library");
  // const q = query(formUploadRef, where("userID", "==", user.uid))
  const [formUploadHistory, setFormUploadHistory] = useState([]);
  const [formDashboardList, setFormDashboardList] = useState([]);
  const [allFormMetadata, setAllFormMetadata] = useState([]);
  const [allData, setAllData] = useState([]);

  //Form Upload History Retrieval
  const q = query(formUploadRef, orderBy("createdAt", "desc"));
  const [previousSubmissions, setPreviousSubmissions] = useState({});
  const [excludedFormIDs, setExcludedFormIDs] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const allPromises = [];
      let uniqueCreatorIDs = [];
      querySnapshot.forEach((docSnapShot) => {
        const rawData = docSnapShot.data();
        const creatorID = rawData.creatorID;
        const docRef = doc(db, "Users", creatorID);
        if (uniqueCreatorIDs.includes(creatorID) == false) {
          allPromises.push(getDoc(docRef));
          uniqueCreatorIDs.push(creatorID);
        }
      });
      await Promise.all(allPromises).then((allDocSnaps) => {
        let formUploadHistData = [];

        let allCreatorData = {};
        allDocSnaps.forEach((docSnap) => {
          const data = docSnap.data();
          allCreatorData[data.userID] = data;
          // console.log(docSnap.data())
        });
        // console.log(allCreatorData)
        let formMetadata = [];
        let excludedFormIDsServer = [];

        querySnapshot.forEach((docSnapShot) => {
          // console.log('formData')
          formMetadata.push(docSnapShot.data());
          // doc.data() is never undefined for query doc snapshots
          const rawData = docSnapShot.data();
          allFormMetadata[rawData.formID] = rawData;
          const createdDate = rawData.createdAt.toDate().toDateString();
          const createdTime = rawData.createdAt
            .toDate()
            .toLocaleTimeString("en-US");
          const editedDate = rawData.editedAt.toDate().toDateString();
          const editedTime = rawData.editedAt
            .toDate()
            .toLocaleTimeString("en-US");
          const formFormat = rawData.formFormat ? rawData.formFormat : "csv";
          const formName = rawData.formTitle
            ? rawData.formTitle
            : "Untitled Form";
          const status = rawData.status ? rawData.status : "published";
          let action = status == "published" ? "Unpublish" : "Publish";
          if (status == "published") {
            action = "Unpublish";
          } else if (status == "unpublished") {
            action = "Publish";
          } else if (status == "awaiting-approval") {
            if (userData) {
              if (isHubLead(userData.atype)) {
                action = "Publish";
              } else if (isCampusLead(userData.atype)) {
                action = "Request Approval";
              }
            }
          }
          const allowedRoles = rawData.allowedRoles ? rawData.allowedRoles : [];

          let allowedRolesString = "None";

          if (allowedRoles.length > 0) {
            let tempList = [];
            allowedRoles.forEach((role) => {
              tempList.push(allRolesCompat[role]);
            });
            allowedRolesString = tempList.join(", ");
          }
          const creatorID = rawData.creatorID;
          const lastEditorID = rawData.lastEditedBy;
          let lastEditorEmail = rawData.lastEditorEmail;
          let creatorEmail = allCreatorData[creatorID]
            ? allCreatorData[creatorID].email
            : "unknown";
          const formDomain = rawData.formDomain ? rawData.formDomain : "Common";
          const excludedInstitutions = rawData.excludedInstitutions
            ? rawData.excludedInstitutions
            : [];

          const allowedInstitutions = rawData.allowedInstitutions
            ? rawData.allowedInstitutions
            : [];
          // console.log(formDomain, allowedInstitutions)
          const currentPrerequisites = rawData.currentPrerequisites
            ? rawData.currentPrerequisites
            : [];
          const currentPrerequisitesFull = rawData.currentPrerequisitesFull
            ? rawData.currentPrerequisitesFull
            : [];
          const startDate =
            rawData.startDate && rawData.startDate != ""
              ? rawData.startDate
              : "";
          const endDate =
            rawData.endDate && rawData.endDate != "" ? rawData.endDate : "";

          if (
            creatorID == userID ||
            allowedRoles.includes(accountType) ||
            isHubLead(accountType) ||
            (isCampusLead(accountType) &&
              (userData.institution == allCreatorData[creatorID].institution ||
                allowedInstitutions.includes(userData.institution)))
          ) {
            // console.log(rawData.formID, rawData.allowedRoles)
            // console.log(userData)
            // if (formDomain == 'Common' || (formDomain == 'Specific' && allowedInstitutions.includes(userData.institution))) {
            if (creatorID == userID) {
              creatorEmail += " (You)";
            }
            if (lastEditorID == userID) {
              lastEditorEmail += " (You)";
            }
            // console.log('here')
            if (isHubLead(accountType) || isCampusLead(accountType)) {
              formUploadHistData.push({
                formID: rawData.formID,
                formTitle: formName,
                createdAt: `${createdDate}, ${createdTime}`,
                timeStamp: rawData.createdAt,
                formFormat: formFormat,
                creatorEmail: creatorEmail,
                creatorID,
                editedAt: `${editedDate}, ${editedTime}`,
                lastEditorEmail,
                status: status.toUpperCase(),
                action: action,
                reupload: "reupload",
                allowedRoles: allowedRoles,
                allowedRolesString: allowedRolesString,
                deleteAction: "deleteAction",
                formDomain: formDomain,
                allowedInstitutions: allowedInstitutions,
                allowedInstitutionsString:
                  formDomain == "Common"
                    ? formDomain
                    : "Specific: " + allowedInstitutions.join(", "),
                currentPrerequisites,
                currentPrerequisitesFull,
                startDate,
                endDate,
              });
            } else {
              const formHistData = {
                formID: rawData.formID,
                formTitle: formName,
                createdAt: `${createdDate}, ${createdTime}`,
                timeStamp: rawData.createdAt,
                formFormat: formFormat,
                creatorEmail: creatorEmail,
                status: status.toUpperCase(),
                action: action,
                reupload: "reupload",
                allowedRoles: allowedRoles,
                allowedRolesString: allowedRolesString,
                deleteAction: "deleteAction",
                formDomain: formDomain,
                allowedInstitutions: allowedInstitutions,
                allowedInstitutionsString:
                  formDomain == "Common"
                    ? formDomain
                    : "Specific: " + allowedInstitutions.join(", "),
                currentPrerequisites,
                currentPrerequisitesFull,
                startDate,
                endDate,
              };
              //Decides
              if (status == "published") {
                if (formDomain == "Common") {
                  if (!excludedInstitutions.includes(userData.institution)) {
                    formUploadHistData.push(formHistData);
                  } else {
                    excludedFormIDsServer.push(formHistData.formID);
                    console.log("here", formHistData.formID);
                  }
                } else if (formDomain == "Specific") {
                  console.log(
                    userData &&
                      allowedInstitutions.includes(userData.institution)
                  );

                  if (
                    userData &&
                    allowedInstitutions.includes(userData.institution)
                  ) {
                    formUploadHistData.push(formHistData);
                  }
                }
              }
            }
          }
        });
        if (setFormMetadata) setFormMetadata(formMetadata);
        setExcludedFormIDs(excludedFormIDsServer);
        // console.log('excludedFormIDsServer', excludedFormIDsServer)
        setAllFormMetadata(formMetadata);
        setFormDashboardList(JSON.parse(JSON.stringify(formUploadHistData)));
        // console.log('formUploadHistData before sort', formUploadHistData)
        formUploadHistData.sort(function (x, y) {
          // console.log(y.currentPrerequisites.length, x.currentPrerequisites.length)
          return x.currentPrerequisites.length - y.currentPrerequisites.length; //sort y before x
          // return x.createdAt
        });
        // console.log('formUploadHistData after sort', formUploadHistData)

        //Check Previous Form Submission Status
        const formUploadRef = collection(db, "automatic_table_submissions");
        const qPrevious = query(
          formUploadRef,
          where("creatorID", "==", userID),
          orderBy("createdAt", "desc")
        );

        const latestRetrievedForm = {};

        onSnapshot(qPrevious, (qSnapShot) => {
          if (qSnapShot.size > 0) {
            qSnapShot.forEach((doc) => {
              // console.log(doc.data());
              // doc.data() is never undefined for query doc snapshots
              const previousRawData = doc.data();
              if (previousRawData.createdAt) {
                const createdDate = previousRawData.createdAt
                  .toDate()
                  .toDateString();
                const createdTime = previousRawData.createdAt
                  .toDate()
                  .toLocaleTimeString("en-US");
                previousRawData.createdDateTime = `${createdDate}, ${createdTime}`;
              }

              if (
                !Object.keys(latestRetrievedForm).includes(
                  previousRawData.formID
                )
              ) {
                latestRetrievedForm[previousRawData.formID] = previousRawData;
              }
            });
            formUploadHistData.forEach((formData, index) => {
              const allPreviousSubmissionsID = Object.keys(latestRetrievedForm);
              const currentPrerequisites = formData.currentPrerequisites;
              const currentPrerequisitesFull =
                formData.currentPrerequisitesFull;
              let notSatisfied = 0;

              currentPrerequisites.forEach((pre, index) => {
                if (!allPreviousSubmissionsID.includes(pre)) {
                  notSatisfied = 1;
                }
              }); ///
              formData.notSatisfied = notSatisfied;
            });

            // console.log('formUploadHistData before sort', formUploadHistData)
            formUploadHistData.sort(function (x, y) {
              // console.log(y.formTitle, y.notSatisfied, x.formTitle, x.notSatisfied)
              return x.notSatisfied - y.notSatisfied; ///sort y before x
              // return y.notSatisfied - x.notSatisfied; //sort y before x
            });
            // console.log('formUploadHistData after sort', formUploadHistData)

            ///
            setPreviousSubmissions({
              ...previousSubmissions,
              ...latestRetrievedForm,
            });
          } else {
            // console.log('no more data!');
            setPreviousSubmissions({});
          }
          console.log("formUploadHistData", formUploadHistData);
          setFormUploadHistory([...formUploadHistData]);
        });
        //Check Form Order
        const unsub = onSnapshot(formOrderRef, (doc) => {
          // console.log('calling from unsub')
          const data = doc.data();
          console.log("orderData", data);
          if (data && data.formOrder) {
            setCurrentFormOrder(data.formOrder);
            // setOriginalFormOrder(data.formOrder);
          } else {
            setCurrentFormOrder([]);
          }
        });
      });
    });
    return [unsubscribe];
  }, [userID]);
  useEffect(() => {
    let allSubmittedTables = [];

    onSnapshot(collection(db, "automatic_table_submissions"), (qSnapShot) => {
      qSnapShot.forEach((docSnapShot) => {
        // doc.data() is never undefined for query doc snapshots
        const raw = docSnapShot.data();
        allSubmittedTables.push(raw);
      });
      // console.log('allSubmittedTables: ', allSubmittedTables)
      setAllData(allSubmittedTables);
    });
  }, [userID]);
  useEffect(() => {
    // console.log('previousSubmissions', previousSubmissions)
  }, [previousSubmissions]);
  let columns = React.useMemo(
    () => [
      {
        Header: `Available Auto-Forms for ${allRolesCompat[accountType]}`,
        columns: [
          {
            Header: "Form ID",
            accessor: "formID",
            width: 100,
          },
          {
            Header: "Form Name",
            accessor: "formTitle",
          },
          {
            Header: "Created",
            accessor: "createdAt",
          },
          {
            Header: "File Format",
            accessor: "formFormat",
          },
          {
            Header: "Status",
            accessor: "status",
            // width: 200,
          },
          // {
          //   Header: 'Available To',
          //   accessor: 'accessibleTo',
          // }
        ],
      },
      // {
      //   Header: 'Action',
      //   columns: [
      //     {
      //       Header: '',
      //       accessor: 'action'
      //     }
      //   ]
      // }
    ],
    []
  );
  if (isHubLead(accountType)) {
    columns = [
      {
        Header: `Form Management Dashboard for ${allRolesCompat[accountType]}`,
        columns: [
          //   {
          //     Header: 'Status',
          //     accessor: 'status',
          //     width: 150,
          //   },
          {
            Header: "Form ID",
            accessor: "formID",
            width: 100,
          },
          {
            Header: "Form Name",
            accessor: "formTitle",
          },
          {
            Header: "Created",
            accessor: "createdAt",
          },
          {
            Header: "Creator",
            accessor: "creatorEmail",
          },
          {
            Header: "Last Edited",
            accessor: "editedAt",
          },
          {
            Header: "Last Editor",
            accessor: "lastEditorEmail",
          },
          {
            Header: "File Format",
            accessor: "formFormat",
          },
          //   {
          //     Header: "Upload revised version",
          //     accessor: "reupload"
          //   },

          {
            Header: "Allowed Roles",
            accessor: "allowedRolesString",
          },
          {
            Header: "Institutions",
            accessor: "allowedInstitutionsString",
          },
          {
            Header: "Action (Hub Lead)",
            accessor: "action",
          },
        ],
      },
    ];
  } else if (isCampusLead(accountType)) {
    columns = [
      {
        Header: `Form Management Dashboard for ${allRolesCompat[accountType]}`,
        columns: [
          //   {
          //     Header: 'Status',
          //     accessor: 'status',
          //   },
          {
            Header: "Form ID",
            accessor: "formID",
          },
          {
            Header: "Form Name",
            accessor: "formTitle",
          },
          {
            Header: "Created",
            accessor: "createdAt",
          },
          {
            Header: "Creator",
            accessor: "creatorEmail",
          },
          {
            Header: "Last Edited",
            accessor: "editedAt",
          },
          {
            Header: "Last Editor",
            accessor: "lastEditorEmail",
          },
          {
            Header: "File Format",
            accessor: "formFormat",
          },

          {
            Header: "Allowed Roles",
            accessor: "allowedRolesString",
          },
          {
            Header: "Institutions",
            accessor: "allowedInstitutionsString",
          },
          {
            Header: "Action (Campus Lead)",
            accessor: "action",
          },
        ],
      },
    ];
  }

  return (
    <div
      className="mb-3 mt-3"
      style={{
        maxWidth: "100%",
        maxHeight: "80vh",
        overflow: "scroll",
      }}
    >
      {/* <h3 style={{ paddingTop: 5 }}><b>Available Forms</b></h3> */}

      {!isHubLead(accountType) && (
        <FormList
          formUploadHistory={formUploadHistory}
          previousSubmissions={previousSubmissions}
          currentFormOrder={currentFormOrder}
          userData={userData}
          excludedFormIDs={excludedFormIDs}
        />
      )}
      {isHubLead(accountType) && (
        <Styles>
          <Table
            columns={columns}
            data={formUploadHistory}
            allFormMetadata={allFormMetadata}
            userData={userData}
            allData={allData}
          />
        </Styles>
      )}
      {isCampusLead(accountType) && (
        <Styles>
          <Table
            columns={columns}
            data={formDashboardList}
            allFormMetadata={allFormMetadata}
            userData={userData}
            allData={allData}
          />
        </Styles>
      )}
    </div>
  );
}
