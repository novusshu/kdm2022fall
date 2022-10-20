
import React, { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import * as Yup from "yup";
import Form from 'react-bootstrap/Form';
import { yupResolver } from "@hookform/resolvers/yup";
import { Checkbox, Input, RadioGroup, Select } from "../Components";
import { db } from "../Firebase/firebasedb";
import { doc, setDoc, orderBy, serverTimestamp, collection, query, where, onSnapshot } from "firebase/firestore";
import { Button } from "react-bootstrap";
import Dropdown from 'react-bootstrap/Dropdown';
import ReactTooltip from 'react-tooltip';
import { AiOutlineRead, AiFillQuestionCircle, AiFillCloseCircle, AiFillFastForward, AiFillFastBackward } from "react-icons/ai";
import theme from '../Theme/theme'
import "./automatic_form.css"
import { institutionsList } from "../Fixed Sources/institutions";
import { CustomMenu, encryptableQuestionTypes, makeid, processID, removeSpecialCharacters } from "./Utils";
import DragNDropList from "./DragNDropList";
import { allQuestionTypes, RoleValidationComponent } from './Utils'
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { Link } from "react-router-dom";
import { allRoles, formPrefixes, formPrefixes2, isCampusLead, isHubLead } from "../Fixed Sources/accountTypes";
import { format } from "date-fns";
// const CustomMenu = React.forwardRef(
//     ({ children, style, className, 'aria-labelledby': labeledBy }, ref) => {
//         const [value, setValue] = useState('');

//         return (
//             <div
//                 ref={ref}
//                 style={style}
//                 className={className}
//                 aria-labelledby={labeledBy}
//             >
//                 <Form.Control
//                     autoFocus
//                     className="mx-3 my-2 w-auto"
//                     placeholder="Type to filter..."
//                     onChange={(e) => setValue(e.target.value)}
//                     value={value}
//                 />
//                 <ul className="list-unstyled">
//                     {React.Children.toArray(children).filter(
//                         (child) =>
//                             !value || child.props.children.toLowerCase().includes(value) || child.props.children.startsWith(value),
//                     )}
//                 </ul>
//             </div>
//         );
//     },
// );
export default function FormCreate({ formAction, editFormID }) {
    const todayDate = new Date()
    const tomorrowDate = new Date(todayDate);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1)
    const [renderPage, setRenderPage] = useState(true);
    const [isBlinking, setIsBlinking] = useState(false);
    const [lastUpdatedDateString, setLastUpdatedDateString] = useState(null);


    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);


    const [institutionsList, setInstitutionsList] = useState([]);
    // const allInstitutions = institutionsList
    // console.log(allInstitutions)
    useEffect(() => {
        const docRef = doc(db, "information_sources", 'institutions');
        onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setInstitutionsList(data['institution_list'])
            } else {

            }
        });
    }, [])
    let newFormID = makeid(8)
    if (formAction == 'edit') {
        newFormID = editFormID
    }
    const [formURL, setFormURL] = useState(formAction == 'edit' ? `/forms/${editFormID}` : null)
    // console.log(formURL);
    const [formData, setFormData] = useState(null)

    const [currentAllowedRoles, setCurrentAllowedRoles] = useState([])
    const [currentQuestionList, setCurrentQuestionList] = useState([])
    const [currentPrerequisites, setCurrentPrerequisites] = useState([])


    const validationSchema = Yup.object().shape({
        formID: Yup.string().required('Cannot be empty!')
            .test("Required", 'Another form with this ID already exists!', (result) => {
                let valid = true;
                if (formLibrary) {
                    // console.log('formLibrary', formLibrary)
                    formLibrary.forEach(form => {
                        // console.log(formID, form.formID)
                        if (result == form.formID && formAction != 'edit') {
                            // console.log('here')
                            valid = false;
                        }
                    })
                }
                // if (result == 'Duplicate Form')
                //     return false;
                return valid;
            }),
        formTitle: Yup.string().required('Cannot be empty!')
            .test('No Special Character', 'Your form cannot contain special characters!', (result) => {
                if (removeSpecialCharacters(result) != result) {
                    return false;
                }
                return true;
            })
            .test("Required", 'Another form with this name already exists! If the form is yours, please upload a revised version from the table below.', (result) => {
                let valid = true;
                if (formLibrary) {
                    formLibrary.forEach(form => {
                        // console.log(formID, form.formID)
                        if (getValues('formID') != form.formID && form.formTitle.toLowerCase() == result.toLowerCase()) {
                            // console.log('here')
                            valid = false;
                        }
                    })
                }
                // if (result == 'Duplicate Form')
                //     return false;
                return valid;
            }),
        allowedInstitutions: Yup.array().test("Required", "Please choose at least one institution to share the form with!", (result) => {
            // console.log(result);
            if (currentFormDomain == 'Specific') {
                if (!result || result.length <= 0)
                    return false;
            }
            return true;
        }),
        allowedRoles: Yup.array().test("Required", 'At least one account type must be specified!', (result) => {
            // console.log(currentAllowedRoles)
            if (!result || result.length <= 0) {
                return false;
            }
            return true;
        }),
        startDate: Yup.string().test('date required', 'Date Required!', (result) => {
            if (!startDateRequired)
                return true
            if (result != '')
                return true
            return false
        }).test('start date vs end date comparison', 'Start Date cannot be after Deadline!', (result) => {
            const date1 = new Date(startDate);
            const date2 = new Date(endDate);

            // console.log(endDate);
            // console.log('startDateRequired', startDateRequired)
            if (!startDateRequired || !endDateRequired)
                return true
            return date1 < date2;
        }),
        endDate: Yup.string().test('date required', 'Date Required!', (result) => {
            if (!endDateRequired)
                return true
            if (result != '')
                return true
            return false
        }).test('start date vs end date comparison', 'Deadline cannot be before Start Date!', (result) => {
            const date1 = new Date(startDate);
            const date2 = new Date(endDate);

            // console.log(endDate);
            // console.log(startDate)
            if (!startDateRequired || !endDateRequired)
                return true

            return date1 < date2;
        }),
        formPrefix: Yup.string().required('Please select one prefix!'),
        formPrefix2: Yup.string().required('Please select one prefix!')



    });
    const [formLibrary, setFormLibrary] = useState([]);
    const [currentEventKey, setCurrentEventKey] = useState(null)
    const allPrerequisites = {}

    useEffect(() => {
        console.log('currentPrerequisites', currentPrerequisites)
    }, [currentPrerequisites])

    const addNewQuestion = (questionType) => {

        const currentQuestionListCopy = currentQuestionList
        const questionTypeFull = allQuestionTypes[questionType]
        const newQuestion = {
            options: [],
            questionID: `${questionType}_${currentQuestionListCopy.length + 1}`,
            question_text: `untitled_${questionType}_question_${currentQuestionListCopy.length + 1}`,
            question_type: questionType

        }
        setCurrentQuestionList([...currentQuestionList, newQuestion])
        setNumberOfQuestions(numberOfQuestions + 1);


    }
    const addExistingQuestions = (formData) => {
        if (formData) {
            const questionList = []
            formData.form_questions.forEach(q => {

                const questionType = q.question_type
                const questionTypeFull = allQuestionTypes[questionType]
                if (questionTypeFull) {
                    // console.log(questionType, questionTypeFull)
                    const newQuestion = {
                        options: q.options ? q.options : [],
                        questionID: q.questionID,
                        question_text: q.question_text,
                        question_type: q.question_type,

                    }
                    if (questionType == 'multiple_choice' || questionType == 'checkbox')
                        newQuestion.requiredOptions = q.requiredOptions ? q.requiredOptions : []
                    else
                        newQuestion.required = q.required == false ? q.required : true
                    if (encryptableQuestionTypes.includes(questionType)) {
                        newQuestion.encrypted = q.encrypted ? q.encrypted : false
                    }
                    questionList.push(newQuestion)

                }
                else {
                    console.log(`${questionType} not supported!`)
                }

            })

            setCurrentQuestionList(questionList)
            setNumberOfQuestions(questionList.length);




        }
    }
    useEffect(() => {
        // console.log(formData);

        const formLibraryRef = collection(db, "form_library");
        const q = query(formLibraryRef)
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const formUploadHistData = []
            let foundFormToEdit = false;
            querySnapshot.forEach((doc) => {
                // doc.data() is never undefined for query doc snapshots
                const rawData = doc.data();
                const createdDate = rawData.createdAt.toDate().toDateString()
                const createdTime = rawData.createdAt.toDate().toLocaleTimeString('en-US');
                const formFormat = rawData.formFormat ? rawData.formFormat : 'csv'
                const formName = rawData.form_questions[0].question_type == 'form_title' ? rawData.form_questions[0].question_text : 'Untitled Form'
                const status = rawData.status ? rawData.status : 'published'
                const action = status == 'published' ? "Unpublish" : 'Publish'
                // const accessibleTo = rawData.accessibleTo ? rawData.accessibleTo : ['student', 'student-mentor', 'faculty', 'administrator']
                const formDomain = rawData.formDomain ? rawData.formDomain : 'Common'
                const allowedInstitutions = rawData.allowedInstitutions ? rawData.allowedInstitutions : []
                const allowedRoles = rawData.allowedRoles ? rawData.allowedRoles : []
                formUploadHistData.push({
                    formID: rawData.formID,
                    formTitle: formName,
                    createdAt: `${createdDate}, ${createdTime}`,
                    timeStamp: rawData.createdAt,
                    formFormat: formFormat,
                    status: status.toUpperCase(),
                    action: action,
                    reupload: 'reupload',
                    // accessibleTo: accessibleTo.join('||'),
                    deleteAction: 'deleteAction',
                    formDomain,
                    allowedInstitutions,
                    allowedRoles,
                })
                // console.log(rawData.formID, editFormID)

                if (formAction == 'edit') {
                    // console.log(rawData.formID, editFormID)
                    if (rawData.formID == editFormID) {
                        // console.log('found')
                        setFormData(rawData);
                        const lastEdited = rawData.lastEdited ? rawData.lastEdited : rawData.createdAt
                        const createdDate = lastEdited.toDate().toDateString()
                        const createdTime = lastEdited.toDate().toLocaleTimeString('en-US');
                        setLastUpdatedDateString(`${createdDate}, ${createdTime}`)

                        foundFormToEdit = true;

                        addExistingQuestions(rawData)
                    }

                }

            });
            // formUploadHistData.sort(function(x, y){
            //     return y.timeStamp - x.timeStamp; //sort y before x
            // })
            setFormLibrary([...formUploadHistData])
            if (formAction == 'edit' && foundFormToEdit == false) {
                setRenderPage(false)
            }
        });

    }, [])


    const formOptions = { resolver: yupResolver(validationSchema) };
    const methods = useForm(formOptions);
    const { handleSubmit, reset, watch, register, setError, setValue, getValues, formState: { errors } } = methods;
    console.log(errors)
    const [numberOfQuestions, setNumberOfQuestions] = useState(0)
    const notQuestionTypes = ['plain_text', 'form_title', 'section_header']
    // console.log(formData)
    const formID = formAction == 'edit' ? newFormID : watch('formID')
    if (formAction == 'edit') {
        setValue('formID', newFormID)
    }
    const startDateRequired = watch('startDateRequired');
    const endDateRequired = watch('endDateRequired');
    const startDate = watch('startDate');

    const endDate = watch('endDate');


    formLibrary.map(form => {
        if (form.formID != formID)
            allPrerequisites[form.formID] = form.formTitle
        // form.formID: form.formTitle
    })
    // console.log(formID)

    useEffect(() => {
        let formTitle = 'Untitled Form';
        let formDomain = 'Common';
        let allowedInstitutions = [];
        let excludedInstitutions = [];
        let allowedRoles = []
        let prerequisites = []
        let nextForm = []
        let startDateRequiredServer = false
        let endDateRequiredServer = false;
        let startDateServer = ''
        let endDateServer = ''
        let formPrefix = 'N/A'
        let formPrefix2 = 'N/A'

        let displayNameServer = ''
        if (formData) {
            if (formData.formTitle) {
                formTitle = formData.formTitle
            }
            else if (formData.form_questions[0].question_type == 'form_title')
                formTitle = formData.form_questions[0].question_text

            allowedInstitutions = formData.allowedInstitutions ? formData.allowedInstitutions : []
            excludedInstitutions = formData.excludedInstitutions ? formData.excludedInstitutions : []
            formDomain = formData.formDomain ? formData.formDomain : 'Common'
            allowedRoles = formData.allowedRoles ? formData.allowedRoles : []
            prerequisites = formData.currentPrerequisites ? formData.currentPrerequisites : []
            nextForm = formData.currentNextForm ? formData.currentNextForm : []
            startDateRequiredServer = formData.startDateRequired ? formData.startDateRequired : false
            endDateRequiredServer = formData.endDateRequired ? formData.endDateRequired : false
            startDateServer = formData.startDate ? formData.startDate : ''
            endDateServer = formData.endDate ? formData.endDate : ''
            formPrefix = formData.formPrefix ? formData.formPrefix : 'N/A'
            formPrefix2 = formData.formPrefix2 ? formData.formPrefix2 : 'N/A'


            // console.log(allowedRoles)


            setValue('formTitle', formTitle)
            setValue('formDomain', formDomain)
            setValue('allowedInstitutions', allowedInstitutions)
            setValue('excludedInstitutions', excludedInstitutions)
            setValue('allowedRoles', [...allowedRoles])
            setValue('currentPrerequisites', [...prerequisites])
            setValue('currentNextForm', [...nextForm])
            setValue('startDateRequired', startDateRequiredServer)
            setValue('startDate', startDateServer)
            setValue('endDateRequired', endDateRequiredServer)
            setValue('endDate', endDateServer)
            setValue('formPrefix', formPrefix)
            setValue('formPrefix2', formPrefix2)





            // setValue('currentPrerequisitesFull', [...currentPrerequisitesFull])


            setCurrentFormDomain(formDomain);
            setCurrentPrerequisites([...prerequisites]);
            setCurrentAllowedInstitutions([...allowedInstitutions]);
            setCurrentExcludedInstitutions([...excludedInstitutions]);
            setCurrentAllowedRoles([...allowedRoles])
            setCurrentNextForm([...nextForm])

            console.log('formData', formData)


            let count = 0
            formData.form_questions.forEach(question => {
                if (!notQuestionTypes.includes(question.question_type)) {
                    count += 1
                }
            })
            // setNumberOfQuestions(count);
        }
    }, [formData, formLibrary])
    const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
        <Button variant={errors['allowedInstitutions'] && currentAllowedInstitutions.length <= 0 ? 'outline-danger' : 'outline-info'}
            href=""
            ref={ref}
            onClick={(e) => {
                e.preventDefault();
                onClick(e);
            }}>{children}
            &#x25bc;</Button>
    ));
    function writeToFirebase(data, merge = false) {
        console.log(data)
        setDoc(doc(db, "form_library", data.formID), data, { merge: merge })
            .then(() => {
                // setFormID(data.formID);
                if (merge == false || formAction != 'edit') {
                    console.log(`Form ${data.formID} written to Firebase successfully`)
                    alert(`Form ${data.formID} written to Firebase successfully`)


                }
                else {
                    console.log(`Form ${data.formID} revised successfully`)
                    alert(`Form ${data.formID} revised successfully`)

                }

                setFormURL(`/forms/${data.formID}`)

                // setFileProcessedSuccessfully(Date.now());
            }).catch(err => {
                console.log(err)
                alert(err)
                // setFileProcessedSuccessfully(Date.now());

            });

    }


    const handleUpload = (data, e) => {
        e.preventDefault();
        console.log('submitted data', data)
        let customValidationPassed = true;

        currentQuestionList.forEach(question => {
            const questionID = question.questionID
            const questionType = question.question_type
            if (questionType == 'short_answer' || questionType == 'long_answer'
                || questionType == 'date' || questionType == 'section_header'
                || questionType == 'email' || questionType == 'phone_number'
                || questionType == 'plain_text' || questionType == 'sign_date' || questionType == 'file_upload') {
                if (data[questionID] == '') {
                    console.log('failed 1')
                    setError(questionID, { type: 'custom', message: 'Cannot be empty!' })
                    customValidationPassed = false;
                }
            }
            else if (questionType == 'multiple_choice' || questionType == 'checkbox') {
                if (data[`${questionID}-question`] == '') {
                    console.log(`${questionID}-question`)
                    console.log('failed 2')

                    // setError(`${questionID}-question`, { type: 'custom', message: 'Cannot be empty!' })
                    setError(`${questionID}-question`, { type: "focus" }, { shouldFocus: true });
                    customValidationPassed = false;
                }
                if (currentQuestionList.length > 0) {
                    currentQuestionList.forEach(item => {
                        // console.log(item);
                        if (item.questionID == questionID) {
                            const optionIDs = item.options
                            const optionVals = []
                            optionIDs.forEach(optionID => {
                                console.log('optionID', `${questionID}-${processID(optionID)}`)
                                console.log('optionID Data', data[`${questionID}-${processID(optionID)}`])
                                const val = data[`${questionID}-${processID(optionID)}`]
                                // optionVals.push(data[val])
                                if (val == '' || !val) {
                                    console.log("INVALID!")
                                    console.log(data)
                                    setError(`${questionID}-${optionID}`, { type: 'custom', message: 'Cannot be empty!' })
                                    customValidationPassed = false;
                                }
                            })
                        }
                    })
                }

            }

        })
        if (customValidationPassed) {
            console.log('PASS!');
            let structuredItems = [{
                questionID: processID(formLongName),
                // question_text: data.formTitle,
                question_text: formLongName,
                question_type: 'form_title'
            }]
            const allQuestionIDs = []
            currentQuestionList.forEach(item => {
                const questionType = item.question_type;
                const questionID = item.questionID;
                if (questionType == 'short_answer' || questionType == 'long_answer'
                    || questionType == 'date' || questionType == 'section_header'
                    || questionType == 'email' || questionType == 'phone_number'
                    || questionType == 'plain_text' || questionType == 'sign_date' || questionType == 'file_upload') {
                    const val = data[item.questionID];
                    // console.log(val == '')

                    if (val) {
                        // console.log(val)
                        let structuredQuestionID = processID(val)
                        let count = 2
                        while (allQuestionIDs.includes(structuredQuestionID)) {
                            structuredQuestionID += `-${count}`
                            count += 1
                        }
                        allQuestionIDs.push(structuredQuestionID)
                        let structuredItem = {
                            question_type: questionType,
                            questionID: structuredQuestionID,
                            question_text: val,
                            required: data[`${questionID}-required`] ? true : false,
                            encrypted: data[`${questionID}-encrypted`] ? true : false
                        }
                        structuredItems.push(structuredItem)
                    }
                }
                else if (questionType == 'multiple_choice' || questionType == 'checkbox') {
                    const val = getValues(item.questionID + '-question');

                    if (val) {
                        let structuredQuestionID = processID(val)
                        let count = 2
                        while (allQuestionIDs.includes(structuredQuestionID)) {
                            structuredQuestionID += `-${count}`
                            count += 1
                        }
                        allQuestionIDs.push(structuredQuestionID)


                        console.log(item.options)
                        console.log(getValues())
                        const options = []
                        const requiredOptions = []
                        item.options.forEach((option, index) => {
                            options.push(data[`${item.questionID}-${processID(option)}`])
                            if (questionType == 'checkbox') {
                                const requiredValue = data[`${item.questionID}-${processID(option)}-required`]
                                if (requiredValue)
                                    requiredOptions.push(data[`${item.questionID}-${processID(option)}`])

                            }
                        })

                        let structuredItem = {
                            question_type: questionType,
                            questionID: structuredQuestionID,
                            question_text: val,
                            options
                        }
                        if (questionType == 'checkbox') {
                            structuredItem['requiredOptions'] = requiredOptions;
                        }

                        structuredItems.push(structuredItem)
                    }
                }
                else if (questionType == 'dropdown') {
                    const prompt = data[`${questionID}-question`];

                    if (!prompt || prompt == '') {
                        setError(`${questionID}-question`, { type: 'custom', message: 'Cannot be empty!' })

                    }
                    let structuredQuestionID = processID(prompt)
                    let count = 2
                    while (allQuestionIDs.includes(structuredQuestionID)) {
                        structuredQuestionID += `-${count}`
                        count += 1
                    }
                    allQuestionIDs.push(structuredQuestionID)

                    const optionsText = data[`${questionID}-options`];
                    let options = []
                    if (optionsText && optionsText.replaceAll(' ') != '') {
                        options = optionsText.split('\n');
                    }
                    else {
                        setError(`${questionID}-options`, { type: 'custom', message: 'Cannot be empty!' })
                    }
                    let structuredItem = {
                        question_type: questionType,
                        questionID: structuredQuestionID,
                        question_text: prompt,
                        options
                    }
                    structuredItems.push(structuredItem)
                }

            })
            const currentPrerequisitesFull = []
            currentPrerequisites.forEach(pre => {
                currentPrerequisitesFull.push(allPrerequisites[pre])
            })
            const currentNextFormFull = []

            currentNextForm.forEach(nForm => {
                currentNextFormFull.push(allPrerequisites[nForm])
            })

            let status = 'unpublished'
            if (userData) {
                if (isHubLead(userData.atype)) {
                    status = 'unpublished'
                    if (formAction == 'edit') {
                        status = formData ? formData.status : 'unpublished'
                    }
                }
                if (isCampusLead(userData.atype)) {
                    status = 'awaiting-approval'
                }
            }

            let finalFormStructure = {
                currentPrerequisites,
                currentPrerequisitesFull,
                currentNextForm: data.currentNextForm ? data.currentNextForm : [],
                currentNextFormFull,
                allowedInstitutions: data.allowedInstitutions ? data.allowedInstitutions : [],
                excludedInstitutions: data.excludedInstitutions ? data.excludedInstitutions : [],

                allowedRoles: data.allowedRoles,
                lastEdited: serverTimestamp(),
                createdAt: serverTimestamp(),
                formDomain: data.formDomain,
                formFormat: 'Web',
                formID: data.formID,
                formPrefix: data.formPrefix,
                formPrefix2: data.formPrefix2,
                form_questions: structuredItems,
                formTitle: data.formTitle,
                formLongName: formLongName,
                userID: user ? user.uid : 'anonymous',
                status: status,
                startDateRequired: data['startDateRequired'],
                endDateRequired: data['endDateRequired'],
                startDate: data.startDateRequired ? data.startDate : '',
                endDate: data.endDateRequired ? data.endDate : '',

            }
            console.log('finalFormStructure', finalFormStructure);
            writeToFirebase(finalFormStructure, true)
            // console.log('allQuestionIDs', allQuestionIDs)

        }
        else {
            console.log('FAILED!')
        }

    }
    register('formDomain', { required: true })
    register('allowedInstitutions', { required: true })
    register('allowedRoles', { required: true })
    register('currentPrerequisites', { required: true })
    register('currentNextForm', { required: true })
    const formTitle = removeSpecialCharacters(watch('formTitle'))
    const formPrefix = watch('formPrefix')
    const formPrefix2 = watch('formPrefix2')
    const allowedInstitutions = watch('allowedInstitutions')
    const formDomain = watch('formDomain')
    const [formLongName, setFormLongName] = useState('')
    useEffect(() => {
        console.log('formLibrary', formLibrary)
        if (formLibrary && formLibrary.length > 0) {
            let displayName = ''
            if (formPrefix != 'N/A' && formPrefix != '') {
                let count = 1
                let valid = false
                let formIncrement = `${formPrefix}${count}`
                if (formLibrary && formLibrary.length > 0) {
                    // console.log('formLibrary', formLibrary)
                    const allFormTitles = formLibrary.map(form => {
                        // console.log(form)

                        if (form.displayName) {

                            return form.displayName

                        }
                        else if (form.formTitle) {

                            return form.formTitle


                        }
                        else if (form.form_questions && form.form_questions[0].question_type == 'form_title') {
                            const formName = form.form_questions[0].question_text
                            return formName

                        }
                    })
                    const allFormIDs = formLibrary.map(form => {
                        return form.formID;
                    })
                    console.log('allFormTitles', allFormTitles)
                    console.log(formIncrement)

                    while (true) {
                        let included = false;
                        for (let form of formLibrary) {
                            let title = '';
                            let formID = form.formID;
                            if (form.displayName) {

                                title = form.displayName

                            }
                            else if (form.formTitle) {

                                title = form.formTitle


                            }
                            else if (form.form_questions && form.form_questions[0].question_type == 'form_title') {
                                const formName = form.form_questions[0].question_text
                                title = formName

                            }
                            if (title.includes(formIncrement)) {
                                included = true
                                if (formID == editFormID) { //No need to increment of the form is in edit mode and same prefix.
                                    console.log(form, count)
                                    included = false;
                                }
                                break;
                            }

                        }

                        if (!included) {
                            break;
                        }

                        count += 1
                        formIncrement = `${formPrefix}${count}`
                    }

                    displayName += `${formIncrement}_`
                }

            }
            //FIX HERE!
            if (formDomain == 'Specific' && allowedInstitutions && allowedInstitutions.length > 0) {
                console.log('allowedInstitutions', allowedInstitutions)
                let allAcronyms = allowedInstitutions.map(institution => {
                    const acronym = institution.match(/\([^\)]+\)/g)[0].replace(/\(|\)/g, "")
                    console.log(acronym)//.replace(/\(|\)/g, "")
                    return acronym
                })
                console.log('allAcronyms', allAcronyms)
                if (allAcronyms.length > 0)
                    displayName += `${allAcronyms.join('_')}_`

            }
            if (formPrefix2 != 'N/A' && formPrefix2 != '') {
                displayName += `${formPrefix2}`
            }
            if (formTitle)
                displayName += ` ${formTitle}`
            setFormLongName(displayName)
        }
    }, [formLibrary, formTitle, formPrefix, formPrefix2, formDomain, allowedInstitutions])

    const [currentAllowedInstitutions, setCurrentAllowedInstitutions] = useState([])
    const [currentExcludedInstitutions, setCurrentExcludedInstitutions] = useState([])

    const [currentFormDomain, setCurrentFormDomain] = useState('Common')
    const [currentNextForm, setCurrentNextForm] = useState([])

    useEffect(() => {
        setValue('formDomain', currentFormDomain);
    }, [currentFormDomain])
    useEffect(() => {
        // setValue('formDomain', currentFormDomain);
        console.log('currentAllowedRoles', currentAllowedRoles)
    }, [currentAllowedRoles])
    const buttonOutlineStyle = { borderColor: theme.highlightColor, color: theme.highlightColor }
    const buttonFillStyle = { borderColor: theme.highlightColor, backgroundColor: theme.highlightColor, color: 'white' }
    const [tempItems, setTempItems] = useState([]);
    useEffect(() => {
        console.log('tempItems: ', tempItems)
    }, [tempItems])
    useEffect(() => {
        console.log('currentQuestionList: ', currentQuestionList)
    }, [currentQuestionList])
    useEffect(() => {
        if (userData)
            console.log('userData: ', userData)
    }, [userData])


    const [structuredFormQuestions, setStructuredFormQuestions] = useState([]);



    return <div>
        {/* <p>Form Title: {formTitle}</p> */}
        <ReactTooltip backgroundColor={theme.highlightColor} />
        <RoleValidationComponent
            // requiredRoles={['student']}
            requiredRoles={['hub-lead', 'campus-lead']}
            redirect={false}
            setUserExternal={setUser}
            setUserDataExternal={setUserData} />

        {renderPage ? <div className="card m-3 border-light">

            <div className="row card-body">
                {formAction == 'edit' && <div>
                    <h6 className="float-end">
                        Last Edited: <i className={isBlinking ? 'blinking' : ''} style={isBlinking ? { backgroundColor: "limegreen" } : { fontWeight: 'bold' }}>
                            {lastUpdatedDateString ? lastUpdatedDateString : 'Never'}
                        </i>
                    </h6>
                </div>}
                {formURL && <div >
                    <Button className='float-end mx-2' variant='success'
                        href={`${formURL}`}> <AiOutlineRead style={{ marginBottom: 1, fontSize: 16 }} /> Form Preview
                    </Button>


                </div>}


                <h2>Form Overview {formID && <span>(ID: <i>{formID}</i>)</span>} </h2>

                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(handleUpload)}>
                        {/* <form onSubmit={handleRegistration}> */}

                        <div className="row">
                            <Input
                                name="formID"
                                label="Form ID"
                                className="mb-3 col-md-2"
                                placeholder={newFormID}
                                defaultValue={newFormID}
                                instructions={formAction == 'edit' ? 'Form ID cannot be altered when revising a form.' : 'Tips: a short and easy URL to access'}
                                disabled={formAction == 'edit'}
                                required={true}
                            />
                            <Select
                                name={'formPrefix'}
                                label={'Prefix'}
                                className="mb-3 col-md-1"
                                options={formPrefixes}
                                // required={true}

                                defaultValue={formPrefixes[0]}
                                instructions={'Specify form access type. Form numbering will be incremented automatically.'}
                            />
                            <Select
                                name={'formPrefix2'}
                                label={'Prefix 2'}
                                className="mb-3 col-md-3"
                                options={formPrefixes2}
                                // required={true}

                                defaultValue={formPrefixes2[0]}
                            // instructions={instructions}
                            />

                            <Input
                                name="formTitle"
                                label="Form Name"
                                className="mb-3 col-md-6"
                                required={true}
                                instructions={'Please do not enter special symbols.'}
                            />

                            {/* <Input
                                name="lastName"
                                label="Last Name"
                                className="mb-3 col-xl-6"
                            /> */}
                            <p>Display Name: <b>{formLongName}</b></p>
                            <p>Number of Questions: {numberOfQuestions}</p>
                            <Dropdown className=''
                                onSelect={(eventKey, event) => {
                                    if (!currentAllowedRoles.includes(eventKey)) {
                                        setValue('allowedRoles', [...currentAllowedRoles, eventKey]);
                                        setCurrentAllowedRoles([...currentAllowedRoles, eventKey])
                                    }
                                }}>
                                <Dropdown.Toggle variant={errors['allowedRoles'] && currentAllowedRoles.length <= 0 ? 'outline-danger' : ''}
                                    className={errors['allowedRoles'] && currentAllowedRoles.length <= 0 ? '' : 'button-outline-theme'}
                                    id="dropdown-basic">
                                    Specify Users
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                    {Object.keys(allRoles).map(role => {
                                        return <Dropdown.Item eventKey={role}>{allRoles[role]}</Dropdown.Item>
                                    })}
                                </Dropdown.Menu>
                                <AiFillQuestionCircle style={{
                                    marginLeft: '2px', marginBottom: '3px',
                                    color: theme.highlightColor, fontSize: '17px'
                                }} data-tip={'Specify which account type can access this form.'} />

                            </Dropdown>
                            <div className="my-2 col-md-10">
                                {Object.keys(allRoles).map(role => {

                                    if (currentAllowedRoles.includes(role)) {
                                        return <Button className="mx-2" variant='secondary'>{allRoles[role]}<AiFillCloseCircle style={{
                                            marginLeft: '5px', marginBottom: '3px',
                                            color: 'white', fontSize: '17px'
                                        }} onClick={() => {
                                            let allowedRoles = currentAllowedRoles
                                            var index = allowedRoles.indexOf(role);
                                            if (index !== -1) {

                                                allowedRoles.splice(index, 1);
                                                console.log(allowedRoles)
                                                setValue('allowedRoles', [...allowedRoles])
                                                setCurrentAllowedRoles([...allowedRoles])
                                            }
                                        }} /> </Button>
                                    }
                                    return <></>

                                })}

                                <div className="is-invalid">

                                </div>
                                <div className="invalid-feedback mb-2">
                                    {errors['allowedRoles'] && currentAllowedRoles.length <= 0 ?
                                        errors['allowedRoles'].message : ''}
                                </div>
                            </div>
                            <Dropdown className='mb-3'
                                onSelect={(eventKey, event) => { setCurrentFormDomain(eventKey) }}>
                                <Dropdown.Toggle className='button-outline-theme' id="dropdown-basic">
                                    Form Domain  {currentFormDomain ? `(${currentFormDomain}) ` : ' '}
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                    <Dropdown.Item eventKey='Common'>Common</Dropdown.Item>
                                    <Dropdown.Item eventKey='Specific' >Specific</Dropdown.Item>
                                </Dropdown.Menu>
                                <AiFillQuestionCircle style={{
                                    marginLeft: '2px', marginBottom: '3px',
                                    color: theme.highlightColor, fontSize: '17px'
                                }} data-tip={'Common: Available to all institutions (except ones listed in the "Exclude an Institution" below).\nSpecific: available to one or more certain institutions.'} />

                            </Dropdown>
                            {currentFormDomain == 'Common' && <div>
                                <Dropdown className='col-md-12  mx-2'
                                    onSelect={(eventKey, event) => {
                                        setCurrentExcludedInstitutions([...currentExcludedInstitutions, eventKey])
                                        setValue('excludedInstitutions', [...currentExcludedInstitutions, eventKey]);
                                        setCurrentEventKey(eventKey)
                                    }}>
                                    <Dropdown.Toggle variant='outline-warning' id="dropdown-custom-components">
                                        Exclude an Institution: {currentExcludedInstitutions.length <= 0 && "None"}
                                    </Dropdown.Toggle>
                                    <AiFillQuestionCircle style={{
                                        marginLeft: '2px', marginBottom: '3px',
                                        color: '#ffcc00', fontSize: '17px'
                                    }} data-tip={'The institutions specified here will not be able to see the form on their main page.'} />


                                    <Dropdown.Menu as={CustomMenu} >
                                        {institutionsList.map(institute => {
                                            if (!currentExcludedInstitutions || !currentExcludedInstitutions.includes(institute))
                                                return <Dropdown.Item eventKey={institute} active={institute == currentEventKey}>{institute}</Dropdown.Item>
                                        })}
                                    </Dropdown.Menu>
                                </Dropdown>
                                <div className="is-invalid">
                                    {/* <div className="invalid-feedback">hello22</div> */}

                                </div>
                                <div className="invalid-feedback mb-2">{errors['institution'] && !currentEventKey ? errors['institution'].message : ''}</div>
                                <div className="mb-2 col-md-6">
                                    {institutionsList && institutionsList.map(institution => {
                                        const displayStyle = currentExcludedInstitutions.includes(institution) ? 'block' : 'none'

                                        return <Button style={{ display: displayStyle }} className="mx-4" variant='secondary'>{institution}<AiFillCloseCircle style={{
                                            marginLeft: '5px', marginBottom: '3px',
                                            color: 'white', fontSize: '17px'
                                        }} onClick={() => {
                                            let excludedInstitutions = currentExcludedInstitutions
                                            var index = excludedInstitutions.indexOf(institution);
                                            if (index !== -1) {

                                                excludedInstitutions.splice(index, 1);
                                                console.log(excludedInstitutions)
                                                setValue('excludedInstitutions', [...excludedInstitutions])
                                                setCurrentExcludedInstitutions([...excludedInstitutions])
                                            }
                                        }} /> </Button>
                                    })}
                                    {/* <Button className="mx-1" variant='secondary'>Institution 1 <AiFillCloseCircle style={{
                                        marginLeft: '2px', marginBottom: '3px',
                                        color: 'white', fontSize: '17px'
                                    }} /> </Button>
                                    <Button className="mx-1" variant='secondary'>Institution 2 </Button> */}
                                    <div className="is-invalid">
                                        {/* <div className="invalid-feedback">hello22</div> */}

                                    </div>
                                    <div className="invalid-feedback mb-2">{errors['excludedInstitutions'] && currentExcludedInstitutions.length <= 0 ? errors['excludedInstitutions'].message : ''}</div>
                                </div>
                            </div>}


                            {currentFormDomain == 'Specific' && <div>
                                <Dropdown className='col-md-12  mx-2'
                                    onSelect={(eventKey, event) => {
                                        setCurrentAllowedInstitutions([...currentAllowedInstitutions, eventKey])
                                        setValue('allowedInstitutions', [...currentAllowedInstitutions, eventKey]);
                                        setCurrentEventKey(eventKey)
                                    }}>
                                    <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-components">
                                        Add an Institution
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu as={CustomMenu} >
                                        {institutionsList.map(institute => {
                                            if (!currentAllowedInstitutions || !currentAllowedInstitutions.includes(institute))
                                                return <Dropdown.Item eventKey={institute} active={institute == currentEventKey}>{institute}</Dropdown.Item>
                                        })}
                                    </Dropdown.Menu>
                                </Dropdown>
                                <div className="is-invalid">
                                    {/* <div className="invalid-feedback">hello22</div> */}

                                </div>
                                <div className="invalid-feedback mb-2">{errors['institution'] && !currentEventKey ? errors['institution'].message : ''}</div>
                                <div className="mb-2 col-md-6">
                                    {institutionsList.map(institution => {
                                        const displayStyle = currentAllowedInstitutions.includes(institution) ? 'block' : 'none'

                                        return <Button style={{ display: displayStyle }} className="mx-4" variant='secondary'>{institution}<AiFillCloseCircle style={{
                                            marginLeft: '5px', marginBottom: '3px',
                                            color: 'white', fontSize: '17px'
                                        }} onClick={() => {
                                            let allowedInstitutions = currentAllowedInstitutions
                                            var index = allowedInstitutions.indexOf(institution);
                                            if (index !== -1) {

                                                allowedInstitutions.splice(index, 1);
                                                console.log(allowedInstitutions)
                                                setValue('allowedInstitutions', [...allowedInstitutions])
                                                setCurrentAllowedInstitutions([...allowedInstitutions])
                                            }
                                        }} /> </Button>
                                    })}
                                    {/* <Button className="mx-1" variant='secondary'>Institution 1 <AiFillCloseCircle style={{
                                        marginLeft: '2px', marginBottom: '3px',
                                        color: 'white', fontSize: '17px'
                                    }} /> </Button>
                                    <Button className="mx-1" variant='secondary'>Institution 2 </Button> */}
                                    <div className="is-invalid">
                                        {/* <div className="invalid-feedback">hello22</div> */}

                                    </div>
                                    <div className="invalid-feedback mb-2">{errors['allowedInstitutions'] && currentAllowedInstitutions.length <= 0 ? errors['allowedInstitutions'].message : ''}</div>
                                </div>
                            </div>}

                            <div className="my-2 row">
                                <div className='col-md-4'>
                                    {currentPrerequisites.length == 0 ? <Button className="" variant='outline-secondary'>
                                        <AiFillFastBackward style={{
                                            marginRight: '5px', marginBottom: '3px',
                                            color: theme.highlightColor, fontSize: '17px'
                                        }} />
                                        Prerequisites Form: <b>None</b>
                                        <AiFillQuestionCircle style={{
                                            marginLeft: '5px', marginBottom: '3px',
                                            color: theme.highlightColor, fontSize: '17px'
                                        }} data-tip={'Specify forms that need to be completed to access this one. Please access this feature from Home Page.'} /> </Button>
                                        : <Button className="" variant='info'
                                        // href = {`/forms/${pre}`}
                                        >
                                            <AiFillFastBackward style={{
                                                marginRight: '5px', marginBottom: '3px',
                                                color: 'white', fontSize: '17px'
                                            }} />
                                            Prerequisite Form(s): <b>{Object.keys(allPrerequisites).map(pre => {
                                                if (currentPrerequisites.includes(pre)) {
                                                    console.log(currentPrerequisites, pre)
                                                    return allPrerequisites[pre]
                                                }
                                                return false
                                            }).filter(Boolean).join(", ")}</b>
                                        </Button>
                                    }
                                </div>
                                <div className='col-md-6'>
                                    {currentNextForm.length == 0 ? <Button className="mx-2" variant='secondary'>
                                        <AiFillFastForward style={{
                                            marginRight: '5px', marginBottom: '3px',
                                            color: theme.highlightColor, fontSize: '17px'
                                        }} />
                                        Next Form: <b>None </b>
                                        <AiFillQuestionCircle style={{
                                            marginLeft: '5px', marginBottom: '3px',
                                            color: theme.highlightColor, fontSize: '17px'
                                        }} data-tip={'Specify next form to forward to after submitting. Please access this feature from Home Page.'} />

                                    </Button> : <Button
                                        // href = {`/forms/${pre}`} 
                                        className="mx-2" variant='success'>
                                        <AiFillFastForward style={{
                                            marginRight: '5px', marginBottom: '3px',
                                            color: 'white', fontSize: '17px'
                                        }} />
                                        Next Form: <b>{Object.keys(allPrerequisites).map(pre => (currentNextForm.includes(pre) ? allPrerequisites[pre] : '')
                                        )}</b>
                                    </Button>
                                    }
                                </div>



                            </div>
                            {/* <Dropdown className=''
                                onSelect={(eventKey, event) => {
                                    if (!currentNextForm.includes(eventKey)) {
                                        setValue('currentNextForm', [eventKey]);
                                        setCurrentNextForm([eventKey])
                                    }
                                }}>
                                <Dropdown.Toggle variant={errors['currentPrerequisites'] && currentNextForm.length <= 0 ? 'outline-danger' : ''}
                                    className={errors['currentPrerequisites'] && currentNextForm.length <= 0 ? '' : 'button-outline-theme'}
                                    id="dropdown-basic">
                                    Specify next form (optional):
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                    {Object.keys(allPrerequisites).map(pre => {
                                        // console.log(pre)
                                        // return <>Hello</>
                                        return <Dropdown.Item eventKey={pre}>{allPrerequisites[pre]}</Dropdown.Item>
                                    })}
                                </Dropdown.Menu>
                                <AiFillQuestionCircle style={{
                                    marginLeft: '2px', marginBottom: '3px',
                                    color: theme.highlightColor, fontSize: '17px'
                                }} data-tip={'Automatic forwaring to this form upon successful completion of the current form.'} />

                            </Dropdown> */}
                            {/* <div className="my-2 col-md-10">
                                
                                {Object.keys(allPrerequisites).map(pre => {

                                    if (currentNextForm.includes(pre)) {
                                        return <Button className="mx-2" variant='success'> Next Form: <b>{allPrerequisites[pre]}</b>
                                        <AiFillCloseCircle style={{
                                            marginLeft: '5px', marginBottom: '3px',
                                            color: 'white', fontSize: '17px'
                                        }} onClick={() => {
                                            let prerequisites = currentNextForm
                                            var index = prerequisites.indexOf(pre);
                                            if (index !== -1) {

                                                prerequisites.splice(index, 1);
                                                console.log(prerequisites)
                                                setValue('currentNextForm', [...currentNextForm])
                                                setCurrentPrerequisites([...currentNextForm])
                                            }
                                        }} /> 
                                        </Button>
                                    }
                                    return <></>

                                })}

                                <div className="is-invalid">

                                </div>
                                <div className="invalid-feedback mb-2">
                                    {errors['currentPrerequisites'] && currentPrerequisites.length <= 0 ?
                                        errors['currentPrerequisites'].message : ''}
                                </div>
                            </div> */}
                            <h4>Date </h4>
                            {/* <Checkbox
                                // style={inputStyle}
                                label={''}
                                groupname={'date'}
                                options={[{ name: 'Start Date' }, { name: 'End Date' }]}
                                requiredOptions={[]}
                                className="col-sm-12 col-md-10 col-lg-10 mb-3"
                            // latestRetrievedForm={latestRetrievedForm}
                            // instructions={instructions}

                            /> */}
                            <div className='row'>
                                <div className='col-md-4 form-check mx-3'>

                                    <label>Start Date</label>

                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id={'startDateRequired'}
                                        // value={true}
                                        value={'startDateRequired'}
                                        // defaultChecked={defaultCheckValue}
                                        {...register('startDateRequired')}
                                    />
                                    {startDateRequired && <Input
                                        name={'startDate'}
                                        type="date"
                                        label={'Pick a date'}
                                        required={true}
                                        // className="mb-3 col-md-4"
                                        defaultValue={format(todayDate, "yyyy-mm-dd")}
                                        instructions={'Form is officially open on this date.'}
                                    />}



                                </div>
                                <div className='col-md-4 form-check'>
                                    <label>End Date</label>
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id={'endDateRequired'}
                                        // value={true}
                                        value={'endDateRequired'}
                                        // defaultChecked={defaultCheckValue}
                                        {...register('endDateRequired')}
                                    />
                                    {endDateRequired && <Input
                                        name={'endDate'}
                                        type="date"
                                        label={'Pick a date'}
                                        // className="mb-3 col-md-4"
                                        required={true}
                                        defaultValue={format(tomorrowDate, "yyyy-mm-dd")}
                                        instructions={'Form will be closed for submissions after this date.'}
                                    />}
                                </div>
                            </div>





                            <div className="row">
                                <div className="col-md-3">
                                    <div className='my-2'>
                                        {/* {questionObj.question_text} */}
                                        <Dropdown className=''
                                            onSelect={(eventKey, event) => {
                                                addNewQuestion(eventKey);
                                                // if (!currentAllowedRoles.includes(eventKey)) {
                                                //     setValue('allowedRoles', [...currentAllowedRoles, eventKey]);
                                                //     setCurrentAllowedRoles([...currentAllowedRoles, eventKey])
                                                // }
                                            }}>
                                            <Dropdown.Toggle variant={errors['currentQuestionList'] && currentQuestionList.length <= 0 ? 'outline-danger' : ''}
                                                className={errors['allowedRoles'] && currentQuestionList.length <= 0 ? '' : 'button-outline-theme'}
                                                id="dropdown-basic">
                                                Add a Question
                                            </Dropdown.Toggle>

                                            <Dropdown.Menu>
                                                {Object.keys(allQuestionTypes).map(qType => {
                                                    return <Dropdown.Item eventKey={qType}>{allQuestionTypes[qType][0]}</Dropdown.Item>
                                                })}
                                            </Dropdown.Menu>
                                            <AiFillQuestionCircle style={{
                                                marginLeft: '2px', marginBottom: '3px',
                                                color: theme.highlightColor, fontSize: '17px'
                                            }} data-tip={'Specify which question type you would like to add.'} />

                                        </Dropdown>
                                    </div>
                                    {/* <Button >Add a question</Button> */}

                                </div>
                            </div>
                            <div className="row">
                                <div>
                                    {/* {currentQuestionList.map(questionObj => {
                                        return <div>
                                            <NewQuestionLayout questionObj={questionObj} />
                                        </div>
                                    })} */}
                                    <DragNDropList currentQuestionList={currentQuestionList}
                                        setTempItems={setCurrentQuestionList}
                                        setStructuredFormQuestions={setStructuredFormQuestions}
                                        latestRetrievedForm={formData}
                                    />

                                </div>
                            </div>

                        </div>

                        <div className="row d-flex justify-content-center my-3">

                            <div className="form-group">
                                <button type="submit" className={`btn button-fill-theme mr-1`}>
                                    {formAction == 'edit' ? 'Revise and Save' : 'Upload New Form'}
                                </button>
                                {/* <Button className='mx-2' variant='outline-secondary' onClick={() => {
                                    // setFormID(null)
                                    // setLatestUnuploadedForm(null);
                                    // fileInputRef.current.value = "";
                                }}>Cancel </Button> */}

                                {formURL && <Button className='float-end mx-2' variant='success' href={`${formURL}`}>

                                    <AiOutlineRead style={{ marginBottom: 1, fontSize: 16 }} /> Form Preview </Button>}



                            </div>
                        </div>
                        {formAction == 'edit' && <div>
                            <h6 className="float-end ">
                                Last Edited: <i className={isBlinking ? 'blinking' : ''} style={isBlinking ? { backgroundColor: "limegreen" } : { fontWeight: 'bold' }}>
                                    {lastUpdatedDateString ? lastUpdatedDateString : 'Never'}
                                </i>
                            </h6>
                        </div>}
                        <small className="text-muted">
                            By clicking the 'Upload' button, you confirm that you accept
                            our Terms of use and Privacy Policy.
                        </small>
                    </form>
                </FormProvider>
            </div>
        </div> : <h2>FORM NOT FOUND!</h2>
        }
    </div>
}

