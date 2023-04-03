import React from 'react'
import {
    CAvatar,
    CButton,
    CButtonGroup,
    CContainer,
    CCard,
    CCardBody,
    CCardFooter,
    CCardHeader,
    CCol,
    CProgress,
    CRow,
    CTable,
    CTableBody,
    CTableDataCell,
    CTableHead,
    CTableHeaderCell,
    CTableRow,
    CFormCheck
} from '@coreui/react'
import { Link } from "react-router-dom";

const TableOfProjects = ({ displayResults, selectedResults, setSelectedResults }) => {
    const handleSelectResult = (result) => {
        if (selectedResults.includes(result['BIIN_PROJECT_ID'])) {
            setSelectedResults(selectedResults.filter((item) => item !== result['BIIN_PROJECT_ID']));
        } else {
            setSelectedResults([...selectedResults, result['BIIN_PROJECT_ID']]);
        }
    };
    return (
        <CTable align="middle" className="mb-0 mt-4 border" hover responsive>
            <CTableHead color="light">
                <CTableRow>
                    <CTableHeaderCell className="text-center" >Select</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">NSF/PD Num</CTableHeaderCell>
                    <CTableHeaderCell>Award Type</CTableHeaderCell>
                    <CTableHeaderCell>Next due date</CTableHeaderCell>
                    <CTableHeaderCell>Title</CTableHeaderCell>
                </CTableRow>
            </CTableHead>
            <CTableBody>
                {displayResults.map((item, index) => (
                    <CTableRow v-for="item in tableItems" key={index}>
                        <CTableDataCell>
                            <CFormCheck type="checkbox" id={`checkbox${index}`}
                                onChange={() => handleSelectResult(item)} />
                        </CTableDataCell>
                        <CTableDataCell>
                            <div>
                                <Link
                                    to={`/user/projects/${item['NSF/PD Num']}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {item['NSF/PD Num']}
                                </Link>
                            </div>
                        </CTableDataCell>
                        <CTableDataCell>
                            <div>{item['Award Type']}</div>
                        </CTableDataCell>

                        <CTableDataCell>
                            <div className="clearfix">
                                <div >
                                    <small className="text-medium-emphasis">{item['Next due date (Y-m-d)'].slice(0, 10)}</small>
                                </div>
                            </div>
                            {/* <CProgress thin color={item.usage.color} value={item.usage.value} /> */}
                        </CTableDataCell>

                        <CTableDataCell>
                            <div>{item['Title']}</div>
                        </CTableDataCell>
                    </CTableRow>
                ))}
            </CTableBody>
        </CTable>
    )
}

export default TableOfProjects