import React, { useState } from 'react';
import { Card, Row, Col, Form, Button } from 'react-bootstrap';

const ProcessScreenSettings = ({ t, getCssClasses, IoSave }) => {
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

  const [
    customDark,
    customMid,
    customLight,
    customBtn,
    customDarkText,
    customLightText,
    customLightBorder,
    customDarkBorder
  ] = getCssClasses();

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
          <Card className={`shadow-lg p-1 border-0 ${customLight} ${customLightBorder} ${customDarkText} `}>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                {/* Default Columns Section */}
                <h6 className="fw-semibold mb-2">{t('defaultColumns') || 'Default Columns'}</h6>
                <Row className="g-2 mb-3 mt-1">
                  {columns.map((column) => (
                    <Col sm={6} lg={2} md={4} key={column.key}>
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
                <Row className="g-2 mb-4 mt-1">
                  {Object.entries(funnelFilters).map(([key, value]) => (
                    <Col sm={6} lg={4} md={4} key={key}>
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
                  <Button type="submit" className={`${customBtn}  ${customLightText} ${customLightBorder} border-1`}>
                    <IoSave /> <span className="d-none d-md-inline">Save Settings</span>
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
