import { db } from "../../../firebasedb";
import { Timestamp } from "firebase/firestore";
import { useUserAuth } from "../../../context/UserAuthContext";
import { useState, useEffect } from "react";
import { fetchData, retrieveProjects } from '../utils';
import { format } from 'date-fns';
import { parseISO } from 'date-fns';


function removeUndefinedValues(obj) {
	// If the input is an object
	if (typeof obj === 'object' && obj !== null) {
		// If the input is an array
		if (Array.isArray(obj)) {
			// Create a new array to store the updated values
			const updatedArr = [];

			// Loop through each value in the array
			obj.forEach((val) => {
				// Recursively remove undefined values from the value
				const updatedVal = removeUndefinedValues(val);

				// If the updated value is not undefined, add it to the updated array
				if (updatedVal !== undefined) {
					updatedArr.push(updatedVal);
				}
			});

			// Return the updated array
			return updatedArr;
		}

		// If the input is an object
		else {
			// Create a new object to store the updated key-value pairs
			const updatedObj = {};

			// Loop through each key-value pair in the object
			Object.entries(obj).forEach(([key, value]) => {
				// Recursively remove undefined values from the value
				const updatedValue = removeUndefinedValues(value);

				// If the updated value is not undefined, add it to the updated object
				if (updatedValue !== undefined) {
					updatedObj[key] = updatedValue;
				}
			});

			// Return the updated object
			return updatedObj;
		}
	}

	// If the input is not an object, return the input value
	return obj;
}

export const createTasksForFirebase = (tasks) => {
	return tasks.map(task => {
		return removeUndefinedValues({
			line: task.line,
			id: task.id,
			type: task.type,
			name: task.name,
			// convert date to timestamp
			start: format(task.start, 'yyyy-MM-dd'),
			end: format(task.end, 'yyyy-MM-dd'),
			progress: task.progress,
			// styles: {
			// 	backgroundColor: task?.styles?.backgroundColor,
			// 	backgroundSelectedColor: task?.styles?.backgroundSelectedColor,
			// 	progressColor: task?.styles?.progressColor,
			// 	progressSelectedColor: task?.styles?.progressSelectedColor,
			// },
			// isDisabled: task?.isDisabled,
			project: task?.project,
			dependencies: task?.dependencies,
			hideChildren: task.hideChildren,
		})
	})
}

export const string2date = (obj) => {
	// obj.start = new Timestamp(obj.start.seconds, obj.start.nanoseconds).toDate()
	obj.start = parseISO(obj.start)
	obj.end = parseISO(obj.end)
	return obj
}


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
//                 start: new Date(2023, 6, 1),
//                 end: new Date(2023, 6, 30),
//                 progress: 1,
//                 project: projectID,
//             },
//             {
//                 line: 2,
//                 type: "task",
//                 id: "Task 1",
//                 name: "1.2 Task",
//                 start: new Date(2023, 7, 1),
//                 end: new Date(2023, 7, 30),
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




export const initTask = (line) => {
	const task = {
		line: line,
		type: "",
		id: "",
		name: "",
		start: new Date(),
		end: new Date(),
		progress: 0,
		hideChildren: false,
		dependencies: [],
	}
	return task
}

export const initTasks = () => {
	const currentDate = new Date();
	const tasks = [
		// Project 1
		{
			// line: 0,
			type: "project",
			id: "ProjectSample",
			name: "1.Project",
			start: new Date(2023, 6, 1),
			end: new Date(2023, 9, 30),
			progress: 25,
			hideChildren: false,
		},
		{
			// line: 1,
			type: "task",
			id: "Task 0",
			name: "1.1 Task",
			start: new Date(2023, 6, 1),
			end: new Date(2023, 6, 30),
			progress: 45,
			project: "ProjectSample",
		},
		{
			// line: 2,
			type: "task",
			id: "Task 1",
			name: "1.2 Task",
			start: new Date(2023, 7, 1),
			end: new Date(2023, 7, 30),
			progress: 25,
			dependencies: ["Task 0"],
			project: "ProjectSample",
		},
		{
			// line: 3,
			type: "task",
			id: "Task 2",
			name: "1.3 Task",
			start: new Date(2023, 6, 1),
			end: new Date(2023, 7, 30),
			progress: 10,
			dependencies: ["Task 1"],
			project: "ProjectSample",
		},
		{
			// line: 4,
			type: "milestone",
			id: "Task 6",
			name: "1.3.1 MileStone (KT)",
			start: new Date(2023, 6, 1),
			end: new Date(2023, 6, 30),
			progress: 100,
			dependencies: ["Task 2"],
			project: "ProjectSample",
		},
		// {
		// 	start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
		// 	end: new Date(
		// 	  currentDate.getFullYear(),
		// 	  currentDate.getMonth(),
		// 	  2,
		// 	  12,
		// 	  28
		// 	),
		// 	name: "Idea",
		// 	id: "Task 022",
		// 	progress: 45,
		// 	type: "task",
		// 	project: "ProjectSample",
		//   },
		{
			// line: 4,
			type: "milestone",
			id: "Task 7",
			name: "1.3.2 MileStone (KT)",
			start: new Date(2023, 7, 1),
			end: new Date(2023, 7, 30),
			progress: 100,
			dependencies: ["Task 2"],
			project: "ProjectSample",
		},

		{
			// line: 5,
			type: "task",
			id: "Task 3",
			name: "1.4 Task",
			start: new Date(2023, 8, 1),
			end: new Date(2023, 8, 30),
			progress: 2,
			dependencies: ["Task 2"],
			project: "ProjectSample",
		},
		{
			// line: 6,
			type: "task",
			id: "Task 4",
			name: "1.5 Task",
			start: new Date(2023, 9, 1),
			end: new Date(2023, 9, 30),
			progress: 70,
			dependencies: ["Task 2"],
			project: "ProjectSample",
		},
		{
			// line: 7,
			type: "milestone",
			id: "Task 5",
			name: "1.5.1 MileStone (KT)",
			start: new Date(2023, 9, 1),
			end: new Date(2023, 9, 30),
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