import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import "./style.css";
import "./calender.css";
import IButton from "./components/Button/Button";
import Calendar from "./components/Calendar/Calendar";
import Modal from "./components/UIElements/Modal";
import Backdrop from "./components/UIElements/Backdrop";
import SideDrawer from "./components/UIElements/SideDrawer";
import {
  List,
  ListItem,
  ListItemText,
  Button,
  Stack,
  Box,
  TextField,
  Select,
} from "@mui/material";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import { db } from "../../../firebasedb";
import {
  doc,
  setDoc,
  getDoc,
  orderBy,
  serverTimestamp,
  collection,
  query,
  where,
  onSnapshot
} from "firebase/firestore";

// import parsedData from "./nsf_funding.json";
import { useUserAuth } from "../../../context/UserAuthContext";

export default function MyCal() {
  const { user } = useUserAuth();
  const [value, onChange] = useState(new Date());
  const currDate = format(value, "yyyy-MM-dd");

  const [upload, setUpload] = useState(false);
  const [input, setCheckInput] = useState(false);
  const [projectDetails, setProjectDetails] = useState([]);
  const [dueprojects, setDueProjects] = useState([]);
  const [nondueprojects, setNonDueProjects] = useState([]);
  const [displayedProject, setDisplayedProject] = useState({});
  const [displayCurrent, setDisplayCurrent] = useState(1);
  const [toggle, setToggle] = useState(false);
  const [listProjects, setListProjects] = useState([]);
  const [parsedData, setParsedData] = useState([])

  const [random, setRandom] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [drawerIsOpen, setDrawerIsOpen] = useState(false);
  

  const openMapHandler = () => setShowMap(true);

  const closeMapHandler = () => setShowMap(false);

  const openDrawerHandler = () => {
    setDrawerIsOpen(true);
  };

  const closeDrawerHandler = () => {
    setDrawerIsOpen(false);
  };

  useEffect(() => {
    if(user){
    const formLibraryRef = collection(db, 'uploads_content');
    const q = query(formLibraryRef, where("userID", "==", user.uid));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const projects = [];
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        const rawData = doc.data();
        projects.push(...rawData.form_content);
      });
      setParsedData(projects);
      // console.log(projects);
    });}
  }, [user]);

  const handleDueProjects = (e) => {
    if(parsedData){
    const res = parsedData.filter((detail) => {
      return detail.Title.toLowerCase().includes(e.target.value.toLowerCase());
    });
    e.target.value !== "" ? setProjectDetails(res) : setProjectDetails([]);
  }
  };

  const handleDisplayProject = async (e) => {
    console.log(e);
    console.log("OnChange hit");
    setDisplayCurrent(3);
    setDisplayedProject(e);
    setDrawerIsOpen(true);
  };

  const handleDisplayCurr = () => {
    console.log(displayCurrent);
    setDisplayCurrent(2);

    console.log("button working");
    console.log(displayCurrent);
  };

  const handleToggle = () => {
    if (toggle === true) {
      setToggle(false);
    } else {
      setToggle(true);
    }
  };

  const filterDueprojects = async () => {
    const res = await parsedData.filter((detail) => {
      return detail["Next due date (Y-m-d)"].length;
    });
    setDueProjects(res);
  };
  // ---------console.logs here---------
  const filterNonDueprojects = async () => {
    const res = await parsedData.filter((detail) => {
      return !detail["Next due date (Y-m-d)"].length;
    });
    console.log(currDate);
    console.log(displayedProject);
    setNonDueProjects(res);
    console.log(parsedData);
    console.log(dueprojects);
    console.log(nondueprojects);
  };

  const currDateProject = () => {
    console.log(displayedProject);
    if (displayCurrent) {
      const res = parsedData.filter((detail) => {
        return (
          detail["Next due date (Y-m-d)"] ===
          displayedProject["Next due date (Y-m-d)"]
        );
      });
      console.log("response working");
      setListProjects(res);
      console.log(listProjects);
      setDisplayCurrent(2);
    }
  };


  useEffect(() => {
    currDateProject();
    filterDueprojects();
    filterNonDueprojects();
  }, [displayCurrent, toggle]);

  return (
    <>
          <section className="glass">
            <div className="calender-area-custom">
              <div className="status">
                <Calendar onSelectEvent={handleDisplayProject} />
                {drawerIsOpen && <Backdrop onClick={closeDrawerHandler} />}
                <SideDrawer
                  show={drawerIsOpen}
                  onCancel={closeDrawerHandler}
                  footerclassName="place-item__modal-actions"
                  footer={<IButton danger={true} onClick={closeDrawerHandler}>CLOSE</IButton>}
                  header={`Projects due on ${displayedProject["Next due date (Y-m-d)"]}`}
                >
                  <div className="cards">
                    {listProjects.map((item) => (
                      <Button
                        variant="contained"
                        key={item["URL"]}
                        value={item}
                        style={{
                          display: "flex",
                          justifyContent: "flex-start",
                          margin: "10px",
                          textAlign: "left",
                        }}
                        onClick={() => {
                          setDisplayedProject(item);
                          setDisplayCurrent(3);
                          openMapHandler();
                        }}
                      >
                        ・{item["Title"]}
                      </Button>
                    ))}
                  </div>
                </SideDrawer>
                {showMap && <Backdrop onClick={closeMapHandler} />}
                <Modal
                  show={showMap}
                  onCancel={closeMapHandler}
                  contentclassName="place-item__modal-content"
                  footerclassName="place-item__modal-actions"
                  footer={
                    <IButton danger={true} onClick={closeMapHandler}>
                      CLOSE
                    </IButton>
                  }
                  style={{ width: "50vw", left: "45%" }}
                  header={"Project Information"}
                >
                  <div className="cards">
                    <div className="card">
                      <div>
                        <h3 className="percentage">Title:</h3>
                      </div>
                      <div>
                        {displayedProject.Title}
                      </div>
                    </div>
                    <div className="card">
                      <div>
                        <h3 className="percentage">Award Type:</h3>
                      </div>
                      <div>
                        <p>{displayedProject["Award Type"]}</p>
                      </div>
                    </div>
                    <div className="card">
                      <div>
                        <h3 className="percentage">Date Due:</h3>
                      </div>
                      <div>
                        <h2>{displayedProject["Next due date (Y-m-d)"]}</h2>
                      </div>
                    </div>
                    <div className="card">
                      <div>
                        <h3 className="percentage">Program ID:</h3>
                      </div>
                      <div>
                        <p>{displayedProject["Program ID"]}</p>
                      </div>
                    </div>
                    <div className="card">
                      <div>
                        <h3 className="percentage">NSF/PD Num:</h3>
                      </div>
                      <div>
                        <p>{displayedProject["NSF/PD Num"]}</p>
                      </div>
                    </div>
                    <div className="card">
                      <div>
                        <h3 className="percentage">Status:</h3>
                      </div>
                      <div>
                        <p>{displayedProject["Status"]}</p>
                      </div>
                    </div>
                    <div className="card">
                      <div>
                        <h3 className="percentage">URL:</h3>
                      </div>
                      <div>
                        <p>{displayedProject.URL}</p>
                      </div>
                    </div>
                    <a
                      href={`${displayedProject["Solicitation URL"]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      More Details
                    </a>
                  </div>
                </Modal>
              </div>
              {/* <Button inverse onClick={() => { handleDisplayCurr(); openMapHandler() }}>
                Display The Selected Project
              </Button> */}
            </div>

            <div className="dashboard">
              <div className="search-toggle">
                <div>
                  <h3>
                    <Stack>
                      <TextField
                        // labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        label="Search By Name"
                        color="success"
                        fullWidth
                        variant="filled"
                        onChange={handleDueProjects}
                      />
                      <div className="text-field">
                        {console.log('projectDetails: ', projectDetails)}
                        {projectDetails.map((item) => (
                          <>
                            <Button
                              key={item["URL"]}
                              value={item}
                              style={{
                                textTransform: 'none',
                                display: "flex",
                                justifyContent: "flex-start",
                                margin: "10px",
                                textAlign: "left",
                              }}
                              onClick={() => {
                                setDisplayedProject(item);
                                setDisplayCurrent(3);
                                openMapHandler();
                              }}
                            >
                              ・{item["Title"]}
                            </Button>
                          </>
                        ))}{" "}
                      </div>
                    </Stack>
                  </h3>
                </div>
                <div className="toggle">
                  <p>
                    <FormGroup>
                      <FormControlLabel
                        control={<Switch />}
                        label="Projects with due dates"
                        onClick={handleToggle}
                      />
                    </FormGroup>
                  </p>
                </div>
              </div>

              <div className="projects-list">
                {toggle === true ? (
                  <div className="field-selects">
                    <h3>
                      {dueprojects.map((item) => (
                        <>
                          <Button
                            key={item["URL"]}
                            value={item}
                            style={{
                              textTransform: 'none',
                              display: "flex",
                              justifyContent: "flex-start",
                              margin: "10px",
                              textAlign: "left",
                            }}
                            onClick={() => {
                              setDisplayedProject(item);
                              setDisplayCurrent(3);
                              openMapHandler();
                            }}
                          >
                            ・{item["Title"]}
                          </Button>
                          <p></p>
                        </>
                      ))}
                    </h3>
                  </div>
                ) : (
                  <div className="field-selects">
                    <h3>
                      {nondueprojects.map((item) => (
                        <>
                          <Button
                            key={item["URL"]}
                            value={item}
                            style={{
                              textTransform: 'none',
                              display: "flex",
                              justifyContent: "flex-start",
                              margin: "10px",
                              textAlign: "left",
                            }}
                            onClick={() => {
                              setDisplayedProject(item);
                              setDisplayCurrent(3);
                              openMapHandler();
                            }}
                          >
                            ・{item["Title"].toLowerCase()}
                          </Button>
                          <p></p>
                        </>
                      ))}
                    </h3>
                  </div>
                )}
              </div>
            </div>
          </section>

    </>
  );
}


