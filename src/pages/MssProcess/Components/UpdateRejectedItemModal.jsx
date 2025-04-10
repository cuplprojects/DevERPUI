import React from "react";
import { Modal, Button, Form } from "react-bootstrap";

const UpdateRejectedItemModal = ({ show, handleClose, item, onUpdate }) => {
  if (!item) {
    return null; // Do not render the modal if item is null
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    // Handle update logic here
    onUpdate(item);
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Update Rejected Item</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formCatchNo">
            <Form.Label>Catch No</Form.Label>
            <Form.Control type="text" defaultValue={item.catchNo || ''} disabled />
          </Form.Group>
          {/* Add more form fields as needed */}
          <Button variant="primary" type="submit">
            Update
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default UpdateRejectedItemModal;
