import React from "react";
import { Modal, Button, Form, Alert, Badge } from "react-bootstrap";

const UpdateRejectedItemModal = ({ show, handleClose, data, onUpdate }) => {
  if (!data) {
    return null; // Do not render the modal if data is null
  }

  const { item, filteredData } = data;
  console.log("data in the items -", item);
  console.log("data in filtered data -", filteredData);
  const matchedItem = filteredData.find(
    (dataItem) => dataItem.quantitysheetId === item.quantitySheetId
  );
  console.log("data in matchedData -", matchedItem);
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

  const handleSubmit = (event) => {
    event.preventDefault();
    onUpdate(item);
    handleClose();
  };

  const sampleData = {
    "quantitySheetId": 764,
    "catchNo": "811",
    "paperTitle": "string",
    "maxMarks": 0,
    "duration": "2",
    "mssStatus": 2,
    "ttfStatus": 0,
    "languageId": [
        1,
        2
    ],
    "languages": [
        "Hindi",
        "English"
    ],
    "examTypeId": 0,
    "examTypes": null,
    "paperNumber": "string",
    "examDate": "string",
    "examTime": "string",
    "courseId": 0,
    "courseName": null,
    "subjectId": 0,
    "subjectName": null,
    "innerEnvelope": "string",
    "outerEnvelope": 0,
    "lotNo": "M",
    "quantity": 0,
    "percentageCatch": 1.1664564943253468,
    "projectId": 14,
    "processId": [
        23,
        24,
        1,
        2,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15
    ],
    "pages": 0,
    "stopCatch": 0,
    "qpId": 1979,
    "nepCode": "56456",
    "uniqueCode": ""
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
          <Form.Group controlId="formCatchNo" className="mb-3">
            <Form.Label>Catch No</Form.Label>
            <Form.Control
              type="text"
              defaultValue={matchedItem?.catchNo || ""}
              disabled
            />
          </Form.Group>

          {/* Add more editable fields as needed */}

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
