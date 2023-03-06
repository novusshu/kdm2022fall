import React, { useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "./Calendar.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useCollection } from "../../../../../hooks/useCollection";

const localizer = momentLocalizer(moment);

const BCalendar = (props) => {
  const { documents, error, isPending } = useCollection("Projects");
  const handleSelectEvent = (e) => {
    console.log(e)
    console.log("Event Hit")
  }
  const parsing = () => {
    if(documents){
      documents.map((item) => {
        item.title = `${item.Title}`;
        item.start = `${item["Next due date (Y-m-d)"].split(",")[0]}`;
        item.end = `${item["Next due date (Y-m-d)"].split(",")[0]}`;
      })
      console.log("Doc Fetched:",documents);
      return documents;
      // parsedData.map((item) => {
      //   item.title = `${item.Title}`;
      //   item.start = `${item["Next due date (Y-m-d)"]}`;
      //   item.end = `${item["Next due date (Y-m-d)"]}`;
      // })
    }else{
      return [];
    }
   
  };
  useEffect(() => {
  }, [documents]);

  return (
    <div className="App">
      {/* {documents && ( */}
    <Calendar
      localizer={localizer}
      defaultDate={new Date()}
      defaultView="month"
      events={parsing()}
      style={{ height: "90vh" }}
      onSelectEvent= {props.onSelectEvent}
      startAccessor={(event) => { return new Date(event.start) }}
    />
      {/* )} */}
  </div>
  );
};

export default BCalendar;
