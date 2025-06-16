import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Form, Button, Alert, OverlayTrigger, Tooltip, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useStore } from 'zustand';
import themeStore from '../../../../../store/themeStore';
import API from '../../../../../CustomHooks/MasterApiHooks/api';
import { FaEye, FaEyeSlash, FaInfoCircle } from 'react-icons/fa';
import { useSettingsActions } from '../../../../../store/useSettingsStore';
import { useUserData } from '../../../../../store/userDataStore';
// import { success, error } from '../../../../../CustomHooks/Services/AlertMessageService';
import { success, error } from './../../../../../CustomHooks/Services/AlertMessageService';

const ScreenLockPin = forwardRef(({ t, getCssClasses, IoSave, settings, getCurrentSettings }, ref) => {
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [screenLockTime, setScreenLockTime] = useState('5'); // Default: 5 minutes
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showOldPin, setShowOldPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [loading, setLoading] = useState(false);

  const { updateSettingSection } = useSettingsActions();
  const userData = useUserData();

  // Expose getSettings method to parent component
  useImperativeHandle(ref, () => ({
    getSettings: () => ({
      screenLockTime: parseInt(screenLockTime)
    })
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

  // Load current settings when component mounts or settings change
  useEffect(() => {
    if (getCurrentSettings) {
      const currentSettings = getCurrentSettings();
      const securitySettings = currentSettings.securitySettings || {};

      setScreenLockTime(securitySettings.screenLockTime?.toString() || '5');
    }
  }, [getCurrentSettings, settings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!oldPin || !newPin || !confirmPin) {
      setErrorMsg(t('pinRequired'));
      return;
    }

    if (newPin !== confirmPin) {
      setErrorMsg(t('pinMismatch'));
      return;
    }

    const oldPinNum = parseInt(oldPin);
    const newPinNum = parseInt(newPin);

    if (isNaN(oldPinNum) || isNaN(newPinNum) || oldPinNum <= 0 || newPinNum <= 0) {
      setErrorMsg(t('pinMustBePositive'));
      return;
    }

    if (newPin.length < 3 || newPin.length > 4) {
      setErrorMsg(t('pinLengthError'));
      return;
    }

    if (oldPinNum === newPinNum) {
      setErrorMsg(t('pinMustBeDifferent'));
      return;
    }

    if (!userData?.userId) {
      setErrorMsg(t('userNotFound'));
      return;
    }

    setLoading(true);
    try {
      // Update PIN via existing API
      await API.put('/User/ChangeScreenLockPin', {
        oldPin: oldPinNum,
        newPin: newPinNum
      });

      // Show success alerts
      setSuccessMsg(t('pinUpdateSuccess'));
      success(t('pinUpdateSuccess') || 'PIN updated successfully!');

      setTimeout(() => {
        setOldPin('');
        setNewPin('');
        setConfirmPin('');
        setErrorMsg('');
        setSuccessMsg('');
      }, 2000);
    } catch (err) {
      console.error('Error updating PIN:', err);
      let errorMessage = '';

      if (err.response?.status === 400) {
        errorMessage = err.response.data.message || t('pinUpdateError');
      } else if (err.response?.status === 401) {
        errorMessage = t('userNotAuthenticated');
      } else if (err.response?.status === 404) {
        errorMessage = t('userNotFound');
      } else {
        errorMessage = t('pinUpdateError');
      }

      // Show error alerts
      setErrorMsg(errorMessage);
      error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePinChange = (value, setter) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setter(numericValue);
  };

  return (
    <div className="screen-lock-pin-container">
  <div className={`p-2 rounded ${customLight}`}>
     <div className="d-flex justify-content-center align-items-center gap-2">
    <h className={`${customDarkText} text-center fw-bold mb-2`}>{t('changeScreenLockPin')}</h></div>
    {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}
    {successMsg && <Alert variant="success">{successMsg}</Alert>}

    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label className={`d-flex align-items-center ${customDarkText}`}>
          {t('currentPin')}
          <OverlayTrigger
            placement="right"
            overlay={<Tooltip>{t('If new user pin is 123')}</Tooltip>}
          >
            <Button variant="link" className="p-0 ms-2">
              <FaInfoCircle />
            </Button>
          </OverlayTrigger>
        </Form.Label>
        <div className="input-group">
          <Form.Control
            type={showOldPin ? "text" : "password"}
            maxLength={4}
            value={oldPin}
            onChange={(e) => handlePinChange(e.target.value, setOldPin)}
            required
            inputMode="numeric"
          />
          <Button
            variant="outline-secondary"
            onClick={() => setShowOldPin(!showOldPin)}
          >
            {showOldPin ? <FaEyeSlash /> : <FaEye />}
          </Button>
        </div>
      </Form.Group>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className={customDarkText}>{t('newPin')}</Form.Label>
            <div className="input-group">
              <Form.Control
                type={showNewPin ? "text" : "password"}
                maxLength={4}
                value={newPin}
                onChange={(e) => handlePinChange(e.target.value, setNewPin)}
                required
                inputMode="numeric"
              />
              <Button
                variant="outline-secondary"
                onClick={() => setShowNewPin(!showNewPin)}
              >
                {showNewPin ? <FaEyeSlash /> : <FaEye />}
              </Button>
            </div>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className={customDarkText}>{t('confirmPin')}</Form.Label>
            <div className="input-group">
              <Form.Control
                type={showConfirmPin ? "text" : "password"}
                maxLength={4}
                value={confirmPin}
                onChange={(e) => handlePinChange(e.target.value, setConfirmPin)}
                required
                inputMode="numeric"
              />
              <Button
                variant="outline-secondary"
                onClick={() => setShowConfirmPin(!showConfirmPin)}
              >
                {showConfirmPin ? <FaEyeSlash /> : <FaEye />}
              </Button>
            </div>
          </Form.Group>
        </Col>
      </Row>
      <Row className='d-flex align-items-center'>
        <Col md={12} lg={6}>
          <Form.Group className="mb-3">
            <Form.Label className={customDarkText}>{t('screenLockTimeout')}</Form.Label>
            <Form.Select
              value={screenLockTime}
              onChange={(e) => setScreenLockTime(e.target.value)}
              required
            >
              <option value="2">2 {t('minutes')}</option>
              <option value="5">5 {t('minutes')}</option>
              <option value="10">10 {t('minutes')}</option>
              <option value="30">30 {t('minutes')}</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={12} lg={6} className='mt-3'>
          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" type="button">
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              className={`${customBtn} border-1 ${customLightBorder}`}
              disabled={loading}
            >
              <IoSave /> <span className="d-none d-md-inline">
                {loading ? t('saving...') : t('save')}
              </span>
            </Button>
          </div>
        </Col>
      </Row>
    </Form>
  </div>
</div>

  );
});

export default ScreenLockPin;
