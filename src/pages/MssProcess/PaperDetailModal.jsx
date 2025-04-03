import React, { useEffect, useState } from "react";
import { Modal as BootstrapModal, Button, Form, Input, DatePicker, Select, message } from "antd";
import axios from "axios";
import moment from "moment";
import API from "../../CustomHooks/MasterApiHooks/api";
import { Row, Col } from "react-bootstrap";
import Modal from 'react-bootstrap/Modal';

const { Option } = Select;

const PaperDetailModal = ({ visible, item, onCancel, onImport, importing, cssClasses }) => {
  const [form] = Form.useForm();
  const [customDark, customMid, customLight, customBtn, customDarkText, customLightText, customLightBorder, customDarkBorder] = cssClasses;
  const [courses, setCourses] = useState();
  const [subject, setSubject] = useState();
  const [examType, setExamType] = useState();


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
        console.error("Error fetching courses:", error);
      }
    };

    const fetchExamType = async () => {
      try {
        const response = await API.get("/ExamType");
        setExamType(response.data);
        console.log(examType)
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchCourses();
    fetchSubject();
    fetchExamType();


    if (item) {
      console.log(item);
      // Set the form fields with the values from the item
      form.setFieldsValue({
        QPId: item.qpMasterId,
        Quantity: item.quantity ?? 0.0,
        CourseId: item.courseName ?? 0,
        SubjectId: item.subjectName ?? 0,
        CatchNo: "", // Initialize as an empty string to allow user input
        InnerEnvelope: item.innerEnvelope ?? "",
        OuterEnvelope: item.outerEnvelope ?? 0,
        PaperTitle: item.paperTitle,
        PaperNumber: item.paperNumber,
        ExamDate: item.examDate ? moment(item.examDate) : null,
        ExamTime: item.examTime ?? null,
        MaxMarks: item.maxMarks ?? 0,
        Duration: item.duration ?? null,
        LanguageId: item.languageId ?? [0],
        ExamTypeId: item.examTypeName ?? 0,
        NEPCode: item.nepCode ?? "",
        PrivateCode: item.privateCode ?? "",
      });
    }
  }, [item, form]);

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();

      const selectedCourse = courses.find(course => course.courseName === values.CourseId);
      const selectedSubject = subject.find(subject => subject.subjectName === values.SubjectId);
      const selectedExamType = examType.find((exam) => exam.examTypeId === values.ExamTypeId);


      // Format the payload according to the API's requirements
      const payload = [{
        paperTitle: values.PaperTitle,
        courseId: selectedCourse ? selectedCourse.courseId : 0,
        subjectId: selectedSubject ? selectedSubject.subjectId : 0,
        quantity: Number(values.Quantity),
        examDate: values.ExamDate ? values.ExamDate.format('YYYY-MM-DD') : null,
        examTime: values.ExamTime,
        maxMarks: Number(values.MaxMarks),
        duration: values.Duration,
        languageId: [],
        // examTypeId: selectedExamType ? selectedExamType.examTypeId : 0,
        examTypeId: selectedExamType ? selectedExamType.examTypeId : 0,
        nepCode: values.NEPCode,
        privateCode: values.PrivateCode,
        catchNo: values.CatchNo,
        innerEnvelope: values.InnerEnvelope,
        outerEnvelope: Number(values.OuterEnvelope),
        qpId: item.qpMasterId, // Ensure QPId is sent correctly
        projectId: 1, // Ensure ProjectId is sent correctly
        lotNo: "1001", // Assuming a default value for LotNo
        processId: [0], // Assuming a default value for ProcessId
        pages: 0, // Assuming a default value for Pages
        percentageCatch: 0, // Assuming a default value for PercentageCatch
        status: 0, // Assuming a default value for Status
        stopCatch: 0, // Assuming a default value for StopCatch
        mssStatus: 0, // Assuming a default value for MSSStatus
        ttfStatus: 0, // Assuming a default value for TTFStatus
      }];

      // Log the payload to inspect the data being sent
      console.log("Payload:", payload);

      // Send updated values to the server with the Authorization header
      await API.post("/QuantitySheet", payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      message.success("Data updated successfully!");
      onCancel(); // Close the modal after successful update
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
        <Modal.Title>Paper Details</Modal.Title>
      </Modal.Header>
      <Modal.Body className={`${customLight}`}>
        <Form form={form} layout="vertical">
          <Row>
            <Col md={2}>
              <Form.Item name="CatchNo" label="Catch No">
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
                      {exam.type}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>


            <Col md={6}>
              <Form.Item name="PaperTitle" label="Paper Title">
                <Input allowClear />
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col md={3}>
              <Form.Item name="SubjectId" label="Subject">
                <Input allowClear />
              </Form.Item>
            </Col>
            <Col md={3}>
              <Form.Item name="NEPCode" label="NEP Code">
                <Input allowClear />
              </Form.Item>
            </Col>
            <Col md={2}>
              <Form.Item name="PrivateCode" label="Private Code">
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
                <Select mode="multiple">
                  {/* Add options dynamically based on available languages */}
                  <Option value={0}>Default Language</Option>
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
              <Form.Item name="Quantity" label="Quantity">
                <Input type="number" allowClear />
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
          Update
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PaperDetailModal;
