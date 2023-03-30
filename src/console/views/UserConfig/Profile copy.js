import { CButton, CInputGroup } from '@coreui/react'
import React from 'react'
import { CForm, CFormInput } from '@coreui/react'
import { useUserAuth } from '../../../context/UserAuthContext'
import { db } from '../../../firebasedb'
import { doc, getDoc, getDocs, query, updateDoc } from 'firebase/firestore'
import { collection } from 'firebase/firestore'

const Profile = () => {


    const { user, userData } = useUserAuth();


    const handleSave = async e => {
        e.preventDefault()
        console.log(e.target.value)
        // write to db
        const docRef = doc(db, "Users", user.uid);
        await updateDoc(docRef, { firstName: e.target.value });

    }



    return (

        <>
            <CForm  >
                <CFormInput
                    type="email"
                    id="exampleFormControlInput1"
                    label="Email address"
                    placeholder="name@example.com"
                    text="Must be 8-20 characters long."
                    aria-describedby="exampleFormControlInputHelpInline"
                />
                <CFormInput
                label="Name"
                type="text"
                id="exampleFormControlInput1"
                // value={userData.firstName}
                />


                <CButton color="primary" className="px-4" type='submit' onClick={handleSave}>Save</CButton>
                <CButton color="warning" className="px-4" type='submit'>Cancel</CButton>

            </CForm>

            {/*  */}
        </>
    )
}

export default Profile