import React, { useState, useEffect, useRef } from "react";
import { db } from "../Firebase/firebasedb";
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
import {
  useCSVReader,
  lightenDarkenColor,
  formatFileSize,
  usePapaParse,
} from "react-papaparse";
import { Modal, Button } from "react-bootstrap";
import { Header } from "../Skeleton/Header";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import styled from "styled-components";
import AvailableTables from "./AvailableTables";
import { Table } from "./SampleGrid";
import * as XLSX from "xlsx";
import { FileDrop } from "react-file-drop";
import "./filedrop.css";
import theme from "../Components/theme";
import { NewTableSummary } from "./NewTableSummary";
import { makeid, RoleValidationComponent } from "../Components/Utils";
import { Table as BootstrapTable } from "react-bootstrap";
import { allRoles } from "../Fixed Sources/accountTypes";
import { useParams } from "react-router-dom";

const GREY = "#CCC";
const GREY_LIGHT = "rgba(255, 255, 255, 0.4)";
const DEFAULT_REMOVE_HOVER_COLOR = "#A01919";
const REMOVE_HOVER_COLOR_LIGHT = lightenDarkenColor(
  DEFAULT_REMOVE_HOVER_COLOR,
  40
);

const GREY_DIM = "#686868";
const Styles = styled.div`
  padding: 1rem;

  table {
    border-spacing: 0;
    border: 1px solid black;

    tr {
      :last-child {
        td {
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

      :last-child {
        border-right: 0;
      }
    }
  }

  .pagination {
    padding: 0.5rem;
  }
`;

const dropZoneStyles = {
  borderRadius: 20,
  border: "2px dashed lightgray",
  color: "black",
  padding: 20,
};

const UploadedList = ({
  latestUnuploadedForm,
  setSummary,
  setFormID,
  setSheetID,
  handleScroll,
}) => {
  // const [active,setActive]= useState('')
  let formData = [...latestUnuploadedForm];
  const wrapperRef = useRef(null);
  const handleActive = (row, ind) => {
    // setActive(id)
    //   let data = [...formData,
    //   {
    //     ...row,
    //     active:!row.active
    //   }
    // ]
    formData.forEach((item, id) => {
      if (item.formID === row.formID && id === ind) {
        item.active = true;
        // item.active = !row.active
      }
    });
    setTimeout(() => {
      handleScroll();
    }, 200);
  };
  return (
    <div className="card m-3 border-light" ref={wrapperRef}>
      <div className="card-body">
        <h2>Uploaded File List</h2>
        <BootstrapTable>
          <thead>
            <tr>
              <th></th>
              <th>Table ID</th>
              <th>File Format</th>
              <th>Sheet Name</th>
              <th>File Name</th>
            </tr>
          </thead>
          <tbody>
            {formData.map((f, ind) => {
              return (
                <tr
                  key={f.formID + ind}
                  style={{ backgroundColor: f.active ? "#e2e3e5" : "" }}
                  onClick={() => {
                    handleActive(f, ind);
                    setSummary(true);
                    setFormID(f.formID);
                    setSheetID(ind);
                  }}
                >
                  <td>{ind}</td>
                  <td
                    className="link"
                    style={{
                      color: `#084298`,
                      textDecoration: "underline",
                    }}
                  >
                    {f.formID}
                  </td>
                  <td>{f.formFormat}</td>
                  <td>{f.sheetName}</td>
                  <td>{f.fileName}</td>
                  {console.log("rendered: ", formData)}
                </tr>
              );
            })}
          </tbody>
        </BootstrapTable>
      </div>
    </div>
  );
};

export default function TableCsvUpload() {
  //Handles Authentication and Redirection
  const auth = getAuth();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(false);
  const [latestUnuploadedForm, setLatestUnuploadedForm] = useState([]);
  const [blinkingFormID, setBlinkingFormID] = useState(null);
  const [formID, setFormID] = useState(null);
  const [sheetID, setSheetID] = useState(0);
  const [summary, setSummary] = useState(false);
  const [formUploadHistory, setFormUploadHistory] = useState([]);
  const { formId } = useParams();

  // console.log("edit form: ", formId);
  // check formID is part of the list

  useEffect(() => {
    if (blinkingFormID) {
      const timer = setTimeout(() => {
        setBlinkingFormID(null);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [blinkingFormID]);

  //////////////////////////////////////////
  const fileInputRef = useRef(null);
  const onTargetClick = () => {
    // setFormID(null);
    console.log("here");
    fileInputRef.current.click();
    // setFileProcessedSuccessfully(Date.now())
  };

  const structureCSVText = (csvText, fileName, format, sheetName = "") => {
    // const storedQuestionIDs = [];
    const header = csvText.data[0];
    console.log(csvText);
    let form_content = [];
    csvText.data.slice(1).forEach((q, index) => {
      let structured_q = {};
      if (q.length >= 2) {
        q.forEach((col, index) => {
          const key = header[index];
          if (key && key !== "") structured_q[key] = col;
        });
        form_content.push(structured_q);
      }
    });
    //Parse Followup

    let data_to_firebase = {};
    if (formId) {
      data_to_firebase = {
        formID: formId,
        form_header: header,
        form_content: form_content,
        lastEditedBy: user.uid,
        lastEditorEmail: user.email,
        editedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        formFormat: format,
        fileName: fileName,
        sheetName: sheetName,
        status: "unpublished",
      };
    } else {
      const newFormID = makeid(8);
      data_to_firebase = {
        formID: newFormID,
        form_header: header,
        form_content: form_content,
        creatorID: user.uid,
        creatorEmail: user.email,
        createdAt: serverTimestamp(),
        lastEditedBy: user.uid,
        lastEditorEmail: user.email,
        editedAt: serverTimestamp(),
        formFormat: format,
        fileName: fileName,
        sheetName: sheetName,
        status: "unpublished",
      };
    }

    return data_to_firebase;
    // console.log(data_to_firebase)
  };
  const { readString } = usePapaParse();
  const onFileInputChange = async (e) => {
    console.log(e);
    const { files } = e.target;
    e.preventDefault();
    const reader = new FileReader();
    let fileName = "";
    if (files.length > 0) {
      fileName = files[0].name;
      if (fileName.includes(".csv")) {
        reader.readAsText(files[0]);
      } else if (fileName.includes(".xlsx")) {
        // alert('EXCEL!');
        reader.readAsBinaryString(files[0]);
      } else {
        alert("File Format not supported!");
      }
    }

    reader.onload = async (e) => {
      const text = e.target.result;
      if (fileName.includes(".csv")) {
        //   alert(text)
        readString(text, {
          worker: true,
          complete: (results) => {
            console.log("---------------------------");
            console.log(results);
            console.log("---------------------------");
            const d2f = structureCSVText(results, fileName, "csv");
            setLatestUnuploadedForm((current) => [d2f, ...current]);
          },
        });
      } else if (fileName.includes(".xlsx")) {
        const wb = XLSX.read(text, { type: "binary" });
        /* Get all worksheet */
        for (let i = 0; i < wb.SheetNames.length; i++) {
          const wsname = wb.SheetNames[i];
          const ws = wb.Sheets[wsname];
          /* Convert array of arrays */
          const csvText = XLSX.utils.sheet_to_csv(ws, { header: 1 });

          /* Update state */
          // console.log("Data>>>"+data);
          readString(csvText, {
            worker: true,
            complete: (results) => {
              console.log("---------------------------");
              console.log(results);
              console.log("---------------------------");
              let d2f = structureCSVText(results, fileName, "xlsx", wsname);
              setLatestUnuploadedForm((current) => [d2f, ...current]);
            },
          });
        }
      } else {
      }
    };
  };

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const logOut = () => {
    setShow(false);
    signOut(auth)
      .then(() => {
        // Sign-out successful.
        console.log("Signed out successfully!");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const blockRef = useRef();
  const handleScroll = () => {
    const block = blockRef.current;
    console.log("block", block);
    if (block) {
      window.scrollTo(0, block.offsetTop || 0);
    }
  };

  /////
  return (
    <div>
      {/* <NavBar setUserDataExternal={setUserData} /> */}


      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Logout Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you would like to log out?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={logOut}>
            Yes!
          </Button>
        </Modal.Footer>
      </Modal>
      <div style={dropZoneStyles}>
        <div>
          <h3
            style={{
              fontWeight: "bold",
              textAlign: "center",
              color: theme.highlightColor,
            }}
          >
            {formId
              ? `Upload An Additional Data Sheet`
              : `Upload A New Table Form `}
          </h3>
          {formId && (
            <h5 style={{ textAlign: "center" }}> Form ID: {formId}</h5>
          )}
        </div>
        <input
          onChange={onFileInputChange}
          ref={fileInputRef}
          type="file"
          className="hidden"
          // key={fileProcessedSuccessfully}
        />
        <FileDrop
          onFrameDragEnter={(event) => console.log("onFrameDragEnter", event)}
          onFrameDragLeave={(event) => console.log("onFrameDragLeave", event)}
          onFrameDrop={(event) => console.log("onFrameDrop", event)}
          onDragOver={(event) => console.log("onDragOver", event)}
          onDragLeave={(event) => console.log("onDragLeave", event)}
          onDrop={(files, event) => console.log("onDrop!", files, event)}
          onTargetClick={onTargetClick}
        >
          <p style={{ fontSize: "17px" }} className="mt-4">
            Drop a CSV (<i>.csv</i>) or Excel file (<i>.xlsx</i>) here to upload
            a <i>new</i> table form
          </p>
        </FileDrop>
        {/* <label style={{ backgroundColor: "yellow", width: "auto" }}>
          <i style={{ fontWeight: "bold", color: "red" }}>Note</i>: if you would
          like to revise an existing form, please navigate to the{" "}
          <b>Upload revised version</b> column of the <b>Your Uploaded Forms</b>{" "}
          table below
        </label> */}
      </div>
      {latestUnuploadedForm.length > 0 && (
        <UploadedList
          latestUnuploadedForm={latestUnuploadedForm}
          setSummary={setSummary}
          setFormID={setFormID}
          setSheetID={setSheetID}
          handleScroll={handleScroll}
        />
      )}
      {console.log("latestUnuploadedForm: ", latestUnuploadedForm)}
      {console.log("sheetID: ", sheetID, formID)}
      {summary && formID && latestUnuploadedForm && (
        <div
          ref={(el) => {
            blockRef.current = el;
          }}
        >
          <NewTableSummary
            formType="tables"
            formID={formID}
            formId={formId}
            setFormID={setFormID}
            sheetID={sheetID}
            latestUnuploadedForm={latestUnuploadedForm}
            fileInputRef={fileInputRef}
            setBlinkingFormID={setBlinkingFormID}
          />
        </div>
      )}

      {/* {user && userData && ( */}
      {/*   <Styles> */}
      {/*     <AvailableTables */}
      {/*       userID={user.uid} */}
      {/*       accountType={userData.atype} */}
      {/*       userData={userData} */}
      {/*     /> */}
      {/*     {/\* <Table */}
      {/*       columns={columns} */}
      {/*       data={formUploadHistory} */}
      {/*       fileInputRef={fileInputRef} */}
      {/*       setFormID={setFormID} */}
      {/*       setLatestUnuploadedForm={setLatestUnuploadedForm} */}
      {/*       blinkingFormID={blinkingFormID} */}
      {/*       userData={userData} */}
      {/*     /> *\/} */}
      {/*   </Styles> */}
      {/* )} */}
    </div>
  );
}
