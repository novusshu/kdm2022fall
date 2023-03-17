import React from "react";

// *** OTHER ***
import { ViewMode } from "react-gantt-chart";
import { CButton, CButtonGroup, CCol, CFormCheck, CRow } from "@coreui/react/dist";


// // *** TYPES ***
// interface IProps {
// 	isChecked: boolean;
// 	onViewListChange: (isChecked: boolean) => void;
// 	onViewModeChange: (viewMode: ViewMode) => void;
// }

const ViewSwitcher = (props) => {
	// *** PROPS ***
	const { onViewModeChange, onViewListChange, isChecked } = props;

	return (
		<div className="ViewContainer">
			<CRow className="justify-content-between">
			<CCol md="auto">
					<CFormCheck
						type="checkbox"
						label="Show Task List"
						defaultChecked={isChecked}
						onClick={() => onViewListChange(!isChecked)}
					/>
					<span className="Slider" />
			</CCol>
			<CCol md="auto">
            <CButtonGroup className="mr-2 mb-2" role="group" aria-label="View Mode">
			{/* <CButton
				color="info"
				onClick={() => onViewModeChange(ViewMode.QuarterDay)}
			>
				Quarter of Day
			</CButton>
			<CButton
				color="info"
				onClick={() => onViewModeChange(ViewMode.HalfDay)}
			>
				Half of Day
			</CButton> */}
			<CButton color="info" onClick={() => onViewModeChange(ViewMode.Day)}>
				Day
			</CButton>
			<CButton
				color="info"
				onClick={() => onViewModeChange(ViewMode.Week)}
			>
				Week
			</CButton>
			<CButton
				color="info"
				onClick={() => onViewModeChange(ViewMode.Month)}
			>
				Month
			</CButton>
            </CButtonGroup>
			</CCol>
			</CRow>
		</div>
	);
};

export default ViewSwitcher;