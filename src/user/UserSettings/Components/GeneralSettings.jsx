import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
  Card,
  Row,
  Col,
  Form,
  ToggleButton,
  ToggleButtonGroup,
  Button
} from 'react-bootstrap';
import { useSettingsActions } from '../../../store/useSettingsStore';
import { useUserData } from '../../../store/userDataStore';
import { success, error } from '../../../CustomHooks/Services/AlertMessageService';
import EnglishIcon from "./../../../assets/Icons/English.png";
import HindiIcon from "./../../../assets/Icons/Hindi.png";
import useLanguageStore from '../../../store/languageStore';
import API from '../../../CustomHooks/MasterApiHooks/api';

const GeneralSettings = forwardRef(({ t, getCssClasses, IoSave, settings, getCurrentSettings }, ref) => {
  const [fontSize, setFontSize] = useState('16');
  const [pageLimit, setPageLimit] = useState('10');
  const [loading, setLoading] = useState(false);

  const { updateSettingSection } = useSettingsActions();
  const userData = useUserData();
  const { language, setLanguage } = useLanguageStore();

  useImperativeHandle(ref, () => ({
    getSettings: () => ({
      language,
      fontSize: `${fontSize}`,
      pageLimit: parseInt(pageLimit)
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

  // Load initial settings
  useEffect(() => {
    if (getCurrentSettings) {
      const currentSettings = getCurrentSettings();
      const generalSettings = currentSettings.general || {};
      setFontSize(generalSettings.fontSize || '16');
      setPageLimit(generalSettings.pageLimit?.toString() || '10');
    }
  }, [getCurrentSettings, settings]);

  // Effect for immediate font size updates
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
  }, [fontSize]);

  // Effect for immediate language-based font family updates
  useEffect(() => {
    const fontFamily = language === 'hi'
      ? "'Noto Sans Devanagari', sans-serif"
      : "'Roboto', sans-serif";
    document.documentElement.style.fontFamily = fontFamily;
  }, [language]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!userData?.userId) {
      error(t('userNotFound'));
      return;
    }

    setLoading(true);
    try {
      const generalSettings = {
        language,
        fontSize,
        pageLimit: parseInt(pageLimit)
      };

      const payload = {
        UserId: userData.userId,
        Settings: JSON.stringify({ general: generalSettings })
      };

      const response = await API.post('/Settings', payload);

      if (response.data) {
        success(t('generalSettingsSavedSuccessfully'));

        const userSettings = JSON.parse(localStorage.getItem('userSettings') || '{}');
        userSettings.settings = { ...userSettings.settings, general: generalSettings };
        localStorage.setItem('userSettings', JSON.stringify(userSettings));

        window.dispatchEvent(new CustomEvent('userSettingsUpdated', {
          detail: { settings: { ...userSettings.settings, general: generalSettings } }
        }));
      }
    } catch (err) {
      console.error('Error saving general settings:', err);
      error(t('failedToSaveGeneralSettings'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={`shadow-lg p-2 border-0 ${customLight} ${customLightBorder} ${customDarkText}`}>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Row className="g-4 mb-3">
            <Col xs={12} md={6}>
              <Form.Group controlId="language-select">
                <Form.Label>{t('language')}</Form.Label>
                <ToggleButtonGroup
                  type="radio"
                  name="language"
                  value={language}
                  onChange={setLanguage}
                  className="d-flex gap-2"
                >
                  <ToggleButton
                    id="lang-en"
                    value="en"
                    variant={language === 'en' ? 'primary' : 'outline-primary'}
                    className="d-flex align-items-center justify-content-center gap-2 px-3"
                  >
                    <img src={EnglishIcon} alt="English" style={{ width: '20px' }} /> <span>English</span>
                  </ToggleButton>
                  <ToggleButton
                    id="lang-hi"
                    value="hi"
                    variant={language === 'hi' ? 'primary' : 'outline-primary'}
                    className="d-flex align-items-center justify-content-center gap-2 px-3"
                  >
                    <img src={HindiIcon} alt="Hindi" style={{ width: '20px' }} /> <span>हिन्दी</span>
                  </ToggleButton>
                </ToggleButtonGroup>
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group controlId="font-size-slider">
                <Form.Label>
                  {t('fontSize')} ({fontSize})
                </Form.Label>
                <Form.Range
                  min={12}
                  max={24}
                  step={1}
                  value={parseInt(fontSize)}
                  onChange={(e) => setFontSize(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className={`g-4 d-flex align-items-end`}>
            <Col xs={12} md={6}>
              <Form.Group controlId="page-limit-select">
                <Form.Label>{t('defaultPageLimit')}</Form.Label>
                <Form.Select value={pageLimit} onChange={(e) => setPageLimit(e.target.value)}>
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col xs={12} lg={6} md={6} className='d-flex justify-content-end'>
              <div className="text-end">
                <Button
                  variant="primary"
                  type="submit"
                  className={`${customBtn} border-1 ${customLightText} ${customLightBorder}`}
                  disabled={loading}
                >
                  <IoSave /> <span className="d-none d-md-inline">
                    {loading ? t('saving...') : t('saveSettings')}
                  </span>
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      </Card.Body>
    </Card>
  );
});

export default GeneralSettings;
