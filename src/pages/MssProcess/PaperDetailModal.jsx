import React, { useEffect, useState } from "react";
import {
  Modal as BootstrapModal,
  Button,
  Form,
  Input,
  DatePicker,
  Select,
  message,
} from "antd";
import axios from "axios";
import moment from "moment";
import API from "../../CustomHooks/MasterApiHooks/api";
import { Row, Col } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";

const { Option } = Select;

const PaperDetailModal = ({
  visible,
  item,
  onCancel,
  importing,
  cssClasses,
  projectId,
  fetchQuantitySheetData,
  setSearchTerm
}) => {
  const [form] = Form.useForm();
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
  const [courses, setCourses] = useState();
  const [subject, setSubject] = useState();
  const [examType, setExamType] = useState();
  const [language, setLanguage] = useState();

  // console.log(item);
  // console.log(importing)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await API.get("/Course");
        setCourses(response.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    const fetchSubject = async () => {
      try {
        const response = await API.get("/Subject");
        setSubject(response.data);
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    };

    const fetchExamType = async () => {
      try {
        const response = await API.get("/ExamType");
        setExamType(response.data);
        // console.log(examType)
      } catch (error) {
        console.error("Error fetching examtype:", error);
      }
    };

    const fetchLanguage = async () => {
      try {
        const response = await API.get("/Language");
        setLanguage(response.data);
        // console.log(language)
      } catch (error) {
        console.error("Error fetching Languages:", error);
      }
    };

    fetchCourses();
    fetchSubject();
    fetchExamType();
    fetchLanguage();

    if (item) {
       console.log(item);
      form.setFieldsValue({
        QPId: item.qpMasterId,
        Quantity: item.quantity ?? 0.0,
        CourseId: item.courseName ?? 0,
        SubjectId: item.subjectId ?? 0,
        CatchNo: "", // Initialize as an empty string to allow user input
        InnerEnvelope: item.innerEnvelope ?? "",
        OuterEnvelope: item.outerEnvelope ?? 0,
        PaperTitle: item.paperTitle,
        PaperNumber: item.paperNumber,
        ExamDate: item.examDate ? moment(item.examDate) : null,
        ExamTime: item.examTime ?? null,
        MaxMarks: item.MaxMarks ?? 0,
        Duration: item.duration ?? null,
        LanguageId: item.languageIds ?? [],
        ExamTypeId: item.examTypeName ?? 0,
        NEPCode: item.nepCode ?? "",
        UniqueCode: item.uniqueCode ?? "",
        StructureOfPaper: item.structureOfPaper ?? "", // Set default value for StructureOfPaper
      });
    }
  }, [item, form]);

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
console.log(values)
      const selectedCourse = courses.find(
        (course) => course.courseName === values.CourseId
      );
      const selectedExamType = examType.find(
        (exam) => exam.examTypeId === values.ExamTypeId
      );
      const selectedLanguages = values.LanguageId?.length
        ? values.LanguageId
        : [0];

      // Format the payload according to the API's requirements
      const finalPayload = [
        {
          paperNumber: values.PaperNumber || "",
          paperTitle: values.PaperTitle || "",
          courseId: selectedCourse ? selectedCourse.courseId : 0,
          subjectId: values.SubjectId || 0,
          quantity: Number(values.Quantity) || 0,
          examDate: values.ExamDate ? values.ExamDate.format("DD-MM-YYYY") : "",
          examTime: values.ExamTime || "",
          maxMarks: Number(values.MaxMarks) || 0,
          duration: values.Duration || "",
          languageId: selectedLanguages,
          examTypeId: selectedExamType ? selectedExamType.examTypeId : 0,
          nepCode: values.NEPCode || "",
          uniqueCode: values.UniqueCode || "",
          catchNo: values.CatchNo || 0,
          innerEnvelope: values.InnerEnvelope || "",
          outerEnvelope: Number(values.OuterEnvelope) || 0,
          qpId: item.qpMasterId || 0,
          projectId: projectId,
          lotNo: "51",
          processId: [0],
          pages: 0,
          percentageCatch: 0,
          status: 0,
          stopCatch: 0,
          mssStatus: 1,
          ttfStatus: 0,
          structureOfPaper: values.StructureOfPaper || "",
        },
      ];

      // Log the payload to inspect the data being sent
      console.log("Payload:", finalPayload);

      // Send updated values to the server with the Authorization header
      await API.post("/QuantitySheet", finalPayload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      message.success("Data updated successfully!");
      onCancel(); // Close the modal after successful update
      fetchQuantitySheetData();
      setSearchTerm(null);
    } catch (error) {
      console.error("Error updating data:", error);
      message.error("Failed to update data.");
    }
  };

  if (!item) {
    return null; // Don't render the modal if item is null
  }

  return (
    <Modal show={visible} onHide={onCancel} size="lg">
      <Modal.Header className={`${customDark} ${customLightText}`}>
        <Modal.Title className="text-center">{item.paperTitle}</Modal.Title>
      </Modal.Header>
      <Modal.Body className={`${customLight}`}>
        <Form form={form} layout="vertical">
          <Row>
            <Col md={2}>
              <Form.Item name="CatchNo" label="Catch No" required>
                <Input allowClear />
              </Form.Item>
            </Col>
            <Col md={2}>
              <Form.Item name="CourseId" label="Course">
                <Select allowClear>
                  {courses.map((course) => (
                    <Option key={course.courseId} value={course.courseName}>
                      {course.courseName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col md={2}>
              <Form.Item name="ExamTypeId" label="Semester">
                <Select allowClear>
                  {examType?.map((exam) => (
                    <Option key={exam.examTypeId} value={exam.examTypeId}>
                      {exam.typeName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col md={4}>
              <Form.Item name="PaperTitle" label="Paper Title">
                <Input allowClear />
              </Form.Item>
            </Col>
            <Col md={2}>
              <Form.Item name="PaperNumber" label="Paper #">
                <Input allowClear />
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col md={3}>
              <Form.Item name="SubjectId" label="Subject">
                <Select
                  allowClear
                  onChange={(value) => {
                    form.setFieldsValue({ SubjectId: value });
                  }}
                >
                  {subject?.map((subj) => (
                    <Option key={subj.subjectId} value={subj.subjectId}>
                      {subj.subjectName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col md={3}>
              <Form.Item name="NEPCode" label="NEP Code">
                <Input allowClear />
              </Form.Item>
            </Col>
            <Col md={2}>
              <Form.Item name="UniqueCode" label="Unique Code">
                <Input allowClear />
              </Form.Item>
            </Col>
            <Col md={2}>
              <Form.Item name="Duration" label="Duration">
                <Input />
              </Form.Item>
            </Col>
            <Col md={2}>
              <Form.Item name="MaxMarks" label="Max Marks">
                <Input type="number" allowClear />
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col md={3}>
              <Form.Item name="ExamDate" label="Exam Date">
                <DatePicker allowClear />
              </Form.Item>
            </Col>
            <Col md={3}>
              <Form.Item name="ExamTime" label="Exam Time">
                <Input allowClear />
              </Form.Item>
            </Col>
            <Col md={6}>
              <Form.Item name="LanguageId" label="Language">
                <Select mode="multiple" allowClear>
                  {/* <Option key={0} value={0}>Default Language</Option> */}
                  {language?.map((lang) => (
                    <Option key={lang.languageId} value={lang.languageId}>
                      {lang.languages}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col md={4}>
              <Form.Item name="InnerEnvelope" label="Inner Envelope">
                <Input allowClear />
              </Form.Item>
            </Col>
            <Col md={4}>
              <Form.Item name="OuterEnvelope" label="Outer Envelope">
                <Input type="number" allowClear />
              </Form.Item>
            </Col>
            <Col md={4}>
              <Form.Item name="Quantity" label="Quantity" required>
                <Input type="number" allowClear />
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Form.Item name="StructureOfPaper" label="Structure of Paper">
                <Input.TextArea rows={2} allowClear />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer className={`${customDark}`}>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleUpdate}
          disabled={importing === item.qpMasterId}
        >
          Import
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PaperDetailModal;
