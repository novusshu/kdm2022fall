import { db } from "../Firebase/firebasedb";
import { doc, getDoc, setDoc, orderBy, serverTimestamp, collection, query, where, onSnapshot } from "firebase/firestore";
export const institutionsList = [
    "Alabama State University (ASU)",
    "Auburn University (AU)",
    "Auburn University-Montgomery (AUM)",
    "Columbus State University (CSU)",
    "Coconino Community College (CCC)",
    "Gallaudet University (GU)",
    "Kapiolani Community College (KCC)",
    "Landmark College (LC)",
    "Little Priest Tribal College (LPTC)",
    "Middle Tennessee State University (MTSU)",
    "Northern Arizona University (NAU)",
    "Northern Arizona University-Yuma (YUMA)",
    "Northern Marianas College (NMC)",
    "Purdue University (PURDUE)",
    "San Diego State University (SDSU)",
    "Southern Union State Community College (SUSCC)",
    "The Ohio State University (OSU)",
    "The University of Tennessee-Knoxville (UTK)",
    "Troy University (TROY)",
    "Tuskegee University (TUSKEGEE)",
    "University of Alaska-Anchorage (ALASKA)",
    "University of Hawaii-Manoa (UHM)",
    "University of Missouri-Kansas City (UMKC)",
    "University of Nevada-Reno (UNR)",
    "University of Washington (UW)",
    "University of Wisconsin-Milwaukee (UWM)",
    "Wichita State University (WSU)"
]

export const writeInstitutions = (institutionsList, callback = null) => {
    const writeData = { "institution_list": institutionsList };
    setDoc(doc(db, "information_sources", 'institutions'), writeData)
        .then(() => {
            // setFormID(data.formID);
            // alert(`Institutions updated on Firebase successfully!`)
            if (callback) {
                callback('Your changes have been saved successfully!');
            }
            // setFileProcessedSuccessfully(Date.now());
        }).catch(err => {
            console.log(err)
            alert(err)
            callback(err);

            // setFileProcessedSuccessfully(Date.now());

        });
}
export const readInstitutions = async () => {
    // let allPromises = []
    const docRef = doc(db, "information_sources", 'institutions');
    onSnapshot(docRef, async (docSnap) => {
        const data = docSnap.data();
        console.log('data', data)
        return data['institution_list'];
    })
    // allPromises.push(getDoc(docRef))
    // await Promise.all(allPromises).then((allDocSnaps) => {
    //     allDocSnaps.forEach(docSnap => {
    //         const data = docSnap.data();
    //         // console.log(data)
    //         return data['institution_list'];
    //         // console.log(docSnap.data())
    //     })
    // })



}

