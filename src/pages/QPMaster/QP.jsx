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

  useEffect(() => {
    const getGroups = async () => {
      try {
        const response = await API.get("/Groups");
        setGroups(response.data);
      } catch (error) {
        console.error("Failed to fetch groups", error);
      }
    };
    getGroups();
  }, []);

  useEffect(() => {
    const getTypes = async () => {
      try {
        const response = await API.get("/PaperTypes");
        setTypes(response.data);
      } catch (error) {
        console.error("Failed to fetch types", error);
      }
    };
    getTypes();
  }, []);

  useEffect(() => {
    const getCourses = async () => {
      try {
        const response = await API.get("/Course");
        setCourses(response.data);
      } catch (error) {
        console.error("Failed to fetch courses", error);
      }
    };
    getCourses();
  }, []);

  useEffect(() => {
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
    getExamType();
  }, []);

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

  // const handleApplyClick = async () => {
  //   setLoading(true);
  //   setError(null);

  //   const filtersObj = {
  //     groupName: encrypt(selectedGroupName),
  //     groupID: encrypt(selectedGroupId),
  //     selectedType: selectedTypeId,
  //     selectedTypeName: selectedTypeName,
  //     selectedCourse: selectedCourseId,
  //     selectedCourseName: selectedCourseName,
  //     selectedExamTypeId: selectedExamTypeIds, // Array of IDs
  //     selectedExamTypeName: selectedExamTypeName, // Type Name
  //   };
  //   setFilters(filtersObj);

  //   try {
  //     let url = "/QPMasters/Filter?";

  //     // Add groupId (required)
  //     if (filtersObj.groupID) {
  //       url += `groupId=${decrypt(filtersObj.groupID)}`;
  //     }

  //     // Add courseId if available
  //     if (filtersObj.selectedCourse) {
  //       url += `&courseId=${filtersObj.selectedCourse}`;
  //     }

  //     // Add typeId if available
  //     if (filtersObj.selectedType) {
  //       url += `&typeId=${filtersObj.selectedType}`;
  //     }

  //     // Add examTypeIds if available
  //     if (
  //       Array.isArray(filtersObj.selectedExamTypeId) &&
  //       filtersObj.selectedExamTypeId.length > 0
  //     ) {
  //       filtersObj.selectedExamTypeId.forEach((id) => {
  //         url += `&examTypeId=${id}`;
  //       });
  //     }

  //     // Make the API call
  //     const response = await API.get(url);

  //     if (response.status === 200) {
  //       setQpData(response.data);
  //       if (response.data.length > 0) {
  //         setShowTable(true);
  //       } else {
  //         setError("No data found for the selected filters.");
  //       }
  //     } else {
  //       throw new Error("Failed to fetch data");
  //     }
  //   } catch (err) {
  //     console.error("Error fetching QP data:", err);
  //     setError("Failed to load data. Please try again later.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
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

  return (
    <div
      className="container-fluid d-flex justify-content-center align-items-center"
      style={{ height: "80vh" }}
    >
      {!showTable ? (
        <div
          className="d-flex flex-column align-items-center justify-content-center p-4"
          style={{
            height: "80vh",
            backgroundColor: "#e9ecef",
            borderRadius: "10px",
            width: "100%",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          }}
        >
          <h1
            className={`${customDarkText} mb-4 text-center`}
            style={{
              fontSize: "5rem", // Adjusted for responsiveness
              fontWeight: "bold",
            }}
          >
            QP-Masters
          </h1>
          <Row className="mb-3 w-50 justify-content-center">
            <Col className="d-fle justify-content-between ">
              <Select
                showSearch
                placeholder="Select Group *"
                className="m-2 w-100"
                onChange={handleGroupChange}
                value={selectedGroupId}
                allowClear
              >
                {groups.map((group) => (
                  <Option key={group.id} value={group.id}>
                    {group.name}
                  </Option>
                ))}
              </Select>
              <Select
                showSearch
                placeholder="Select Type"
                className="m-2 w-100"
                onChange={handleTypeChange}
                value={selectedTypeId}
                allowClear
                // disabled={!isGroupSelected}
              >
                {types.map((type) => (
                  <Option key={type.typeId} value={type.typeId}>
                    {type.types}
                  </Option>
                ))}
              </Select>
              <Select
                showSearch
                placeholder="Select Course"
                className="m-2 w-100"
                onChange={handleCourseChange}
                value={selectedCourseId}
                allowClear
                // disabled={!isGroupSelected}
              >
                {courses.map((course) => (
                  <Option key={course.courseId} value={course.courseId}>
                    {course.courseName}
                  </Option>
                ))}
              </Select>
              <Select
                showSearch
                placeholder="Select Semester Type"
                className="m-2 w-100"
                onChange={handleSemesterChange}
                value={selectedExamTypeName || undefined}
                allowClear
                // disabled={!isGroupSelected}
              >
                {uniqueTypes.map((type) => (
                  <Option key={type} value={type}>
                    {type}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>
          <Row className="w-100 justify-content-center">
            <Col className="d-flex justify-content-center">
              <Button
                variant="outline-primary"
                className="me-2"
                style={{ borderRadius: "5px" }}
                onClick={handleApplyClick}
              >
                Apply & View
              </Button>
              <Button
                variant="outline-secondary"
                className="me-2"
                style={{ borderRadius: "5px" }}
                onClick={handleClearClick}
              >
                Clear
              </Button>
            </Col>
          </Row>
          <Row className="w-100 justify-content-center mt-3">
            <span className={`${customDarkText} text-center fs-4 fw-bold`}>
              OR
            </span>
          </Row>
          <Row className="w-100 justify-content-center mt-3">
            <Col className="d-flex justify-content-center">
              <Tooltip
                title={!isGroupSelected ? "Please select a group first" : ""}
              >
                <span>
                  <Button
                    variant="outline-secondary"
                    style={{ borderRadius: "5px" }}
                    className="me-2"
                    onClick={handleAddClick}
                    disabled={!isGroupSelected}
                  >
                    Add
                  </Button>
                </span>
              </Tooltip>
            </Col>
          </Row>
          {loading && <p>Loading data...</p>}
          {error && <p className="text-danger">{error}</p>}
        </div>
      ) : (
        <div
          className="d-flex flex-colum justify-content-center p-4 w-100 h-100"
          style={{
            backgroundColor: "#e9ecef",
            borderRadius: "10px",
            // height: "80vh",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          }}
        >
          <QPTable
            filters={filters}
            qpData={qpData}
            setShowTable={setShowTable}
          />
        </div>
      )}
    </div>
  );
};

export default QPMiddleArea;
