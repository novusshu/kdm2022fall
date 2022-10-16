import { decode as base64_decode, encode as base64_encode } from 'base-64';
export const atypeOptions = [
    { label: "Student", value: "student" },
    { label: "Student Peer Mentor", value: "student-mentor" },
    { label: "Faculty/Staff", value: "faculty" },
    { label: "Campus/Hub Lead", value: "campus-lead" },
    { label: "Hub Lead Admin", value: "hub-lead-admin" },
];
export const atypeOptionsCompat = [...atypeOptions, {
    label: "Hub Lead Admin", value: "administrator"
}]
export const allRoles = {
    'student': 'Student',
    'student-mentor': 'Student Peer Mentor',
    'faculty': 'Faculty/Staff',
    'campus-lead': 'Campus/Hub Lead',
    'hub-lead-admin': 'Hub Lead Admin',
    // administrator: 'Hub Lead Admin',
    // 'hub-lead': 'Hub Lead Admin'
}
export const allRolesRegular = {
    'student': 'Student',
    'student-mentor': 'Student Peer Mentor',
    'faculty': 'Faculty/Staff',
    'campus-lead': 'Campus/Hub Lead',

}
export const allRolesCompat = {
    ...allRoles,
    administrator: 'Hub Lead Admin',
    'hub-lead': 'Hub Lead Admin'
}
export const equivalentRoles = [
    ['student'],
    ['student-mentor'],
    ['faculty'],
    ['administrator', 'hub-lead', 'hub-lead-admin'],
    ['campus-lead']
]
export function isHubLead(accountType) {
    return accountType == 'hub-lead' || accountType == 'administrator' || accountType == 'hub-lead-admin'
}
export function isCampusLead(accountType) {
    return accountType == 'campus-lead'
}
export function isStudentOrMentor(accountType) {
    return accountType == 'student' || accountType == 'student-mentor'
}
export function encodeInviteCode(role) {
    return base64_encode(role)
}
export function decodeInviteCode(code) {
    return base64_decode(code)
}
export const specialAccounts = [
    'leeyu@umkc.edu', 'petria@umkc.edu', 'traigerj@umkc.edu', 'admin1@admin.com', 'wanye@umkc.edu'
]
/*
Hub Lead Admin: https://soar-ai.com/register?inviteCode=aHViLWxlYWQtYWRtaW4= 
Campus/Hub Lead: https://soar-ai.com/register?inviteCode=Y2FtcHVzLWxlYWQ=
Faculty/Staff: https://soar-ai.com/register?inviteCode=ZmFjdWx0eQ==
Student Peer Mentor: https://soar-ai.com/register?inviteCode=c3R1ZGVudC1tZW50b3I=
Student: https://soar-ai.com/register
*/

export const getFirebaseDocumentID = (role) => {
    if (role == 'student') {
        return 'master_form_order'
    }
    else if (role == 'faculty') {
        return 'faculty_form_order'
    }
    else if (role == 'student-mentor') {
        return 'studentmentor_form_order'
    }
    else if (role == 'campus-lead') {
        return 'campuslead_form_order'
    }
    return `${role}_form_rder`
}
export const formPrefixes = [
    'STU', 'PEER', 'FAC', 'CAMP', 'N/A'
]
export const formPrefixes2 = [
    'TAPDINTO-STEM', 'N/A'
]
export const READMEsample = String.raw`[Please use Google Chrome as the most reliable browser for the web-based forms.]

SOAR is the backbone portal for NSF INCLUDES Alliance TAPDINTO-STEM. This is the project of a team of talented doctoral computer science students. They built something novel and useful for TAPDINTO-STEM. This is part one, the input forms, and part two, the data reporting and visualizations, are still in-progress.

SOAR also has an associated app that is currently available for IOS and will soon be available for Android. The app permits only completing forms and not editing or creating forms.

One of the features that we like about this portal is the ability for someone to listen to the form and speak the answers using their microphone or type the answers into the chat box. Individuals completing the forms using the dialogue feature can edit their responses on the form itself should AI insert something other than what was intended.

As Campus/Hub Lead, you have access to edit common forms and create individual forms that are tailored to your hub or college/university.  The backbone team hopes that much of this will be intuitive for you – that the design matches what you have come to know from Google Forms or Qualtrics. The backbone team does have requests to keep the portal organized and functioning optimally.

1.	You have the capability to edit and the admins will publish the form. When you edit the form, please give a heads up to the backbone to review and publish forms. (Alexis Petri, petria@umkc.edu)
2.	Follow the naming convention. For student forms, begin the form name with “STU” followed by a number and an underscore, such as “6_”, and then the acronym for your college or university followed by an underscore, such as “UMKC_” and then the name of your form with spaces between the words. STU2_UMKC_TAPDINTO-STEM Student Demographic Form
3.	Specify the role. In other words, who will complete the form? We have a limited number of options for this and ask that you make the form fit the roles available: student, student mentor, faculty/staff, campus/hub lead.
4.	Note the form domain: common means that the form is common to all institutions and individual means that the form is limited to specific institution(s).
5.	Some forms are part of a sequence, which you can set up in the create forms space.
6.	Date options allow you to have a start and end date for the form. We have one limitation in that we cannot have multiple start date and end date for the same form.
7.	There are a variety of questions and descriptive text that you can add.
8.	Remember to upload your new form and also to view it as a form.

We have a request to not make individual changes to the established common forms that are already published. However, if you have a wording suggestion or would like additional questions that everyone should answer, please edit the forms. This way we can benefit from all of our perspectives and expertise.

We encourage you to edit, create, and use forms associated with the portal. With all the data in one place, our reporting will be stronger and we can make evidence-based decisions.

Backbone Team

Duy H. Ho, UMKC doctoral student
Ahmed Alanazi, UMKC doctoral student
Cheng Shu, UMKC doctoral student
Yugi Lee, Professor of Computer Science
Ye Wang, Professor of Communication and Journalism
Alexis Petri, backbone lead
Jeff Traiger, backbone manager`