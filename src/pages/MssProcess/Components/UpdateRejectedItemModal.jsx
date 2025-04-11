import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Alert, Badge, Row, Col } from "react-bootstrap";
import { Select } from "antd";
import API from "../../../CustomHooks/MasterApiHooks/api";


const { Option } = Select;

const UpdateRejectedItemModal = ({ show, handleClose, data, onUpdate, languageOptions }) => {
  const [formData, setFormData] = useState({});
  const [processOptions, setProcessOptions] = useState([]);

  useEffect(() => {
    if (data) {
      const { item } = data;
      setFormData({
        quantitySheetId: item.quantitySheetId,
        catchNo: item.catchNo,
        examDate: item.examDate,
        examTime: item.examTime,
        courseId: item.courseId,
        subjectId: item.subjectId,
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
        mssStatus: item.mssStatus,
        ttfStatus: item.ttfStatus,
        structureOfPaper: item.structureOfPaper,
      });

      // Fetch processes using your API service
      fetchProcesses();
    }
  }, [data]);

  if (!data) {
    return null; // Do not render the modal if data is null
  }

  const { item, filteredData } = data;
  const matchedItem = filteredData.find(
    (dataItem) => dataItem.quantitysheetId === item.quantitySheetId
  );

  const rejectionReasons = matchedItem?.verified || {};

  const rejectionFields = {
    catchNo: "Catch No",
    language: "Language",
    maxMarks: "Max Marks",
    duration: "Duration",
    structure: "Structure",
    series: "Series",
  };

  const rejectedEntries = Object.entries(rejectionFields)
    .filter(([key]) => rejectionReasons[key] === false)
    .map(([key, label]) => (
      <li key={key}>
        <Badge bg="danger" className="me-2">
          Rejected
        </Badge>
        {label}
      </li>
    ));

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

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Update Rejected Item</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {rejectedEntries.length > 0 && (
          <Alert variant="danger">
            <strong>Rejection Reasons:</strong>
            <ul className="mb-0 mt-2">{rejectedEntries}</ul>
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
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
            <Col md={6}>
              <Form.Group controlId="formExamDate" className="mb-3">
                <Form.Label>Exam Date</Form.Label>
                <Form.Control
                  type="text"
                  name="examDate"
                  value={formData.examDate || ""}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
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
            <Col md={6}>
              <Form.Group controlId="formCourseId" className="mb-3">
                <Form.Label>Course ID</Form.Label>
                <Form.Control
                  type="number"
                  name="courseId"
                  value={formData.courseId || ""}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group controlId="formSubjectId" className="mb-3">
                <Form.Label>Subject ID</Form.Label>
                <Form.Control
                  type="number"
                  name="subjectId"
                  value={formData.subjectId || ""}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
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
          </Row>

          <Row>
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
            <Col md={6}>
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
          </Row>

          <Row>
            <Col md={6}>
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
            <Col md={6}>
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
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group controlId="formPercentageCatch" className="mb-3">
                <Form.Label>Percentage Catch</Form.Label>
                <Form.Control
                  type="number"
                  name="percentageCatch"
                  value={formData.percentageCatch || ""}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formProjectId" className="mb-3">
                <Form.Label>Project ID</Form.Label>
                <Form.Control
                  type="number"
                  name="projectId"
                  value={formData.projectId || ""}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group controlId="formStatus" className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Control
                  type="number"
                  name="status"
                  value={formData.status || ""}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formStopCatch" className="mb-3">
                <Form.Label>Stop Catch</Form.Label>
                <Form.Control
                  type="number"
                  name="stopCatch"
                  value={formData.stopCatch || ""}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
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
            <Col md={6}>
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
            <Col md={6}>
              <Form.Group controlId="formQpId" className="mb-3">
                <Form.Label>QP ID</Form.Label>
                <Form.Control
                  type="number"
                  name="qpId"
                  value={formData.qpId || ""}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
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
          </Row>

          <Row>
            <Col md={6}>
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
            <Col md={6}>
              <Form.Group controlId="formLanguageId" className="mb-3">
                <Form.Label>Language</Form.Label>
                <Select
                  mode="multiple"
                  style={{ width: '100%' }}
                  placeholder="Select Languages"
                  value={formData.languageId}
                  onChange={(value) => handleSelectChange(value, 'languageId')}
                >
                  {languageOptions.map((option) => (
                    <Option key={option.languageId} value={option.languageId}>
                      {option.languages}
                    </Option>
                  ))}
                </Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group controlId="formExamTypeId" className="mb-3">
                <Form.Label>Exam Type ID</Form.Label>
                <Form.Control
                  type="number"
                  name="examTypeId"
                  value={formData.examTypeId || ""}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
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
              <Form.Group controlId="formUniqueCode" className="mb-3">
                <Form.Label>Unique Code</Form.Label>
                <Form.Control
                  type="text"
                  name="uniqueCode"
                  value={formData.uniqueCode || ""}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formMssStatus" className="mb-3">
                <Form.Label>MSS Status</Form.Label>
                <Form.Control
                  type="number"
                  name="mssStatus"
                  value={formData.mssStatus || ""}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group controlId="formTtfStatus" className="mb-3">
                <Form.Label>TTF Status</Form.Label>
                <Form.Control
                  type="number"
                  name="ttfStatus"
                  value={formData.ttfStatus || ""}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formStructureOfPaper" className="mb-3">
                <Form.Label>Structure of Paper</Form.Label>
                <Form.Control
                  type="text"
                  name="structureOfPaper"
                  value={formData.structureOfPaper || ""}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Form.Group controlId="formProcessId" className="mb-3">
                <Form.Label>Processes</Form.Label>
                <Select
                  mode="multiple"
                  style={{ width: '100%' }}
                  placeholder="Select Processes"
                  value={formData.processId}
                  onChange={(value) => handleSelectChange(value, 'processId')}
                >
                  {processOptions.map((option) => (
                    <Option key={option.id} value={option.id}>
                      {option.name}
                    </Option>
                  ))}
                </Select>
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex justify-content-end">
            <Button variant="primary" type="submit">
              Update
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default UpdateRejectedItemModal;
