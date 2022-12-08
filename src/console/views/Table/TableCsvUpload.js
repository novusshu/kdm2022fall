import React, { useState, useEffect, useRef } from "react";
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
import {  usePapaParse } from "react-papaparse";
// import { Table } from "./SampleGrid";
import * as XLSX from "xlsx";
import { FileDrop } from "react-file-drop";
// import "./filedrop.css";
// import theme from "../components/theme";
import { NewTableSummary } from "./NewTableSummary";
import { makeid, RoleValidationComponent } from "../../../components/Utils";
import { Table as BootstrapTable, Card } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { useUserAuth } from "../../../context/UserAuthContext";
import { WriteToJSON } from "./WriteToJSON";

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
    <div className="card mt-1 mb-1 border-light" ref={wrapperRef}>
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
  const [latestUnuploadedForm, setLatestUnuploadedForm] = useState([]);
  const [blinkingFormID, setBlinkingFormID] = useState(null);
  const [formID, setFormID] = useState(null);
  const [sheetID, setSheetID] = useState(0);
  const [summary, setSummary] = useState(false);
  const { formId } = useParams();

  // check formID is part of the list

  const { user } = useUserAuth();

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
    console.log('csvText: ', csvText);
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
        userID: user.uid,
        editedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        formFormat: format,
        fileName: fileName,
        sheetName: sheetName,
      };
    } else {
      const newFormID = makeid(8);
      data_to_firebase = {
        formID: newFormID,
        form_header: header,
        form_content: form_content,
        userID: user.uid,
        createdAt: serverTimestamp(),
        editedAt: serverTimestamp(),
        formFormat: format,
        fileName: fileName,
        sheetName: sheetName,
      };
    }

    return data_to_firebase;

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

  const blockRef = useRef();
  const handleScroll = () => {
    const block = blockRef.current;
    console.log("block", block.offsetTop );
    if (block) {
      window.scrollTo(0, block.offsetTop * 0.8  || 0);
    }
  };

  /////
  return (
    <>
      <Card  >
      {/* <WriteToJSON />  */}
      <Card.Header as="h3" className="text-center">
            {formId
              ? `Edit Existing Sheet`
              : `Upload A New Funding Info Sheet `}
          </Card.Header>
        <Card.Body>
          <Card.Text>
          {formId && (
            <h5 style={{ textAlign: "center" }}> Form ID: {formId}</h5>
          )}
          </Card.Text>
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
        </Card.Body>
      </Card>
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
    </>
  );
}
