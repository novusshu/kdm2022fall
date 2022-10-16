import React, { useState, useEffect } from "react";

import styled from "styled-components";
import {
  useTable,
  usePagination,
  useSortBy,
  useResizeColumns,
  useBlockLayout,
  useFlexLayout,
} from "react-table";
import makeData from "./makeData";
import "./sampleTable.css";
import { Link } from "react-router-dom";
import { db } from "../Firebase/firebasedb";
import { Modal, Button } from "react-bootstrap";
import { FileDrop } from "react-file-drop";
import { useForm, FormProvider } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  query,
  where,
  collection,
  orderBy,
  getDoc,
} from "firebase/firestore";
import theme from "../Components/theme";
import {
  AiFillSave,
  AiOutlineDownload,
  AiFillCopy,
  AiFillEdit,
  AiOutlineDelete,
  AiOutlineCheckCircle,
  AiOutlineCloseCircle,
  AiTwotoneClockCircle,
} from "react-icons/ai";
import {
  BsBoxArrowInLeft,
  BsDashCircleFill,
  BsSortAlphaDownAlt,
  BsSortAlphaDown,
  BsFillCaretDownSquareFill,
  BsFillCaretUpSquareFill,
  BsFillSkipForwardFill,
  BsThreeDotsVertical,
  BsCloudSlashFill,
  BsFillCloudArrowUpFill,
  BsCloudSlash,
  BsCloudCheck,
  BsCloudCheckFill,
  BsClock,
} from "react-icons/bs";
import { BiSort, BiSortAlt2 } from "react-icons/bi";
import Dropdown from "react-bootstrap/Dropdown";
import { makeid } from "../Components/Utils";
import { CSVDownload, CSVLink } from "react-csv";
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
      .resizer {
        display: inline-block;
        background: blue;
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

  .pagination {
    padding: 0.5rem;
  }
`;
function ActionDropDown({
  editBtn,
  rejectBtn,
  requestBtn,
  deleteBtn,
  addBtn,
  cloneBtn,
  publishBtn,
  downloadBtn,
  chartBtn,
}) {
  return (
    <Dropdown>
      <Dropdown.Toggle variant="outline-theme" id="dropdown-basic">
        <BsThreeDotsVertical />
      </Dropdown.Toggle>

      <Dropdown.Menu>
        {publishBtn && <Dropdown.Item>{publishBtn}</Dropdown.Item>}
        {rejectBtn && <Dropdown.Item>{rejectBtn}</Dropdown.Item>}
        {requestBtn && <Dropdown.Item>{requestBtn}</Dropdown.Item>}

        {cloneBtn && <Dropdown.Item>{cloneBtn}</Dropdown.Item>}

        {editBtn && <Dropdown.Item href={"/"}>{editBtn}</Dropdown.Item>}
        {addBtn && <Dropdown.Item href={"/"}>{addBtn}</Dropdown.Item>}
        {chartBtn && <Dropdown.Item href={"/"}>{chartBtn}</Dropdown.Item>}

        {deleteBtn && <Dropdown.Item>{deleteBtn}</Dropdown.Item>}
        {downloadBtn && <Dropdown.Item href={"/"}>{downloadBtn}</Dropdown.Item>}

        {/* <Dropdown.Item href="#/actionn-3">Something else</Dropdown.Item> */}
      </Dropdown.Menu>
    </Dropdown>
  );
}

export function Table({
  columns,
  data,
  fileInputRef,
  setFormID,
  setLatestUnuploadedForm,
  blinkingFormID,
  allFormMetadata,
  userData,
  allData,
}) {
  // console.log('allFormMetadata: ', allFormMetadata)
  // console.log('allData: ', allData)
  // Use the state and functions returned from useTable to build your UI
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page, // Instead of using 'rows', we'll use page,
    // which has only the rows for the active page

    // The rest of these things are super handy, too ;)
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0 },
    },
    // useBlockLayout,
    // useFlexLayout,
    useSortBy,
    usePagination,
    useResizeColumns
  );
  const [show, setShow] = useState(false);
  const [revisionShow, setRevisionShow] = useState(false);
  const [cloneShow, setCloneShow] = useState(false);

  const [currentFormID, setCurrentFormID] = useState(null);
  const [currentFormName, setCurrentFormName] = useState(null);
  const [creatorEmail, setCreatorEmail] = useState(null);

  const [roleChangeClick, setRoleChangeClick] = useState({});
  const allRoles = ["student", "student-mentor", "faculty", "administrator"];
  const allRolesFull = [
    "Student",
    "Student Mentor",
    "Faculty",
    "Administrator",
  ];

  const [checkedState, setCheckedState] = useState({});

  function convertToArray(formID) {
    let exportData = [];
    if (allFormMetadata && allData) {
      const metaForm = allFormMetadata.filter((e) => e.formID == formID)[0];
      if (metaForm) {
        const allContent = allData
          .filter((e) => e.formID == formID)
          .sort((a, b) => a.shard - b.shard)
          .map((e) => e.form_content)
          .reduce((pre, cur) => pre.concat(cur), []);
        exportData = [
          metaForm.form_header,
          ...allContent.map((content) =>
            metaForm.form_header.map((head) => content[head])
          ),
        ];
      }
      // console.log('allContent: ', allContent)
    }
    // console.log('exportData: ', exportData);
    return exportData;
  }

  const handleClose = () => {
    setShow(false);
    setCurrentFormID(null);
    setCurrentFormName(null);
    setCreatorEmail(null);

    // navigate("/dashboardstudent");
  };
  const handleShow = (formID, formName, creatorEmail) => {
    console.log(formID, formName);
    setShow(true);
    setCurrentFormID(formID);
    setCurrentFormName(formName);
    setCreatorEmail(creatorEmail);
  };
  const handleRevisionShow = (formID, formName) => {
    console.log(formID, formName);
    setRevisionShow(true);
    setCurrentFormID(formID);
    setCurrentFormName(formName);
  };
  const handleRevisionClose = () => {
    setRevisionShow(false);
    setCurrentFormID(null);
    setCurrentFormName(null);
    setFormID(null);

    // navigate("/dashboardstudent");
  };
  const handleCloneShow = (formID, formName, creatorEmail) => {
    console.log(formID, formName);
    setCloneShow(true);
    setCurrentFormID(formID);
    setCurrentFormName(formName);
    setCreatorEmail(creatorEmail);
  };
  const handleCloneClose = () => {
    setCloneShow(false);
    setCurrentFormID(null);
    setCurrentFormName(null);
    if (setFormID) setFormID(null);
    setCreatorEmail(null);

    // navigate("/dashboardstudent");
  };
  const publishForm = async (formID, status) => {
    await setDoc(
      doc(db, "table_library", formID),
      { status: status },
      { merge: true }
    );
    console.log(`Form ${formID} is now ${status}`);
  };
  const deleteForm = async (formID, userData) => {
    handleClose();

    if (formID && userData) {
      // await deleteDoc(doc(db, "table_library", formID))
      let docSnapshot = await getDoc(doc(db, "table_library", formID));
      let formData = {};
      if (docSnapshot.data()) {
        // formData = docSnapshot.data()
        // formData = { ...formData, status: 'unpublished', deletedAt: serverTimestamp(), deletedBy: userData.userID, deletedByFull: userData.email }
        // console.log('deleted formData', formData)

        // await setDoc(doc(db, "table_library_recently_deleted", formID), formData, { merge: true })
        const shardNum = docSnapshot.data().shardNum;
        await deleteDoc(doc(db, "table_library", formID));
        for (let j = 0; j < shardNum; j++) {
          // console.log('j: ', j)
          deleteDoc(doc(db, "automatic_table_submissions", formID + "_" + j));
        }
        // alert(`Form ${formID} is now moved to Recently Deleted folder!`);
        alert(`Form ${formID} is now deleted permanantly!`);
      }
    }
  };
  const cloneForm = async (formID) => {
    console.log("Cloning ", formID);
    if (allFormMetadata) {
      allFormMetadata.forEach((formMetadata) => {
        if (formMetadata.formID == formID) {
          let cloneData = JSON.parse(JSON.stringify(formMetadata));
          const newFormID = makeid(8);
          let newFormLongName = "";
          let newFormTitle = "";
          if (formMetadata.displayName) {
            newFormLongName = formMetadata.displayName + " (Cloned)";
          } else if (formMetadata.formTitle) {
            newFormTitle = newFormLongName.formTitle + " (Cloned)";
            newFormTitle = formMetadata.formTitle + " (Cloned)";
          } else if (formMetadata.formTitle) {
            const formName = formMetadata.formTitle;
            newFormLongName = formName + " (Cloned)";
            newFormTitle = formName + " (Cloned)";
          }
          let newData = {
            createdAt: serverTimestamp(),
            lastEdited: serverTimestamp(),
            formID: newFormID,
            formLongName: newFormLongName,
            formTitle: newFormTitle,
            creatorID: userData.creatorID,
            status: "unpublished",
            currentPrerequisites: [],
            currentPrerequisitesFull: [],
            currentNextForm: [],
            currentNextFormFull: [],
          };
          let newFormQuestions = cloneData.form_content;
          newFormQuestions[0].question_text =
            newFormQuestions[0].question_text + " (Cloned)";
          cloneData = { ...cloneData, ...newData };
          console.log("Original Data:", formMetadata);
          console.log("Cloned Data: ", cloneData);
          setDoc(doc(db, "table_library", newFormID), cloneData).then(() => {
            alert("Form has been cloned successfully!");
            handleCloneClose(true);
          });
        }
      });
    }
  };
  const onTargetClick = (formID) => {
    // setFormID(formID)
    fileInputRef.current.click();
    handleRevisionClose();
    setFormID(formID);
  };
  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  useEffect(() => {
    // console.log(roleChangeClick)
  }, [roleChangeClick]);
  useEffect(() => {
    // console.log(checkedState)
  }, [checkedState]);
  const [validationSchema, setValidationSchema] = useState({});

  const methods = useForm({
    resolver: yupResolver(Yup.object().shape(validationSchema)),
  });
  // const { register, handleSubmit, watch, reset, formState: { errors } } = methods;
  const {
    handleSubmit,
    register,
    watch,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = methods;
  const onSubmit = (data) => {
    console.log(data);
    for (const [key, value] of Object.entries(data)) {
      console.log(key, value);
      if (value != "false") {
        const formID = key.split("FormID-")[1];
        setRoleChangeClick({ ...roleChangeClick, [formID]: false });
      } else {
        const formID = key.split("FormID-")[1];
        setRoleChangeClick({ ...roleChangeClick, [formID]: true });
      }
    }

    // writeToFirebase(data);
    // writeToFirebaseAsync(data);
    // reset()
  };
  const handleOnChange = (formID, position) => {
    const updatedCheckedState = checkedState[formID].map((item, index) =>
      index === position ? !item : item
    );
    setCheckedState({ ...checkedState, [formID]: updatedCheckedState });
  };
  const writePermissionToFirebase = (formID, permissionData) => {
    const textPermissionData = [];
    permissionData.forEach((item, i) => {
      if (item == true) {
        textPermissionData.push(allRoles[i]);
      } else {
      }
    });
    const dataObject = { accessibleTo: textPermissionData };
    setDoc(doc(db, "table_library", formID), dataObject, { merge: true })
      .then(() => {
        console.log(`Form ${formID}: Permission updated successfully`);
        alert(`Form ${formID}: Permission updated successfully`);
      })
      .catch((err) => {
        console.log(err);
        alert(err);
      });
  };
  // Render the UI for your table
  return (
    <>
      <pre>
        {/* <code>
          {JSON.stringify(
            {
              pageIndex,
              pageSize,
              pageCount,
              canNextPage,
              canPreviousPage,
            },
            null,
            2
          )}
        </code> */}
      </pre>
      <Modal
        size="lg"
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Form Deletion Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h5>Are you sure you would like to delete this form? </h5>
          <h6>
            Form ID: {currentFormID} - {currentFormName}
          </h6>
          <h6>Creator Email: {creatorEmail}</h6>

          {/* <i>Note: You can recover this by clicking on <Button size='sm' className='mx-1' variant="danger" disabled>
            View Recently Deleted Forms
          </Button></i> on the main page. */}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            No, I would like to keep this form.
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              deleteForm(currentFormID, userData);
            }}
          >
            Yes, I would like to delete this form.
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal
        size="lg"
        show={cloneShow}
        onHide={handleCloneClose}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Form Cloning Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h5>Are you sure you would like to clone this form? </h5>
          <h6>
            Form ID: {currentFormID} - {currentFormName}
          </h6>
          <h6>Creator Email: {creatorEmail}</h6>

          <i>Note: This action is irreversible.</i>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloneClose}>
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={() => {
              cloneForm(currentFormID);
            }}
          >
            Yes, I would like to clone this form.
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal
        size="lg"
        show={revisionShow}
        onHide={handleRevisionClose}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Form Revision Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h5>Are you sure you would like to revise this form? </h5>
          <h6>
            Form ID: {currentFormID} - {currentFormName}
          </h6>
          <i>Note: This action is irreversible.</i>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleRevisionClose}>
            No, I would like to keep this form.
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              onTargetClick(currentFormID);
            }}
          >
            Yes, I would like to revise this form.
          </Button>
        </Modal.Footer>
      </Modal>

      <table {...getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => {
                const customStyleDict = {
                  Status: { width: 150 },
                  Created: { width: 150 },
                };
                // console.log(column.render('Header'))
                let originalStyle = column.getHeaderProps(
                  column.getSortByToggleProps()
                ).style;
                // console.log(getTableProps())
                if (column.render("Header") == "Delete Action") {
                  return (
                    <th
                      {...column.getHeaderProps()}
                      style={{ textAlign: "center" }}
                    ></th>
                  );
                } else if (column.render("Header") == "Status") {
                  return (
                    <th
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                      style={{
                        ...originalStyle,
                        width: 150,
                        textAlign: "center",
                      }}
                    >
                      {column.render("Header")}{" "}
                      <span>
                        {column.isSorted ? (
                          column.isSortedDesc ? (
                            <BsSortAlphaDownAlt
                              style={{
                                marginLeft: "4px",
                                marginBottom: "3px",
                                color: theme.highlightColor,
                                fontSize: "18px",
                              }}
                            />
                          ) : (
                            <BsSortAlphaDown
                              style={{
                                marginLeft: "4px",
                                marginBottom: "3px",
                                color: theme.highlightColor,
                                fontSize: "18px",
                              }}
                            />
                          )
                        ) : (
                          <BiSort
                            style={{
                              marginLeft: "4px",
                              marginBottom: "3px",
                              color: theme.highlightColor,
                              fontSize: "18px",
                            }}
                          />
                        )}
                      </span>
                      {/* <div
                      {...column.getResizerProps()}
                      className={`resizer ${column.isResizing ? 'isResizing' : ''}`}
                    // className={'resizer isResizing'}

                    /> */}
                    </th>
                  );
                } else if (column.render("Header") == "Action (Hub Lead)") {
                  return (
                    <th
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                      style={{ ...originalStyle, textAlign: "center" }}
                    >
                      {column.render("Header")}
                    </th>
                  );
                }
                let customStyle = {};
                if (customStyleDict[column.render("Header")]) {
                  customStyle = customStyleDict[column.render("Header")];
                }

                return (
                  <th
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    style={{
                      ...originalStyle,
                      ...customStyle,
                      textAlign: "center",
                    }}
                  >
                    {column.render("Header")}{" "}
                    <span>
                      {column.isSorted ? (
                        column.isSortedDesc ? (
                          <BsSortAlphaDownAlt
                            style={{
                              marginLeft: "4px",
                              marginBottom: "3px",
                              color: theme.highlightColor,
                              fontSize: "18px",
                            }}
                          />
                        ) : (
                          <BsSortAlphaDown
                            style={{
                              marginLeft: "4px",
                              marginBottom: "3px",
                              color: theme.highlightColor,
                              fontSize: "18px",
                            }}
                          />
                        )
                      ) : (
                        <BiSort
                          style={{
                            marginLeft: "4px",
                            marginBottom: "3px",
                            color: theme.highlightColor,
                            fontSize: "18px",
                          }}
                        />
                      )}
                    </span>
                    {/* <div
                    {...column.getResizerProps()}
                    className={`resizer ${column.isResizing ? 'isResizing' : ''}`}
                  // className={'resizer isResizing'}

                  />  */}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map((row, i) => {
            prepareRow(row);
            let formID = "";
            let creatorID = "";
            let formName = "";
            let creatorEmail = "";
            let lastEditorEmail = "";
            let blinking = false;
            let status = "unpublished";
            // console.log(blinkingFormID)
            if (blinkingFormID) {
              row.cells.forEach((cell) => {
                if (cell.column.Header == "Form ID") {
                  formID = cell.render("Cell").props.cell.value;
                  if (formID == blinkingFormID) {
                    blinking = true;
                  }
                }
              });
            }

            return (
              <tr
                {...row.getRowProps()}
                className={blinking ? "blinking-background" : ""}
              >
                {row.cells.map((cell) => {
                  // console.log(cell)
                  if (cell.column.Header == "Form ID") {
                    // console.log(cell.render('Cell').props.cell.value['formId'])
                    formID = cell.render("Cell").props.cell.value;
                    // creatorID =  cell.render('Cell').props.cell.value['creatorID']
                    return (
                      <td {...cell.getCellProps()}>
                        <Link
                          to={`/tables/${formID}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {formID}
                        </Link>
                      </td>
                    );
                  } else if (cell.column.Header == "Form Name") {
                    formName = cell.render("Cell").props.cell.value;
                  } else if (cell.column.Header == "Status") {
                    status = cell.render("Cell").props.cell.value;
                    let color = "red";
                    let icon = <BsCloudCheck />;
                    if (status.toLowerCase() == "published") {
                      color = "green";
                    } else if (status.toLowerCase() == "unpublished") {
                      color = "red";
                      icon = <BsCloudSlash />;
                    } else if (status.toLowerCase() == "awaiting-approval") {
                      color = theme.warningColor;
                      icon = <BsClock />;
                    }
                    const inputStyle = { color };

                    return (
                      <td
                        {...cell.getCellProps()}
                        style={{
                          ...cell.getCellProps().style,
                          ...inputStyle,
                          fontWeight: "bold",
                        }}
                      >
                        {status.replace("-", " ")} {icon}{" "}
                      </td>
                    );
                  } else if (cell.column.Header == "Creator") {
                    creatorEmail = cell.render("Cell").props.cell.value;
                    const inputStyle = creatorEmail.includes("(You)")
                      ? { color: theme.highlightColor }
                      : {};
                    return (
                      <td
                        {...cell.getCellProps()}
                        style={{
                          ...cell.getCellProps().style,
                          ...inputStyle,
                          fontWeight: "bold",
                        }}
                      >
                        {creatorEmail}
                      </td>
                    );
                  } else if (cell.column.Header == "Last Editor") {
                    lastEditorEmail = cell.render("Cell").props.cell.value;
                    const inputStyle = creatorEmail.includes("(You)")
                      ? { color: theme.highlightColor }
                      : {};
                    return (
                      <td
                        {...cell.getCellProps()}
                        style={{
                          ...cell.getCellProps().style,
                          ...inputStyle,
                          fontWeight: "bold",
                        }}
                      >
                        {lastEditorEmail}
                      </td>
                    );
                  } else if (cell.column.Header == "Action") {
                    const currentAction = cell.render("Cell").props.cell.value;
                    const DeleteBtn = (
                      <Button
                        //   disabled={botSubmit}
                        onClick={() => {
                          handleShow(formID, formName, creatorEmail);
                        }}
                        className="btn-sm"
                        variant="danger"
                      >
                        <AiOutlineDelete
                          style={{
                            marginRight: 2,
                            marginBottom: 2,
                            fontSize: 16,
                          }}
                        />

                        {"Delete Form"}
                      </Button>
                    );
                    const EditOverviewBtn = (
                      <Button
                        onClick={() => {
                          console.log(`changing ${formID}`);
                          // handleRevisionShow(formID, formName)
                          // handleRevisionClose();
                          setFormID(formID);
                          data.forEach((form) => {
                            if (form.formID == formID) {
                              console.log(form.rawData);
                              setLatestUnuploadedForm(form.rawData);
                            }
                          });
                          // setRoleChangeClick({ ...roleChangeClick, [formID]: true })
                        }}
                        variant="secondary"
                        className="my-1 btn-sm"
                        // style={{ margin: 0, paddingTop: "3px" }}
                      >
                        Edit Details
                      </Button>
                    );
                    // console.log(currentAction.toLowerCase())
                    if (currentAction.toLowerCase() == "unpublish") {
                      return (
                        <td
                          {...cell.getCellProps()}
                          style={{ textAlign: "center" }}
                        >
                          <button
                            //   disabled={botSubmit}
                            onClick={() => {
                              publishForm(formID, "unpublished");
                            }}
                            className="btn btn-warning mr-1 btn-sm"
                          >
                            <BsCloudSlashFill
                              style={{
                                marginRight: 2,
                                marginBottom: 1,
                                fontSize: 14,
                              }}
                            />

                            {"Unpublish"}
                          </button>
                          {EditOverviewBtn}
                          {DeleteBtn}
                        </td>
                      );
                    } else if (currentAction.toLowerCase() == "publish") {
                      return (
                        <td
                          {...cell.getCellProps()}
                          style={{ textAlign: "center" }}
                        >
                          <button
                            //   disabled={botSubmit}
                            onClick={() => {
                              publishForm(formID, "published");
                            }}
                            className="btn btn-success mr-1 btn-sm"
                          >
                            <BsFillCloudArrowUpFill
                              style={{
                                marginRight: 2,
                                marginBottom: 1,
                                fontSize: 14,
                              }}
                            />

                            {"Publish"}
                          </button>
                          {EditOverviewBtn}
                          {DeleteBtn}
                        </td>
                      );
                    }
                  } else if (cell.column.Header == "Action (Hub Lead)") {
                    const currentAction = cell.render("Cell").props.cell.value;
                    const EditBtn = (
                      <Link
                        to={`/tables/${formID}/edit`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button className="btn-sm" variant="info">
                          <AiFillEdit
                            style={{
                              marginRight: 2,
                              marginBottom: 2,
                              fontSize: 16,
                            }}
                          />

                          {"Edit Form"}
                        </Button>
                      </Link>
                    );
                    const AddBtn = (
                      <Link
                        to={`/tablecsvupload/${formID}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button className="btn-sm" variant="warning">
                          <AiFillEdit
                            style={{
                              marginRight: 2,
                              marginBottom: 2,
                              fontSize: 16,
                            }}
                          />

                          {"Add New Data"}
                        </Button>
                      </Link>
                    );
                    const ChartBtn = (
                      <Link
                        to={`/charts/${formID}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button className="btn-sm" variant="outline-warning">
                          <AiFillEdit
                            style={{
                              marginRight: 2,
                              marginBottom: 2,
                              fontSize: 16,
                            }}
                          />

                          {"View Charts (Beta)"}
                        </Button>
                      </Link>
                    );
                    const CloneBtn = (
                      <Button
                        className="btn-sm"
                        variant="fill-theme"
                        onClick={() =>
                          handleCloneShow(formID, formName, creatorEmail)
                        }
                      >
                        <AiFillCopy
                          style={{
                            marginRight: 2,
                            marginBottom: 2,
                            fontSize: 16,
                          }}
                        />

                        {"Clone Form"}
                      </Button>
                    );
                    const downloadBtn = (
                      <CSVLink
                        data={convertToArray(formID)}
                        filename={`${formName}.csv`}
                      >
                        <Button size="sm">
                          <AiOutlineDownload
                            style={{
                              marginRight: 2,
                              marginBottom: 2,
                              fontSize: 16,
                            }}
                          />
                          Download Form (CSV)
                        </Button>
                      </CSVLink>
                    );

                    const DeleteBtn = (
                      <Button
                        //   disabled={botSubmit}
                        onClick={() => {
                          handleShow(formID, formName, creatorEmail);
                        }}
                        className="btn-sm"
                        variant="danger"
                      >
                        <AiOutlineDelete
                          style={{
                            marginRight: 2,
                            marginBottom: 2,
                            fontSize: 16,
                          }}
                        />

                        {"Delete Form"}
                      </Button>
                    );
                    // console.log(currentAction.toLowerCase())
                    if (currentAction.toLowerCase() == "unpublish") {
                      const publishBtn = (
                        <button
                          //   disabled={botSubmit}
                          onClick={() => {
                            publishForm(formID, "unpublished");
                          }}
                          className="btn btn-warning my-1 btn-sm"
                        >
                          <BsCloudSlashFill
                            style={{
                              marginRight: 2,
                              marginBottom: 2,
                              fontSize: 14,
                            }}
                          />

                          {"Unpublish"}
                        </button>
                      );
                      return (
                        <td
                          {...cell.getCellProps()}
                          style={{
                            ...cell.getCellProps().style,
                            textAlign: "center",
                          }}
                        >
                          <ActionDropDown
                            publishBtn={publishBtn}
                            // editBtn={EditBtn}
                            deleteBtn={DeleteBtn}
                            addBtn={AddBtn}
                            // cloneBtn={CloneBtn}
                            // chartBtn = {ChartBtn}
                            downloadBtn={downloadBtn}
                          />
                        </td>
                      );
                    } else if (currentAction.toLowerCase() == "publish") {
                      // console.log("status", status);
                      const publishBtn = (
                        <button
                          //   disabled={botSubmit}
                          onClick={() => {
                            publishForm(formID, "published");
                          }}
                          className="btn btn-success btn-sm"
                        >
                          <BsFillCloudArrowUpFill
                            style={{
                              marginRight: 2,
                              marginBottom: 1,
                              fontSize: 14,
                            }}
                          />

                          {status.toLowerCase() == "awaiting-approval" &&
                            "Approve and "}
                          {"Publish"}
                        </button>
                      );

                      const rejectBtn = status.toLowerCase() ==
                        "awaiting-approval" && (
                        <Button
                          variant="warning"
                          size="sm"
                          onClick={() => {
                            publishForm(formID, "unpublished");
                          }}
                        >
                          <BsCloudSlashFill
                            style={{
                              marginRight: 2,
                              marginBottom: 1,
                              fontSize: 14,
                            }}
                          />
                          Reject and Unpublish
                        </Button>
                      );

                      return (
                        <td
                          {...cell.getCellProps()}
                          style={{
                            ...cell.getCellProps().style,
                            textAlign: "center",
                          }}
                        >
                          <ActionDropDown
                            // rejectBtn={rejectBtn}
                            // publishBtn={publishBtn}
                            // editBtn={EditBtn}
                            deleteBtn={DeleteBtn}
                            addBtn={AddBtn}
                            // cloneBtn={CloneBtn}
                            // chartBtn = {ChartBtn}

                            downloadBtn={downloadBtn}
                          />
                        </td>
                      );
                    }
                  } else if (cell.column.Header == "Action (Campus Lead)") {
                    const currentAction = cell.render("Cell").props.cell.value;
                    const EditBtn = (
                      <Link
                        to={`/tables/${formID}/edit`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button className="btn-sm" variant="info">
                          <AiFillEdit
                            style={{
                              marginRight: 2,
                              marginBottom: 2,
                              fontSize: 16,
                            }}
                          />

                          {"Edit Form"}
                        </Button>
                      </Link>
                    );
                    const CloneBtn = (
                      <Button
                        className="btn-sm"
                        variant="fill-theme"
                        onClick={() =>
                          handleCloneShow(formID, formName, creatorEmail)
                        }
                      >
                        <AiFillCopy
                          style={{
                            marginRight: 2,
                            marginBottom: 2,
                            fontSize: 16,
                          }}
                        />

                        {"Clone Form"}
                      </Button>
                    );
                    const downloadBtn = (
                      <CSVLink
                        data={convertToArray(formID)}
                        filename={`${formName}.csv`}
                      >
                        <Button size="sm">
                          <AiOutlineDownload
                            style={{
                              marginRight: 2,
                              marginBottom: 2,
                              fontSize: 16,
                            }}
                          />
                          Download Form (CSV)
                        </Button>
                      </CSVLink>
                    );

                    const DeleteBtn = (
                      <Button
                        //   disabled={botSubmit}
                        onClick={() => {
                          handleShow(formID, formName, creatorEmail);
                        }}
                        className="btn-sm"
                        variant="danger"
                      >
                        <AiOutlineDelete
                          style={{
                            marginRight: 2,
                            marginBottom: 2,
                            fontSize: 16,
                          }}
                        />

                        {"Delete Form"}
                      </Button>
                    );
                    // console.log(currentAction.toLowerCase())
                    if (currentAction.toLowerCase() == "publish") {
                      const requestBtn = (
                        <button
                          //   disabled={botSubmit}
                          onClick={() => {
                            publishForm(formID, "awaiting-approval");
                          }}
                          className="btn btn-warning btn-sm"
                        >
                          <BsFillSkipForwardFill
                            style={{
                              marginRight: 3,
                              marginBottom: 2,
                              fontSize: 14,
                            }}
                          />

                          {"Request Approval"}
                        </button>
                      );
                      return (
                        <td
                          {...cell.getCellProps()}
                          style={{
                            ...cell.getCellProps().style,
                            textAlign: "center",
                          }}
                        >
                          {/* {EditBtn}
                        {DeleteBtn} */}
                          <ActionDropDown
                            requestBtn={requestBtn}
                            editBtn={EditBtn}
                            deleteBtn={DeleteBtn}
                            cloneBtn={CloneBtn}
                            downloadBtn={downloadBtn}
                          />
                        </td>
                      );
                    } else if (
                      currentAction.toLowerCase() == "request approval"
                    ) {
                      const requestBtn = (
                        <button
                          //   disabled={botSubmit}
                          // onClick={() => { publishForm(formID, 'published') }}
                          className="btn btn-warning btn-sm"
                          disabled
                        >
                          <BsFillSkipForwardFill
                            style={{
                              marginRight: 3,
                              marginBottom: 2,
                              fontSize: 14,
                            }}
                          />

                          {"Awaiting Approval"}
                        </button>
                      );
                      return (
                        <td
                          {...cell.getCellProps()}
                          style={{
                            ...cell.getCellProps().style,
                            textAlign: "center",
                          }}
                        >
                          <ActionDropDown
                            // requestBtn = {requestBtn}
                            editBtn={EditBtn}
                            deleteBtn={DeleteBtn}
                            cloneBtn={CloneBtn}
                            downloadBtn={downloadBtn}
                          />
                        </td>
                      );
                    } else if (currentAction.toLowerCase() == "unpublish") {
                      return (
                        <td
                          {...cell.getCellProps()}
                          style={{
                            ...cell.getCellProps().style,
                            textAlign: "center",
                          }}
                        >
                          <ActionDropDown
                            // requestBtn = {requestBtn}
                            editBtn={EditBtn}
                            deleteBtn={DeleteBtn}
                            cloneBtn={CloneBtn}
                            downloadBtn={downloadBtn}
                          />
                        </td>
                      );
                    }
                  } else if (cell.column.Header == "Available To") {
                    const allAllowedRoles = cell
                      .render("Cell")
                      .props.cell.value.split("||");
                    let allAllowedRolesLong = [];
                    const newCheckedItem = new Array(allRoles.length).fill(
                      false
                    );

                    allAllowedRoles.forEach((role, i) => {
                      // console.log(role)
                      if (role == "student-mentor") {
                        allAllowedRolesLong.push("Student Mentor");
                      } else {
                        allAllowedRolesLong.push(capitalizeFirstLetter(role));
                      }
                      if (allRoles.indexOf(role) != -1)
                        newCheckedItem[allRoles.indexOf(role)] = true;
                    });

                    if (formID in checkedState == false) {
                      setCheckedState({
                        ...checkedState,
                        [formID]: newCheckedItem,
                      });
                    }
                    if (
                      formID in roleChangeClick &&
                      roleChangeClick[formID] == true
                    ) {
                      return (
                        <td {...cell.getCellProps()}>
                          {allRoles.map((role, index) => {
                            return (
                              <div className="form-check">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id={`role-checkbox-${formID}-${index}`}
                                  name={role}
                                  value={role}
                                  checked={checkedState[formID][index]}
                                  onChange={() => handleOnChange(formID, index)}
                                />

                                <label
                                  className="form-check-label"
                                  htmlFor={`role-checkbox-${formID}-${index}`}
                                >
                                  {allRolesFull[index]}
                                </label>
                              </div>
                            );
                          })}
                          <button
                            // type = 'submit'
                            onClick={() => {
                              console.log(`done changing ${formID}`);
                              setRoleChangeClick({
                                ...roleChangeClick,
                                [formID]: false,
                              });
                              // console.log(newCheckedItem, checkedState[formID])
                              var result = newCheckedItem.map(
                                (aVal, aIndex) =>
                                  aVal == checkedState[formID][aIndex]
                              );
                              console.log(result);
                              if (result.includes(false)) {
                                writePermissionToFirebase(
                                  formID,
                                  checkedState[formID]
                                );
                              }
                            }}
                            className="btn btn-link mr-1 btn-md"
                            style={{ margin: 0, paddingTop: "3px" }}
                          >
                            Done
                          </button>

                          {/* </form> */}
                          {/* </FormProvider> */}
                        </td>
                      );
                    } else {
                      return (
                        <td {...cell.getCellProps()}>
                          {allAllowedRolesLong.join(", ")}
                          <button
                            onClick={() => {
                              console.log(`done changing ${formID}`);
                              setRoleChangeClick({
                                ...roleChangeClick,
                                [formID]: true,
                              });
                            }}
                            className="btn btn-link mr-1 btn-md"
                            style={{ margin: 0, paddingTop: "3px" }}
                          >
                            Change
                          </button>
                        </td>
                      );
                    }
                  } else if (cell.column.Header == "Upload revised version") {
                    return (
                      <td {...cell.getCellProps()}>
                        <button
                          onClick={() => {
                            setFormID(formID);
                            handleRevisionShow(formID, formName);
                          }}
                          className="btn btn-link mr-1 btn-sm"
                        >
                          Upload revised version
                        </button>
                      </td>
                    );
                  } else if (cell.column.Header == "Institutions") {
                    return (
                      <td {...cell.getCellProps()}>
                        {cell.render("Cell").props.cell.value}
                      </td>
                    );
                  } else if (cell.column.Header == "Delete Action") {
                    return (
                      <td {...cell.getCellProps()}>
                        <button
                          //   disabled={botSubmit}
                          onClick={() => {
                            handleShow(formID, formName, creatorEmail);
                          }}
                          className="btn btn-danger mr-1 btn-sm"
                        >
                          {"Delete Form"}
                        </button>
                      </td>
                    );
                  }
                  return (
                    <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                  );
                  //   return <td {...cell.getCellProps()}>{cell.render('Cell').props.cell.value}</td>
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      {/*
        Pagination can be built however you'd like.
        This is just a very basic UI implementation:
      */}
      <div className="pagination">
        <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
          {"<<"}
        </button>{" "}
        <button onClick={() => previousPage()} disabled={!canPreviousPage}>
          {"<"}
        </button>{" "}
        <button onClick={() => nextPage()} disabled={!canNextPage}>
          {">"}
        </button>{" "}
        <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
          {">>"}
        </button>{" "}
        <span>
          Page{" "}
          <strong>
            {pageIndex + 1} of {pageOptions.length}
          </strong>{" "}
        </span>
        <span>
          | Go to page:{" "}
          <input
            type="number"
            defaultValue={pageIndex + 1}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0;
              gotoPage(page);
            }}
            style={{ width: "100px" }}
          />
        </span>{" "}
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
          }}
        >
          {[10, 20, 30, 40, 50].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}

function SampleTable() {
  const columns = React.useMemo(
    () => [
      {
        Header: "Name",
        columns: [
          {
            Header: "First Name",
            accessor: "firstName",
          },
          {
            Header: "Last Name",
            accessor: "lastName",
          },
        ],
      },
      {
        Header: "Info",
        columns: [
          {
            Header: "Age",
            accessor: "age",
          },
          {
            Header: "Visits",
            accessor: "visits",
          },
          {
            Header: "Status",
            accessor: "status",
          },
          {
            Header: "Profile Progress",
            accessor: "progress",
          },
        ],
      },
    ],
    []
  );

  const data = React.useMemo(() => makeData(100000), []);
  console.log(data);
  return (
    <Styles>
      <Table columns={columns} data={data} />
    </Styles>
  );
}

export default SampleTable;
