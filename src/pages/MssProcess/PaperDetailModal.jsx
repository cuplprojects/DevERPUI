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

// Add styles to head
const style = document.createElement('style');
style.textContent = `
  .ant-message {
    z-index: 9999 !important;
    position: fixed !important;
  }
  .custom-message {
    z-index: 9999 !important;
  }
  .ant-message-notice-content {
    z-index: 9999 !important;
  }
`;
document.head.appendChild(style);

// Configure message component
message.config({
  top: 100,
  duration: 2,
  maxCount: 3,
  rtl: false,
  getContainer: () => document.body,
});

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
  isNewPaper = false,
}) => {
  const [form] = Form.useForm();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [formValues, setFormValues] = useState(null);
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
  const [abcdData, setAbcdData] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // console.log(item);
  // console.log(importing)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, subjectRes, examTypeRes, languageRes] = await Promise.all([
          API.get("/Course"),
          API.get("/Subject"),
          API.get("/ExamType"),
          API.get("/Language"),
        ]);
        setCourses(courseRes.data);
        setSubject(subjectRes.data);
        setExamType(examTypeRes.data);
        setLanguage(languageRes.data);
      } catch (error) {
        console.error("Error loading initial data:", error);
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

    const fetchABCD = async () => {
      try {
        const response = await API.get("/ABCD");
        setAbcdData(response.data);
      } catch (error) {
        console.error("Error fetching ABCD data:", error);
      }
    };
    fetchData();
    fetchABCD();

    if (item) {
      // If it's a new paper, set empty values
      if (isNewPaper) {
        form.setFieldsValue({
          QPId: 0,
          Quantity: 0,
          CourseId: "",
          SubjectId: 0,
          CatchNo: "",
          InnerEnvelope: "",
          OuterEnvelope: 0,
          PaperTitle: "",
          PaperNumber: "",
          ExamDate: null,
          ExamTime: "",
          MaxMarks: 0,
          Duration: "",
          LanguageId: [],
          ExamTypeId: 0,
          NEPCode: "",
          UniqueCode: "",
          StructureOfPaper: "",
        });
      } else {
        // For existing paper, set values from the item
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
          MaxMarks: item.maxMarks ?? 0,
          Duration: item.duration ?? null,
          LanguageId: item.languageIds ?? [],
          ExamTypeId: item.examTypeName ?? 0,
          NEPCode: item.nepCode ?? "",
          UniqueCode: item.uniqueCode ?? "",
          StructureOfPaper: item.structureOfPaper ?? "",
        });
      }
    }
  }, [item, form]);

  const showMessage = (type, content) => {
    message[type]({
      content,
      className: 'custom-message',
      style: {
        marginTop: '20vh',
        position: 'fixed',
        zIndex: 9999,
      }
    });
  };

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      setFormValues(values);
      setShowConfirmDialog(true);
    } catch (error) {
      console.error("Error validating form:", error);
      showMessage('error', "Please fill in all required fields.");
    }
  };

  const handleConfirmedImport = async () => {
    try {
      const values = formValues;
      // const selectedCourse = courses.find(
      //   (course) => course.courseName === values.CourseId
      // );
      // const selectedExamType = examType.find(
      //   (exam) => exam.examTypeId === values.ExamTypeId
      // );
      // const selectedLanguages = values.LanguageId?.length
      //   ? values.LanguageId
      //   : [0];

      // Format the payload according to the API's requirements
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
          qpId: isNewPaper ? 0 : (item?.qpMasterId || 0),
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

      // Send updated values to the server with the Authorization header
      await API.post("/QuantitySheet", finalPayload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      showMessage('success', isNewPaper ? "Paper added successfully!" : "Data imported successfully!");
      setShowConfirmDialog(false);
      onCancel();
      fetchQuantitySheetData();
      setSearchTerm(null);
    } catch (error) {
      console.error("Error updating data:", error);
      showMessage('error', "Failed to update data.");
      setShowConfirmDialog(false);
    }
  };

  const getFormattedHeaderText = () => {
    if (!formValues || !abcdData || abcdData.length === 0) return '';

    // Find the ABCD config with groupId 19 (or use the first one if not found)
    const abcdConfig = abcdData.find(config => config.groupId === 19) || abcdData[0];

    const getValue = (field) => {
      switch (field) {
        case "CourseId Examination SessionId TypeId":
          return `${formValues?.CourseId || ''} ${examType?.find(e => e.examTypeId === formValues?.ExamTypeId)?.typeName || ''}`;
        case "SubjectId":
          return subject?.find(s => s.subjectId === formValues?.SubjectId)?.subjectName || '';
        case "PaperTitle":
          return formValues?.PaperTitle || '';
        case "PaperNumber":
          return formValues?.PaperNumber || '';
        default:
          return '';
      }
    };

    // Get values in the order specified by ABCD config
    const parts = [
      getValue(abcdConfig.a), // CourseId Examination SessionId TypeId
      getValue(abcdConfig.b), // SubjectId
      getValue(abcdConfig.c), // PaperTitle
      getValue(abcdConfig.d), // PaperNumber
      formValues?.ExamDate ? formValues.ExamDate.format('DD-MM-YYYY') : ''
    ];

    return parts.filter(part => part).join(' - ');
  };

  const handleStructureTemplateChange = (value) => {
    setSelectedTemplate(value);
    form.setFieldsValue({ StructureOfPaper: structureTemplates[value] });
  };

  if (!item) return null;

  return (
    <>
      <Modal show={visible} onHide={onCancel} size="lg">
        <Modal.Header className={`${customDark} ${customLightText}`}>
          <Modal.Title className="text-center">
            {isNewPaper ? "Add New Paper" : item?.paperTitle}
          </Modal.Title>
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
                  <Select
                    allowClear
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    placeholder="Search course"
                  >
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
                  <Select
                    allowClear
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    placeholder="Search semester"
                  >
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
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    placeholder="Search subject"
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
                  <Select
                    mode="multiple"
                    allowClear
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    placeholder="Search languages"
                  >
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
                <Form.Item name="Quantity" label="Previous Year Quantity" required>
                  <Input type="number" allowClear />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col md={4}>
              <Form.Item label="Select Paper Structure Template">
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
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
            disabled={importing === item?.qpMasterId}
          >
            {isNewPaper ? "Add Paper" : "Import"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Confirmation Dialog */}
      <Modal
        show={showConfirmDialog}
        onHide={() => setShowConfirmDialog(false)}
        centered
        backdrop="static"
        className="confirmation-modal"
      >
        <Modal.Header >
          <Modal.Title className="fw-bold">
            {getFormattedHeaderText()}
          </Modal.Title>
        </Modal.Header>

        <Modal.Footer className={`${customDark} border-top-0 justify-content-center gap-3`}>
          <Button
            variant="outline-secondary"
            className="px-4 rounded-pill"
            onClick={() => setShowConfirmDialog(false)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            className={`${customBtn} ${customLightText} px-4 rounded-pill`}
            onClick={handleConfirmedImport}
          >
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PaperDetailModal;

