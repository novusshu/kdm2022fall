import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../../../firebasedb";
import { useUserAuth } from "../../../context/UserAuthContext";
import { getDoc, doc, query, where, updateDoc, arrayRemove } from "firebase/firestore";
import { CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CButton } from '@coreui/react';
import Year from "./YearView";
import './style.css'

const localizer = momentLocalizer(moment);

localizer.formats.yearHeaderFormat = 'YYYY'

const MyCal = () => {

    const { user, userData } = useUserAuth();
    const [events, setEvents] = useState([]);
    const [myProjects, setMyProjects] = useState([])
    const [visible, setVisible] = useState(false)
    const [docData, setDocData] = useState({})

    async function fetchFavorites() {
        const docSnap = await getDoc(doc(db, "Favorites", user.uid))
        if (docSnap.exists()) {
            // console.log("Document data:", docSnap.data());
            setMyProjects(docSnap.data())
        } else {
            console.log("No such document!");
        }
    }

    const retrieveProjects = async () => {
        const q = query(collection(db, "Projects"),
            where("BIIN_PROJECT_ID", "in", myProjects.favoriteList))
        const docSnapShot = await getDocs(q);
        const data = docSnapShot.docs.map(doc => doc.data())
        // console.log('data: ', data)
        const events = data.filter(doc => doc['Next due date (Y-m-d)'])
            .map(doc => {
                let day = new Date(doc['Next due date (Y-m-d)'].split(',')[0])
                return {
                    title: doc.Title,
                    start: day,
                    end: day,
                    id: doc.BIIN_PROJECT_ID
                }
            });
        console.log('events: ', events)
        setEvents(events);
    }


    useEffect(() => {
        fetchFavorites()
    }, [user])

    useEffect(() => {
        { console.log('My Projects: ', myProjects) }
        if (myProjects?.favoriteList) {

            retrieveProjects()
        }
    }, [myProjects])

    const onSelectEvent = async (event) => {
        console.log('event: ', event)
        const q = query(collection(db, "Projects"), where("BIIN_PROJECT_ID", "==", event.id))
        const docSnap = await getDocs(q);
        console.log(docSnap)
        setDocData(docSnap.docs[0].data())
        setVisible(!visible)
    }


    return (
        <>
            <CModal visible={visible} onClose={() => setVisible(false)}>
                <CModalHeader>
                    <CModalTitle>{docData.Title}</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    {docData.Synopsis}
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setVisible(false)}>Close</CButton>
                </CModalFooter>
            </CModal>
            <Calendar localizer={localizer} events={events}
                defaultDate={new Date()}
                defaultView="month"
                style={{ height: "90vh" }}
                onSelectEvent={onSelectEvent}
                startAccessor={(event) => { return new Date(event.start) }}
                endAccessor="end" 
                toolbar={true}
                views={{
                  day: true,
                  week: true,
                  month: true,
                  year: Year,
                  agenda: true,
                }}
                messages={{ year: 'Year' }}
              
                />
        </>

    );
};

export default MyCal;
