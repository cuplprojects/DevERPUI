import React from "react";
import { Modal, Button, Form, Alert, Badge } from "react-bootstrap";

const UpdateRejectedItemModal = ({ show, handleClose, data, onUpdate }) => {
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
        <Badge bg="danger" className="me-2">Rejected</Badge>
        {label}
      </li>
    ));

  const handleSubmit = (event) => {
    event.preventDefault();
    onUpdate(item);
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Update Rejected Item</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {rejectedEntries.length > 0 && (
          <Alert variant="danger">
            <strong>Rejection Reasons:</strong>
            <ul className="mb-0 mt-2">
              {rejectedEntries}
            </ul>
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formCatchNo" className="mb-3">
            <Form.Label>Catch No</Form.Label>
            <Form.Control
              type="text"
              defaultValue={matchedItem?.catchNo || ''}
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
