import { CButton, CInputGroup } from '@coreui/react'
import React, { useState } from 'react'
import { CForm, CFormInput } from '@coreui/react'
import { useUserAuth } from '../../../context/UserAuthContext'
import { db } from '../../../firebasedb'
import { doc, getDoc, getDocs, query, updateDoc } from 'firebase/firestore'
import { collection } from 'firebase/firestore'

const Profile = () => {

    const { user, userData } = useUserAuth();

    // initialize state variables
    const [email, setEmail] = useState(userData.email || '');
    const [firstName, setFirstName] = useState(userData.firstName || '');
    const [lastName, setLastName] = useState(userData.lastName || '');
    const [password, setPassword] = useState('');
    const [userID, setUserID] = useState(user.uid || '');

    const handleSave = async (e) => {
        e.preventDefault();

        // write to db
        const docRef = doc(db, "Users", user.uid);
        await updateDoc(docRef, { email, firstName, lastName, password, userID });
    };

    return (
        <>
            <CForm>
                <CFormInput
                    type="email"
                    id="exampleFormControlInput1"
                    label="Email address"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <CFormInput
                    label="First Name"
                    type="text"
                    id="exampleFormControlInput2"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                />
                <CFormInput
                    label="Last Name"
                    type="text"
                    id="exampleFormControlInput3"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                />
                <CFormInput
                    label="Password"
                    type="password"
                    id="exampleFormControlInput4"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <CFormInput
                    label="User ID"
                    type="text"
                    id="exampleFormControlInput5"
                    value={userID}
                    onChange={(e) => setUserID(e.target.value)}
                />

                <div style={{display: "flex", justifyContent: "space-between", marginTop: "20px"}}>
                  <CButton color="primary" className="px-4" type="submit" onClick={handleSave}>
                      Save
                  </CButton>
                  <CButton color="warning" className="px-4" type="submit">
                      Cancel
                  </CButton>
                </div>
            </CForm>
        </>
    );
};

export default Profile;
