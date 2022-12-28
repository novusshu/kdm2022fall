import React, { useState, useEffect } from "react";
import {
  useTable,
  usePagination,
  useSortBy,
  useResizeColumns,
  useBlockLayout,
  useFlexLayout
} from "react-table";
import "./sampleTable.css";
import { Link } from "react-router-dom";
import { db } from "../../../firebasedb";
import { Modal, Button } from "react-bootstrap";
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
  getDoc
} from "firebase/firestore";
import {
  AiFillSave,
  AiOutlineDownload,
  AiFillCopy,
  AiFillEdit,
  AiFillFileAdd,
  AiOutlineDelete,
  AiOutlineCheckCircle,
  AiOutlineCloseCircle,
  AiTwotoneClockCircle
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
  BsClock
} from "react-icons/bs";
import { BiSort, BiSortAlt2 } from "react-icons/bi";
import Dropdown from "react-bootstrap/Dropdown";
import { makeid } from "../../../components/Utils";
import theme from "../../../components/theme";
import { CSVDownload, CSVLink } from "react-csv";

// function ActionDropDown({
//   editBtn,
//   rejectBtn,
//   requestBtn,
//   deleteBtn,
//   addBtn,
//   cloneBtn,
//   publishBtn,
//   downloadBtn,
//   chartBtn
// }) {
//   return (
//     <Dropdown>
//       <Dropdown.Toggle variant="outline-theme" id="dropdown-basic">
//         <BsThreeDotsVertical />
//       </Dropdown.Toggle>

//       <Dropdown.Menu>
//         {editBtn && <Dropdown.Item href={"/"}>{editBtn}</Dropdown.Item>}
//         {addBtn && <Dropdown.Item href={"/"}>{addBtn}</Dropdown.Item>}
//         {deleteBtn && <Dropdown.Item>{deleteBtn}</Dropdown.Item>}
//         {downloadBtn && <Dropdown.Item href={"/"}>{downloadBtn}</Dropdown.Item>}
//       </Dropdown.Menu>
//     </Dropdown>
//   );
// }

export function Table({
  columns,
  data,
  userData,
}) {
  // console.log('userData: ', userData)
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
    state: { pageIndex, pageSize }
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0 }
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

  const [checkedState, setCheckedState] = useState({});

  // function convertToArray(formID) {
  //   let exportData = [];
  //   if (allFormMetadata && allData) {
  //     const metaForm = allFormMetadata.filter(e => e.formID == formID)[0]
  //     if(metaForm){
  //     const allContent = allData.filter(e => e.formID == formID).sort((a, b) => a.shard - b.shard).map(e => e.form_content).reduce((pre, cur) => pre.concat(cur), [])
  //     exportData = [
  //       // metaForm.form_header, 
  //       ...allContent.map(
  //       // content => metaForm.form_header.map(head => content[head])
  //       content => [...Array(metaForm.form_header.length).keys()].map(head => content[head])
  //     )]}
  //     // console.log('allContent: ', allContent)
  //   }
  //   // console.log('exportData: ', exportData);
  //   return exportData;
  // }

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
    // setFormID(null);
  };

  const deleteForm = async (formID, userData) => {
    handleClose();

    if (formID && userData) {
      // await deleteDoc(doc(db, "uploads_index", formID))
      let docSnapshot = await getDoc(doc(db, "uploads_index", formID));
      let formData = {};
      if (docSnapshot.data()) {
        // formData = docSnapshot.data()
        // formData = { ...formData, status: 'unpublished', deletedAt: serverTimestamp(), deletedBy: userData.userID, deletedByFull: userData.email }
        // console.log('deleted formData', formData)

        // await setDoc(doc(db, "uploads_index_recently_deleted", formID), formData, { merge: true })
        const shardNum = docSnapshot.data().shardNum;
        await deleteDoc(doc(db, "uploads_index", formID));
        for (let j = 0; j < shardNum; j++) {
          // console.log('j: ', j)
          deleteDoc(doc(db, "uploads_content", formID + "_" + j));
        }
        // alert(`Form ${formID} is now moved to Recently Deleted folder!`);
        alert(`Form ${formID} is now deleted permanantly!`);
      }
    }
  };
  const onTargetClick = formID => {
    // setFormID(formID)
    // fileInputRef.current.click();
    handleRevisionClose();
  };

  useEffect(() => {
    // console.log(checkedState)
  }, [checkedState]);

  const handleOnChange = (formID, position) => {
    const updatedCheckedState = checkedState[formID].map((item, index) =>
      index === position ? !item : item
    );
    setCheckedState({ ...checkedState, [formID]: updatedCheckedState });
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
          <Modal.Title>File Deletion Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h5>Are you sure you would like to delete this file? </h5>
          <h6>
            File ID: {currentFormID}</h6>
            <h6>
            File Name: {currentFormName}
          </h6>

          {/* <i>Note: You can recover this by clicking on <Button size='sm' className='mx-1' variant="danger" disabled>
            View Recently Deleted Forms
          </Button></i> on the main page. */}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            No, I would like to keep this file.
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              deleteForm(currentFormID, userData);
            }}
          >
            Yes, I would like to delete this file.
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
          <Modal.Title>File Revision Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h5>Are you sure you would like to revise this file? </h5>
          <h6>
            Form ID: {currentFormID} - {currentFormName}
          </h6>
          <i>Note: This action is irreversible.</i>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleRevisionClose}>
            No, I would like to keep this file.
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              onTargetClick(currentFormID);
            }}
          >
            Yes, I would like to revise this file.
          </Button>
        </Modal.Footer>
      </Modal>

      <table {...getTableProps()}>
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => {
                const customStyleDict = {
                  Status: { width: 150 },
                  // Created: { width: 150 }
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
                        textAlign: "center"
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
                                fontSize: "18px"
                              }}
                            />
                          ) : (
                            <BsSortAlphaDown
                              style={{
                                marginLeft: "4px",
                                marginBottom: "3px",
                                color: theme.highlightColor,
                                fontSize: "18px"
                              }}
                            />
                          )
                        ) : (
                          <BiSort
                            style={{
                              marginLeft: "4px",
                              marginBottom: "3px",
                              color: theme.highlightColor,
                              fontSize: "18px"
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
                } else if (column.render("Header") == "Action") {
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
                      textAlign: "center"
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
                              fontSize: "18px"
                            }}
                          />
                        ) : (
                          <BsSortAlphaDown
                            style={{
                              marginLeft: "4px",
                              marginBottom: "3px",
                              color: theme.highlightColor,
                              fontSize: "18px"
                            }}
                          />
                        )
                      ) : (
                        <BiSort
                          style={{
                            marginLeft: "4px",
                            marginBottom: "3px",
                            color: theme.highlightColor,
                            fontSize: "18px"
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
            let formName = "";

            return (
              <tr
                {...row.getRowProps()}
              >
                {row.cells.map(cell => {
                  // console.log(cell)
                  if (cell.column.Header == "File ID") {
                    // console.log(cell.render('Cell').props.cell.value['formId'])
                    formID = cell.render("Cell").props.cell.value;
                    // userID =  cell.render('Cell').props.cell.value['userID']
                    return (
                      <td {...cell.getCellProps()}>
                        <Link
                          to={`/user/files/${formID}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {formID}
                        </Link>
                      </td>
                    );
                  } else if (cell.column.Header == "File Name") {
                    formName = cell.render("Cell").props.cell.value;
                  } else if (cell.column.Header == "Action") {
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
                              fontSize: 16
                            }}
                          />

                          {"Edit"}
                        </Button>
                      </Link>
                    );
                    const AddBtn = (
                      <Link
                        to={`/edittable/${formID}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button className="btn-sm" variant="warning">
                          <AiFillEdit
                            style={{
                              marginRight: 2,
                              marginBottom: 2,
                              fontSize: 16
                            }}
                          />

                          {"Edit"}
                        </Button>
                      </Link>
                    );
                    const ChartBtn = (
                      <Link
                        to={`/tablecharts/${formID}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button className="btn-sm" variant="outline-warning">
                          <AiFillEdit
                            style={{
                              marginRight: 2,
                              marginBottom: 2,
                              fontSize: 16
                            }}
                          />

                          {"View Charts (Beta)"}
                        </Button>
                      </Link>
                    );
                    // const downloadBtn = (
                    //   <CSVLink data={convertToArray(formID)} filename={`${formName}.csv`}>
                    //     <Button size="sm">
                    //       <AiOutlineDownload
                    //         style={{
                    //           marginRight: 2,
                    //           marginBottom: 2,
                    //           fontSize: 16
                    //         }}
                    //       />
                    //       Download Form (CSV)
                    //     </Button>
                    //   </CSVLink>
                    // );

                    const DeleteBtn = (
                      <Button
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
                            fontSize: 16
                          }}
                        />

                        {"Delete"}
                      </Button>
                    );

                    const UpdateBtn = (
                      <Button
                      onClick={() => {
                        // setFormID(formID);
                        handleRevisionShow(formID, formName);
                      }}
                        className="btn-sm"
                        variant="warning"
                      >
                        <AiFillFileAdd
                          style={{
                            marginRight: 2,
                            marginBottom: 2,
                            fontSize: 16
                          }}
                        />

                        {"Reupload"}
                      </Button>
                    );


                    return (
                      <td
                        {...cell.getCellProps()}
                        style={{
                          ...cell.getCellProps().style,
                          textAlign: "center"
                        }}
                      >
                       
                       {/* {UpdateBtn} */}
                        {DeleteBtn}
                        {/* {EditBtn} */}

                        {/* <ActionDropDown
                          // publishBtn={publishBtn}
                          editBtn={EditBtn}
                          deleteBtn={DeleteBtn}
                          // addBtn={AddBtn}
                          // cloneBtn={CloneBtn}
                          // chartBtn = {ChartBtn}
                          // downloadBtn={downloadBtn}
                        /> */}
                      </td>
                    );
                  }  else if (cell.column.Header == "Institutions") {
                    return (
                      <td {...cell.getCellProps()}>
                        {cell.render("Cell").props.cell.value}
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
            onChange={e => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0;
              gotoPage(page);
            }}
            style={{ width: "100px" }}
          />
        </span>{" "}
        <select
          value={pageSize}
          onChange={e => {
            setPageSize(Number(e.target.value));
          }}
        >
          {[10, 20, 30, 40, 50].map(pageSize => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}


