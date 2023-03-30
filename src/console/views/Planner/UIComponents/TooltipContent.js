import React from 'react'


export const TooltipContent = (props) => {
	// *** PROPS ***
	const { task, fontFamily, fontSize } = props;

	return (
		<div
			style={{
				background: "#fff",
				padding: "12px",
				boxShadow:
					"0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)",
				fontFamily,
				fontSize,
			}}
		>
			{/* DATES RANGE */}
            <h6>{task.name}
            </h6>
			<div>
			<b>
			{`${task.start.getMonth() + 1}/${task.start.getDate()}/${task.start.getFullYear()} -- 
            ${task.end.getMonth() + 1}/${task.end.getDate()}/${task.end.getFullYear()}`}
			</b>
			</div>

			{/* DURATION */}
			{task.end.getTime() - task.start.getTime() !== 0 && (
				<div
					style={{
						fontSize: "12px",
						marginBottom: "6px",
						color: "#666",
					}}
				>{`Duration: ${~~(
					(task.end.getTime() - task.start.getTime()) /
					(1000 * 60 * 60 * 24)
				)} day(s)`}</div>
			)}

			{/* PROGRESS */}
			<div
				style={{
					fontSize: "12px",
					marginBottom: "6px",
					color: "#666",
				}}
			>
				{!!task.progress && `Progress: ${task.progress} %`}
			</div>
		</div>
	);
};






