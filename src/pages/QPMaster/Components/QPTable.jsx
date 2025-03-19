import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Button } from "react-bootstrap";
import { FaHome } from "react-icons/fa";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { decrypt } from "./../../../Security/Security";
import API from "../../../CustomHooks/MasterApiHooks/api";
import themeStore from "./../../../store/themeStore";
import { useStore } from "zustand";
import { useMemo } from "react";

const QPTable = ({ filters, setShowTable }) => {
  const navigate = useNavigate();
  const [qpData, setQpData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // States to control ag-Grid features
  const [enableSorting, setEnableSorting] = useState(true);
  const [enableFilter, setEnableFilter] = useState(true);

  const themeState = useStore(themeStore);
  const cssClasses = useMemo(() => themeState.getCssClasses(), [themeState]);
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

  useEffect(() => {
    const fetchQPData = async () => {
      try {
        setLoading(true);

        // Prepare the URL with query parameters
        let url = "/QPMasters/Filter?";

        // Add groupId (required)
        if (filters?.groupID) {
          url += `groupId=${decrypt(filters.groupID)}`;
        }

        // Add courseId if available
        if (filters?.selectedCourse) {
          url += `&courseId=${filters.selectedCourse}`;
        }

        // Add typeId if available
        if (filters?.selectedType) {
          url += `&typeId=${filters.selectedType}`;
        }

        // Add examTypeIds if available
        if (
          Array.isArray(filters?.selectedExamTypeId) &&
          filters.selectedExamTypeId.length > 0
        ) {
          filters.selectedExamTypeId.forEach((id) => {
            url += `&examTypeId=${id}`;
          });
        }

        // Make the API call
        const response = await API.get(url);

        if (response.status === 200) {
          setQpData(response.data);
        } else {
          throw new Error("Failed to fetch data");
        }
      } catch (err) {
        console.error("Error fetching QP data:", err);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    // Call the function if filters are available
    if (filters) {
      fetchQPData();
    }
  }, [filters]);

  const columnDefs = [
    {
      headerName: "QP Master ID",
      field: "qpMasterId",
      sortable: enableSorting,
      filter: enableFilter,
    },
    {
      headerName: "Group Name",
      field: "groupName",
      sortable: enableSorting,
      filter: enableFilter,
    },
    {
      headerName: "Type",
      field: "type",
      sortable: enableSorting,
      filter: enableFilter,
    },
    {
      headerName: "NEP Code",
      field: "nepCode",
      sortable: enableSorting,
      filter: enableFilter,
    },
    {
      headerName: "Private Code",
      field: "privateCode",
      sortable: enableSorting,
      filter: enableFilter,
    },
    {
      headerName: "Subject Name",
      field: "subjectName",
      sortable: enableSorting,
      filter: enableFilter,
    },
    {
      headerName: "Paper Number",
      field: "paperNumber",
      sortable: enableSorting,
      filter: enableFilter,
    },
    {
      headerName: "Paper Title",
      field: "paperTitle",
      sortable: enableSorting,
      filter: enableFilter,
    },
    {
      headerName: "Max Marks",
      field: "maxMarks",
      sortable: enableSorting,
      filter: enableFilter,
    },
    {
      headerName: "Duration",
      field: "duration",
      sortable: enableSorting,
      filter: enableFilter,
    },
    {
      headerName: "Course Name",
      field: "courseName",
      sortable: enableSorting,
      filter: enableFilter,
    },
    {
      headerName: "Exam Type Name",
      field: "examTypeName",
      sortable: enableSorting,
      filter: enableFilter,
    },
  ];

  return (
    <div>
      <h1
        className={`${customDarkText} mb-4`}
        style={{
          fontSize: "3rem",
          fontWeight: "bold",
          textAlign: "center",
        }}
      >
        QP-Masters
      </h1>
      <FaHome
        className="me-2 c-pointer"
        color="blue"
        size={30}
        onClick={handleHomeClick}
      />
      {loading && <p>Loading data...</p>}
      {error && <p className="text-danger">{error}</p>}

      {!loading && !error && qpData.length === 0 && (
        <p>No data found for the selected filters.</p>
      )}

      {!loading && !error && qpData.length > 0 && (
        <div
          className="ag-theme-alpine"
          style={{ height: "50vh", width: "100%" }}
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
