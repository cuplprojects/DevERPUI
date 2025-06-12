import React, { useState } from 'react';
import { Form, Button, Alert, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useStore } from 'zustand';
import themeStore from '../../../../../store/themeStore';
import API from '../../../../../CustomHooks/MasterApiHooks/api';
import { FaEye, FaEyeSlash, FaInfoCircle } from 'react-icons/fa';

const ScreenLockPin = () => {
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showOldPin, setShowOldPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const { t } = useTranslation();

  const { getCssClasses } = useStore(themeStore);
  const cssClasses = getCssClasses();
  const [customDark, customMid, customLight, customBtn, customDarkText, customLightText, customLightBorder, customDarkBorder] = cssClasses;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!oldPin || !newPin || !confirmPin) {
      setError(t('pinRequired'));
      return;
    }

    if (newPin !== confirmPin) {
      setError(t('pinMismatch'));
      return;
    }

    const oldPinNum = parseInt(oldPin);
    const newPinNum = parseInt(newPin);

    if (isNaN(oldPinNum) || isNaN(newPinNum) || oldPinNum <= 0 || newPinNum <= 0) {
      setError(t('pinMustBePositive'));
      return;
    }

    if (newPin.length < 3 || newPin.length > 4) {
      setError(t('pinLengthError'));
      return;
    }

    if (oldPinNum === newPinNum) {
      setError(t('pinMustBeDifferent'));
      return;
    }

    try {
      await API.put('/User/ChangeScreenLockPin', {
        oldPin: oldPinNum,
        newPin: newPinNum
      });
      setSuccess(t('pinUpdateSuccess'));
      setTimeout(() => {
        setOldPin('');
        setNewPin('');
        setConfirmPin('');
        setError('');
        setSuccess('');
      }, 2000);
    } catch (error) {
      if (error.response?.status === 400) {
        setError(error.response.data.message || t('pinUpdateError'));
      } else if (error.response?.status === 401) {
        setError(t('userNotAuthenticated'));
      } else if (error.response?.status === 404) {
        setError(t('userNotFound'));
      } else {
        setError(t('pinUpdateError'));
      }
    }
  };

  const handlePinChange = (value, setter) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setter(numericValue);
  };

  return (
    <div className="screen-lock-pin-container">
      <div className={`p-4 rounded ${customLight}`}>
        <h2 className={customDarkText}>{t('changeScreenLockPin')}</h2>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label className={`d-flex align-items-center ${customDarkText}`}>
              {t('currentPin')}
              <OverlayTrigger
                placement="right"
                overlay={<Tooltip>{t('If new user pin is 123')}</Tooltip>}
              >
                <Button
                  variant="link"
                  className="p-0 ms-2"
                >
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

          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" type="button">
              {t('cancel')}
            </Button>
            <Button type="submit" className={customBtn}>
              {t('save')}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default ScreenLockPin;
