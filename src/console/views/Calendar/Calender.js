import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "./calender.css";

import Papa from "papaparse";

import {
  List,
  ListItem,
  ListItemText,
  Button,
  Stack,
  Box,
  TextField,
} from "@mui/material";

function MyCalendar() {
  const [value, onChange] = useState(new Date());
  const [upload, setUpload] = useState(false);
  const [input, setCheckInput] = useState(false);
  const [projectDetails, setProjectDetails] = useState([]);
  const [parsedData, setPasrsedData] = useState([]);
  const [dueprojects, setDueProjects] = useState([]);
  const [nondueprojects, setNonDueProjects] = useState([]);
  const handleDueProjects = (e) => {
    const res = parsedData.filter((detail) => {
      return detail.Title.toLowerCase().includes(e.target.value.toLowerCase());
    });
    e.target.value !== "" ? setProjectDetails(res) : setProjectDetails([]);
  };

  const changeHandler = (event) => {
    Papa.parse(event.target.files[0], {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        setPasrsedData(results.data);
      },
    });

    setUpload(true);
    setCheckInput(true);
  };

  const filterDueprojects = () => {
    const res = parsedData.filter((detail) => {
  
      return detail.Status==="Cleared";
    });
console.log(res)
    setDueProjects(res);
  };
  const filterNonDueprojects = () => {
    const res = parsedData.filter((detail) => {

      return detail.Status.length>0;
    });

    setNonDueProjects(res);
  };

  useEffect(() => {});
  return (
    <Box
      sx={{
        flex: 1,
        background: "#1A527B",
        display: "flex",

        height: "100vh",
      }}
    >
      {input === false ? (
        <input
          type="file"
          name="file"
          accept=".csv"
          style={{ display: "block", margin: "10px auto" }}
          onChange={changeHandler}
        />
      ) : null}

      {upload === false ? null : (
        <Box sx={{ bgColor: "red", display: "flex", flex: 1 }}>
          <Box sx={{ marginTop: "5%", marginRight: "3%" }}>
            <Calendar onChange={onChange} value={value} />
          </Box>

          <Box sx={{ backgroundColor: "palegreen", width: 1, display: "flex" }}>
            <Stack sx={{ width: 2 / 4 }}>
              <TextField
                id="outlined-name"
                label="Search by Project Names"
                sx={{
                  marginTop: "10%",
                  marginLeft: "5%",
                  width: "40%",
                }}
                onChange={handleDueProjects}
              />

              {projectDetails.length !== 0 ? (
                <Box
                  sx={{
                    width: "40%",
                    marginLeft: "5%",
                    maxHeight: "50%",
                    overflow: "auto",
                    bgcolor: "red",
                  }}
                >
                  {projectDetails.slice(0, 20).map((detail) => (
                    <List key={detail.URL}>
                      <ListItem>
                        <ListItemText primary={detail.Title} />
                      </ListItem>
                    </List>
                  ))}
                </Box>
              ) : null}
            </Stack>

            <Stack direction={"row"} sx={{ marginTop: "6%" }}>
              <Button
                variant="contained"
                sx={{ width: "40%", height: "7%" }}
                onClick={() => filterDueprojects()}
              >
                Due Projects
              </Button>
              <Button variant="contained" sx={{ width: "40%", height: "7%" }}    onClick={() => filterNonDueprojects()}>
                Non Due Projects
              </Button>
            </Stack>

            {dueprojects.length !== 0 && (
              <Box sx={{ bgcolor: "red",overflow:'auto',maxHeight:'50%'} }>
                {dueprojects.map((item) => (
                   <List key={item['URL']}>
                   <ListItem>
                     <ListItemText primary={item["Next due date (Y-m-d)"]} />
                   </ListItem>
                 </List>
                ))}
              </Box>
            )}
            {nondueprojects.length !== 0 && (
              <Box sx={{ bgcolor: "red",overflow:'auto',maxHeight:'50%'} }>
                {dueprojects.map((item) => (
                   <List key={item['URL']}>
                   <ListItem>
                     <ListItemText primary={item["Title"]} />
                   </ListItem>
                 </List>
                ))}
              </Box>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default MyCalendar;
