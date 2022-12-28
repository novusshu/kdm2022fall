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
import Card from 'react-bootstrap/Card';

import { useUserAuth } from "../../../context/UserAuthContext";


export default function Project() {

    const { projectID } = useParams();
    // const API_TOKEN = process.env.REACT_APP_HF_API_TOKEN

    const { user, userData } = useUserAuth();
    const [project, setProject] = useState(null)
    const [summary, setSummary] = useState(null)

    async function summarize(data) {
        const response = await fetch(
            "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
            {
                headers: { Authorization: "Bearer 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" },
                method: "POST",
                body: JSON.stringify(data),
            }
        );
        const result = await response.json();
        return result;
    }

    useEffect(() => {
        let dbproject = []

        const q = query(collection(db, "uploads_content"),
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


    useEffect(
        () => {
            if (project) {
                summarize({
                    inputs: project.Synopsis
                }).then((response) => {
                    setSummary(response)
                    console.log(JSON.stringify(response));
                })
                    .catch((err) => {
                        console.log(err.message);
                    });
            }

        }, [project])




    return (
        <>
            {project &&
                <Card >
                    <Card.Header>{project.Title}</Card.Header>
                    <Card.Body>
                        <Card.Title className="m-5" >
                            <QuestionAnswer context={project.Synopsis} />
                        </Card.Title>
                        <Card.Text >
                            {summary &&  summary[0].summary_text}
                        </Card.Text>
                    </Card.Body>
                    {/* <Card.Footer className="text-muted">2 days ago</Card.Footer> */}
                </Card>
            }
        </>
    )
}