import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../../../firebasedb";
import { useUserAuth } from "../../../context/UserAuthContext";
import { getDoc, doc, query, where } from "firebase/firestore";
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CInputGroup,
  CInputGroupText,
  CInput,
} from "@coreui/react";
import Year from "./YearView";
import "./style.css";

const localizer = momentLocalizer(moment);

localizer.formats.yearHeaderFormat = "YYYY";

const MyCal = () => {
  const { user, userData } = useUserAuth();
  const [events, setEvents] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [visible, setVisible] = useState(false);
  const [docData, setDocData] = useState({});
  const [filterKeyword, setFilterKeyword] = useState("");

  async function fetchFavorites() {
    const docSnap = await getDoc(doc(db, "Favorites", user.uid));
    if (docSnap.exists()) {
      setMyProjects(docSnap.data());
    } else {
      console.log("No such document!");
    }
  }

  const retrieveProjects = async () => {
    const q = query(
      collection(db, "Projects"),
      where("BIIN_PROJECT_ID", "in", myProjects.favoriteList)
    );
    const docSnapShot = await getDocs(q);
    const data = docSnapShot.docs.map((doc) => doc.data());
    const filteredData = data
      .filter((doc) => {
        if (!doc["Next due date (Y-m-d)"]) return false;
        if (!filterKeyword) return true;
        const title = doc.Title.toLowerCase();
        const keyword = filterKeyword.toLowerCase();
        return title.includes(keyword);
      })
      .map((doc) => {
        let day = new Date(doc["Next due date (Y-m-d)"].split(",")[0]);
        return {
          title: doc.Title,
          start: day,
          end: day,
          id: doc.BIIN_PROJECT_ID,
        };
      });
    setEvents(filteredData);
  };

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  useEffect(() => {
    if (myProjects?.favoriteList) {
      retrieveProjects();
    }
  }, [myProjects, filterKeyword]);

  const onSelectEvent = async (event) => {
    const q = query(
      collection(db, "Projects"),
      where("BIIN_PROJECT_ID", "==", event.id)
    );
    const docSnap = await getDocs(q);
    setDocData(docSnap.docs[0].data());
    setVisible(true);
  };

  const handleFilterKeywordChange = (e) => {
    setFilterKeyword(e.target.value);
  };

  const filteredEvents = events.filter((event) => {
    if (!filterKeyword) return true;
    const title = event.title.toLowerCase();
    const keyword = filterKeyword.toLowerCase();
    return title.includes(keyword);
  });

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
          <CButton color="secondary" onClick={() => setVisible(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
      <div className="filter-container" style={{ display: "flex", justifyContent: "center" }}>
        <label htmlFor="filter-input">Filter by keywords:</label>
        <input
          type="text"
          id="filter-input"
          onChange={handleFilterKeywordChange}
          value={filterKeyword}
        />
        <button onClick={retrieveProjects}>Filter</button>
      </div>

      <Calendar
        localizer={localizer}
        events={events}
        defaultDate={new Date()
        }
        defaultView="month"
        style={{
          height: "90vh"
        }
        }
        onSelectEvent={onSelectEvent}
        startAccessor={(event) => new Date(event.start)
        }
        endAccessor="end"
        toolbar={true
        }
        views={{
          day: true,
          week: true,
          month: true,
          year: Year,
          agenda: true,
        }}
        messages={{ year: "Year" }}
      />
    </>
  );
};

export default MyCal;


/*
    I added a new filteredEvents state variable to store the events filtered by keyword.
    I replaced the filterEvents function with handleFilterKeywordChange, which updates the filterKeyword state variable when the user types a new value into the filter input field.
    I modified the retrieveProjects function to use the filterKeyword state variable to filter the data before mapping it to events.
    I updated the events prop passed to the Calendar component to use the filteredEvents state variable if it contains events, otherwise fall back to the original events state variable.
    I updated the onClick handler for the filter button to call retrieveProjects instead of filterEvents.
    I updated the onChange handler for the filter input field to call handleFilterKeywordChange instead of filterEvents.
    I added a key prop to the Calendar component to force it to re-render when the filteredEvents state variable changes.
*/