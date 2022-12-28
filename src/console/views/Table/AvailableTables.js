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
}) {
  const [formUploadHistory, setFormUploadHistory] = useState([]);

  //Form Upload History Retrieva  l
  useEffect(() => {
    const formUploadRef = collection(db, "uploads_index");
    const q = query(formUploadRef, where("userID", "==", userID),)
    // orderBy("createdAt", "desc"))
    const unsubscribe = onSnapshot(q, querySnapshot => {
      let formUploadHistData = [];
      querySnapshot.forEach(docSnapShot => {
        // doc.data() is never undefined for query doc snapshots
        const rawData = docSnapShot.data();
        const createdDate = rawData.createdAt.toDate().toDateString();
        const createdTime = rawData.createdAt
          .toDate()
          .toLocaleTimeString("en-US");
        const editedDate = rawData.editedAt.toDate().toDateString();
        const editedTime = rawData.editedAt
          .toDate()
          .toLocaleTimeString("en-US");

        // console.log('here')
        formUploadHistData.push({
          ...rawData,
          createdAt: `${createdDate}, ${createdTime}`,
          timeStamp: rawData.createdAt,
          editedAt: `${editedDate}, ${editedTime}`,
        });
      });
      console.log('formUploadHistData before sort', formUploadHistData)
      formUploadHistData.sort(function (x, y) {
        // console.log(y.currentPrerequisites.length, x.currentPrerequisites.length)
        // return x.currentPrerequisites.length - y.currentPrerequisites.length; //sort y before x
        return x.createdAt
      });
      setFormUploadHistory(formUploadHistData)
      // console.log('formUploadHistData after sort', formUploadHistData)

    });
  }, [userID]);

  // useEffect(() => {
  //   let allSubmittedTables = []

  //   onSnapshot(collection(db, "uploads_content",
  //     where("userID", "==", userID)), 
  //     qSnapShot => {
  //       qSnapShot.forEach(docSnapShot => {
  //         const raw = docSnapShot.data();
  //         allSubmittedTables.push(raw);
  //       })
  //       // console.log('allSubmittedTables: ', allSubmittedTables)
  //       setAllData(allSubmittedTables)
  //     })
  // }, [userID])

  let columns = React.useMemo(
    () => [
      {
        Header: `Uploaded Files`,
        columns: [
          {
            Header: "File ID",
            accessor: "formID",
            width: 100
          },
          {
            Header: "File Name",
            accessor: "formTitle"
          },
          {
            Header: "Created",
            accessor: "createdAt"
          },
          {
            Header: "Edited",
            accessor: "editedAt"
          },
          {
            Header: 'Short Notes',
            accessor: 'notes'
          },
          {
            Header: 'Action',
            accessor: 'action'
          }
        ]
      },
     
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
          userData={userData}
        />
      </Styles>

    </div>
  );
}
