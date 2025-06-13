import { useEffect, useState } from 'react';
import {
  Container, Row,
  Col,
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
              <Col lg={4} md={2} className='d-flex justify-content-end'>
                <button
                  className={`btn btn-outline-danger  me-2 d-flex align-items-center gap-1`}
                  title={t('resetAll')}
                >
                  <LuTimerReset />
                  {t('reset')}
                </button>
              </Col>
            </Row>


            {/* General & Dashbaord Settings */}
            <Row className='mt-5'>
              {/* General Settings */}
              <Col lg={6} md={12} className={``}>
                <div className={`${customLightBorder} rounded-2 p-2`} >
                  <h3 className={`${customDarkText}`}>{t('generalSettings')}</h3>
                  <GeneralSettings t={t} getCssClasses={getCssClasses} IoSave={IoSave} />
                </div>
              </Col>
              {/* CuDashboard Settings  */}
              <Col lg={6} md={12} className={``}>
                <div className={`${customLightBorder} rounded-2 p-1`}>
                  <h3 className={`${customDarkText}`}>{t('dashboardSettings')}</h3>
                  <CuDashboardSettings t={t} getCssClasses={getCssClasses} IoSave={IoSave} />
                </div>
              </Col>
            </Row>
            {/* Process Screen Settings */}
            <Row className='mt-3'>
              <Col lg={12} md={12} className={``}>
                <h3 className={`${customDarkText}`}>{t('processSettings')}</h3>
                <ProcessScreenSettings t={t} getCssClasses={getCssClasses} IoSave={IoSave} />
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
