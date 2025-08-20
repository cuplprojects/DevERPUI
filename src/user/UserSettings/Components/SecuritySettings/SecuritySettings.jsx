import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Card, Row, Col, Container } from 'react-bootstrap';
import ChangePassword from './Components/ChangePassword';
import ScreenLockPin from './Components/ScreenLockPin';
import { useStore } from 'zustand';

const SecuritySettings = forwardRef(({ t, getCssClasses, IoSave, settings, getCurrentSettings }, ref) => {
  const screenLockPinRef = useRef();

  // Expose getSettings method to parent component
  useImperativeHandle(ref, () => ({
    getSettings: () => {
      const screenLockData = screenLockPinRef.current?.getSettings();
      return {
        screenLockTime: screenLockData?.screenLockTime || 5
      };
    }
  }));

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
    <Container className={`mt-4`}>
      <Row className="">
        <Col md={6} sm={12}>
            <ChangePassword />
        </Col>
        <Col md={6} sm={12}>
          <Card className={`shadow-lg rounded-4 p-1 ${customLightBorder} ${customLight}`}>
            <ScreenLockPin
              ref={screenLockPinRef}
              t={t}
              getCssClasses={getCssClasses}
              IoSave={IoSave}
              settings={settings}
              getCurrentSettings={getCurrentSettings}
            />
          </Card>
        </Col>
      </Row>
    </Container>
  );
});

export default SecuritySettings;
