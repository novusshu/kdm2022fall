import { useEffect, useState } from "react";
import { db } from "../firebasedb";
import { collection,onSnapshot   } from "firebase/firestore";

export const useCollection = (collectionName) => {
  const [documents, setDocuments] = useState(null);
  const [error, setError] = useState(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    setIsPending(true);
    const myCollection = collection(db, collectionName);
    const unsubscribe = onSnapshot(myCollection, (snapshot) => {
      if (snapshot.empty) {
        setError("******* could not fetch the data");
        setIsPending(false);
      } else {
        let results = [];
        snapshot.docs.forEach((doc) => {
          results.push({ ...doc.data(), id: doc.id });
        });
        console.log("Collection Result:",results);
        setDocuments(results);
        setIsPending(false);
      }
    }, (error) => {
      setError(error.message);
      setIsPending(false);
    });

    // unsubscribe on unmount
    return () => unsubscribe();
  }, [collectionName]);

  return { documents, error, isPending };
};
