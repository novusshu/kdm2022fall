import React, { useEffect, useState, useContext } from "react";
// import {
// 	GanttOriginal,
// 	ViewMode,
// } from "react-gantt-chart";
import { Gantt, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";

import { TooltipContent, TaskListHeader, TaskListTable } from "./UIComponents";
import { db } from "../../../firebasedb";
import { setDoc, getDoc, doc, collection, query, where, getDocs, updateDoc, arrayRemove, serverTimestamp, Timestamp } from "firebase/firestore";
import { removeUndefinedFields, createTasksForFirebase, string2date } from "./utils"
// *** OTHER ***
import ViewSwitcher from "./ViewSwitcher";
import { getStartEndDateForProject, initTasks } from "./utils";
import { useUserAuth } from "../../../context/UserAuthContext";
import { TaskModal } from "./TaskForm";
import { CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CButton, CCol, CRow } from '@coreui/react';
import { initTask } from "./utils";


const GanttContext = React.createContext();
export const useGanttContext = () => {
	return useContext(GanttContext);
}

const GanttChart = () => {
	// *** USE STATE ***
	const [tasks, setTasks] = useState(null);
	const [view, setView] = useState(ViewMode.Month);
	const [isChecked, setIsChecked] = useState(true);
	const [visible, setVisible] = useState(false);
	const [task, setTask] = useState(null);
	const [readOnly, setReadOnly] = useState(true);
	const [addingMode, setAddingMode] = useState(false);

	const { user, userData } = useUserAuth();
	useEffect(() => {
		const docRef = doc(db, "Gantt", user.uid);
		const getDocData = async () => {
			const docSnap = await getDoc(docRef);
			if (docSnap.exists()) {
				console.log("Document data:", docSnap.data());
				const tasklist = docSnap.data().tasks
				tasklist.forEach(task => string2date(task))
				// console.log("tasklist", tasklist)
				setTasks(tasklist);
			} else {
				console.log("No such document!");
				setTasks(initTasks());
			}
		};
		getDocData();
	}, [user]);

	// *** CONSTANTS ***
	let columnWidth = 60;
	if (view === ViewMode.Month) {
		columnWidth = 300;
	} else if (view === ViewMode.Week) {
		columnWidth = 250;
	}

	// *** HANDLERS ***
	const handleDateChange = (task) => {
		console.log("On date change Id:" + task.id);

		let newTasks = tasks.map((t) => (t.id === task.id ? task : t));

		if (task.project) {
			const [start, end] = getStartEndDateForProject(newTasks, task.project);
			const project =
				newTasks[newTasks.findIndex((t) => t.id === task.project)];

			if (
				project.start.getTime() !== start.getTime() ||
				project.end.getTime() !== end.getTime()
			) {
				const changedProject = { ...project, start, end };
				newTasks = newTasks.map((t) =>
					t.id === task.project ? changedProject : t
				);
			}
		}

		setTasks(newTasks);
		console.log("tasks after date change: ", tasks)
	};

	const handleTaskDelete = (task) => {
		console.log('task', task)
		const conf = window.confirm("Are you sure about deleting " + task.name + " ?");
		if (conf) {
			setTasks(tasks.filter((t) => t.id !== task.id));
			// console.log("On task delete Id:" + task.id);
		}
		console.log('tasks after deletion', tasks)
		// fix the dependency issue

		return conf;
	};

	const handleProgressChange = async (task) => {
		console.log("On progress change Id:" + task.id);
		setTasks(() => tasks.map((t) => (t.id === task.id ? task : t)));
	};

	const handleDblClick = (task) => {
		console.log("On Double Click event Id:" + task.id);
		setReadOnly(true)
		setVisible(true)
		setTask(task)
	};

	const handleSelect = (task, isSelected) => {
		console.log(task.name + " has " + (isSelected ? "selected" : "unselected"));

	};

	const handleExpanderClick = (task) => {
		console.log("On expander click Id:" + task.id);
		setTasks(() => tasks.map((t) => (t.id === task.id ? task : t)));
	};

	const saveTasks = async () => {
		const data = {
			tasks: createTasksForFirebase(tasks),
			timestamp: serverTimestamp(),
		};
		// console.log("data", data);
		await setDoc(doc(db, "Gantt", user.uid), data);
	}

	const addTask = () => {
		setReadOnly(false)
		setAddingMode(true)
		setTask(initTask(tasks.length - 1))
		setVisible(true)
		console.log('tasks after adding', tasks)
	}


	return (
		<>

			{task &&
				<GanttContext.Provider value={{
					task: task, setTask: setTask,
					tasks: tasks, setTasks: setTasks,
					visible: visible, setVisible: setVisible,
					readOnly: readOnly, setReadOnly: setReadOnly,
					addingMode: addingMode, setAddingMode: setAddingMode
				}}>
					<TaskModal />
				</GanttContext.Provider>
			}
			<ViewSwitcher
				onViewModeChange={(viewMode) => setView(() => viewMode)}
				onViewListChange={setIsChecked}
				isChecked={isChecked}
			/>

			{/* <CCol className="mb-2">
                <CButton color="primary">Generate Timeline from Favorites</CButton>
            </CCol> */}
			<CRow>
				<CCol className="mb-2">
					<CButton color="primary" onClick={saveTasks}>Save</CButton>
				</CCol>
				<CCol className="mb-2">
					<CButton color="primary" onClick={addTask}>Add New Task</CButton>
				</CCol>
			</CRow>


			{/* ORIGINAL */}
			{/* <h3>My Scheduler</h3> */}
			{console.log("tasks", tasks)}
			{tasks && (
				<Gantt
					tasks={tasks}
					viewMode={view}
					// handlers
					onDateChange={handleDateChange}
					onDelete={handleTaskDelete}
					onProgressChange={handleProgressChange}
					onDoubleClick={handleDblClick}
					onSelect={handleSelect}
					onExpanderClick={handleExpanderClick}
					// styles
					listCellWidth={isChecked ? "155px" : ""}
					columnWidth={columnWidth}
					ganttHeight="72vh"
					locale="en-US"
					TooltipContent={TooltipContent}
					TaskListHeader={TaskListHeader}
					TaskListTable={TaskListTable}
					preStepsCount={0.1}

				/>
			)}


		</>
	);
};

export default GanttChart;