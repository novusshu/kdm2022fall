import { useEffect, useState } from "react";
import {
  ReactGrid,
} from "@silevis/reactgrid";
import "@silevis/reactgrid/styles.css";

const applyChanges = (changes, prevPeople) => {
  changes.forEach(change => {
    if (change.newCell.type === "text") {
      console.log("change: ", change);
      prevPeople[change.rowId][change.columnId] = change.newCell.text;
    }
  });
  return [...prevPeople];
};

const reorderArray = (arr, idxs, to) => {
  const movedElements = arr.filter((_, idx) => idxs.includes(idx));
  const targetIdx =
    Math.min(...idxs) < to
      ? (to += 1)
      : (to -= idxs.filter(idx => idx < to).length);
  const leftSide = arr.filter(
    (_, idx) => idx < targetIdx && !idxs.includes(idx)
  );
  const rightSide = arr.filter(
    (_, idx) => idx >= targetIdx && !idxs.includes(idx)
  );
  return [...leftSide, ...movedElements, ...rightSide];
};

const makeEmptyRows =  (con, n, h) => 
  Array(n).fill([...h.map(e => {
      return {[e]: ""}})
  ].reduce((pre, cur) => {return {...pre, ...cur}} , {})).map((c, idx) => {return {id: idx+con.length, ...c}});
     
  // console.log("makeEmptyRows ", makeEmptyRows(content, 3))
  
const handleCanReorderRows = (targetRowId, rowIds) => {
  return targetRowId !== "header";
};

const CreateGrid = (
  { formContent,
    latestRetrievedForm,
    setSubmissionData }
) => {

  // console.log("Form Content: ", formContent);
  // console.log("latestRetrievedForm q: ", latestRetrievedForm)

  const header = formContent['form_header'];
  const q = latestRetrievedForm ? latestRetrievedForm.form_content : formContent.form_content;
  const content = q.map((c, idx) => {return {id: idx, ...c}});

  const getContent = () => [...content, ...makeEmptyRows(content, 1, header)];
  const [tableContent, setTableContent] = useState(getContent());
  // console.log("content: ", content)

  
  // console.log("header: ", header);
  const getColumns = () => [
    { columnId: "Row", width: 50, resizable: true, reorderable: true },
    ...header.map(h => {
      return {
        columnId: h,
        // width: 100,
        resizable: true,
        reorderable: true
      };
    })
  ];
  const [columns, setColumns] = useState(getColumns());


  const getRows = (contentrow, columnsOrder) => {
    return [
      {
        rowId: "header",
        cells: [
          { type: "header", text: "Row" },
          ...columnsOrder.map(h => {
            return { type: "header", text: h };
          })
        ]
      },
      ...contentrow.map((row, idx) => ({
        rowId: idx,
        reorderable: true,
        cells: [
          { type: "number", value: idx + 1 },
          ...columnsOrder.map(h => {
            return { type: "text", text: row[h] == undefined ? "" : row[h] };
          })
        ]
      }))
    ]
  }
    // const rows = getRows(tableContent, header);
    const rows = getRows(tableContent, columns.slice(1).map(c => c.columnId));


  const handleChanges = changes => {
    setTableContent(prevPeople => applyChanges(changes, prevPeople));
    console.log("tableContent: ", tableContent);
  };

  

  const handleContextMenu = (
    selectedRowIds,
    selectedColIds,
    selectionMode,
    menuOptions
  ) => {
    if (selectionMode === "row") {
      menuOptions = [
        ...menuOptions,
        {
          id: "removeRow",
          label: "Remove Row",
          handler: () => {
            setTableContent(prevPeople => {
              return [...prevPeople.filter((person, idx) => !selectedRowIds.includes(idx))]
            })
          }
        },
        {
          id: "addRow",
          label: "Insert Row",
          handler: () => {
            console.log('selectedRowIds', Math.max(selectedRowIds))
            // console.log('selectedRowIds', Math.max(selectedRowIds) - Math.min(selectedRowIds))
            setTableContent(prevPeople => {
              return [...prevPeople.filter((person, idx) => idx < Math.min(...selectedRowIds)),
                // ...makeEmptyRows(prevPeople,  1),
                ...makeEmptyRows(prevPeople, Math.max(...selectedRowIds) - Math.min(...selectedRowIds) + 1, header),
                ...prevPeople.filter((person, idx) => idx >= Math.min(...selectedRowIds))
              ]
            })
          }
        },]
      }
    //   if (selectionMode === "column") {
    //     menuOptions = [
    //       ...menuOptions,
    //     {
    //       id: "removeCol",
    //       label: "Remove Column",
    //       handler: () => {
    //         setColumns(prevCols => prevCols.filter(c => !selectedColIds.includes(c.columnId) ))
    //         setTableContent(prevPeople => {
    //           console.log("selectedColumnIds: ", selectedColIds)
    //           return prevPeople.map(c => {
    //             delete c[selectedColIds[0]]
    //             return c
    //           })
    //         })
    //       }
    //     },

    //   ];
    // }
    return menuOptions;
  }

  // console.log("rows: ", rows)
  // console.log("colums: ", columns)
  // console.log("tableContent: ", tableContent)


  const handleColumnsReorder = (targetColumnId, columnIds) => {
    const to = columns.findIndex(column => column.columnId === targetColumnId);
    const columnIdxs = columnIds.map(columnId =>
      columns.findIndex(c => c.columnId === columnId)
    );
    setColumns(prevColumns => reorderArray(prevColumns, columnIdxs, to));
    console.log("columns: ", columns);
  };
  

  const handleRowsReorder = (targetRowId, rowIds) => {
    setTableContent(prevPeople => 
      reorderArray(prevPeople, rowIds, targetRowId))
    console.log("row switched: ", tableContent)
  };


  
  useEffect( 
    () => setSubmissionData(tableContent),
    [tableContent]
  )
  
  return (
    <ReactGrid
      rows={[ ...rows /* getBlankRow(addRow) */]}
      columns={columns}
      onColumnResized={(id, width) => {
        setColumns(columns =>
          columns.map(col =>
            col.columnId === id ? { ...col, width } : col
          )
        );
      }}
      onCellsChanged={handleChanges}
      onContextMenu={handleContextMenu}
      stickyLeftColumns={1}
      stickyTopRows={1}
      stickyBottomRows={1}
      enableRangeSelection
      enableColumnSelection
      enableRowSelection
    onColumnsReordered={handleColumnsReorder}
     onRowsReordered={handleRowsReorder} 
     canReorderRows={handleCanReorderRows}
    />


  );
};
export default CreateGrid;
