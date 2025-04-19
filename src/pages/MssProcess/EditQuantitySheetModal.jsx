import React, { useState, useEffect } from "react";
import { Button, DatePicker, Select, InputNumber, message } from "antd";
import { Modal, Row, Col, Form as BootstrapForm } from 'react-bootstrap';
import API from "../../CustomHooks/MasterApiHooks/api";
import moment from "moment";

const EditQuantitySheetModal = ({
  show,
  onHide,
  record,
  languageOptions,
  onSuccess ,
  cssClasses,
  fetchQuantitySheetData
}) => {
  const [formData, setFormData] = useState({});
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

  // Initialize form data when record changes
  useEffect(() => {
    if (record) {
      console.log(record)
      const initialFormData = {
        catchNo: record.catchNo || '',
        nepCode: record.nepCode || '',
        paperTitle: record.paperTitle || '',
        duration: record.duration || '',
        languageId: record.languageId || [],
        paperNumber: record.paperNumber || '',
        quantity: record.quantity || 0,
        maxMarks: record.maxMarks || 0,
        uniqueCode: record.uniqueCode || '',
        examDate: record.examDate || '',
        examTime: record.examTime || '',
        structureOfPaper: record.structureOfPaper || '',
        mssStatus: record.mssStatus, // Include the original mssStatus
        ttfStatus: record.ttfStatus, // Include the original ttfStatus
        status : record.status,
      };

      setFormData(initialFormData);
    }
  }, [record]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      examDate: date ? moment(date).format('DD-MM-YYYY') : ''
    }));
  };

  const handleLanguageChange = (selectedOptions) => {
    setFormData(prev => ({
      ...prev,
      languageId: selectedOptions
    }));
  };

  const handleNumberChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      if (!record) return;

      // Create a clean payload for the API
      const payload = {
        quantitySheetId: record.quantitySheetId,
        catchNo: formData.catchNo,
        nepCode: formData.nepCode,
        paperTitle: formData.paperTitle,
        duration: formData.duration,
        languageId: formData.languageId,
        paperNumber: formData.paperNumber,
        quantity: formData.quantity,
        maxMarks: formData.maxMarks,
        uniqueCode: formData.uniqueCode,
        examTime: formData.examTime,
        structureOfPaper: formData.structureOfPaper || '',
        examDate: formData.examDate || '',
        mssStatus: record.mssStatus, // Use the original mssStatus value
        ttfStatus: record.ttfStatus, // Use the original ttfStatus value
        projectId: record.projectId,
        courseId: record.courseId,
        subjectId: record.subjectId,
        processId: record.processId,
        lotNo: record.lotNo,
        percentageCatch: record.percentageCatch,
        qpId: record.qpId,
        pages: record.pages,
        innerEnvelope: record.innerEnvelope,
        outerEnvelope : record.outerEnvelope,
        status : record.status,
        stopCatch : record.stopCatch,
      };
      console.log("Payload Data -", payload);
      // Call the API to update the item
      await API.put('/QuantitySheet/bulk-update', [payload]);

      message.success('Item updated successfully');

      // Call onSuccess (fetchQuantitySheetData) immediately to refresh the table data
      if (onSuccess) onSuccess();

      // Close the modal after data is refreshed
      onHide();
    } catch (error) {
      console.error('Failed to update item:', error);
      message.error('Failed to update item');
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
    >
      <Modal.Header closeButton className={`${customDark}`}>
        <Modal.Title  className={`${customLightText}`}>Edit Quantity Sheet</Modal.Title>
      </Modal.Header>
      <Modal.Body className={`${customLight}`}>
        {record && (
          <Row>
            <Col md={6}>
              <BootstrapForm.Group className="mb-3">
                <BootstrapForm.Label>Catch No</BootstrapForm.Label>
                <BootstrapForm.Control
                  type="text"
                  name="catchNo"
                  value={formData.catchNo || ''}
                  onChange={handleInputChange}
                  required
                />
              </BootstrapForm.Group>
            </Col>
            <Col md={6}>
              <BootstrapForm.Group className="mb-3">
                <BootstrapForm.Label>NEP Code</BootstrapForm.Label>
                <BootstrapForm.Control
                  type="text"
                  name="nepCode"
                  value={formData.nepCode || ''}
                  onChange={handleInputChange}
                />
              </BootstrapForm.Group>
            </Col>
            <Col md={12}>
              <BootstrapForm.Group className="mb-3">
                <BootstrapForm.Label>Paper Title</BootstrapForm.Label>
                <BootstrapForm.Control
                  type="text"
                  name="paperTitle"
                  value={formData.paperTitle || ''}
                  onChange={handleInputChange}
                  required
                />
              </BootstrapForm.Group>
            </Col>
            <Col md={6}>
              <BootstrapForm.Group className="mb-3">
                <BootstrapForm.Label>Duration</BootstrapForm.Label>
                <BootstrapForm.Control
                  type="text"
                  name="duration"
                  value={formData.duration || ''}
                  onChange={handleInputChange}
                />
              </BootstrapForm.Group>
            </Col>
            <Col md={6}>
              <BootstrapForm.Group className="mb-3">
                <BootstrapForm.Label>Languages</BootstrapForm.Label>
                <Select
                  mode="multiple"
                  style={{ width: '100%' }}
                  placeholder="Select languages"
                  value={formData.languageId}
                  onChange={handleLanguageChange}
                >
                  {languageOptions.map(option => (
                    <Select.Option key={option.languageId} value={option.languageId}>
                      {option.languageName}
                    </Select.Option>
                  ))}
                </Select>
              </BootstrapForm.Group>
            </Col>
            <Col md={6}>
              <BootstrapForm.Group className="mb-3">
                <BootstrapForm.Label>Paper Number</BootstrapForm.Label>
                <BootstrapForm.Control
                  type="text"
                  name="paperNumber"
                  value={formData.paperNumber || ''}
                  onChange={handleInputChange}
                />
              </BootstrapForm.Group>
            </Col>
            <Col md={6}>
              <BootstrapForm.Group className="mb-3">
                <BootstrapForm.Label>Quantity</BootstrapForm.Label>
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  value={formData.quantity}
                  onChange={(value) => handleNumberChange('quantity', value)}
                />
              </BootstrapForm.Group>
            </Col>
            <Col md={6}>
              <BootstrapForm.Group className="mb-3">
                <BootstrapForm.Label>Max Marks</BootstrapForm.Label>
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  value={formData.maxMarks}
                  onChange={(value) => handleNumberChange('maxMarks', value)}
                />
              </BootstrapForm.Group>
            </Col>
            <Col md={6}>
              <BootstrapForm.Group className="mb-3">
                <BootstrapForm.Label>Private Code</BootstrapForm.Label>
                <BootstrapForm.Control
                  type="text"
                  name="uniqueCode"
                  value={formData.uniqueCode || ''}
                  onChange={handleInputChange}
                />
              </BootstrapForm.Group>
            </Col>
            <Col md={6}>
              <BootstrapForm.Group className="mb-3">
                <BootstrapForm.Label>Exam Date</BootstrapForm.Label>
                <DatePicker
                  style={{ width: '100%' }}
                  format="DD-MM-YYYY"
                  value={formData.examDate ? moment(formData.examDate, 'DD-MM-YYYY') : null}
                  onChange={handleDateChange}
                />
              </BootstrapForm.Group>
            </Col>
            <Col md={6}>
              <BootstrapForm.Group className="mb-3">
                <BootstrapForm.Label>Exam Time</BootstrapForm.Label>
                <BootstrapForm.Control
                  type="text"
                  name="examTime"
                  value={formData.examTime || ''}
                  onChange={handleInputChange}
                />
              </BootstrapForm.Group>
            </Col>
            <Col md={12}>
              <BootstrapForm.Group className="mb-3">
                <BootstrapForm.Label>Structure of Paper</BootstrapForm.Label>
                <BootstrapForm.Control
                  as="textarea"
                  rows={3}
                  name="structureOfPaper"
                  value={formData.structureOfPaper || ''}
                  onChange={handleInputChange}
                />
              </BootstrapForm.Group>
            </Col>
          </Row>
        )}
      </Modal.Body>
      <Modal.Footer className={`${customDark}`}>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditQuantitySheetModal;
