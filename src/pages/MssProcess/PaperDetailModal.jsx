


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

const structureTemplates = {
  1: `B.A./B.Com./B.Sc./B.H.Sc./BBA/BSC/BTM(First Year)
Examination, March-2025
Open Elective
Paper: S1-COAP2G
M.S. Office

Section-A
Very Short Answer Type Questions
Attempt any three out of six questions  (3*2=6)
Section-B
Short Answer Type Questions
Attempt any four questions out of eight questions. (4*9=36)
Section-C
Long Answer Type Questions
Attempt any four questions out of four questions(4*2=8)`,

  2: `M.Sc. Agriculture 2nd Semester Main Examination June-2024
Subject: Horticulture
Paper title: Production Technology of Vegetable Crops & Spices
Code: J-2061
Section-A
Very Short Answer Type Questions
Attempt all the five questions(5*2=10)
Section-B
Short Answer Type Questions
Attempt any two questions out of following three questions(2*5=10)
Section-C
Detail Answer Type Questions
Attempt any three questions out of following five questions(3*10=30)`,

  3: `NP-2700
M.A. IInd Year(Major) (X / IVth Semester May 2025)
Course Code – A061006T
Political Science
Paper –- IV – a
(international Law)
Time :03 Hours 
Max. Marks: 75
Section-A
Attempt all questions
Section-B
Attempt any five questions out of eight questions
Section-C
Attempt any two questions out of four questions`,
};

const PaperDetailModal = ({
  visible,
  item,
  onCancel,
  importing,
  cssClasses,
  projectId,
  fetchQuantitySheetData,
  setSearchTerm,
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
  const [courses, setCourses] = useState([]);
  const [subject, setSubject] = useState([]);
  const [examType, setExamType] = useState([]);
  const [language, setLanguage] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [projectRequiredFields, setProjectRequiredFields] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, subjectRes, examTypeRes, languageRes, projectRes] = await Promise.all([
          API.get("/Course"),
          API.get("/Subject"),
          API.get("/ExamType"),
          API.get("/Language"),
          API.get("/Project"),
        ]);
        setCourses(courseRes.data);
        setSubject(subjectRes.data);
        setExamType(examTypeRes.data);
        setLanguage(languageRes.data);
        const projectData = projectRes.data.find((p) => p.projectId === projectId);
        setProjectRequiredFields(projectData?.requiredField || []);
                console.log(projectData.requiredField);
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    };
    fetchData();

    if (item) {
      form.setFieldsValue({
        QPId: item.qpMasterId,
        Quantity: item.quantity ?? 0.0,
        CourseId: item.courseName ?? 0,
        SubjectId: item.subjectId ?? 0,
        CatchNo: "",
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
        StructureOfPaper: item.structureOfPaper ?? "",
      });
    }
  }, [item, form]);

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      const selectedCourse = courses.find((c) => c.courseName === values.CourseId);
      const selectedExamType = examType.find((e) => e.examTypeId === values.ExamTypeId);

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
          languageId: values.LanguageId?.length ? values.LanguageId : [0],
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

      await API.post("/QuantitySheet", finalPayload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      message.success("Data updated successfully!");
      onCancel();
      fetchQuantitySheetData();
      setSearchTerm(null);
    } catch (error) {
      console.error("Error updating data:", error);
      message.error("Failed to update data.");
    }
  };

  const handleStructureTemplateChange = (value) => {
    setSelectedTemplate(value);
    form.setFieldsValue({ StructureOfPaper: structureTemplates[value] });
  };

  const isFieldRequired = (fieldName) => {
    return projectRequiredFields?.includes(fieldName);
  };

  if (!item) return null;

  return (
    <Modal show={visible} onHide={onCancel} size="lg">
      <Modal.Header className={`${customDark} ${customLightText}`}>
        <Modal.Title className="text-center">{item.paperTitle}</Modal.Title>
      </Modal.Header>
      <Modal.Body className={`${customLight}`}>
        <Form form={form} layout="vertical">
        <Row>
            <Col md={2}>
              <Form.Item name="CatchNo" 
              label={isFieldRequired("Catch No") ? "Catch No" : "Catch No"} 
              required = {isFieldRequired("Catch No")}>
                <Input allowClear />
              </Form.Item>
            </Col>
            <Col md={2}>
              <Form.Item name="CourseId" 
               label={isFieldRequired("Course") ? "Course " : "Course"}
               required={isFieldRequired("Course")}>
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
              <Form.Item name="ExamTypeId" 
              label={isFieldRequired("Semester") ? "Semester " : "Semester"}
              required={isFieldRequired("Semester")}>
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
              <Form.Item name="PaperTitle" 
              label={isFieldRequired("Paper Title") ? "Paper Title " : "Paper Title"}
              required={isFieldRequired("Paper Title")}>
                <Input allowClear />
              </Form.Item>
            </Col>
            <Col md={2}>
              <Form.Item name="PaperNumber" 
              label={isFieldRequired("Paper #") ? "Paper #" : "Paper #"}
              required={isFieldRequired("Paper #")}>
                <Input allowClear />
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col md={3}>
              <Form.Item name="SubjectId" 
              label={isFieldRequired("Subject") ? "Subject " : "Subject"}
              required={isFieldRequired("Subject")}>
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
              <Form.Item name="NEPCode" 
              label={isFieldRequired("NEP Code") ? "NEP Code " : "NEP Code"}
              required={isFieldRequired("NEP Code")}>
                <Input allowClear />
              </Form.Item>
            </Col>
            <Col md={2}>
              <Form.Item name="UniqueCode" 
              label={isFieldRequired("Unique Code") ? "Unique Code " : "Unique Code"}
              required={isFieldRequired("Unique Code")}>
                <Input allowClear />
              </Form.Item>
            </Col>
            <Col md={2}>
              <Form.Item name="Duration" 
              label={isFieldRequired("Duration") ? "Duration" : "Duration"}
              required={isFieldRequired("Duration")}>
                <Input />
              </Form.Item>
            </Col>
            <Col md={2}>
              <Form.Item name="MaxMarks" 
              label={isFieldRequired("Max Marks") ? "Max Marks " : "Max Marks"}
              required={isFieldRequired("Max Marks")}>
                <Input type="number" allowClear />
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col md={3}>
              <Form.Item name="ExamDate" 
              label={isFieldRequired("Exam Date") ? "Exam Date " : "Exam Date"}
              required={isFieldRequired("Exam Date")}>
                <DatePicker allowClear />
              </Form.Item>
            </Col>
            <Col md={3}>
              <Form.Item name="ExamTime" 
              label={isFieldRequired("Exam Time") ? "Exam Time " : "Exam Time"}
              required={isFieldRequired("Exam Time")}>
                <Input allowClear />
              </Form.Item>
            </Col>
            <Col md={6}>
              <Form.Item name="LanguageId" 
              label={isFieldRequired("Language") ? "Language " : "Language"}
              required={isFieldRequired("Language")}>
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
              <Form.Item name="InnerEnvelope" 
              label={isFieldRequired("Inner Envelope") ? "Inner Envelope " : "Inner Envelope"}
              required={isFieldRequired("Inner Envelope")}>
                <Input allowClear />
              </Form.Item>
            </Col>
            <Col md={4}>
              <Form.Item name="OuterEnvelope" 
              label={isFieldRequired("Outer Envelope") ? "Outer Envelope " : "Outer Envelope"}
              required={isFieldRequired("Outer Envelope")}>
                <Input type="number" allowClear />
              </Form.Item>
            </Col>
            <Col md={4}>
              <Form.Item name="Quantity" 
              label={isFieldRequired("Quantity") ? "Quantity " : "Quantity"}
              required={isFieldRequired("Quantity")}>
                <Input type="number" allowClear />
              </Form.Item>
            </Col>
            {/* <Col md={4}>
              <Form.Item name="Pages" label="Pages" required>
                <Input type="number" allowClear />
              </Form.Item>
            </Col> */}
          </Row>
          <Row>
            <Col md={4}>
              <Form.Item label="Select Paper Structure Template">
                <Select
                  allowClear
                  placeholder="Select a structure"
                  onChange={handleStructureTemplateChange}
                  value={selectedTemplate}
                >
                  {Object.keys(structureTemplates).map((key) => (
                    <Option key={key} value={key}>
                      {key}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col md={8}>
              <Form.Item name="StructureOfPaper" label="Structure of Paper">
                <Input.TextArea
                  rows={4}
                  allowClear
                  style={{ whiteSpace: "pre-wrap" }}
                />
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

