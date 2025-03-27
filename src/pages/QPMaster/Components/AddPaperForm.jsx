import React, { useState, useMemo, useEffect } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { Select, Input, Modal, notification } from "antd";
import { useStore } from "zustand";
import { FaFileUpload } from "react-icons/fa";
import themeStore from "../../../store/themeStore";
import API from "../../../CustomHooks/MasterApiHooks/api";

const { Option } = Select;

const AddPaperForm = ({ groupId, groupName }) => {
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

  const fetchOptions = (field) => {
    if (field === "course") getCourse();
    if (field === "subject") getSubject();
    if (field === "examType") getExamType();
    if (field === "language") getLanguage();
    if (field === "paperType") getType();
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
      console.error("Failed to fetch subjects");
    }
  };

  const getExamType = async () => {
    try {
      const response = await API.get("/ExamType");
      setExamType(response.data);
    } catch (error) {
      console.error("Failed to fetch exam types");
    }
  };

  const getLanguage = async () => {
    try {
      const response = await API.get("/Language");
      setLanguage(response.data);
    } catch (error) {
      console.error("Failed to fetch languages");
    }
  };

  const getType = async () => {
    try {
      const response = await API.get("/PaperTypes");
      setType(response.data);
    } catch (error) {
      console.error("Failed to fetch paper types");
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
      groupId: groupId,
    }));
  }, [groupId]);

  const handleManualInput = (e, field) => {
    const { value } = e.target;
    setManualInputs((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddNewOption = async () => {
    let data = {};
    switch (selectedField) {
      case "course":
        data = { courseName: newOptionValue };
        break;
      case "subject":
        data = { subjectName: newOptionValue };
        break;
      case "examType":
        data = { typeName: newOptionValue };
        break;
      case "language":
        data = { languages: newOptionValue };
        break;
      case "type":
        data = { types: newOptionValue };
        break;
      default:
        console.error("Unknown field type:", selectedField);
        return;
    }

    try {
      const response = await API.post(`/${selectedField}`, data);
      setIsModalVisible(false);
      setNewOptionValue("");
      fetchOptions(selectedField);
    } catch (error) {
      console.error(`Error adding ${selectedField}:`, error);
    }
  };

  const handleAdd = async () => {
    const requiredFields = [
      "paperTitle",
      "paperNumber",
      "examType",
      "maxMarks",
      "duration",
      "course",
      "subject",
    ];
    const missingFields = requiredFields.filter((field) => !manualInputs[field]);

    if (missingFields.length > 0) {
      notification.error({
        message: "Validation Error",
        description: `Please fill in the following required fields: ${missingFields.join(", ")}`,
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
        privateCode: manualInputs.courseCode || "string",
        subjectId: manualInputs.subject || 0,
        paperNumber: manualInputs.paperNumber || "string",
        paperTitle: manualInputs.paperTitle || "string",
        maxMarks: manualInputs.maxMarks || 0,
        duration: manualInputs.duration || "string",
        languageId: Array.isArray(manualInputs.language)
          ? manualInputs.language
          : [manualInputs.language],
        courseId: manualInputs.course || 0,
        examTypeId: manualInputs.examType || 0,
      },
    ];

    try {
      const response = await API.post("/QPMasters", dataToSend);
      if (response.status === 200) {
        notification.success({
          message: "Success",
          description: "Paper added successfully!",
          duration: 4,
        });
        handleClear();
      }
    } catch (error) {
      notification.error({
        message: "Error",
        description: error.response?.data?.message || "Failed to add paper. Please try again.",
        duration: 4,
      });
      console.error("Error adding paper:", error);
    }
  };

  const handleClear = () => {
    setManualInputs((prev) => ({
      groupId: prev.groupId,
    }));
    notification.info({
      message: "Form Cleared",
      description: "All fields have been reset.",
      duration: 2,
    });
  };

  const renderField = (label, field, isDropdown, isDisabled = false, fixedValue = null, options = [], labelField = "name", valueField = "id") => {
    return (
      <>
        <h5 className={`mb-3 ${cssClasses[5]}`}>{label}</h5>
        {isDropdown ? (
          <Select
            placeholder={`Select ${label}`}
            className="mb-3"
            style={{ width: "100%" }}
            onChange={(value) => handleManualInput({ target: { value } }, field)}
            value={manualInputs[field]}
            disabled={isDisabled}
            showSearch
            mode={field === "language" ? "multiple" : undefined}
            notFoundContent={
              <div
                className="d-flex justify-content-center align-items-center"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setSelectedField(field);
                  setIsModalVisible(true);
                }}
              >
                <span>+</span> Add New
              </div>
            }
            filterOption={(input, option) =>
              option.children?.toString().toLowerCase().includes(input.toLowerCase())
            }
          >
            {fixedValue ? (
              <Option value={fixedValue.value}>{fixedValue.label}</Option>
            ) : (
              options.map((option) => (
                <Option key={option[valueField]} value={option[valueField]}>
                  {option[labelField]}
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

  return (
    <Container fluid className="mt-3">
      <Row>
        <Col md={6}>
          {renderField("Group", "groupId", true, true, {
            label: `${groupName} (ID: ${groupId})`,
            value: groupId,
          })}
          {renderField("Paper Title", "paperTitle", false)}
          {renderField("Paper Number", "paperNumber", false)}
          {renderField("Exam Type", "examType", true, false, null, examtype, "typeName", "examTypeId")}
          {renderField("Max Marks", "maxMarks", false)}
          {renderField("Duration", "duration", false)}
        </Col>
        <Col md={6}>
          {renderField("Course", "course", true, false, null, courses, "courseName", "courseId")}
          {renderField("Subject", "subject", true, false, null, subject, "subjectName", "subjectId")}
          {renderField("NEP Code / Paper Code", "nepCode", false)}
          {renderField("Course Code / Private Code", "courseCode", false)}
          {renderField("Language", "language", true, false, null, language, "languages", "languageId")}
          {renderField("Type", "type", true, false, null, type, "types", "typeId")}
          <Row>
            <Col md={6}>
              <Button type="primary" className="mt-3 w-100" onClick={handleAdd}>
                Add
              </Button>
            </Col>
            <Col md={6}>
              <Button type="primary" className="mt-3 w-100" onClick={handleClear}>
                Clear
              </Button>
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

export default AddPaperForm;
