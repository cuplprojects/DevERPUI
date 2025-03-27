import React, { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { FaHome, FaSearch, FaChevronRight, FaChevronDown } from "react-icons/fa";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { useStore } from "zustand";
import { Row, Col, Button, InputGroup, Form } from "react-bootstrap";
import { Select, Tooltip } from "antd";
import AddPaperForm from "./AddPaperForm"; // Import the new component
import themeStore from "./../../../store/themeStore";
import { useNavigate } from "react-router-dom";
import { encrypt } from "../../../Security/Security"; // Assuming you have an encrypt function

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
  const [showAddPaper, setShowAddPaper] = useState(false);
  const gridRef = useRef(null);
  const navigate = useNavigate();
  const [encryptedGroupId, setEncryptedGroupId] = useState("");
  const [encryptedGroupName, setEncryptedGroupName] = useState("");

  useEffect(() => {
    if (selectedGroupId) {
      const encryptedId = encrypt(selectedGroupId.toString());
      const selectedGroup = groups.find(group => group.id === selectedGroupId);
      const encryptedName = selectedGroup ? encrypt(selectedGroup.name) : "";
      setEncryptedGroupId(encryptedId);
      setEncryptedGroupName(encryptedName);
    }
  }, [selectedGroupId, groups]);

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

  const handleImportClick = () => {
    navigate(`/Import-Paper/${encryptedGroupId}/${encryptedGroupName}`);
  };

  const onFilterTextChange = useCallback((e) => {
    const value = e.target.value;
    setGlobalFilter(value);

    if (gridRef.current && gridRef.current.api) {
      gridRef.current.api.setQuickFilter(value);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setGlobalFilter("");
    if (gridRef.current && gridRef.current.api) {
      gridRef.current.api.setQuickFilter("");
    }
  }, []);

  const columnDefs = [
    {
      headerName: "S.No.",
      field: "serialNumber",
      sortable: false,
      filter: false,
      pinned: "left",
      valueGetter: (params) => params.node.rowIndex + 1,
      width: 80,
    },
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

  return (
    <div className="w-100">
      <Row className="">
        <Col xs={12} className="text-center position-relative">
          <h1 className={`${customDarkText} mb-4`} style={{ fontSize: "3rem", fontWeight: "bold" }}>
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
      

      <Row className="mb-4">
        <Col md={2} className="d-md-none d-lg-block"></Col>
        <Col xs={12} md={3} className="mb-2">
          <Select
            className="w-100"
            placeholder="Group"  
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
        <Col xs={12} md={1} className="mb-2">
          <Select
            className="w-100"
            placeholder="Type"
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
            placeholder="Course"
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
        <Col xs={12} md={1} className="mb-2">
          <Select
            className="w-100"
            placeholder="Semester"
            value={selectedExamTypeIds.length > 0 ? selectedExamTypeIds[0] : undefined}
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
      </Row>

      <Row className="mb-4 align-items-center">
        <Col xs={12} lg={3} className="d-none d-lg-block"></Col>
        <Col xs={12} md={12} lg={6} className="text-center mb-2 mb-md-0">
          <Button variant="primary" className="me-2" size="sm" onClick={onApplyClick}>
            Search
          </Button>
          <Button variant="secondary" className="me-2" size="sm" onClick={onClearClick}>
            Clear Filters
          </Button>
          <Tooltip title={!selectedGroupId ? "Select a group first" : ""}>
            <span>
              <Button
                variant="success"
                className="me-2"
                onClick={() => setShowAddPaper(!showAddPaper)}
                disabled={!selectedGroupId} size="sm"
              >
                Add Paper {showAddPaper ? <FaChevronDown /> : <FaChevronRight />}
              </Button>
            </span>
          </Tooltip>
          <Tooltip title={!selectedGroupId ? "Select a group first" : ""}>
            <span>
              <Button
                variant="info"
                onClick={handleImportClick}
                disabled={!selectedGroupId} size="sm"
              >
                Import Paper
              </Button>
            </span>
          </Tooltip>
        </Col>
        <Col xs={12} lg={3} className="d-none d-lg-block"></Col>
      </Row>

      {showAddPaper && selectedGroupId && (
        <div className="">
          <AddPaperForm groupId={selectedGroupId} groupName={groups.find(group => group.id === selectedGroupId)?.name} />
        </div>
      )}

      {qpData.length > 0 && (
        <>
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

          <div className="ag-theme-alpine" style={{ height: "60vh", width: "100%" }}>
            <AgGridReact
              ref={gridRef}
              rowData={qpData}
              columnDefs={columnDefs}
              pagination={true}
              paginationPageSize={10}
              quickFilterText={globalFilter}
              suppressMenu={false}
              cacheQuickFilter={true}
              // useValueFormatterForExport = {true}
              suppressMultiRanges={true}
            />
          </div>
        </>
      )}
      {qpData.length === 0 && <p className="text-center">No data found for the selected filters.</p>}
    </div>
  );
};

export default QPTable;
