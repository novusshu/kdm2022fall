import React, { useEffect, useState, useRef } from "react";
import { db } from "../../../firebasedb";
import { Container, Row, Col, Form, Button, ListGroup } from 'react-bootstrap';
import { CForm, CFormCheck, CFormInput, CInputGroup, CInputGroupText } from "@coreui/react/dist";
import {
    collection,
    onSnapshot,
    addDoc,
    doc,
    setDoc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    updateDoc,
    arrayUnion,
    serverTimestamp,
} from "firebase/firestore";
import {
    CAvatar,
    CButton,
    CButtonGroup,
    CContainer,
    CCard,
    CCardBody,
    CCardFooter,
    CCardHeader,
    CCol,
    CProgress,
    CRow,
    CTable,
    CTableBody,
    CTableDataCell,
    CTableHead,
    CTableHeaderCell,
    CTableRow,
} from '@coreui/react'
import { Link } from "react-router-dom";
import { useUserAuth } from "../../../context/UserAuthContext";
import TableOfProjects from "./TableOfProjects";

export default function ProjectList() {

    const { user, userData } = useUserAuth();
    const [projectlist, setProjectlist] = useState(null)
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedResults, setSelectedResults] = useState([]);
    const [checkedItems, setCheckedItems] = useState({});

    // useEffect(() => {
    //     let allSubmittedTables = []

    //     const q = query(collection(db, "uploads_content"),
    //         where("userID", "==", user.uid))
    //     const unsubscribe = onSnapshot(q, (qSnapShot) => {
    //         qSnapShot.forEach(docSnapShot => {
    //             const raw = docSnapShot.data();
    //             allSubmittedTables.push(...raw?.form_content);
    //         })
    //         // console.log('allSubmittedTables: ', allSubmittedTables)
    //         setProjectlist(allSubmittedTables)
    //     })
    // }, [user])

    const handleKeyPress = (event) => {
        if (event.key === 'Enter' && searchTerm !== '') {
            handleSearch(searchTerm);
        }
    };

    const handleSearch = () => {
        let results = []
        const fieldToMatch = 'Title'
        const q = query(collection(db, "Projects"),
            // where(fieldToMatch, 'array-contains', searchTerm)
        )
        const unsubscribe = onSnapshot(q, (qSnapShot) => {
            qSnapShot.forEach(docSnapShot => {
                const raw = docSnapShot.data();
                if (raw[fieldToMatch].toLowerCase().includes(searchTerm.toLowerCase())) {
                    results.push(raw);
                }
            })
            // c onsole.log('allSubmittedTables: ', allSubmittedTables)
            setSearchResults(results)
        })
        // console.log(results)
    }

    const favoriteDB = 'Favorites'
    const handleSaveFavorites = async () => {
        // Update the user document with the new data
        await updateDoc(doc(db, favoriteDB, user.uid), 
            { favoriteList: arrayUnion(...selectedResults), timestamp: serverTimestamp()}
        )
        console.log('export selected to favorites: ', selectedResults)
    }

    return (
        <CContainer className="my-4">
            <CRow >
                <CInputGroup className="mb-3">
                    <CFormInput
                        type="text"
                        value={searchTerm}
                        onChange={(e) => {
                            // e.preventDefault();
                            setSearchTerm(e.target.value)
                        }}
                        placeholder="Search by Title"
                        onKeyPress={handleKeyPress}
                    />
                    <CButton color="info" onClick={handleKeyPress}>Search</CButton>
                </CInputGroup>

            </CRow>
            <CRow>
                {
                    searchResults.length > 0 &&
                    <>
                        <CCol xs="8" lg="4">
                            <CButton color="secondary"
                                onClick={handleSaveFavorites} disabled={selectedResults.length === 0}>
                                Export Selected to Favorites
                            </CButton>
                        </CCol>
                        <TableOfProjects displayResults={searchResults} 
                        selectedResults={selectedResults} 
                        setSelectedResults={setSelectedResults} />
                    </>
                }
            </CRow>
        </CContainer>
    )
}