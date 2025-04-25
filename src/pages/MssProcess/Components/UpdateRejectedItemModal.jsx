import React, { useEffect, useState } from "react";
import {
  Modal,
  Button,
  Form,
  Alert,
  Badge,
  Row,
  Col,
  ModalFooter,
} from "react-bootstrap";
import { Select, Tag } from "antd";
import API from "../../../CustomHooks/MasterApiHooks/api";

const { Option } = Select;

const UpdateRejectedItemModal = ({
  show,
  handleClose,
  data,
  onUpdate,
  languageOptions,
  cssClasses,
}) => {
  const [formData, setFormData] = useState({});
  const [processOptions, setProcessOptions] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [rejectionReasons, setRejectionReasons] = useState([]);
  const [examTypeOptions, setExamTypeOptions] = useState([]);
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
  
  useEffect(() => {
    if (data) {
      const { item, filteredData } = data;
      setFormData({
        quantitySheetId: item.quantitySheetId,
        catchNo: item.catchNo,
        examDate: item.examDate,
        examTime: item.examTime,
        courseId: item.courseId || null,
        subjectId: item.subjectId ? Number(item.subjectId) : undefined,
        innerEnvelope: item.innerEnvelope,
        outerEnvelope: item.outerEnvelope,
        lotNo: item.lotNo,
        quantity: item.quantity,
        pages: item.pages,
        percentageCatch: item.percentageCatch,
        projectId: item.projectId,
        status: item.status,
        stopCatch: item.stopCatch,
        processId: item.processId || [],
        paperNumber: item.paperNumber,
        paperTitle: item.paperTitle,
        qpId: item.qpId,
        maxMarks: item.maxMarks,
        duration: item.duration,
        languageId: item.languageId || [],
        examTypeId: item.examTypeId,
        nepCode: item.nepCode,
        uniqueCode: item.uniqueCode,
        structureOfPaper: item.structureOfPaper,
        mssStatus: 5,
        ttfStatus: item.ttfStatus,
      });

      // Determine rejection reasons
      const reasons = [];
      const verifiedItem = filteredData.find(
        (fd) => fd.quantitysheetId === item.quantitySheetId
      );
      if (verifiedItem) {
        for (const [key, value] of Object.entries(verifiedItem.verified)) {
          if (!value && key !== "catchNo" && key !== "status") {
            reasons.push(key);
          }
        }
      }
      setRejectionReasons(reasons);

      // Fetch processes, courses, subjects, and exam types
      fetchProcesses();
      fetchCourses();
      fetchSubjects();
      fetchExamTypes();
    }
  }, [data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSelectChange = (value, name) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onUpdate(formData);
    handleClose();
  };

  const fetchProcesses = async () => {
    try {
      const response = await API.get("/api/Processes");
      setProcessOptions(response.data);
    } catch (error) {
      console.error("Error fetching processes:", error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await API.get("/Course");
      setCourseOptions(response.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await API.get("/Subject");
      setSubjectOptions(response.data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const fetchExamTypes = async () => {
    try {
      const response = await API.get("/ExamType");
      setExamTypeOptions(response.data);
    } catch (error) {
      console.error("Error fetching exam types:", error);
    }
  };
  // console.log("Form Data:", formData);
  // console.log("Subjects Options:", subjectOptions);

  return (
    <Modal show={show} onHide={handleClose} size="lg" className="rounded-5">
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton className={`${customDark} `}>
          <Modal.Title className={`${customLightText}`}>
            Update Rejected Item
          </Modal.Title>
        </Modal.Header>

        <Row>
          <Col md={12}>
            <Form.Group controlId="formRejectionReasons" className="mb-3">
              <Form.Label className={`${customDarkText} fw-bold fs-5 text-center w-100 mb-3`}>
                Rejection Reasons
              </Form.Label>
              <div className="d-flex flex-wrap justify-content-center gap-3 mt-3 p-4 mb-4 bg-light rounded-3 shadow-sm">
                {rejectionReasons.map((reason) => (
                  <Tag
                    key={reason}
                    color="#ff6b6b"
                    className="px-4 py-2 rounded-pill shadow-sm m-1 transition-all hover:shadow-md"
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: '500',
                      border: 'none',
                      cursor: 'default'
                    }}
                  >
                    {reason.charAt(0).toUpperCase() + reason.slice(1)}
                  </Tag>
                ))}
              </div>
            </Form.Group>
          </Col>
        </Row>
        <Modal.Body className={`${customLight} ${customDarkText}`}>
          {/* Existing form fields */}
          <Row>
            <Col md={3}>
              <Form.Group controlId="formCatchNo" className="mb-3">
                <Form.Label>Catch No</Form.Label>
                <Form.Control
                  type="text"
                  name="catchNo"
                  value={formData.catchNo || ""}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="formLotNo" className="mb-3">
                <Form.Label>Lot No</Form.Label>
                <Form.Control
                  type="text"
                  name="lotNo"
                  value={formData.lotNo || ""}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="formExamDate" className="mb-3">
                <Form.Label>Exam Date</Form.Label>
                <Form.Control
                  type="date"
                  name="examDate"
                  value={formData.examDate || ""}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="formExamTime" className="mb-3">
                <Form.Label>Exam Time</Form.Label>
                <Form.Control
                  type="text"
                  name="examTime"
                  value={formData.examTime || ""}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group controlId="formCourseId" className="mb-3">
                <Form.Label>Course</Form.Label>
                <Select
                  style={{ width: "100%" }}
                  placeholder="Select Course"
                  value={formData.courseId}
                  onChange={(value) => handleSelectChange(value, "courseId")}
                >
                  {courseOptions.map((option) => (
                    <Option key={option.courseId} value={option.courseId}>
                      {option.courseName}
                    </Option>
                  ))}
                </Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formSubjectId" className="mb-3">
                <Form.Label>Subject</Form.Label>
                <Select
                  style={{ width: "100%" }}
                  placeholder="Select Subject"
                  value={formData.subjectId}
                  onChange={(value) => handleSelectChange(Number(value), "subjectId")}
                  showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  optionFilterProp="children"
                >
                  {subjectOptions.map((option) => (
                    <Option key={option.subjectId} value={option.subjectId}>
                      {option.subjectName}
                    </Option>
                  ))}
                </Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group controlId="formInnerEnvelope" className="mb-3">
                <Form.Label>Inner Envelope</Form.Label>
                <Form.Control
                  type="text"
                  name="innerEnvelope"
                  value={formData.innerEnvelope || ""}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formOuterEnvelope" className="mb-3">
                <Form.Label>Outer Envelope</Form.Label>
                <Form.Control
                  type="number"
                  name="outerEnvelope"
                  value={formData.outerEnvelope || ""}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={2}>
              <Form.Group controlId="formQuantity" className="mb-3">
                <Form.Label>Quantity</Form.Label>
                <Form.Control
                  type="number"
                  name="quantity"
                  value={formData.quantity || ""}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group controlId="formPages" className="mb-3">
                <Form.Label>Pages</Form.Label>
                <Form.Control
                  type="number"
                  name="pages"
                  value={formData.pages || ""}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="formPaperNumber" className="mb-3">
                <Form.Label>Paper Number</Form.Label>
                <Form.Control
                  type="text"
                  name="paperNumber"
                  value={formData.paperNumber || ""}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={5}>
              <Form.Group controlId="formPaperTitle" className="mb-3">
                <Form.Label>Paper Title</Form.Label>
                <Form.Control
                  type="text"
                  name="paperTitle"
                  value={formData.paperTitle || ""}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={3}>
              <Form.Group controlId="formMaxMarks" className="mb-3">
                <Form.Label>Max Marks</Form.Label>
                <Form.Control
                  type="number"
                  name="maxMarks"
                  value={formData.maxMarks || ""}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group controlId="formDuration" className="mb-3">
                <Form.Label>Duration</Form.Label>
                <Form.Control
                  type="text"
                  name="duration"
                  value={formData.duration || ""}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="formExamTypeId" className="mb-3">
                <Form.Label>Semester</Form.Label>
                <Select
                  style={{ width: "100%" }}
                  placeholder="Select Semester"
                  value={formData.examTypeId}
                  onChange={(value) => handleSelectChange(Number(value), "examTypeId")}
                  showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  optionFilterProp="children"
                >
                  {examTypeOptions.map((option) => (
                    <Option key={option.examTypeId} value={option.examTypeId}>
                      {option.typeName}
                    </Option>
                  ))}
                </Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="formNepCode" className="mb-3">
                <Form.Label>NEP Code</Form.Label>
                <Form.Control
                  type="text"
                  name="nepCode"
                  value={formData.nepCode || ""}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group controlId="formLanguageId" className="mb-3">
                <Form.Label>Language</Form.Label>
                <Select
                  mode="multiple"
                  style={{ width: "100%" }}
                  placeholder="Select Languages"
                  value={formData.languageId}
                  onChange={(value) => handleSelectChange(value, "languageId")}
                >
                  {languageOptions.map((option) => (
                    <Option key={option.languageId} value={option.languageId}>
                      {option.languages}
                    </Option>
                  ))}
                </Select>
              </Form.Group>
            </Col>
            <Col md={6}>
  <Form.Group controlId="formStructureOfPaper" className="mb-3">
    <Form.Label>Structure of Paper</Form.Label>
    <Form.Control
      as="textarea"
      rows={4} // You can adjust the number of rows as needed
      name="structureOfPaper"
      value={formData.structureOfPaper || ""}
      onChange={handleChange}
    />
  </Form.Group>
</Col>

          </Row>

          {/* New Row for Rejection Reasons */}

        </Modal.Body>
        <ModalFooter className={`${customDark}`}>
          <div className="d-flex justify-content-end">
            <Button
              variant="primary"
              type="submit"
              className={`${customBtn} ${customLightBorder}`}
            >
              Update
            </Button>
          </div>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default UpdateRejectedItemModal;
