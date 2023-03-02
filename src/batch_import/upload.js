var admin = require("firebase-admin");
var serviceAccount = require("./includes-5bac5-firebase-adminsdk-zqqyr-c8a0d0848d.json");
const data = require("./data.json");
const collectionKey = "Projects"; //name of the collection

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const firestore = admin.firestore();
const settings = { timestampsInSnapshots: true };

firestore.settings(settings);

if (data && typeof data === "object") {
  Object.keys(data).forEach((docKey) => {
    firestore
      .collection(collectionKey)
      .doc('mock'+docKey)
      .set(data[docKey])
      .then((res) => {
        console.log("Document " + docKey + " written!");
      })
      .catch((error) => {
        console.error("Error: ", error);
      });
  });
}
