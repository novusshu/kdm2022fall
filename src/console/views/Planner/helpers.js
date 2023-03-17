import {db} from "../../../firebasedb";
import {collection, getDocs, query, where, doc, getDoc, updateDoc, arrayRemove} from "firebase/firestore";
import { useUserAuth } from "../../../context/UserAuthContext";
import {useState, useEffect} from "react";
import { fetchData, retrieveProjects } from '../utils';

// function makeArr(startValue, stopValue, cardinality) {
//     var arr = [];
//     var step = (stopValue - startValue) / (cardinality - 1);
//     for (var i = 0; i < cardinality; i++) {
//       arr.push(startValue + (step * i));
//     }
//     return arr;
//   }

// export const createTasksFromFavorites = async ({setTasks}) => {

//     const [myProjects, setMyProjects] = useState([])
//     const [results, setResults] = useState([])
//     await fetchData(user.uid, setMyProjects, 'Favorites')
//     await retrieveProjects(myProjects, setResults)

//     let tasks = []
//     results.forEach((result, index) => {

//         today = new Date()
//         days = 86400000

//         let due = new Date(result['Next due date (Y-m-d)'].split(',')[0])
//         let start = today
//         let totalDays = (due - start) / days
//         let period = makeArr(0, totalDays, 4)
//         let projectID = result.BIIN_PROJECT_ID
//         let threeSteps = [

//             {
//                 line: 0,
//                 type: "project",
//                 id: projectID,
//                 name: "1.Project",
//                 start: today,
//                 end: due,
//                 progress: 25,
//                 hideChildren: false,
//             },
//             {
//                 line: 1,
//                 type: "task",
//                 id: "Task 0",
//                 name: "1.1 Task",
//                 start: new Date(2021, 6, 1),
//                 end: new Date(2021, 6, 30),
//                 progress: 1,
//                 project: projectID,
//             },
//             {
//                 line: 2,
//                 type: "task",
//                 id: "Task 1",
//                 name: "1.2 Task",
//                 start: new Date(2021, 7, 1),
//                 end: new Date(2021, 7, 30),
//                 progress: 25,
//                 dependencies: ["Task 0"],
//                 project: "ProjectSample",
//             },

//         ]

//     useEffect(() => {
//         { console.log('My Projects: ', myProjects) }
//         if (myProjects?.favoriteList) {
            
//             retrieveProjects(myProjects, setTasks)
//             []
//             setTasks(tasks => tasks.map(task => {
//         }

export const initTasks = () => {

    // const [myProjects, setMyProjects] = useState([])
    // const [myTasks, setMyTasks] = useState([])
    // const [showMessage, setShowMessage] = useState(false)
    // const [createTasksFromFavorites, setCreateTasksFromFavorites] = useState(false)

    // const { user, userData } = useUserAuth();

    // useEffect(() => {
    //     fetchMyTasks(user.uid, setMyTasks, 'Favorites')
    //     if(myTasks.length == 0){
    //         setShowMessage(true)
    //     }
    // }, [user])



    
    
    const tasks = [
		// Project 1
		{
			line: 0,
			type: "project",
			id: "ProjectSample",
			name: "1.Project",
			start: new Date(2021, 6, 1),
			end: new Date(2021, 9, 30),
			progress: 25,
			hideChildren: false,
		},
		{
			line: 1,
			type: "task",
			id: "Task 0",
			name: "1.1 Task",
			start: new Date(2021, 6, 1),
			end: new Date(2021, 6, 30),
			progress: 45,
			project: "ProjectSample",
		},
		{
			line: 2,
			type: "task",
			id: "Task 1",
			name: "1.2 Task",
			start: new Date(2021, 7, 1),
			end: new Date(2021, 7, 30),
			progress: 25,
			dependencies: ["Task 0"],
			project: "ProjectSample",
		},
		{
			line: 3,
			type: "task",
			id: "Task 2",
			name: "1.3 Task",
			start: new Date(2021, 6, 1),
			end: new Date(2021, 7, 30),
			progress: 10,
			dependencies: ["Task 1"],
			project: "ProjectSample",
		},
		{
			line: 4,
			type: "milestone",
			id: "Task 6",
			name: "1.3.1 MileStone (KT)",
			start: new Date(2021, 6, 1),
			end: new Date(2021, 6, 30),
			progress: 100,
			dependencies: ["Task 2"],
			project: "ProjectSample",
		},
		{
			line: 4,
			type: "milestone",
			id: "Task 7",
			name: "1.3.2 MileStone (KT)",
			start: new Date(2021, 7, 1),
			end: new Date(2021, 7, 30),
			progress: 100,
			dependencies: ["Task 2"],
			project: "ProjectSample",
		},

		{
			line: 5,
			type: "task",
			id: "Task 3",
			name: "1.4 Task",
			start: new Date(2021, 8, 1),
			end: new Date(2021, 8, 30),
			progress: 2,
			dependencies: ["Task 2"],
			project: "ProjectSample",
		},
		{
			line: 6,
			type: "task",
			id: "Task 4",
			name: "1.5 Task",
			start: new Date(2021, 9, 1),
			end: new Date(2021, 9, 30),
			progress: 70,
			dependencies: ["Task 2"],
			project: "ProjectSample",
		},
		{
			line: 7,
			type: "milestone",
			id: "Task 5",
			name: "1.5.1 MileStone (KT)",
			start: new Date(2021, 9, 1),
			end: new Date(2021, 9, 30),
			progress: 100,
			dependencies: ["Task 4"],
			project: "ProjectSample",
		},
	];
	return tasks;
};

export const getStartEndDateForProject = (
	tasks,
	projectId
) => {
	const projectTasks = tasks.filter((t) => t.project === projectId);
	let start = projectTasks[0].start;
	let end = projectTasks[0].end;

	for (let i = 0; i < projectTasks.length; i++) {
		const task = projectTasks[i];
		if (start.getTime() > task.start.getTime()) {
			start = task.start;
		}
		if (end.getTime() < task.end.getTime()) {
			end = task.end;
		}
	}
	return [start, end];
};