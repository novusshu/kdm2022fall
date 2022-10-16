import React, { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { Modal, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
// import { Alert } from "react-bootstrap";
import { db } from "../Firebase/firebasedb";
import { doc, getDoc } from "firebase/firestore";
import AvailableForms from "./AvailableForms";
import { NavBar } from "./NavBar";

export default function DashboardFaculty() {
  const auth = getAuth();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  // const [userRole, setUserRole] = useState("faculty");
  const userRole = "faculty";
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [redirectDestination, setRedirectDestination] = useState("/");
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        // const uid = user.uid;
        // ...
        setUser(user);
      } else {
        setRedirectDestination("/");
        setShouldRedirect(true);
      }
    });
    return () => unsubscribe();
  }, [auth]);
  useEffect(() => {
    if (user) {
      const docRef = doc(db, "Users", user.uid);
      getDoc(docRef).then((docSnap) => {
        if (docSnap.exists()) {
          console.log("Document data:", docSnap.data());
          const data = docSnap.data();
          setUserData(data);
          if (data.atype === "administrator") {
            setRedirectDestination("/dashboardadmin");
            setShouldRedirect(true);
          } else if (data.atype === "faculty") {
            setRedirectDestination("/dashboardfaculty");
            // setShouldRedirect(true);
          } else if (data.atype === "student") {
            setRedirectDestination("/dashboardstudent");
            setShouldRedirect(true);
          } //  else {
          //   setRedirectDestination("/dashboardstudent");
          //   setShouldRedirect(true);
          // }
        } else {
          // doc.data() will be undefined in this case
          console.log("No such document!");
          setRedirectDestination("/dashboardstudent");
          setShouldRedirect(true);
        }
      });
    }
  }, [user]);

  const navigate = useNavigate();
  useEffect(() => {
    if (shouldRedirect) {
      navigate(redirectDestination);
    }
  }, [shouldRedirect, redirectDestination, navigate]);

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const logOut = () => {
    setShow(false);
    signOut(auth)
      .then(() => {
        // Sign-out successful.
        console.log("Signed out successfully!");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  function toTitleCase(str) {
    return str.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }

  return (
    <>
      {/* {userData && (
        <NavBar />
      )} */}
      {redirectDestination && (
        <main>
          <h3 className="mt-3 text-center">
            {`Welcome to SOAR,  ${toTitleCase(userRole)}`}
          </h3>
          <h3><b>Manual Forms</b></h3>

          <p></p>
          <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>Logout Confirmation</Modal.Title>
            </Modal.Header>
            <Modal.Body>Are you sure you would like to log out?</Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button variant="danger" onClick={logOut}>
                Yes!
              </Button>
            </Modal.Footer>
          </Modal>
          {user && userData && <AvailableForms userID={user.uid} accountType={userData.atype} />}

        </main>
      )}
    </>
  );
}