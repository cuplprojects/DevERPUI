import React, { useState, useMemo, useEffect } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { Select, Input, Modal, notification } from "antd";
import "antd/dist/reset.css";
import themeStore from "./../../store/themeStore";
import { useStore } from "zustand";
import { useNavigate, useParams } from "react-router-dom";
import { FaHome } from "react-icons/fa";
import API from "../../CustomHooks/MasterApiHooks/api";
import { decrypt} from "./../../Security/Security";
import { FaFileUpload } from "react-icons/fa";
const { Option } = Select;

const ImportPage = () => {
  const { encryptedGroupId, encryptedGroupName } = useParams();
  const [groupId, setGroupId] = useState(null);
  const [groupName, setGroupName] = useState(null);

  useEffect(() => {
    const decryptGroupId = decrypt(encryptedGroupId);
    // console.log(decryptGroupId);
    const decryptGroupName = decrypt(encryptedGroupName);
    setGroupId(decryptGroupId);
    setGroupName(decryptGroupName);
  }, []);

  const navigate = useNavigate();
  const [manualInputs, setManualInputs] = useState({});
  const [courses, setCourses] = useState([]);
  const [subject, setSubject] = useState([]);
  const [examtype, setExamType] = useState([]);
  const [type, setType] = useState([]);
  const [language, setLanguage] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newOptionValue, setNewOptionValue] = useState("");
  const [selectedField, setSelectedField] = useState("");
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
    navigate("/QP-Masters");
  };

  const handleImportClick = () => {
    navigate(`/Import-Paper/${encryptedGroupId}/${encryptedGroupName}`);
  };

  const handleManualInput = (e, field) => {
    const { value } = e.target;
    setManualInputs((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getCourse = async () => {
    try {
      const response = await API.get("/Course");
      setCourses(response.data);
    } catch (error) {
      console.error("Failed to fetch courses");
    }
  };

  const getSubject = async () => {
    try {
      const response = await API.get("/Subject");
      setSubject(response.data);
    } catch (error) {
      console.error("Failed to fetch courses");
    }
  };

  const getExamType = async () => {
    try {
      const response = await API.get("/ExamType");
      setExamType(response.data);
    } catch (error) {
      console.error("Failed to fetch courses");
    }
  };

  const getLanguage = async () => {
    try {
      const response = await API.get("/Language");
      setLanguage(response.data);
    } catch (error) {
      console.error("Failed to fetch courses");
    }
  };

  const getType = async () => {
    try {
      const response = await API.get("/PaperTypes");
      setType(response.data);
    } catch (error) {
      console.error("Failed to fetch courses");
    }
  };

  useEffect(() => {
    getCourse();
    getSubject();
    getType();
    getLanguage();
    getExamType();
  }, []);
  
  useEffect(() => {
    setManualInputs((prev) => ({
      ...prev,
      groupId: groupId, // or you can use groupName if needed
    }));
  }, [groupId, groupName]);

  const renderField = (
    label,
    field,
    isDropdown,
    isDisabled = false,
    fixedValue = null,
    options = [],
    labelField = "name",
    valueField = "id"
  ) => {
    return (
      <>
        <h5 className={`mb-3 ${customDarkText}`}>{label}</h5>
        {isDropdown ? (
          <Select
            placeholder={`Select ${label}`}
            className="mb-3"
            style={{ width: "100%" }}
            onChange={(value) =>
              handleManualInput({ target: { value } }, field)
            }
            value={manualInputs[field]}
            disabled={isDisabled}
            showSearch
            mode={field === "language" ? "multiple" : undefined}
            notFoundContent={
              <>
                <div
                  className="d-flex justify-content-center align-items-center"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setSelectedField(field); // Set the field name dynamically
                    setIsModalVisible(true); // Open the modal
                  }}
                >
                  <span>+</span> Add New
                </div>
              </>
            }
            filterOption={(input, option) =>
              option.children
                ?.toString()
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          >
            {fixedValue ? (
              <Option value={fixedValue.value}>{fixedValue.label}</Option>
            ) : (
              options.map((option) => (
                <Option key={option[valueField]} value={option[valueField]}>
                  {option[labelField]} {/* Dynamic label */}
                </Option>
              ))
            )}
          </Select>
        ) : (
          <Input
            placeholder={`Enter ${label}`}
            className="mb-3"
            onChange={(e) => handleManualInput(e, field)}
            value={manualInputs[field] || ""}
            disabled={isDisabled}
          />
        )}
      </>
    );
  };

  const handleAddNewOption = async () => {
    // Prepare new data to send to the backend
    let data = {};

    // Dynamically create the data object based on selectedField
    switch (selectedField) {
      case "course":
        data = { courseName: newOptionValue }; // Assuming courseName for Course
        break;
      case "subject":
        data = { subjectName: newOptionValue }; // Assuming subjectName for Subject
        break;
      case "examType":
        data = { typeName: newOptionValue }; // Assuming typeName for ExamType
        break;
      case "language":
        data = { languages: newOptionValue }; // Assuming language for Language
        break;
      case "type":
        data = { types: newOptionValue }; // Assuming type for Type
        break;
      default:
        console.error("Unknown field type:", selectedField);
        return; // Exit early if selectedField is not recognized
    }

    try {
      const response = await API.post(`/${selectedField}`, data);
      // console.log("Upload Success:", response.data);
      setIsModalVisible(false);
      setNewOptionValue(""); // Clear input value
      fetchOptions(selectedField);
    } catch (error) {
      console.error(`Error adding ${selectedField}:`, error);
    }
  };

  const fetchOptions = (field) => {
    // Fetch options for different fields (course, subject, examType, etc.)
    if (field === "course") getCourse();
    if (field === "subject") getSubject();
    if (field === "examType") getExamType();
    if (field === "language") getLanguage();
    if (field === "paperType") getType();
  };

  const isClearDisabled = useMemo(() => {
    const keys = Object.keys(manualInputs).filter((key) => key !== "groupId");
    return !keys.some(
      (key) => manualInputs[key] && manualInputs[key].toString().trim() !== ""
    );
  }, [manualInputs]);

  const handleClear = () => {
    setManualInputs((prev) => ({
      groupId: prev.groupId, // Keep groupId intact
    }));
    notification.info({
      message: 'Form Cleared',
      description: 'All fields have been reset.',
      duration: 2,
    });
  };

  const handleAdd = async () => {
    // Basic validation
    const requiredFields = ['paperTitle', 'paperNumber', 'examType', 'maxMarks', 'duration', 'course', 'subject'];
    const missingFields = requiredFields.filter(field => !manualInputs[field]);
    
    if (missingFields.length > 0) {
      notification.error({
        message: 'Validation Error',
        description: `Please fill in the following required fields: ${missingFields.join(', ')}`,
        duration: 4,
      });
      return;
    }

    const dataToSend = [
      {
        qpMasterId: 0,
        groupId: manualInputs.groupId || 0,
        typeId: manualInputs.type || 0,
        nepCode: manualInputs.nepCode || "string",
        uniqueCode: manualInputs.uniqueCode || "string",
        subjectId: manualInputs.subject || 0,
        paperNumber: manualInputs.paperNumber || "string",
        paperTitle: manualInputs.paperTitle || "string",
        maxMarks: manualInputs.maxMarks || 0,
        duration: manualInputs.duration || "string",
        languageId: Array.isArray(manualInputs.language) ? manualInputs.language : [manualInputs.language], // Handle multiple languages
        courseId: manualInputs.course || 0,
        examTypeId: manualInputs.examType || 0,
      },
    ];

    try {
      const response = await API.post("/QPMasters", dataToSend);

      if (response.status === 200) {
        notification.success({
          message: 'Success',
          description: 'Paper added successfully!',
          duration: 4,
        });
        handleClear();
      }
    } catch (error) {
      notification.error({
        message: 'Error',
        description: error.response?.data || 'Failed to add paper. Please try again.',
        duration: 4,
      });
      handleClear();
      console.error("Error adding paper:", error);
    }
  };

  return (
    <Container
      fluid
      className={`shadow-lg d-flex flex-column justify-content-center align-items-center ${customDark === "dark-dark" ? `${customDark}` : `${customLight}`} rounded p-3`}
    >
      <Row className="w-75">
        <Col>
          <Row className="mb-3">
            <Col>
              <h1 className={`mb-4 ${customDarkText} fw-bold`}>Add Paper</h1>
            </Col>
            <Col className="d-flex justify-content-end align-items-center">
              <div className="">
                <FaHome
                  className={`me-2  c-pointer ${customDarkText} fw-bold ${customDark === "dark-dark" ? `${customLight} $` : `${customLight}`}`}
                  size={30}
                  onClick={handleHomeClick}
                />
                <Button
                  type="primary"
                  className={` ${customDark === "dark-dark" ? `${customLight} ${customLightBorder}` : `${customLight} ${customDarkBorder} ${customDarkText}`}`}
                  onClick={handleImportClick}
                >
                  <FaFileUpload className={`me-2  ${customDark === "dark-dark" ? `${customLightText}` : `${customDarkText}`}`}
                  size={30}/>
                  Import
                </Button>
              </div>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              {renderField("Group", "groupId", true, true, {
                label: `${groupName} (ID: ${groupId})`,
                value: groupId,
              })}
              {renderField("Paper Title", "paperTitle", false)}
              {renderField("Paper Number", "paperNumber", false)}
              {renderField(
                "Exam Type",
                "examType",
                true,
                false,
                null,
                examtype,
                "typeName",
                "examTypeId"
              )}
              {renderField("Max Marks", "maxMarks", false)}
              {renderField("Duration", "duration", false)}
            </Col>
            <Col md={6}>
              {renderField(
                "Course",
                "course",
                true,
                false,
                null,
                courses,
                "courseName",
                "courseId"
              )}
              {renderField(
                "Subject",
                "subject",
                true,
                false,
                null,
                subject,
                "subjectName",
                "subjectId"
              )}
              {renderField("NEP Code / Paper Code", "nepCode", false)}
              {renderField("UniqueCode", "uniqueCode", false)}
              {renderField(
                "Language",
                "language",
                true,
                false,
                null,
                language,
                "languages",
                "languageId"
              )}
              {renderField(
                "Type",
                "type",
                true,
                false,
                null,
                type,
                "types",
                "typeId"
              )}
              <Row>
                <Col md={6}>
                  <Button
                    type="primary"
                    className={`mt-3 w-100 ${customDark === "dark-dark" ? `${customLight} ${customLightBorder}` : `${customLight} ${customDarkBorder} ${customDarkText}`}`}
                    onClick={handleAdd}
                  >
                    Add
                  </Button>
                </Col>
                <Col md={6}>
                  <Button
                    type="primary"
                    className={`mt-3 w-100 ${customDark === "dark-dark" ? `${customLight} ${customLightBorder}` : `${customLight} ${customDarkBorder} ${customDarkText}`}`}
                    onClick={handleClear}
                    disabled={isClearDisabled}
                  >
                    Clear
                  </Button>
                </Col>
              </Row>
            </Col>
          </Row>
        </Col>
      </Row>
      <Modal
        title={`Add New ${selectedField}`}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleAddNewOption}
      >
        <Input
          placeholder={`Enter new ${selectedField}`}
          value={newOptionValue}
          onChange={(e) => setNewOptionValue(e.target.value)}
        />
      </Modal>
    </Container>
  );
};

export default ImportPage;
