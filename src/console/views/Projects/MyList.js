import React, { useEffect, useState } from 'react'
import { CCard, CCardBody, CCardHeader, CCol, CRow, CButton } from '@coreui/react'
import TableOfProjects from './TableOfProjects'
import { useUserAuth } from '../../../context/UserAuthContext'
import { getDoc, doc, collection, query, where, getDocs, updateDoc, arrayRemove } from "firebase/firestore";
import { db } from "../../../firebasedb";
import { fetchData, retrieveProjects } from '../utils';

const MyList = () => {

    const { user, userData } = useUserAuth();
    const [myProjects, setMyProjects] = useState([])
    const [displayResults, setDisplayResults] = useState([])
    const [selectedResults, setSelectedResults] = useState([]);

    useEffect(() => {
        fetchData(user.uid, setMyProjects)
    }, [user])

    useEffect(() => {
        { console.log('My Projects: ', myProjects) }
        if (myProjects?.favoriteList) {
            setDisplayResults([])
            retrieveProjects(myProjects, setDisplayResults)
        }
    }, [myProjects])

    const handleDeleteFavorites = () => {
        console.log('selectedResults: ', selectedResults)
        let newFavorites = myProjects.favoriteList.filter((item) => !selectedResults.includes(item))
        console.log('newFavorites: ', newFavorites)
        deleteDoc()
        setMyProjects(prev => ({ ...prev, favoriteList: newFavorites }))
        setSelectedResults([])
    }

    const deleteDoc = async () => {
        const docRef = doc(db, "Favorites", user.uid);
        await updateDoc(docRef, { favoriteList: arrayRemove(...selectedResults) });
    }

    return (
        <>
            {/* {console.log('Display: ', displayResults)} */}
            {/* {console.log('My Projects: ', myProjects)} */}
            {myProjects &&
                <>
                    <CCol xs="8" lg="4">
                        <CButton color="warning" className="px-4"
                            onClick={handleDeleteFavorites} disabled={selectedResults.length === 0}>
                            Delete
                        </CButton>
                    </CCol>
                    <TableOfProjects displayResults={displayResults}
                        selectedResults={selectedResults}
                        setSelectedResults={setSelectedResults} />
                </>
            }
        </>


    )
}

export default MyList