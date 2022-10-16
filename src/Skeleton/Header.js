import React, { useState, useEffect, useRef } from "react";
import {
  Navbar,
  Nav,
  NavDropdown,
  Container,
  Button,
  Modal,
} from "react-bootstrap";

import { AiOutlineLogout, AiOutlineProfile } from "react-icons/ai";
import { FcAssistant } from "react-icons/fc";
import { FaUser, FaUserAlt, FaUserGraduate, FaUserTie } from "react-icons/fa";
import { GrUserManager, GrUserExpert } from "react-icons/gr";
import { AuthComponent } from "./AuthComponent";

import { db } from "../Firebase/firebasedb";
import "../Markting/assets/css/style.css";
import kitty from "../Fixed Sources/kitty.jpg";

export const Header = ({user}) => {
  

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
            {user ? (
              <Nav.Link className="getstarted scrollto" href="/dashboard">
                My Account
              </Nav.Link>
            ) : (
              <Nav.Link className="getstarted scrollto" href="/login">
                Sign in
              </Nav.Link>
            )}
          </Container>
        </Navbar>
      </header>
    </>
  );
};
