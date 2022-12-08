import { Table } from "./SampleGrid";
import React, { useState, useEffect, useRef } from "react";
import { Modal, Button } from "react-bootstrap";

import { db } from "../../../firebasedb";
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
  onSnapshot
} from "firebase/firestore";
// import "../Automatic Forms/automatic_form.css";

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

      ${"" /* In this example we use an absolutely position resizer,
       so this is required. */}
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

export default function AvailableTables({
  userID,
  userData,
  setFormMetadata
}) {
  const [formUploadHistory, setFormUploadHistory] = useState([]);
  const [allFormMetadata, setAllFormMetadata] = useState([]);
  const [allData, setAllData] = useState([])

    //Form Upload History Retrieva  l
  useEffect(() => {
    const formUploadRef = collection(db, "table_library");
    const q = query(formUploadRef, where("userID", "==", userID),)
    // orderBy("createdAt", "desc"))
    let formMetadata = [];
    const unsubscribe = onSnapshot(q, querySnapshot => {
        let formUploadHistData = [];
        querySnapshot.forEach(docSnapShot => {
          
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

          // console.log('here')
          formUploadHistData.push({
            formID: rawData.formID,
            formTitle: formName,
            createdAt: `${createdDate}, ${createdTime}`,
            timeStamp: rawData.createdAt,
            formFormat: formFormat,
            editedAt: `${editedDate}, ${editedTime}`,
          });
        });
        if (setFormMetadata) setFormMetadata(formMetadata);
        setAllFormMetadata(formMetadata);
        console.log('formUploadHistData before sort', formUploadHistData)
        formUploadHistData.sort(function (x, y) {
          // console.log(y.currentPrerequisites.length, x.currentPrerequisites.length)
          // return x.currentPrerequisites.length - y.currentPrerequisites.length; //sort y before x
          return x.createdAt
        });
        // console.log('formUploadHistData after sort', formUploadHistData)

        //Check Previous Form Submission Status
        const formUploadRef = collection(db, "automatic_table_submissions");
      });
    return [unsubscribe];
  }, [userID]);

  useEffect(() => {
    let allSubmittedTables = []

    onSnapshot(collection(db, "automatic_table_submissions",
      where("userID", "==", userID)), 
      qSnapShot => {
        qSnapShot.forEach(docSnapShot => {
          const raw = docSnapShot.data();
          allSubmittedTables.push(raw);
        })
        // console.log('allSubmittedTables: ', allSubmittedTables)
        setAllData(allSubmittedTables)
      })
  }, [userID])

  let columns = React.useMemo(
    () => [
      {
        Header: `Uploaded Forms`,
        columns: [
          {
            Header: "Form ID",
            accessor: "formID",
            width: 100
          },
          {
            Header: "Form Name",
            accessor: "formTitle"
          },
          {
            Header: "Created",
            accessor: "createdAt"
          },
          {
            Header: "File Format",
            accessor: "formFormat"
          },
          {
            Header: "Status",
            accessor: "status"
            // width: 200,
          }
          // {
          //   Header: 'Available To',
          //   accessor: 'accessibleTo',
          // }
        ]
      }
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

  return (
    <div
      className="mb-3 mt-3"
      style={{
        maxWidth: "100%",
        maxHeight: "80vh",
        overflow: "scroll"
      }}
    >
      <Styles>
        <Table
          columns={columns}
          data={formUploadHistory}
          allFormMetadata={allFormMetadata}
          userData={userData}
          allData={allData}
        />
      </Styles>

    </div>
  );
}
