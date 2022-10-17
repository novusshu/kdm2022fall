import { RoleValidationComponent } from "../Automatic Forms/Utils"
import React, { useState, useEffect, useRef } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { NavBar } from "./NavBar"
import './Input.css'
import ReadMeEdit from './ReadMeEdit'
import { db } from "../Firebase/firebasedb";
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { allRolesRegular, allRoles, isHubLead } from "../Fixed Sources/accountTypes";
import Dropdown from 'react-bootstrap/Dropdown';
import { Button } from "react-bootstrap";
import { BsBoxArrowInLeft, BsEyeglasses, BsPencilSquare } from "react-icons/bs";
import { AiFillSave, AiFillQuestionCircle, AiFillEdit } from "react-icons/ai";

const RenderComponent = ({ action = null, userData }) => {
    console.log('action', action);
    const [valid, setValid] = useState(false)
    const [readmeText, setReadmeText] = useState('')
    const [readmeDict, setReadMeDict] = useState({})
    const [currentPreviewRole, setCurrentPreviewRole] = useState(null);
    useEffect(() => {
        const docRef = doc(db, "information_sources", 'readme');
        onSnapshot(docRef, (docSnap) => {
            const data = docSnap.data();
            console.log('data', data)
            if (data) {
                const readmeDictServer = {}
                Object.keys(allRoles).forEach(role => {
                    let text = ''
                    // console.log(role, data[role])
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
    useEffect(() => {
        console.log('currentPreviewRole', currentPreviewRole)
        console.log('readmeText of ', currentPreviewRole, readmeDict[currentPreviewRole])
    }, [currentPreviewRole])
    const rawStringCampusLead = String.raw`   [Please use Google Chrome as the most reliable browser for the web-based forms.]

    SOAR is the backbone portal for NSF INCLUDES Alliance TAPDINTO-STEM. This is the project of a team of talented doctoral computer science students. They built something novel and useful for TAPDINTO-STEM. This is part one, the input forms, and part two, the data reporting and visualizations, are still in-progress.

    SOAR also has an associated app that is currently available for IOS and will soon be available for Android. The app permits only completing forms and not editing or creating forms.

    One of the features that we like about this portal is the ability for someone to listen to the form and speak the answers using their microphone or type the answers into the chat box. Individuals completing the forms using the dialogue feature can edit their responses on the form itself should AI insert something other than what was intended.

    As Campus/Hub Lead, you have access to edit common forms and create individual forms that are tailored to your hub or college/university.  The backbone team hopes that much of this will be intuitive for you – that the design matches what you have come to know from Google Forms or Qualtrics. The backbone team does have requests to keep the portal organized and functioning optimally.

    1.	You have the capability to edit and the admins will publish the form. When you edit the form, please give a heads up to the backbone to review and publish forms. (Alexis Petri, petria@umkc.edu)
    2.	Follow the naming convention. For student forms, begin the form name with “STU” followed by a number and an underscore, such as “6_”, and then the acronym for your college or university followed by an underscore, such as “UMKC_” and then the name of your form with spaces between the words. STU2_UMKC_TAPDINTO-STEM Student Demographic Form
    3.	Specify the role. In other words, who will complete the form? We have a limited number of options for this and ask that you make the form fit the roles available: student, student mentor, faculty/staff, campus/hub lead.
    4.	Note the form domain: common means that the form is common to all institutions and individual means that the form is limited to specific institution(s).
    5.	Some forms are part of a sequence, which you can set up in the create forms space.
    6.	Date options allow you to have a start and end date for the form. We have one limitation in that we cannot have multiple start date and end date for the same form.
    7.	There are a variety of questions and descriptive text that you can add.
    8.	Remember to upload your new form and also to view it as a form.

    We have a request to not make individual changes to the established common forms that are already published. However, if you have a wording suggestion or would like additional questions that everyone should answer, please edit the forms. This way we can benefit from all of our perspectives and expertise.

    We encourage you to edit, create, and use forms associated with the portal. With all the data in one place, our reporting will be stronger and we can make evidence-based decisions.

    Backbone Team

    Duy H. Ho, UMKC doctoral student
    Ahmed Alanazi, UMKC doctoral student
    Cheng Shu, UMKC doctoral student
    Yugi Lee, Professor of Computer Science
    Ye Wang, Professor of Communication and Journalism
    Alexis Petri, backbone lead
    Jeff Traiger, backbone manager`
    if (action == 'edit') {
        return <div>
            <RoleValidationComponent requiredRoles={['hub-lead', 'hub-lead-admin', 'administrator']} setValidExternal={setValid} />
            <ReadMeEdit />
        </div>
    }
    else if (action == 'preview') {
        <RoleValidationComponent requiredRoles={['hub-lead', 'hub-lead-admin', 'administrator']} setValidExternal={setValid} />

        return <div>
            <Dropdown onSelect={(eventKey, event) => {
                console.log(eventKey)
                setCurrentPreviewRole(eventKey);
            }}>
                <Dropdown.Toggle variant={''}
                    className={'btn-lg button-fill-theme mb-2'}
                    id="dropdown-basic">
                    Target Users: <b>{allRoles[currentPreviewRole]}</b>
                </Dropdown.Toggle>

                <Dropdown.Menu>
                    {Object.keys(allRoles).map(role => {


                        return <Dropdown.Item eventKey={role} active={currentPreviewRole == role}>{allRoles[role]}</Dropdown.Item>
                    })}
                </Dropdown.Menu>
            </Dropdown>

            {readmeDict[currentPreviewRole] && <pre style={{ fontFamily: 'sans-serif' }}>{readmeDict[currentPreviewRole]}</pre>}
            <Button href='/readme/edit'> <BsPencilSquare style={{ marginRight: 4, marginBottom: 3, fontSize: 16 }} />Edit README </Button>

        </div>
    }
    else {
        if (userData) {
            return <div>
                {/* <RoleValidationComponent requiredRoles={[userData.atype]} redirect={true} setValidExternal={setValid} /> */}

                {readmeDict[userData.atype] && <pre style={{ fontFamily: 'sans-serif' }}>{readmeDict[userData.atype]}</pre>}
                {userData && isHubLead(userData.atype) && <div>

                    <Button href='/readme/edit'> <BsPencilSquare style={{ marginRight: 4, marginBottom: 3, fontSize: 16 }} />Edit README </Button>
                    <Link to={'/readme/preview'} target="_blank" rel="noopener noreferrer">
                <Button style={{ marginLeft: 3 }} variant="fill-theme" >
                <BsEyeglasses style={{
                        //   marginLeft: '1px',
                           marginBottom: '3px',
                        //   color: theme.highlightColor,
                          fontSize: '17px'
                        }} /> Preview
                </Button></Link>
                </div>}
            </div>
        }
        // else {
        //     return <div>
        //         <RoleValidationComponent requiredRoles={['student']} redirect={true} setValidExternal={setValid} />
        //         Page not available
        //     </div>
        // }

        return <>
        </>
    }
    // else {
    //     if (currentPreviewRole && currentPreviewRole != '') {
    //         return <div>
    //             <h4>Preview Mode: <b>{allRolesRegular[currentPreviewRole]}</b></h4>
    //             <pre style={{ fontFamily: 'sans-serif' }}>{readmeText}</pre>
    //         </div>
    //     }
    //     else {
    //         return <div>
    //             <RoleValidationComponent requiredRoles={['hub-lead', 'campus-lead', 'hub-lead-admin', 'administrator']} setValidExternal={setValid} />

    //             {valid == true && <pre style={{ fontFamily: 'sans-serif' }}>


    //                 {rawStringCampusLead}


    //             </pre>}
    //         </div>
    //     }
    // }

}
export const ReadMe = () => {
    const { action } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const [userData, setUserData] = useState(null);
    const [valid, setValid] = useState(false)
    useEffect(() => {
        console.log('valid', valid)
    }, [valid])
    return <div>

        <NavBar setUserDataExternal={setUserData} />
        <RoleValidationComponent requiredRoles={Object.keys(allRoles)}
            redirect={true}
            setValidExternal={setValid} />


        {valid && <RenderComponent action={action} userData={userData} />}
    </div>
}