import React, { useState } from "react";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const NotificationForm = ({ type }) => {
  const [formData, setFormData] = useState({
    messageContent: "",
    durationHrs: "",
    durationMin: "",
    durationSec: "",
    typeID: type === 'inscreen' ? "1" : "2",
    displayID: "",
  });

  const displayOptions = {
    1: "Hall 1",
    2: "Hall 2",
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!formData.messageContent.trim()) {
      toast.error("Message content is required");
      return false;
    }
    if (!formData.durationHrs && !formData.durationMin && !formData.durationSec) {
      toast.error("Duration is required");
      return false;
    }
    if (!formData.typeID) {
      toast.error("Type is required");
      return false;
    }
    if (!formData.displayID) {
      toast.error("Please select at least one display");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const duration =
      (parseInt(formData.durationHrs || 0) * 3600) +
      (parseInt(formData.durationMin || 0) * 60) +
      parseInt(formData.durationSec || 0);

    const payload = {
      messageContent: formData.messageContent,
      duration,
      typeID: parseInt(formData.typeID),
      displayID: formData.displayID,
    };

    try {
      await axios.post("https://localhost:7212/api/Notifications", payload);
      toast.success("Notification sent successfully!");
    } catch (error) {
      toast.error("Failed to send notification");
    }
  };

  return (
    <Container>
      <ToastContainer />
      <h2 className="my-4">Push Notification</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Message Content</Form.Label>
          <Form.Control
            type="text"
            name="messageContent"
            value={formData.messageContent}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Row>
          <Col>
            <Form.Group className="mb-3">
              <Form.Label>Hours</Form.Label>
              <Form.Control
                type="number"
                name="durationHrs"
                value={formData.durationHrs}
                onChange={handleChange}
                min="0"
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group className="mb-3">
              <Form.Label>Minutes</Form.Label>
              <Form.Control
                type="number"
                name="durationMin"
                value={formData.durationMin}
                onChange={handleChange}
                min="0"
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group className="mb-3">
              <Form.Label>Seconds</Form.Label>
              <Form.Control
                type="number"
                name="durationSec"
                value={formData.durationSec}
                onChange={handleChange}
                min="0"
              />
            </Form.Group>
          </Col>
        </Row>
        <Form.Group className="mb-3">
          <Form.Label>Type</Form.Label>
          <Form.Select name="typeID" value={formData.typeID} onChange={handleChange} required>
            <option value="">Select Type</option>
            <option value="1">In-Screen</option>
            <option value="2">Full Screen</option>
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Display</Form.Label>
          <Form.Select name="displayID" value={formData.displayID} onChange={handleChange} required>
            <option value="">Select Display</option>
            {Object.entries(displayOptions).map(([key, value]) => (
              <option key={key} value={key}>{value}</option>
            ))}
          </Form.Select>
        </Form.Group>
        <Button variant="primary" type="submit">
          Send Notification
        </Button>
      </Form>
    </Container>
  );
};

export default NotificationForm;
