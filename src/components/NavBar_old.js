import React, { useState, useEffect, useRef } from "react";
import { Navbar, Nav, NavDropdown, Container, Button, Modal } from "react-bootstrap";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import { useNavigate, useLocation } from "react-router-dom";
import { AiOutlineLogout, AiOutlineProfile } from "react-icons/ai";
import { FcAssistant } from "react-icons/fc";
import { FaUser, FaUserAlt, FaUserGraduate, FaUserTie } from "react-icons/fa";
import { GrUserManager, GrUserExpert } from "react-icons/gr";
import { AuthComponent } from "./AuthComponent";

import { db } from "../Firebase/firebasedb";

export const NavBar = ({ setUserDataExternal, render = true }) => {
  const location = useLocation();
  const auth = getAuth();
  // console.log(userData)
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [redirectDestination, setRedirectDestination] = useState(null);
  const navigate = useNavigate();

  const [showLogOut, setShowLogOut] = useState(false);
  const handleClose = () => setShowLogOut(false);
  const handleShow = () => setShowLogOut(true);
  const logOut = () => {
    setShowLogOut(false);
    signOut(auth)
      .then(() => {
        // Sign-out successful.
        console.log("Signed out successfully!");
        if (location.pathname == "/") window.location.reload();
        else {
          navigate("/");
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };


  return (
    <div>
      <AuthComponent
        user={user}
        setUser={setUser}
        auth={auth} />
      {render && userData && (
        <Navbar bg="light" expand="lg" className="py-3 fs-4">
          <Container fluid>
            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            <Navbar.Collapse
              id="responsive-navbar-nav"
              className="justify-content-center"
            >
              <Nav className="me-auto">
                <Nav.Link href="/">Home</Nav.Link>
                <Nav.Link href="/readme">README</Nav.Link>
              </Nav>
              <Button className="mx-2" variant="warning" href="/edit-profile">
                <AiOutlineProfile
                  style={{ marginRight: 2, marginBottom: 2, fontSize: 16 }}
                />
                Edit Profile
              </Button>
              <Button variant="danger" onClick={handleShow}>
                <AiOutlineLogout
                  style={{ marginRight: 2, marginBottom: 2, fontSize: 16 }}
                />
                Log Out
              </Button>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      )}
      <Modal show={showLogOut} onHide={handleShow}>
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
    </div>
  );
};
