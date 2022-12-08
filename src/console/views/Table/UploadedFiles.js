import React, { useState, useEffect, useRef } from "react";
import { Table as BootstrapTable, Card } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { useUserAuth } from "../../../context/UserAuthContext";
import styled from "styled-components";
import AvailableTables from "./AvailableTables";

const Styles = styled.div`
  padding: 1rem;

  table {
    border-spacing: 0;
    border: 1px solid black;

    tr {
      :last-child {
        td {
          border-bottom: 0;
        }
      }
    }

    th,
    td {
      margin: 0;
      padding: 0.5rem;
      border-bottom: 1px solid black;
      border-right: 1px solid black;

      :last-child {
        border-right: 0;
      }
    }
  }

  .pagination {
    padding: 0.5rem;
  }
`;
export default function UploadedFiles() {


    // check formID is part of the list

    const { user, userData } = useUserAuth();
    return (
        <Styles>
            <AvailableTables
                userID={user.uid}
                accountType={userData.atype}
                userData={userData}
            />
        </Styles>
    )
}
