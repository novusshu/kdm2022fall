import React, { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
// import Button from 'react-bootstrap/Button';
import { Modal, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
// import { Alert } from "react-bootstrap";
import { db } from "../Firebase/firebasedb";
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { NavBar } from "./NavBar";
import Dropdown from 'react-bootstrap/Dropdown';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import { allRoles, allRolesCompat, allRolesRegular, atypeOptions, getFirebaseDocumentID, READMEsample } from "../Fixed Sources/accountTypes";
// import { AiFillSave, AiOutlineDownload, AiFillCopy, AiFillEdit, AiOutlineDelete, AiOutlineCheckCircle, AiOutlineCloseCircle, AiTwotoneClockCircle } from "react-icons/ai";
import { AiFillSave, AiFillQuestionCircle, AiFillCloseCircle } from "react-icons/ai";
import { BsBoxArrowInLeft, BsEyeglasses } from "react-icons/bs";

import ReactTooltip from 'react-tooltip';
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import theme from "../Theme/theme";
import { readInstitutions, writeInstitutions } from "../Fixed Sources/institutions";
import { Textarea } from "./Textarea";
import { Input } from "./Input";
function ReadMeEdit() {


    const validationSchema = Yup.object().shape({

        // institutionList: Yup.string().required('Institutions Required')

    });
    const formOptions = { resolver: yupResolver(validationSchema) };
    const methods = useForm(formOptions);
    const { handleSubmit, reset, register, setValue, formState: { errors }, setError, watch, getValues } = methods;


    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const [readmeDict, setReadMeDict] = useState({})


    useEffect(() => {
        const docRef = doc(db, "information_sources", 'readme');
        onSnapshot(docRef, (docSnap) => {
            const data = docSnap.data();
            console.log('data', data)
            if (data) {
                const readmeDictServer = {}
                Object.keys(allRoles).forEach(role => {
                    let text = ''
                    console.log(role, data[role])
                    if (data[role]) {
                        text = data[role]
                    }

                    readmeDictServer[role] = text

                })
                setReadMeDict({ ...readmeDictServer })
            }
            else {
                Object.keys(allRoles).forEach(role => {
                    let text = ''
                    readmeDict[role] = text

                })
                setReadMeDict({ ...readmeDict })
            }

        })
    }, [])

    // useEffect (() => {

    // }, [currentTargetRole])
    const [currentTargetRole, setCurrentTargetRole] = useState('student');
    useEffect(() => {
        console.log('currentTargetRole', currentTargetRole)

        console.log("readmeDict", readmeDict)
        console.log("readme of ", currentTargetRole, readmeDict[currentTargetRole])
        setValue('readmeContent', readmeDict[currentTargetRole])
    }, [readmeDict, currentTargetRole])
    const [saveSuccessfully, setSaveSuccessfully] = useState(false)
    const [modalText, setModalText] = useState('Nothing')
    const handleCloseSave = () => {
        setModalText('')
        setSaveSuccessfully(false);
    }
    const handleShowSave = (textToShow) => {
        setModalText(textToShow)
        setSaveSuccessfully(true);
    }
    const handleEdit = (data, e) => {
        e.preventDefault();
        data.targetRole = currentTargetRole;
        console.log('handleEdit data', data);
        // const institutionListArray = data['institutionList'].split('\n')
        // console.log('institutionListArray', institutionListArray)
        writeREADME(data, handleShowSave)
        handleClose();
    }
    console.log(errors)
    const writeREADME = (data, callback = null) => {

        const writeData = { [data.targetRole]: data.readmeContent }
        console.log('writeData', writeData)
        setDoc(doc(db, "information_sources", 'readme'), writeData, { merge: true })
            .then(() => {
                // setFormID(data.formID);
                // alert(`Institutions updated on Firebase successfully!`)
                if (callback) {
                    callback('Your README changes have been saved successfully!');
                }
                // setFileProcessedSuccessfully(Date.now());
            }).catch(err => {
                console.log(err)
                alert(err)
                callback(err);

                // setFileProcessedSuccessfully(Date.now());

            });
    }

    return <>
        <ReactTooltip />
        <Modal show={saveSuccessfully} onHide={handleCloseSave}>
            <Modal.Header closeButton>
                <Modal.Title>README Updates</Modal.Title>
            </Modal.Header>
            <Modal.Body>{modalText}</Modal.Body>
            <Modal.Footer>
                <Button variant="success" onClick={handleCloseSave}>
                    Okay
                </Button>
                {/* <Button variant="primary" onClick={handleClose}>
            Save Changes
          </Button> */}
            </Modal.Footer>
        </Modal>
        <Dropdown onSelect={(eventKey, event) => {
            console.log(eventKey)
            setCurrentTargetRole(eventKey);
        }}>
            <Dropdown.Toggle variant={''}
                className={'btn-lg button-fill-theme mb-2'}
                id="dropdown-basic">
                Target Users: <b>{allRoles[currentTargetRole]}</b>
            </Dropdown.Toggle>

            <Dropdown.Menu>
                {Object.keys(allRoles).map(role => {


                    return <Dropdown.Item eventKey={role} active={currentTargetRole == role}>{allRoles[role]}</Dropdown.Item>
                })}
            </Dropdown.Menu>
        </Dropdown>
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(handleEdit)}>
                <div className='row'>
                    <Textarea
                        name={'readmeContent'}
                        label={'README Content: '}
                        className="mb-3 col-md-12"
                        defaultValue={''}
                        required
                        instructions={'README content for this specific role.'}
                        minHeight={400}
                        placeholder={'...Sample README text...'}
                    />
                </div>

                <Button variant="primary" onClick={handleSubmit(handleEdit)}>
                <AiFillSave style={{
                        //   marginLeft: '1px',
                           marginBottom: '3px',
                        //   color: theme.highlightColor,
                          fontSize: '17px'
                        }} /> Save Changes
                </Button>
                <Button style={{ marginLeft: 3 }} variant="secondary" href='/'>
                <BsBoxArrowInLeft style={{
                        //   marginLeft: '1px',
                           marginBottom: '3px',
                        //   color: theme.highlightColor,
                          fontSize: '17px'
                        }} /> Back
                </Button>
                <Link to={'/readme/preview'} target="_blank" rel="noopener noreferrer">
                <Button style={{ marginLeft: 3 }} variant="fill-theme" >
                <BsEyeglasses style={{
                        //   marginLeft: '1px',
                           marginBottom: '3px',
                        //   color: theme.highlightColor,
                          fontSize: '17px'
                        }} /> Preview
                </Button></Link>


            </form>
        </FormProvider>

    </>
}
export default ReadMeEdit;