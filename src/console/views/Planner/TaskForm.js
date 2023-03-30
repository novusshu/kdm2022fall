import React, { useState, useEffect, useContext } from 'react';
import { db } from "../../../firebasedb";
import { CFormGroup, CFormLabel, CFormInput, CRow, CButton, CFormSwitch } from '@coreui/react';
import { Input } from '../../../components/Input';
import { Select } from '../../../components/Select';
import { useForm, FormProvider } from 'react-hook-form';
import { useGanttContext } from './GanttChart'
import { CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter } from '@coreui/react'
import { format } from 'date-fns';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from "yup";
import DropdownMultipleSelect from '../../../components/DropdownMultipleSelect';


const TaskInput = ({ name, label, readOnly, ...rest }) => {
    const { task } = useGanttContext();
    return (
        <Input
            name={name}
            label={label}
            labelClass='col-form-label'
            defaultValue={task[name]}
            inputClass="form-control-plaintext border-bottom"
            readOnly={readOnly}
            {...rest}
        />
    )
}

const TaskSelect = ({ name, label, readOnly, ...rest }) => {
    const { task } = useGanttContext();
    return (
        <Select
            name={name}
            label={label}
            labelClass='col-form-label'
            defaultValue={task[name]}
            readOnly={readOnly}
            options={['task', 'project', 'milestone']} 
            {...rest}
        />
    )
}


function TaskEditForm() {
    const schema = Yup.object().shape({
        // project: Yup.string(),
        id: Yup.string().required(),
        name: Yup.string().required(),
        type: Yup.string().required(),
        start: Yup.date().required(),
        end: Yup.date().required(),
        process: Yup.number(),
    });
    const formOptions = { resolver: yupResolver(schema) };
    const methods = useForm(formOptions);
    const { handleSubmit } = methods
    const { task, setTask, tasks, setTasks, readOnly, setReadOnly, addingMode, setAddingMode } = useGanttContext();
    console.log("task", task)

    const [dependencies, setDependencies] = useState([]);
    const [taskIDs, setTaskIDs] = useState([]);

    useEffect(() => {
        const taskIDs = tasks.map((t) => t.id);
        setTaskIDs(taskIDs);
    }, [tasks]);

    useEffect(() => {
        if (task) {
            setDependencies(task.dependencies);
        }
    }, [task]);

    const onSubmit = data => {
        // console.log("data", data)
        const newtask = { ...task, ...data, dependencies:dependencies }
        console.log("newtask", newtask)
        console.log('AddingMode', addingMode)
        if (addingMode) {
            setTasks([...tasks, newtask])
            setAddingMode(false)
        } else {
            setTasks(tasks.map((t) => (t.id === newtask.id ? newtask : t)))
        }
        console.log("tasks", tasks)
    };

    // console.log("editable", editable)
    // console.log("tasks", tasks)
    // console.log(task.start.toISOString().slice(0, 10))
    return (

        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>

                <CFormSwitch
                    label="Edit"
                    id="formSwitchCheckChecked"
                    checked={!readOnly}
                    onChange={() => setReadOnly(!readOnly)}
                />
                <TaskInput name='project' label='Project' readOnly={readOnly} />
                <TaskInput name='id' label='Task ID' readOnly={readOnly} />
                <TaskInput name='name' label='Task Name' readOnly={readOnly} />
                {/* <TaskInput name='type' label='Type' readOnly={readOnly} /> */}
                <TaskSelect name='type' label='Type' readOnly={readOnly} />
                <TaskInput name='start' label='Start Date' readOnly={readOnly} type='date'
                    defaultValue={format(task.start, 'yyyy-MM-dd')} />
                <TaskInput name='end' label='End Date' readOnly={readOnly} type='date'
                    defaultValue={format(task.end, 'yyyy-MM-dd')} />
                <TaskInput name='progress' label='Progress (%)' readOnly={readOnly} type='number' max='100' min='0' />
                <DropdownMultipleSelect selectedItems={dependencies} setSelectedItems={setDependencies}
                    label='Dependencies' readOnly={readOnly} items={taskIDs} />
                <TaskInput name='description' label='Description' readOnly={readOnly} />

                <br />
                <div className="d-grid gap-2 d-md-flex justify-content-md-end m-2   ">
                    <CButton type="submit" color="primary" className="mr-2" >Save</CButton>
                </div>

            </form>
        </FormProvider>
    );
}

export const TaskModal = () => {
    // console.log(task)
    const { visible, setVisible } = useGanttContext();
    return (
        <>
            <CModal alignment="center" scrollable visible={visible} onClose={() => setVisible(false)}>
                <CModalHeader>
                    <CModalTitle>Task Card</CModalTitle>
                </CModalHeader>

                <CModalBody>
                    <TaskEditForm />
                </CModalBody>
                {/* <CModalFooter>
					<CButton color="secondary" onClick={() => setVisible(false)}>
						Close
					</CButton>
					<CButton color="primary">Save changes</CButton>
				</CModalFooter> */}
            </CModal>
        </>
    )
}
