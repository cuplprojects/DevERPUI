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

const GeneralSettings = forwardRef(({ t, getCssClasses, IoSave, settings, getCurrentSettings }, ref) => {
  const [language, setLanguage] = useState('english');
  const [fontSize, setFontSize] = useState('medium');
  const [pageLimit, setPageLimit] = useState('10');
  const [loading, setLoading] = useState(false);

  const { updateSettingSection } = useSettingsActions();
  const userData = useUserData();

  // Expose getSettings method to parent component
  useImperativeHandle(ref, () => ({
    getSettings: () => ({
      language,
      fontSize,
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

  // Load current settings when component mounts or settings change
  useEffect(() => {
    if (getCurrentSettings) {
      const currentSettings = getCurrentSettings();
      const generalSettings = currentSettings.general || {};

      setLanguage(generalSettings.language || 'english');
      setFontSize(generalSettings.fontSize || 'medium');
      setPageLimit(generalSettings.pageLimit?.toString() || '10');
    }
  }, [getCurrentSettings, settings]);

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

      const success_result = await updateSettingSection(userData.userId, 'general', generalSettings);

      if (success_result) {
        success(t('generalSettingsSavedSuccessfully'));
      } else {
        error(t('failedToSaveGeneralSettings'));
      }
    } catch (err) {
      console.error('Error saving general settings:', err);
      error(t('failedToSaveGeneralSettings'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={`shadow-lg p-2 border-0 ${customLight} ${customLightBorder} ${customDarkText} `}>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Row className="g-4 mb-3">
            {/* Language Toggle with Flags */}
            <Col xs={12} md={6}>
              <Form.Group controlId="language-select">
                <Form.Label>Language</Form.Label>
                <ToggleButtonGroup
                  type="radio"
                  name="language"
                  value={language}
                  onChange={setLanguage}
                  className="d-flex gap-2"
                >
                  <ToggleButton
                    id="lang-en"
                    value="english"
                    variant={language === 'english' ? 'primary' : 'outline-primary'}
                    className="d-flex align-items-center justify-content-center gap-2 px-3"
                  >
                    🇬🇧 <span>English</span>
                  </ToggleButton>
                  <ToggleButton
                    id="lang-hi"
                    value="hindi"
                    variant={language === 'hindi' ? 'primary' : 'outline-primary'}
                    className="d-flex align-items-center justify-content-center gap-2 px-3"
                  >
                    🇮🇳 <span>Hindi</span>
                  </ToggleButton>
                </ToggleButtonGroup>
              </Form.Group>
            </Col>

            {/* Font Size */}
            <Col xs={12} md={6}>
              <Form.Group controlId="font-size-select">
                <Form.Label>Font Size</Form.Label>
                <Form.Select value={fontSize} onChange={(e) => setFontSize(e.target.value)}>
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <Row className={`g-4 d-flex align-items-end`}>
            {/* Page Limit */}
            <Col xs={12} md={6}>
              <Form.Group controlId="page-limit-select">
                <Form.Label>Default Page Limit</Form.Label>
                <Form.Select value={pageLimit} onChange={(e) => setPageLimit(e.target.value)}>
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Submit Button */}
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
