import React, { useState, useEffect, useRef } from "react";
import {
  Navbar,
  Nav,
  NavDropdown,
  Container,
  Button,
  Modal,
} from "react-bootstrap";
import { useNavigate} from "react-router-dom";
import "../assets/css/style.css";
import kitty from "../assets/img/kitty.jpg";
import { useUserAuth } from "../context/UserAuthContext";


export const PublicHeader = () => {

  return (
    <>
      <header id="header" className="sticky-top header-scrolled">
        <Navbar id="navbar">
          <Container fluid>
            <Navbar.Brand href="/" className="logo me-auto">
              <img
                src={kitty}
                width="30"
                height="30"
                className="img-fluid"
                alt="BBIN logo"
              />
              {"   "}
              BBIN
            </Navbar.Brand> 
            <>
                <Nav.Link href="/#about" className="scrollto">
                About
              </Nav.Link>
              <Nav.Link href="/#service" className="scrollto">
                Services
              </Nav.Link>
              <Nav.Link href="/#team" className="scrollto">
                Team
              </Nav.Link>
                <Nav.Link className="getstarted scrollto" href="/login">
                Log in / Sign up
              </Nav.Link>
              </>
              
          </Container>
        </Navbar>
      </header>
    </>
  );

}

export const PrivateHeader = () => {
  const { logOut, userData } = useUserAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logOut();
      console.log("Signed out successfully!");
      navigate("/");
      // window.location.reload();
    } catch (error) {
      console.log(error.message);
    }
  };


  return (
    <>
      <header id="header" className="sticky-top header-scrolled">
        <Navbar id="navbar">
          <Container fluid>
            <Navbar.Brand href="/" className="logo me-auto">
              <img
                src={kitty}
                width="30"
                height="30"
                className="img-fluid"
                alt="BBIN logo"
              />
              {"   "}
              BBIN
            </Navbar.Brand>      
                 <Nav.Link href="/tablecsvupload" className="scrollto">
                NSF Funding List
              </Nav.Link>
                <NavDropdown
              title="My Accout"
              menuVariant="dark"
            >
              <NavDropdown.Item href="/">{userData.firstName}</NavDropdown.Item>
              <NavDropdown.Item href="/settings">Settings</NavDropdown.Item>
              <NavDropdown.Item onClick={handleLogout}>
                Log out
              </NavDropdown.Item>
              </NavDropdown>
              
          </Container>
        </Navbar>
      </header>
    </>
  );
};

