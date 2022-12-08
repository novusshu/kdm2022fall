import React, { useEffect, Component } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";


import parsedData from "../../nsf_funding.json";
import "./Calendar.css";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

const BCalendar = (props) => {




  
    const handleSelectEvent = (e) => {
      console.log(e)
      console.log("Event Hit")
    }

    const parsing = () => {
      parsedData.map((item) => {
        item.title = `${item.Title}`;
        item.start = `${item["Next due date (Y-m-d)"]}`;
        item.end = `${item["Next due date (Y-m-d)"]}`;

      })
      console.log(parsedData)
    }

      useEffect(() => {
        parsing();
      }, []);

    return (
      <div className="App">
        <Calendar
          localizer={localizer}
          defaultDate={new Date()}
          defaultView="month"
          events={parsedData}
          style={{ height: "90vh" }}
          onSelectEvent= {props.onSelectEvent}
          startAccessor={(event) => { return new Date(event.start) }}
        />
      </div>
    );
  }


export default BCalendar;
