import React, { useState } from 'react';
import {
  CFormSelect,
  CFormLabel,
  CBadge,
  CButton,
} from '@coreui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';


const DropdownMultipleSelect = ({selectedItems, setSelectedItems, label, items, readOnly}) => {
//   const [selectedItems, setSelectedItems] = useState([]);
  console.log("selectedItems", selectedItems)
  const handleSelect = (event) => {
    const value = event.target.value;
    if (!selectedItems.includes(value)) {
      setSelectedItems([...selectedItems, value]);
    }
  };

  const handleRemove = (itemToRemove) => {
    setSelectedItems(selectedItems.filter((item) => item !== itemToRemove));
  };

  return (
    <div>
        <CFormLabel>{label}</CFormLabel>
        <CFormSelect
          multiple
          onChange={handleSelect}
          value={selectedItems}
          className="mb-3"
          disabled={readOnly}
        >
            {items.map((item) => (
                <option key={item} value={item}>{item}</option>
            ))}
        </CFormSelect>

      <div>
        {selectedItems && selectedItems.length >= 1 && selectedItems.map((item) => (
          <CBadge key={item} color="info" className="mr-1 mb-1">
            {item}
            {!readOnly && (
            <CButton
              color="transparent"
              size="sm"
              className="ml-1"
              onClick={() => handleRemove(item)}
            >
              <FontAwesomeIcon icon={faTimes} />
            </CButton>
             )}
          </CBadge>
        ))}
      </div>
    </div>
  );
};

export default DropdownMultipleSelect;
