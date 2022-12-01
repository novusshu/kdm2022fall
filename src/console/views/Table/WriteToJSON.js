import { db } from "../../../firebasedb";
import {
    doc,
    setDoc,
    getDoc,
    deleteDoc,
    orderBy,
    serverTimestamp,
    collection,
    query,
    where,
    onSnapshot,
  } from "firebase/firestore";
  import { Modal, Button } from "react-bootstrap";
export const WriteToJSON = () => {

    const generateJson = () => {
        const ref = collection(db, "automatic_table_submissions");
        const q = query(ref);
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const out = [];
          querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            const rawData = doc.data();
            out.push({...rawData});
          });
          console.log(out);
        });
    }
    

    return (
        <Button onClick={() => generateJson()}> Download JSON </Button>
    )
}
    