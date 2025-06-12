import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Form,
  ToggleButton,
  ToggleButtonGroup,
  Button
} from 'react-bootstrap';

const CuDashboardSettings = ({ t }) => {
  const [showDashboardTable, setShowDashboardTable] = useState(true);
  const [showBarChart, setShowBarChart] = useState(true);
  const [numberOfProjects, setNumberOfProjects] = useState('5');
  const [viewType, setViewType] = useState('project');

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log({
      showDashboardTable,
      showBarChart,
      numberOfProjects,
      viewType
    });
  };

  return (
    <Card className="shadow-sm border-0">
      <Card.Header className="bg-white border-bottom">
        <div className="d-flex align-items-center">
          <i className="bi bi-speedometer2 me-2 text-primary"></i>
          <h5 className="mb-0">{t('dashboardSettings')}</h5>
        </div>
      </Card.Header>

      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Row className="g-3">
            {/* Dashboard Table Toggle */}
            <Col xs={12} md={6}>
              <Form.Check
                type="switch"
                id="toggle-dashboard-table"
                label="Show Dashboard Table"
                checked={showDashboardTable}
                onChange={() => setShowDashboardTable(!showDashboardTable)}
              />
            </Col>

            {/* Bar Chart Toggle */}
            <Col xs={12} md={6}>
              <Form.Check
                type="switch"
                id="toggle-bar-chart"
                label="Show Bar Chart"
                checked={showBarChart}
                onChange={() => setShowBarChart(!showBarChart)}
              />
            </Col>

            {/* Number of Project Cards */}
            <Col xs={12} md={6}>
              <Form.Group controlId="select-number-projects">
                <Form.Label>Number of Project Cards</Form.Label>
                <Form.Select
                  value={numberOfProjects}
                  onChange={(e) => setNumberOfProjects(e.target.value)}
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="15">15</option>
                  <option value="custom">Custom</option>
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Custom Project Input */}
            {numberOfProjects === 'custom' && (
              <Col xs={12} md={6}>
                <Form.Group controlId="custom-number-projects">
                  <Form.Label>Custom Number</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Enter custom number"
                    value={numberOfProjects}
                    onChange={(e) => setNumberOfProjects(e.target.value)}
                    min={1}
                  />
                </Form.Group>
              </Col>
            )}

            {/* View Type Selector */}
            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>Default View Type</Form.Label>
                <ToggleButtonGroup
                  type="radio"
                  name="viewType"
                  value={viewType}
                  onChange={setViewType}
                  className="d-flex gap-2"
                >
                  <ToggleButton id="viewType-lot" value="lot" variant="outline-primary">
                    Lot-wise
                  </ToggleButton>
                  <ToggleButton id="viewType-project" value="project" variant="outline-primary">
                    Project-wise
                  </ToggleButton>
                </ToggleButtonGroup>
              </Form.Group>
            </Col>

            {/* Submit Button */}
            <Col xs={12}>
              <div className="text-end">
                <Button variant="primary" type="submit">
                  Save Settings
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default CuDashboardSettings;
