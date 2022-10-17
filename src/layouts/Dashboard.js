import React, { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { Modal, Button, ListGroup } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
// import { Alert } from "react-bootstrap";
import { db } from "../features/firebasedb";
import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  serverTimestamp,
  query,
  collection,
} from "firebase/firestore";
import Dropdown from "react-bootstrap/Dropdown";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import { AiFillQuestionCircle, AiFillCloseCircle } from "react-icons/ai";
import ReactTooltip from "react-tooltip";
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { Textarea } from "../components/Textarea";
import Card from "react-bootstrap/Card";

export default function Dashboard({ role }) {
  const auth = getAuth();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(false);
  const [formMetadata, setFormMetadata] = useState(null);

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
        } else {
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

  return (
    <>
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
      {redirectDestination && (
        <main>
          <h3 className="mt-3 text-center">Welcome, {role}!</h3>
          {/* <h3><b>Manual Forms</b></h3> */}
          <p></p>
          <div>
            <Dropdown style={{ display: "inline" }}>
              <Dropdown.Toggle variant="outline-info" id="dropdown-basic">
                Create A New Table Form
              </Dropdown.Toggle>

              <Dropdown.Menu>
                {/* <Dropdown.Item href="/forms/create">Online via Web <b>(Recommended)</b></Dropdown.Item> */}
                <Dropdown.Item href="/tablecsvupload">
                  Upload CSV or Excel
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </main>
      )}
    </>
  );
}
