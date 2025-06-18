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
import { useUserData } from '../../../store/userDataStore';
import { success, error } from '../../../CustomHooks/Services/AlertMessageService';
import API from '../../../CustomHooks/MasterApiHooks/api';

const CuDashboardSettings = forwardRef(({ t, getCssClasses, IoSave, settings, getCurrentSettings }, ref) => {
  const [showDashboardTable, setShowDashboardTable] = useState(true);
  const [showBarChart, setShowBarChart] = useState(true);
  const [numberOfProjects, setNumberOfProjects] = useState(5);
  const [viewType, setViewType] = useState('project');
  const [loading, setLoading] = useState(false);

  const userData = useUserData();

  useImperativeHandle(ref, () => ({
    getSettings: () => ({
      showDashboardTable,
      showBarChart,
      numberOfProjects: parseInt(numberOfProjects),
      viewType
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

  useEffect(() => {
    if (getCurrentSettings) {
      const currentSettings = getCurrentSettings();
      const dashboardSettings = currentSettings.dashboardSettings || {};

      setShowDashboardTable(dashboardSettings.showDashboardTable ?? true);
      setShowBarChart(dashboardSettings.showBarChart ?? true);
      setNumberOfProjects(dashboardSettings.numberOfProjects || 5);
      setViewType(dashboardSettings.viewType || 'project');
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
      const dashboardSettings = {
        showDashboardTable,
        showBarChart,
        numberOfProjects: parseInt(numberOfProjects),
        viewType
      };

      // Prepare payload for backend
      const payload = {
        UserId: userData.userId,
        Settings: JSON.stringify({ dashboardSettings })
      };

      // Send to backend
      const response = await API.post('/Settings', payload);

      if (response.data) {
        success(t('dashboardSettingsSavedSuccessfully'));

        // Update userSettings localStorage to ensure synchronization
        const userSettings = JSON.parse(localStorage.getItem('userSettings') || '{}');
        userSettings.settings = { ...userSettings.settings, dashboardSettings };
        localStorage.setItem('userSettings', JSON.stringify(userSettings));

        // Dispatch custom event to notify other components about settings update
        window.dispatchEvent(new CustomEvent('userSettingsUpdated', {
          detail: { settings: { ...userSettings.settings, dashboardSettings } }
        }));
      }
    } catch (err) {
      console.error('Error saving dashboard settings:', err);
      error(t('failedToSaveDashboardSettings'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={`shadow-lg p-1 border-0 ${customLight} ${customLightBorder} ${customDarkText}`}>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Row className="g-3 mb-3">
            <Col xs={12} lg={6} md={6}>
              <Form.Check
                type="switch"
                id="toggle-dashboard-table"
                label={t("showDashboardTable")}
                checked={showDashboardTable}
                onChange={() => setShowDashboardTable(!showDashboardTable)}
              />
            </Col>

            <Col xs={12} md={6} lg={6}>
              <Form.Check
                type="switch"
                id="toggle-bar-chart"
                label={t('showBarChart')}
                checked={showBarChart}
                onChange={() => setShowBarChart(!showBarChart)}
              />
            </Col>
          </Row>

          <Row className="g-3">
            <Col xs={12} lg={6} md={6}>
              <Form.Group controlId="select-number-projects">
                <Form.Label>{t('defaultProjectCards')}</Form.Label>
                <Form.Select
                  value={numberOfProjects}
                  onChange={(e) => setNumberOfProjects(e.target.value)}
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="15">15</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col xs={12} lg={6} md={6}>
              <Form.Group>
                <Form.Label>{t('defaultViewType')}</Form.Label>
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
          </Row>
          <Row className="g-3 mt-1">
            <Col xs={12} lg={12} md={12}>
              <div className="text-end">
                <Button
                  type="submit"
                  className={`${customBtn} ${customLightText} ${customLightBorder} border-1`}
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

export default CuDashboardSettings;
