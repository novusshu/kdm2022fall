import { getDoc, doc, getDocs, query, collection, where } from "firebase/firestore";
import { db } from "../../firebasedb";

export async function fetchData( uid, setStateValue, dbName = "Favorites" ) {
    const docSnap = await getDoc(doc(db, dbName, uid))
    if (docSnap.exists()) {
        // console.log("Document data:", docSnap.data());
        setStateValue(docSnap.data())
    } else {
        console.log("No such document!");
    }
}

export const retrieveProjects = async (myProjects, setResults) => {
    const q = query(collection(db, "Projects"),
        where("BIIN_PROJECT_ID", "in", myProjects.favoriteList))
    const querySnapshot = await getDocs(q);
    // let count = 0
    querySnapshot.forEach(docSnapShot => {
        const raw = docSnapShot.data();
        // console.log('raw: ', raw)
        setResults(prev => [...prev, raw])
    })
}