import "bootstrap/dist/css/bootstrap.min.css";
import 'font-awesome/css/font-awesome.min.css';
import React, { useEffect, useState, useRef } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { db } from "../../../firebasedb";
import {
    collection,
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
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';


export default function QuestionAnswer({
    context
}) {

    const API_TOKEN = process.env.REACT_APP_HF_API_TOKEN
    const [answer, setAnswer] = useState(null)
    const { register, handleSubmit, watch, formState: { errors } } = useForm();

    // console.log('token, ', process.env.REACT_APP_HF_API_TOKEN)
    async function query(data) {
        const response = await fetch(
            "https://api-inference.huggingface.co/models/deepset/roberta-base-squad2",
            {
                headers: { Authorization: `Bearer ${API_TOKEN}` },
                method: "POST",
                body: JSON.stringify(data),
            }
        );
        const result = await response.json();
        return result;
    }

    const getFirebase = async data => {

    }

    function onSubmit(data) {
        console.log(data);
        // alert("SUCCESS!! :-)\n\n" + JSON.stringify(data, null, 4));
        // writeToFirebase(data);
        query({inputs:{question: data.search,
        context: context}}).
        then((response) => {
            setAnswer(response)
            console.log(JSON.stringify(response));
        })
        .catch((err) => {
            console.log(err.message);
         });
    }
    return (
        <>
        <form className="d-flex" onSubmit={handleSubmit(onSubmit)}>
            <Form.Control
                type="search"
                placeholder="Ask a Question"
                className="me-2"
                aria-label="Search"
                {...register("search", { required: true })}
            />
            <Button type='submit' variant="outline-success">Search Answers</Button>
            <div className="invalid-feedback">
            {errors?.search?.message}
            </div>
           
        </form>

        {answer && <div> {answer.answer} </div>}

        </>
    )
}