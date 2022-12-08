import React, { useEffect, useState, useRef } from "react";
import { db } from "../../../firebasedb";
import {
    collection,
    onSnapshot,
    addDoc,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
} from "firebase/firestore";
import {
    CAvatar,
    CButton,
    CButtonGroup,
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

export default function ProjectList() {

    const { user, userData } = useUserAuth();
    const [projectlist, setProjectlist] = useState(null)
    useEffect(() => {
        let allSubmittedTables = []

        const q = query(collection(db, "automatic_table_submissions"),
            where("userID", "==", user.uid))
        const unsubscribe = onSnapshot(q, (qSnapShot) => {
                qSnapShot.forEach(docSnapShot => {
                    const raw = docSnapShot.data();
                    allSubmittedTables.push(...raw?.form_content);
                })
                // console.log('allSubmittedTables: ', allSubmittedTables)
                setProjectlist(allSubmittedTables)
            })
    }, [user])

    console.log(projectlist)
    return (
        <>
            {
                projectlist &&
                <CTable align="middle" className="mb-0 border" hover responsive>
                    <CTableHead color="light">
                        <CTableRow>
                            <CTableHeaderCell className="text-center">NSF/PD Num</CTableHeaderCell>
                            <CTableHeaderCell>Award Type</CTableHeaderCell>
                            <CTableHeaderCell>Next due date</CTableHeaderCell>
                            <CTableHeaderCell>Title</CTableHeaderCell>
                        </CTableRow>
                    </CTableHead>
                    <CTableBody>
                        {projectlist.map((item, index) => (
                            <CTableRow v-for="item in tableItems" key={index}>
                                <CTableDataCell>
                                <div>
                                <Link
                          to={`/user/projects/${item['NSF/PD Num']}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {item['NSF/PD Num']}
                        </Link>
                                    </div>
                                </CTableDataCell>
                                <CTableDataCell>
                                    <div>{item['Award Type']}</div>
                                </CTableDataCell>

                                <CTableDataCell>
                                    <div className="clearfix">
                                        <div >
                                            <small className="text-medium-emphasis">{item['Next due date (Y-m-d)']}</small>
                                        </div>
                                    </div>
                                    {/* <CProgress thin color={item.usage.color} value={item.usage.value} /> */}
                                </CTableDataCell>

                                <CTableDataCell>
                                    <div>{item['Title']}</div>
                                </CTableDataCell>
                            </CTableRow>
                        ))}
                    </CTableBody>
                </CTable>
            }
        </>
    )
}