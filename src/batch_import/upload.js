// https://javascript.plainenglish.io/automate-importing-data-to-firestore-836b0a2cdcfd
var admin = require("firebase-admin");
var serviceAccount = require("./keys/kdm2022fall-firebase-adminsdk-v6296-78382cc16a.json");

const collectionKey = "Projects"; //name of the collection
const fs = require('fs');
const csv = require('csv-parser');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const firestore = admin.firestore();
const settings = { timestampsInSnapshots: true };

firestore.settings(settings);


const path = require('path');

const nsfPath = path.join(__dirname, 'nsf_funding.csv');
fs.createReadStream(nsfPath)
  .pipe(csv())
  .on('data', (data) => {
    // Add data to Firestore
    data = {
      BIIN_PROJECT_ID: data['NSF/PD Num'] + '_' + data['Program ID'],
      ...data
    }
    firestore.collection(collectionKey).doc().set(data);
  })
  .on('end', () => {
    console.log('Data imported successfully');
  });