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

export const Header = () => {
  const { logOut, user } = useUserAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logOut();
      console.log("Signed out successfully!");
      navigate("/");
    } catch (error) {
      console.log(error.message);
    }
  };


  return (
    <>
      <header id="header" className="fixed-top header-scrolled">
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
            <Nav.Link href="#about" className="scrollto">
              About
            </Nav.Link>
            <Nav.Link href="#service" className="scrollto">
              Services
            </Nav.Link>
            <Nav.Link href="#team" className="scrollto">
              Team
            </Nav.Link>
            {
              user ? (
                <>
                <Nav.Link href="/" className="scrollto">
                My Accout
            </Nav.Link>
            <Nav.Link className="getstarted scrollto" onClick={handleLogout}>
                Log out
              </Nav.Link>
                </>
                
              ) : (
                <Nav.Link className="getstarted scrollto" href="/login">
                Log in / Sign up
              </Nav.Link>
              )
              
            }
              
          </Container>
        </Navbar>
      </header>
    </>
  );
};
