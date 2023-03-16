import {useState} from "react";
import {
	GanttOriginal,
	ViewMode,
} from "react-gantt-chart";

// *** OTHER ***
import ViewSwitcher from "./ViewSwitcher";
import { getStartEndDateForProject, initTasks } from "./helpers";
import { CButton, CCol, CForm, CModal } from "@coreui/react/dist";

const GanttChart = () => {
	// *** USE STATE ***
	const [tasks, setTasks] = useState(initTasks());
	const [view, setView] = useState(ViewMode.Month);
	const [isChecked, setIsChecked] = useState(true);

	// *** CONSTANTS ***
	let columnWidth = 60;
	if (view === ViewMode.Month) {
		columnWidth = 300;
	} else if (view === ViewMode.Week) {
		columnWidth = 250;
	}

	// *** HANDLERS ***
	const handleTaskChange = (task) => {
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

		setTasks(() => newTasks);
	};

	const handleTaskDelete = (task) => {
		const conf = window.confirm("Are you sure about " + task.name + " ?");
		if (conf) {
			setTasks(() => tasks.filter((t) => t.id !== task.id));
		}
		return conf;
	};

	const handleProgressChange = async (task) => {
		console.log("On progress change Id:" + task.id);
		setTasks(() => tasks.map((t) => (t.id === task.id ? task : t)));
	};

	const handleDblClick = (task) => {
		console.log("On Double Click event Id:" + task.id);
	};

	const handleSelect = (task, isSelected) => {
		console.log(task.name + " has " + (isSelected ? "selected" : "unselected"));
	};

	const handleExpanderClick = (task) => {
		console.log("On expander click Id:" + task.id);
		setTasks(() => tasks.map((t) => (t.id === task.id ? task : t)));
	};

	return (
		<>

        {/* <CModal 
            show={true}
            onClose={() => {}}
            color="primary"
        >
            <CModalHeader closeButton>
                <CModalTitle>Modal title</CModalTitle>
            </CModalHeader>
            <CModalBody>
                <CForm>
                    <CFormGroup>
                        <CLabel htmlFor="nf-email">Project Name</CLabel>
                        <CInput
                            type="email"
                            id="nf-email"
                            name="nf-email"
                            placeholder="Enter Email.."
                            autoComplete="email"
                        />
                        <CFormText className="help-block">Please enter your email</CFormText>
                    </CFormGroup>
                    <CFormGroup>
                        <CLabel htmlFor="">Start</CLabel>
                        <CInput
                            type="email"
                            id="nf-email"
                            name="nf-email"
                            placeholder="Enter Email.."
                            autoComplete="email"
                        />
                        <CFormText className="help-block">Please enter your email</CFormText>
                    </CFormGroup>
                </CForm>

                </CModalBody>
            <CModalFooter>
                <CButton color="secondary" onClick={() => {}}>Cancel</CButton>
                <CButton color="primary" onClick={() => {}}>Confirm</CButton>{' '}
            </CModalFooter>
        </CModal> */}

			<ViewSwitcher
				onViewModeChange={(viewMode) => setView(() => viewMode)}
				onViewListChange={setIsChecked}
				isChecked={isChecked}
			/>

            <CCol className="mb-2">
                <CButton color="primary">Generate Timeline from Favorites</CButton>
            </CCol>

			{/* ORIGINAL */}
			{/* <h3>My Scheduler</h3> */}
			<GanttOriginal
				tasks={tasks}
				viewMode={view}
				// handlers
				onDateChange={handleTaskChange}
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
			/>

			
		</>
	);
};

export default GanttChart;