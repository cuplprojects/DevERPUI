import React from "react";
import { FaHome, FaSearch } from "react-icons/fa";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import themeStore from "./../../../store/themeStore";
import { useStore } from "zustand";
import { useMemo, useState, useCallback, useRef } from "react";
import "./QPTable.css";
import { decrypt, encrypt } from "./../../../Security/Security";
import { Row, Col, Button, InputGroup, Form } from "react-bootstrap";
import { Select } from "antd";

const { Option } = Select;

const QPTable = ({
  filters,
  qpData,
  setShowTable,
  groups,
  types,
  courses,
  examType,
  uniqueTypes,
  selectedGroupId,
  selectedTypeId,
  selectedCourseId,
  selectedExamTypeIds,
  onGroupChange,
  onTypeChange,
  onCourseChange,
  onSemesterChange,
  onApplyClick,
  onClearClick,
}) => {
  const themeState = useStore(themeStore);
  const cssClasses = useMemo(() => themeState.getCssClasses(), [themeState]);
  const [globalFilter, setGlobalFilter] = useState("");
  const gridRef = useRef(null);
  
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

  //Button Click Actions
  const handleHomeClick = () => {
    setShowTable(false);
  };

  // Global search handler
  const onFilterTextChange = useCallback((e) => {
    const value = e.target.value;
    setGlobalFilter(value);
    
    if (gridRef.current && gridRef.current.api) {
      gridRef.current.api.setQuickFilter(value);
    }
  }, []);

  // Clear search field
  const clearSearch = useCallback(() => {
    setGlobalFilter("");
    if (gridRef.current && gridRef.current.api) {
      gridRef.current.api.setQuickFilter("");
    }
  }, []);

  // Define all possible columns
  const allColumnDefs = [
    {
      headerName: "S.No.",
      field: "serialNumber",
      sortable: false,
      filter: false,
      pinned: "left",
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

      {/* Filters Section */}
      <Row className="mb-4">
        <Col xs={12} md={3} className="mb-2">
          <Select
            className="w-100"
            placeholder="Select Group"
            value={selectedGroupId}
            onChange={onGroupChange}
            allowClear
          >
            {groups.map((group) => (
              <Option key={group.id} value={group.id}>
                {group.name}
              </Option>
            ))}
          </Select>
        </Col>
        <Col xs={12} md={3} className="mb-2">
          <Select
            className="w-100"
            placeholder="Select Type"
            value={selectedTypeId}
            onChange={onTypeChange}
            allowClear
          >
            {types.map((type) => (
              <Option key={type.typeId} value={type.typeId}>
                {type.types}
              </Option>
            ))}
          </Select>
        </Col>
        <Col xs={12} md={3} className="mb-2">
          <Select
            className="w-100"
            placeholder="Select Course"
            value={selectedCourseId}
            onChange={onCourseChange}
            allowClear
          >
            {courses.map((course) => (
              <Option key={course.courseId} value={course.courseId}>
                {course.courseName}
              </Option>
            ))}
          </Select>
        </Col>
        <Col xs={12} md={3} className="mb-2">
          <Select
            className="w-100"
            placeholder="Select Semester"
            value={
              selectedExamTypeIds.length > 0
                ? selectedExamTypeIds[0]
                : undefined
            }
            onChange={onSemesterChange}
            allowClear
          >
            {uniqueTypes.map((type) => (
              <Option key={type} value={type}>
                {type}
              </Option>
            ))}
          </Select>
        </Col>
        <Col xs={12} className="text-center mt-3">
          <Button variant="primary" className="me-2" onClick={onApplyClick}>
            Apply Filters
          </Button>
          <Button variant="secondary" onClick={onClearClick}>
            Clear Filters
          </Button>
        </Col>
      </Row>

      {qpData.length > 0 && (
        <>
          {/* Global Search Bar */}
          <Row className="mb-3">
            <Col xs={12} md={6} lg={4} className="mx-auto">
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search across all columns..."
                  value={globalFilter}
                  onChange={onFilterTextChange}
                  aria-label="Global search"
                />
                {globalFilter && (
                  <Button variant="outline-secondary" onClick={clearSearch}>
                    Clear
                  </Button>
                )}
              </InputGroup>
            </Col>
          </Row>

          <div
            className="ag-theme-alpine"
            style={{ height: "60vh", width: "100%" }}
          >
            <AgGridReact
              ref={gridRef}
              rowData={qpData}
              columnDefs={columnDefs}
              pagination={true}
              paginationPageSize={10}
              quickFilterText={globalFilter}
              suppressMenu={false}
              cacheQuickFilter={true}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default QPTable;