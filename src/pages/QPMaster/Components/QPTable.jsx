import React from "react";
import { Row, Col } from "react-bootstrap";
import { FaHome } from "react-icons/fa";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import themeStore from "./../../../store/themeStore";
import { useStore } from "zustand";
import { useMemo } from "react";
import "./QPTable.css";
import { decrypt, encrypt } from "./../../../Security/Security";

const QPTable = ({ filters, qpData, setShowTable }) => {
  const themeState = useStore(themeStore);
  const cssClasses = useMemo(() => themeState.getCssClasses(), [themeState]);
  // console.log("Filters passed ->", filters);
  const [
    customDark,
    customMid,
    customLight,
    customBtn,
    customDarkText,
    customLightText,
    customLightBorder,
    customDarkBorder,
  ] = cssClasses;

  const handleHomeClick = () => {
    setShowTable(false);
  };

  // Define all possible columns
  const allColumnDefs = [
    {
      headerName: "S.No.",
      field: "serialNumber",
      sortable: false,
      filter: false,
      pinned: 'left',
      valueGetter: (params) => params.node.rowIndex + 1,
      width: 80,
    },
    // { headerName: "QP Master ID", field: "qpMasterId", sortable: true, filter: true },
    {
      headerName: "Group Name",
      field: "groupName",
      sortable: true,
      filter: true,
    },
    { headerName: "Type", field: "type", sortable: true, filter: true },
    { headerName: "NEP Code", field: "nepCode", sortable: true, filter: true },
    {
      headerName: "Private Code",
      field: "privateCode",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Subject Name",
      field: "subjectName",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Paper Number",
      field: "paperNumber",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Paper Title",
      field: "paperTitle",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Max Marks",
      field: "maxMarks",
      sortable: true,
      filter: true,
    },
    { headerName: "Duration", field: "duration", sortable: true, filter: true },
    {
      headerName: "Course Name",
      field: "courseName",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Exam Type Name",
      field: "examTypeName",
      sortable: true,
      filter: true,
    },
  ];

  // Conditionally include columns based on applied filters
  const columnDefs = useMemo(() => {
    return allColumnDefs.filter((col) => {
      switch (col.field) {
        case "groupName":
          return !filters.groupName;
        case "type":
          return !filters.selectedTypeName;
        case "courseName":
          return !filters.selectedCourseName;
        case "examTypeName":
          return !filters.selectedExamTypeName;
        default:
          return true;
      }
    });
  }, [filters]);

  return (
    <div className="w-100">
      <Row className="">
        <Col xs={12} className="text-center position-relative">
          <h1
            className={`${customDarkText} mb-4`}
            style={{
              fontSize: "3rem",
              fontWeight: "bold",
            }}
          >
            QP-Masters
          </h1>
          <FaHome
            className="position-absolute end-0 me-2 c-pointer"
            color="blue"
            size={30}
            onClick={handleHomeClick}
            style={{ top: "50%", transform: "translateY(-50%)" }}
          />
        </Col>
      </Row>
      {qpData.length === 0 && <p>No data found for the selected filters.</p>}
      {qpData.length > 0 && (
        <div
          className="ag-theme-alpine "
          style={{ height: "60vh", width: "100%" }}
        >
          <AgGridReact
            rowData={qpData}
            columnDefs={columnDefs}
            pagination={true}
            paginationPageSize={10}
          />
        </div>
      )}
    </div>
  );
};

export default QPTable;
