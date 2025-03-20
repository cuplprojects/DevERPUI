import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { Select, Tooltip } from "antd";
import "antd/dist/reset.css";
import themeStore from "./../../store/themeStore";
import { useStore } from "zustand";
import API from "../../CustomHooks/MasterApiHooks/api";
import QPTable from "./Components/QPTable";
import { decrypt, encrypt } from "./../../Security/Security";

const { Option } = Select;

const QPMiddleArea = () => {
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [isGroupSelected, setIsGroupSelected] = useState(false);
  const [selectedGroupName, setSelectedGroupName] = useState("");

  const [types, setTypes] = useState([]);
  const [selectedTypeId, setSelectedTypeId] = useState(null);
  const [selectedTypeName, setSelectedTypeName] = useState("");

  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [selectedCourseName, setSelectedCourseName] = useState("");

  const [examType, setExamType] = useState([]);
  const [uniqueTypes, setUniqueTypes] = useState([]);
  const [selectedExamTypeIds, setSelectedExamTypeIds] = useState([]);
  const [selectedExamTypeName, setSelectedExamTypeName] = useState("");

  const [showTable, setShowTable] = useState(false);
  const [filters, setFilters] = useState({});
  const [qpData, setQpData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  //Get Data Funtion Calls
  useEffect(() => {
    getGroups();
    getTypes();
    getExamType();
    getCourses();
  }, []);

  //Get Filters
  const getGroups = async () => {
    try {
      const response = await API.get("/Groups");
      setGroups(response.data);
    } catch (error) {
      console.error("Failed to fetch groups", error);
    }
  };
  const getTypes = async () => {
    try {
      const response = await API.get("/PaperTypes");
      setTypes(response.data);
    } catch (error) {
      console.error("Failed to fetch types", error);
    }
  };
  const getCourses = async () => {
    try {
      const response = await API.get("/Course");
      setCourses(response.data);
    } catch (error) {
      console.error("Failed to fetch courses", error);
    }
  };
  const getExamType = async () => {
    try {
      const response = await API.get("/ExamType");
      const apiData = response.data;
      setExamType(apiData);
      // Extract unique types
      const typesSet = new Set(apiData.map((item) => item.type));
      setUniqueTypes([...typesSet]);
    } catch (error) {
      console.error("Failed to fetch exam types", error);
    }
  };

  //Change in Filters
  const handleGroupChange = (value) => {
    const selectedGroup = groups.find((group) => group.id === value);
    setSelectedGroupId(value);
    setSelectedGroupName(selectedGroup ? selectedGroup.name : "");
    setIsGroupSelected(true);
  };
  const handleTypeChange = (value) => {
    setSelectedTypeId(value);
  };
  const handleCourseChange = (value) => {
    const selectedCourse = courses.find((course) => course.courseId === value);
    setSelectedCourseId(value);
    setSelectedCourseName(selectedCourse ? selectedCourse.courseName : "");
  };
  const handleSemesterChange = (type) => {
    const matching = examType.filter((item) => item.type === type);
    const ids = matching.map((item) => item.examTypeId);
    setSelectedExamTypeIds(ids); // Array of ids
    setSelectedExamTypeName(type);
  };

  //Button Click Actions
  const handleApplyClick = async () => {
    setLoading(true);
    setError(null);

    const filtersObj = {
      groupName: selectedGroupName ? encrypt(selectedGroupName) : null,
      groupID: selectedGroupId ? encrypt(selectedGroupId) : null,
      selectedType: selectedTypeId,
      selectedTypeName: selectedTypeName,
      selectedCourse: selectedCourseId,
      selectedCourseName: selectedCourseName,
      selectedExamTypeId: selectedExamTypeIds, // Array of IDs
      selectedExamTypeName: selectedExamTypeName, // Type Name
    };
    setFilters(filtersObj);

    try {
      let url = "/QPMasters/Filter?";
      let hasFilters = false;

      // Add groupId if available
      if (filtersObj.groupID) {
        url += `groupId=${decrypt(filtersObj.groupID)}`;
        hasFilters = true;
      }

      // Add courseId if available
      if (filtersObj.selectedCourse) {
        url += `${hasFilters ? "&" : ""}courseId=${filtersObj.selectedCourse}`;
        hasFilters = true;
      }

      // Add typeId if available
      if (filtersObj.selectedType) {
        url += `${hasFilters ? "&" : ""}typeId=${filtersObj.selectedType}`;
        hasFilters = true;
      }

      // Add examTypeIds if available
      if (
        Array.isArray(filtersObj.selectedExamTypeId) &&
        filtersObj.selectedExamTypeId.length > 0
      ) {
        filtersObj.selectedExamTypeId.forEach((id) => {
          url += `${hasFilters ? "&" : ""}examTypeId=${id}`;
          hasFilters = true;
        });
      }

      // Make the API call
      const response = await API.get(url);

      if (response.status === 200) {
        setQpData(response.data);
        if (response.data.length > 0) {
          setShowTable(true);
        } else {
          setError("No data found for the selected filters.");
        }
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
  const handleAddClick = () => {
    const encryptedGroupId = encrypt(selectedGroupId);
    const encryptedGroupName = encrypt(selectedGroupName);
    navigate(`/Add-Paper/${encryptedGroupId}/${encryptedGroupName}`);
  };
  const handleClearClick = () => {
    setSelectedGroupId(null);
    setSelectedGroupName("");
    setIsGroupSelected(false);
    setSelectedTypeId(null);
    setSelectedTypeName("");
    setSelectedCourseId(null);
    setSelectedCourseName("");
    setSelectedExamTypeIds([]);
    setSelectedExamTypeName("");
    setFilters({});
    setShowTable(false);
  };

  return (
    <div className={`${customLight} p-4 w-100`}>
      {!showTable ? (
        <div>
          <Row className="mb-4">
            <Col xs={12} className="text-center">
              <h1
                className={`${customDarkText}`}
                style={{
                  fontSize: "3rem",
                  fontWeight: "bold",
                }}
              >
                QP-Masters
              </h1>
            </Col>
          </Row>

          <Row className="mb-4 w-100">
            <Col xs={12} md={3} lg={3} className="mb-2">
              <Select
                className="w-100"
                placeholder="Select Group"
                value={selectedGroupId}
                onChange={handleGroupChange}
              >
                {groups.map((group) => (
                  <Option key={group.id} value={group.id}>
                    {group.name}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={12} md={3} lg={3} className="mb-2">
              <Select
                className="w-100"
                placeholder="Select Type"
                value={selectedTypeId}
                onChange={handleTypeChange}
              >
                {types.map((type) => (
                  <Option key={type.typeId} value={type.typeId}>
                    {type.types}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={12} md={3} lg={3} className="mb-2">
              <Select
                className="w-100"
                placeholder="Select Course"
                value={selectedCourseId}
                onChange={handleCourseChange}
              >
                {courses.map((course) => (
                  <Option key={course.courseId} value={course.courseId}>
                    {course.courseName}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={12} md={3} lg={3} className="mb-2">
              <Select
                className="w-100"
                placeholder="Select Semester Type"
                value={selectedExamTypeName || undefined}
                onChange={handleSemesterChange}
              >
                {uniqueTypes.map((type) => (
                  <Option key={type} value={type}>
                    {type}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col xs={12} className="text-center">
              <Button
                variant="primary"
                className="me-2"
                onClick={handleApplyClick}
                disabled={loading}
              >
                {selectedGroupId ||
                selectedGroupName ||
                selectedTypeId ||
                selectedCourseId ||
                selectedExamTypeIds.length > 0
                  ? "Apply & View"
                  : "View All"}
              </Button>

              <Button variant="secondary" onClick={handleClearClick}>
                Clear Filters
              </Button>
            </Col>
          </Row>
          <Row>
            <Col
              xs={12}
              className={`text-center fw-bold fs-4 ${customDarkText}`}
            >
              OR
            </Col>
          </Row>
          <Row className="mb-4">
            <Col xs={12} className="text-center">
              <Button
                variant="success"
                className="ms-2"
                onClick={handleAddClick}
              >
                Add Paper
              </Button>
            </Col>
          </Row>

          {error && (
            <Row>
              <Col xs={12} className="text-center text-danger">
                {error}
              </Col>
            </Row>
          )}
        </div>
      ) : (
        <QPTable
          filters={filters}
          qpData={qpData}
          setShowTable={setShowTable}
          groups={groups}
          types={types}
          courses={courses}
          examType={examType}
          uniqueTypes={uniqueTypes}
          selectedGroupId={selectedGroupId}
          selectedTypeId={selectedTypeId}
          selectedCourseId={selectedCourseId}
          selectedExamTypeIds={selectedExamTypeIds}
          onGroupChange={handleGroupChange}
          onTypeChange={handleTypeChange}
          onCourseChange={handleCourseChange}
          onSemesterChange={handleSemesterChange}
          onApplyClick={handleApplyClick}
          onClearClick={handleClearClick}
        />
      )}
    </div>
  );
};

export default QPMiddleArea;
