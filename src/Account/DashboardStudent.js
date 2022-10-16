import React, { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { Modal, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { NavBar } from "./NavBar";
// import { Alert } from "react-bootstrap";
import { db } from "../Firebase/firebasedb";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import AvailableForms from "./AvailableForms";
import { allRoles, allRolesCompat } from "../Fixed Sources/accountTypes";

export default function DashboardStudent({ role }) {
  const auth = getAuth();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        // const uid = user.uid;
        // ...
        setUser(user);
      } else {
      }
    });
    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (user) {
      const docRef = doc(db, "Users", user.uid);
      onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          console.log("Document data:", docSnap.data());
          const data = docSnap.data();
          setUserData(data);
        } else {
          // doc.data() will be undefined in this case
          console.log("No such document!");
        }
      });
    }
  }, [user]);
  return (
    <>

      <main>
        {/* <h2>Surmounting Obstacles for Academic Resilience </h2> */}
        <h3 className="mt-3 text-center">
          {user && userData && `Welcome to SOAR,  ${allRolesCompat[role]}!`}
        </h3>
        <p></p>
        {user && userData && <AvailableForms userID={user.uid} accountType={userData.atype} userData={userData} />}
      </main>
    </>
  );
}