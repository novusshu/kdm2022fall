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

export default function Dashboard() {

  return (
    <>
      {/* <Modal show={show} onHide={handleClose}>
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
      </Modal> */}
        <main>
          <h3 className="mt-3 text-center">Welcome!</h3>
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
    </>
  );
}
