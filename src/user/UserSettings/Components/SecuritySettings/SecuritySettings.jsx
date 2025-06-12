import React from 'react';
import { Card, Row, Col, Container } from 'react-bootstrap';
import ChangePassword from './Components/ChangePassword';
import ScreenLockPin from './Components/ScreenLockPin';
import { useStore } from 'zustand';


const SecuritySettings = ({getCssClasses}) => {

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

  return (
    <Container fluid className={`mt-4`}>
      <Row className="gy-4">
        <Col md={6}>
          <Card className={`shadow-lg rounded-4 p-4 ${customLightBorder} ${customLight}`}>
            <ChangePassword />
          </Card>
        </Col>
        <Col md={6}>
          <Card className={`shadow-lg rounded-4 p-4 ${customLightBorder} ${customLight}`}>
            <ScreenLockPin />
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SecuritySettings;
