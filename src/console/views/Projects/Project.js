import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
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
import QuestionAnswer from "../QnA/QuestionAnswer";

import { useUserAuth } from "../../../context/UserAuthContext";

export default function Project() {

    const { projectID } = useParams();

    const { user, userData } = useUserAuth();
    const [project, setProject] = useState(null)

    useEffect(() => {
        let dbproject = []

        const q = query(collection(db, "automatic_table_submissions"),
            where("userID", "==", user.uid))
        const unsubscribe = onSnapshot(q, (qSnapShot) => {
                qSnapShot.forEach(docSnapShot => {
                    const raw = docSnapShot.data();
                    dbproject.push(
                    raw.form_content.filter(e => e["NSF/PD Num"] == projectID)[0])
                })
                setProject(dbproject.filter(e => e !== undefined)[0])                
            })
    }, [user])


    return (
        <>
       
        <div>
            <QuestionAnswer />
        
        <div>
             {project && project.Synopsis}

            </div>
            </div>
        </>
    )
}