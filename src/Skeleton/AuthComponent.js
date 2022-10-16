import React, { useState, useEffect } from "react";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../Firebase/firebasedb";

export const AuthComponent = ({ user, setUser, auth, navigate }) => {
  const [redirectDestination, setRedirectDestination] = useState(null);

  useEffect(() => {
    if (shouldRedirect) {
      navigate(redirectDestination);
    }
  }, [shouldRedirect, redirectDestination, navigate]);
  // State listener
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/firebase.User
      // const uid = user.uid;
      // ...
      setUser(user);
    } else {
    }
  });

  //Firestore Read
  useEffect(() => {
    if (user) {
      const docRef = doc(db, "Users", user.uid);
      getDoc(docRef).then((docSnap) => {
        if (docSnap.exists()) {
          console.log("Document data:", docSnap.data());
          const data = docSnap.data();
          setRedirectDestination("/");
        } else {
          // doc.data() will be undefined in this case
          signOut(auth)
            .then(() => {
              // Sign-out successful.
              console.log("Signed out successfully!");
            })
            .catch((error) => {
              console.log(error);
            });
        }
      });
    }
  }, [user, auth]);
};
