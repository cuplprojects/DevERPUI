import React, { useState, useMemo, useEffect } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { Select, Input, Modal, notification } from "antd";
import { useStore } from "zustand";
import themeStore from "../../../store/themeStore";
import API from "../../../CustomHooks/MasterApiHooks/api";

const { Option } = Select;

const AddPaperForm = ({ groupId, groupName, isMSSAddPaperActive }) => {

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

    // reqruied fields
    const handleAdd = async () => {
        const requiredFields = [
            "paperTitle",
            "examType",
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
                uniqueCode: manualInputs.uniqueCode || "string",
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

    const handleAddAndImport = () => {
        // handleAdd();
        notification.success({
            message: "Success",
            description: "Paper added successfully!",
            duration: 4,
        });
    };

    const renderField = (label, field, isDropdown, isDisabled = false, fixedValue = null, options = [], labelField = "name", valueField = "id") => {
        return (
            <>
                {isDropdown ? (
                    <Select
                        placeholder={`${label}`}
                        className="mb-1 w-100"
                        style={{ width: "100%" }}
                        onChange={(value) => handleManualInput({ target: { value } }, field)}
                        value={manualInputs[field]}
                        disabled={isDisabled}
                        showSearch
                        allowClear
                        mode={field === "language" ? "multiple" : undefined}
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
                        placeholder={`${label}`}
                        className="mb-1 w-100"
                        onChange={(e) => handleManualInput(e, field)}
                        value={manualInputs[field] || ""}
                        disabled={isDisabled}
                    />
                )}
            </>
        );
    };

    return (
        <Container fluid className="rounded mb-2 d-flex flex-column ">
            <Row className="d-flex align-items-center">
                <Col md={4} className="d-none">
                    {renderField("Group", "groupId", true, true, {
                        label: `${groupName} (ID: ${groupId})`,
                        value: groupId,
                    })}
                </Col>
                <Col md={1} className="d-lg-block d-md-none"></Col>
                <Col md={2}>{renderField("Course", "course", true, false, null, courses, "courseName", "courseId")}  </Col>
                <Col md={1}>{renderField("Semester*", "examType", true, false, null, examtype, "typeName", "examTypeId")}</Col>
                <Col md={3}>{renderField("Paper Title*", "paperTitle", false)}</Col>

                <Col md={2}>{renderField("Subject*", "subject", true, false, null, subject, "subjectName", "subjectId")}</Col>

                <Col md={2}>{renderField("Enter NEP Code / Paper Code", "nepCode", false)}</Col>
            </Row>
            <Row className="d-flex align-items-center">
                <Col md={1} className="d-lg-block d-md-none"></Col>
                <Col md={isMSSAddPaperActive ? 1 : 3}>{renderField("Unique Code", "uniqueCode", false)}</Col>
                <Col md={1}>{renderField("Paper Number", "paperNumber", false)}</Col>
                <Col md={1}>{renderField("Language", "language", true, false, null, language, "languages", "languageId")}</Col>
                <Col md={1}>{renderField("Duration", "duration", false)}</Col>
                <Col md={1}>{renderField("Max Marks", "maxMarks", false)}</Col>
                <Col md={1}>{renderField("Type", "type", true, false, null, type, "types", "typeId")}</Col>
                <Col md={1} className="d-flex justify-content-en">
                    <Button type="primary" className="mt- me-2 w-100" size="sm" onClick={handleAdd}>
                        Add
                    </Button>
                </Col>
                {isMSSAddPaperActive && <Col md={1} className="d-flex align-items-center">
                    <Button type="primary" className="w-100" size="sm"
                    onClick={handleAddAndImport}>
                        Add & Import
                    </Button>
                </Col>}
                <Col md={isMSSAddPaperActive ? 2 : 1}>
                    <Button type="primary" variant="danger" className="w-100" size="sm" onClick={handleClear}>
                        Clear
                    </Button>
                </Col>
            </Row>
        </Container>
    );
};

export default AddPaperForm;
