import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDnRm8KxNJDrBimUIBnIhpiPFTLA-L-G7Q",
  authDomain: "kdm2022fall.firebaseapp.com",
  projectId: "kdm2022fall",
  storageBucket: "kdm2022fall.appspot.com",
  messagingSenderId: "478197070215",
  appId: "1:478197070215:web:3affe09c1032439ce07b22",
};

export const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
