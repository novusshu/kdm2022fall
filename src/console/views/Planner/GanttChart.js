import React, { useEffect, useState } from 'react';
import { FrappeGantt } from 'frappe-gantt-react';


const GanttChart = () => {
    const [viewMode, setViewMode] = useState("Day");

    const [tasks, setTasks] = useState([
        {
            id: "Task 1",
            name: "Create a Gantt chart",
            start: "2023-03-02",
            end: "2023-03-06",
            progress: 50,
        },
        {
            id: "Task 2",
            name: "Add dependencies",
            start: "2023-03-06",
            end: "2023-03-08",
            progress: 25,
            dependencies: ["Task 1"],
        },
        {
            id: "Task 3",
            name: "Test the chart",
            start: "2023-03-09",
            end: "2023-03-10",
            progress: 0,
            dependencies: ["Task 1"],
        },
    ]);
    const handleQuarterDayClick = () => {
        setViewMode("Quarter Day");
    };

    const handleHalfDayClick = () => {
        setViewMode("Half Day");
    };

    const handleDayClick = () => {
        setViewMode("Day");
    };

    const handleWeekClick = () => {
        setViewMode("Week");
    };

    const handleMonthClick = () => {
        setViewMode("Month");
    };

    const handleAddTask = () => {
        const newTask = {
            id: `Task ${tasks.length + 1}`,
            name: "New task",
            start: "2023-03-11",
            end: "2023-03-14",
            progress: 0,
            dependencies: ["Task 1"],
        };
        setTasks([...tasks, newTask]);
    };
    

    const handleEditTask = (taskId, propName, propValue) => {
        const taskIndex = tasks.findIndex((task) => task.id === taskId);
        const task = tasks[taskIndex];
        const updatedTask = { ...task, [propName]: propValue };
        const updatedTasks = [
          ...tasks.slice(0, taskIndex),
          updatedTask,
          ...tasks.slice(taskIndex + 1),
        ];
        setTasks(updatedTasks);
      };

      const handleTaskClick = (task) => {
        const newName = prompt("Enter a new name for the task", task.name);
        if (newName !== null) {
          const newDependencies = prompt(
            "Enter a new value for dependencies (comma separated)",
            task.dependencies.join(", ")
          );
          if (newDependencies !== null) {
            handleEditTask(task.id, "name", newName);
            handleEditTask(task.id, "dependencies", newDependencies.split(", "));
          }
        }
      };
    
      const handleDeleteTask = (taskId) => {
        const updatedTasks = tasks.filter((task) => task.id !== taskId);
        setTasks(updatedTasks);
      };
    return (
        <>
            <div>
                <FrappeGantt tasks={tasks}
                    viewMode={viewMode} 
                    onTaskUpdated={handleEditTask} 
                    onClick={handleTaskClick}/>
            </div>
            <div>
                <button onClick={handleQuarterDayClick}>Quarter Day</button>
                <button onClick={handleHalfDayClick}>Half Day</button>
                <button onClick={handleDayClick}>Day</button>
                <button onClick={handleWeekClick}>Week</button>
                <button onClick={handleMonthClick}>Month</button>
            </div>
            <div>
                <button onClick={handleAddTask}>Add Task</button>
            </div>
        </>
    );
};

export default GanttChart;


