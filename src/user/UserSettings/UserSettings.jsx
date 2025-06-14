import { useEffect, useState, useRef } from 'react';
import {
  Container, Row,
  Col, Button
} from 'react-bootstrap';
import CuDashboardSettings from './Components/CuDashboardSettings';
import GeneralSettings from './Components/GeneralSettings';
import ProcessScreenSettings from './Components/ProcessScreenSettings';
import 'bootstrap/dist/css/bootstrap.min.css';
import './UserSettings.css';
import { useTranslation } from "react-i18next";
import SecuritySettings from './Components/SecuritySettings/SecuritySettings';
import themeStore from '../../store/themeStore';
import { useStore } from 'zustand';
import { IoSave } from "react-icons/io5";
import { IoSettingsSharp } from "react-icons/io5";
import { LuTimerReset } from "react-icons/lu";
import { useSettings, useSettingsActions, useSettingsLoading } from '../../store/useSettingsStore';
import { useUserData } from '../../store/userDataStore';
import { success, error } from '../../CustomHooks/Services/AlertMessageService';
import API from '../../CustomHooks/MasterApiHooks/api';

const UserSettings = () => {
  const { t } = useTranslation();
  const { getCssClasses } = useStore(themeStore);
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

  // Settings store hooks
  const settings = useSettings();
  const loading = useSettingsLoading();
  const { getCurrentSettings, setDefaultSettings } = useSettingsActions();
  const userData = useUserData();

  // State for saving all settings
  const [saveAllLoading, setSaveAllLoading] = useState(false);

  // Refs to get data from child components
  const generalSettingsRef = useRef();
  const dashboardSettingsRef = useRef();
  const processSettingsRef = useRef();

  // Reset all settings to default
  const handleResetAll = async () => {
    if (userData?.userId) {
      try {
        await setDefaultSettings(userData.userId);
        success(t('settingsResetSuccessfully'));
      } catch (err) {
        error(t('failedToResetSettings'));
      }
    }
  };

  // Save all settings function
  const handleSaveAllSettings = async () => {
    if (!userData?.userId) {
      error(t('userNotFound'));
      return;
    }

    setSaveAllLoading(true);
    try {
      // Get data from all child components
      const generalData = generalSettingsRef.current?.getSettings();
      const dashboardData = dashboardSettingsRef.current?.getSettings();
      const processData = processSettingsRef.current?.getSettings();

      // Combine all settings
      const allSettings = {
        general: generalData || {},
        dashboardSettings: dashboardData || {},
        processScreenSettings: processData || {}
      };

      // Prepare payload for backend
      const payload = {
        UserId: userData.userId,
        Settings: JSON.stringify(allSettings)
      };

      console.log('Saving all settings:', payload);

      // Send to backend
      const response = await API.post('/Settings', payload);

      if (response.data) {
        success(t('allSettingsSavedSuccessfully'));
        // Optionally refresh settings in store
        // await fetchSettings(userData.userId);
      }
    } catch (err) {
      console.error('Error saving all settings:', err);
      error(t('failedToSaveAllSettings'));
    } finally {
      setSaveAllLoading(false);
    }
  };

  return (
    <div className={`${customLight} user-settings-container rounded-4 shadow-lg`}>
      <Container className="py-2">
        <div className="row">
          <div className="">
            <Row className='d-flex align-items-center'>
              <Col lg={4} md={2}></Col>
              <Col lg={4} md={8}>
                <div className="d-flex align-items-center justify-content-center mb-4">
                  <h2 className={`${customDarkText} mb-0 text-center d-flex align-items-center justify-content-center`}>
                    <span>
                      <IoSettingsSharp className='me-2 settings-icon-rotate ' />
                    </span>
                    <span>
                      {t('userSettings')}
                    </span>
                  </h2>
                </div>
              </Col>
              <Col lg={4} md={2} className='d-flex justify-content-end gap-2'>
                <Button
                  variant="success"
                  className={`d-flex align-items-center gap-1`}
                  title={t('saveAllSettings')}
                  onClick={handleSaveAllSettings}
                  disabled={saveAllLoading || loading}
                >
                  <IoSave />
                  {saveAllLoading ? t('saving...') : t('saveAll')}
                </Button>
                <Button
                  variant="outline-danger"
                  className={`d-flex align-items-center gap-1`}
                  title={t('resetAll')}
                  onClick={handleResetAll}
                  disabled={loading || saveAllLoading}
                >
                  <LuTimerReset />
                  {t('reset')}
                </Button>
              </Col>
            </Row>


            {/* General & Dashbaord Settings */}
            <Row className='mt-5'>
              {/* General Settings */}
              <Col lg={6} md={12} className={``}>
                <div className={`${customLightBorder} rounded-2 p-2`} >
                  <h3 className={`${customDarkText}`}>{t('generalSettings')}</h3>
                  <GeneralSettings
                    ref={generalSettingsRef}
                    t={t}
                    getCssClasses={getCssClasses}
                    IoSave={IoSave}
                    settings={settings}
                    getCurrentSettings={getCurrentSettings}
                  />
                </div>
              </Col>
              {/* CuDashboard Settings  */}
              <Col lg={6} md={12} className={``}>
                <div className={`${customLightBorder} rounded-2 p-1`}>
                  <h3 className={`${customDarkText}`}>{t('dashboardSettings')}</h3>
                  <CuDashboardSettings
                    ref={dashboardSettingsRef}
                    t={t}
                    getCssClasses={getCssClasses}
                    IoSave={IoSave}
                    settings={settings}
                    getCurrentSettings={getCurrentSettings}
                  />
                </div>
              </Col>
            </Row>
            {/* Process Screen Settings */}
            <Row className='mt-3'>
              <Col lg={12} md={12} className={``}>
                <h3 className={`${customDarkText}`}>{t('processSettings')}</h3>
                <ProcessScreenSettings
                  ref={processSettingsRef}
                  t={t}
                  getCssClasses={getCssClasses}
                  IoSave={IoSave}
                  settings={settings}
                  getCurrentSettings={getCurrentSettings}
                />
              </Col>
            </Row>
            {/* Security Settings */}
            <Row className='mt-3'>
              <Col lg={12} md={12}>
                <div className="">
                  <h3 className={`${customDarkText}`}>{t('securitySettings')}</h3>
                  <SecuritySettings t={t} getCssClasses={getCssClasses} IoSave={IoSave} />
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default UserSettings;
