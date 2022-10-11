import React from "react";
import {
  CellTemplate,
  Uncertain,
  Compatible,
  Cell,
  CellStyle,
  keyCodes
} from "@silevis/reactgrid";

// export interface ButtonCell extends Cell {
//   type: "button";
//   text: string;
//   onClick: () => void;
// }

// const blankFunction = () => {};

// export const ButtonCellTemplate: CellTemplate<ButtonCell> = {
//   getCompatibleCell(
//     uncertainCell: Uncertain<ButtonCell>
//   ): Compatible<ButtonCell> {
//     return {
//       ...uncertainCell,
//       text: uncertainCell.text || "",
//       value: 0,
//       onClick: uncertainCell.onClick || blankFunction
//     };
//   },
//   handleKeyDown(cell: Compatible<ButtonCell>, keyCode: number) {
//     if (keyCode === keyCodes.ENTER) {
//       cell.onClick();
//     }
//     return { cell, enableEditMode: false };
//   },
//   render(cell: Compatible<ButtonCell>): React.ReactNode {
//     return (
//       <button
//         className={cell.className}
//         onPointerDown={e => e.stopPropagation()}
//         onClick={cell.onClick}
//       >
//         {cell.text}
//       </button>
//     );
//   }
// };

export const getButtonCell = (text, onClick, style, className) => ({
  // type: "button",
  text,
  style,
  onClick,
  className
});

const transparentBorder = { color: "rgba(0,0,0,0.25)" };
const transparentBorderStyle = {
  border: {
    top: transparentBorder,
    right: transparentBorder,
    bottom: transparentBorder
  }
};

export const getTextCell = text => ({ type: "text", text: text || "" });

export const getHeaderCell = (text, background) => ({
  type: "header",
  text: text || "",
  style: { background, ...transparentBorderStyle }
});

export const getBlankRow = (onPressButton, id) => ({
  rowId: id,
  // height,
  cells: [
    getButtonCell("+", onPressButton, {}, "add-row-button"),
    { type: "date", date: undefined, className: "date-cell" },
    getTextCell(""),
    { type: "number", value: 0, nanToZero: true, hideZero: true },
    // getDropdownCell("", projects, false, {}, "dropdown-cell"),
    getTextCell("")
  ]
});
