import React, { useState } from 'react';
import { Card, Row, Col, Form, Button } from 'react-bootstrap';

const ProcessScreenSettings = ({ t }) => {
  const [selectedColumns, setSelectedColumns] = useState({
    interimQuantity: true,
    remarks: true,
    teamAssigned: true,
    paperTitle: true,
    paperDetails: true,
    envelopes: true,
    course: true,
    machine: true,
    zone: true,
    subject: true,
    examDate: true,
    examTime: true,
    pages: true,
  });

  const [funnelFilters, setFunnelFilters] = useState({
    hideCompleted: false,
    previousCompleted: false,
    catchesWithAlerts: false,
    catchesWithRemarks: false,
    showCatchData: false,
    showCompletionPercentage: false,
  });

  const handleColumnChange = (key) => {
    setSelectedColumns({ ...selectedColumns, [key]: !selectedColumns[key] });
  };

  const handleFunnelFilterChange = (key) => {
    setFunnelFilters({ ...funnelFilters, [key]: !funnelFilters[key] });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log({ selectedColumns, funnelFilters });
  };

  const columns = [
    { key: 'interimQuantity', label: t('interimQuantity') },
    { key: 'remarks', label: t('remarks') },
    { key: 'teamAssigned', label: t('teamAssigned') },
    { key: 'paperTitle', label: t('paperTitle') },
    { key: 'paperDetails', label: t('paperDetails') },
    { key: 'envelopes', label: t('envelopes') },
    { key: 'course', label: t('course') },
    { key: 'machine', label: t('machine') },
    { key: 'zone', label: t('zone') },
    { key: 'subject', label: t('subject') },
    { key: 'examDate', label: t('examDate') },
    { key: 'examTime', label: t('examTime') },
    { key: 'pages', label: t('pages') },
  ];

  return (
  <div>
    <Row>
      <Col xs={12}>
        <Card className="shadow-sm border-0">
          <Card.Header className="bg-light">
            <div className="d-flex align-items-center">
              <i className="bi bi-diagram-3-fill me-2 text-primary"></i>
              <h5 className="mb-0">{t('processSettings')}</h5>
            </div>
          </Card.Header>
          <Card.Body>
            <p className="text-muted mb-3 small">
              Configure process-related settings and workflow preferences.
            </p>

            <Form onSubmit={handleSubmit}>
              {/* Default Columns Section */}
              <h6 className="fw-semibold mb-2">{t('defaultColumns') || 'Default Columns'}</h6>
              <Row className="g-2 mb-3">
                {columns.map((column) => (
                  <Col sm={6} lg={4} key={column.key}>
                    <Form.Check
                      type="switch"
                      id={`column-${column.key}`}
                      label={column.label}
                      checked={selectedColumns[column.key]}
                      onChange={() => handleColumnChange(column.key)}
                    />
                  </Col>
                ))}
              </Row>

              {/* Funnel Filters Section */}
              <h6 className="fw-semibold mb-2">{t('defaultFunnelFilters') || 'Default Funnel Filters'}</h6>
              <Row className="g-2 mb-4">
                {Object.entries(funnelFilters).map(([key, value]) => (
                  <Col sm={6} lg={4} key={key}>
                    <Form.Check
                      type="switch"
                      id={`funnel-${key}`}
                      label={t(key)}
                      checked={value}
                      onChange={() => handleFunnelFilterChange(key)}
                    />
                  </Col>
                ))}
              </Row>

              {/* Submit Button */}
              <div className="text-end">
                <Button variant="primary" type="submit">
                  {t('saveSettings') || 'Save Settings'}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </div>
);

};

export default ProcessScreenSettings;
