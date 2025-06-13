import React, { useEffect, useRef, useState } from 'react';
import {
  Container, Nav, Row,
  Col,
} from 'react-bootstrap';
import CuDashboardSettings from './Components/CuDashboardSettings';
import GeneralSettings from './Components/GeneralSettings';
import ProcessScreenSettings from './Components/ProcessScreenSettings';
import 'bootstrap/dist/css/bootstrap.min.css';
import './UserSettings.css';
import { useTranslation } from "react-i18next";
import SecuritySettings from './Components/SecuritySettings/SecuritySettings';
import { Dropdown } from 'react-bootstrap';
import themeStore from '../../store/themeStore';
import { useStore } from 'zustand';
import { IoSave } from "react-icons/io5";
import { IoSettingsSharp } from "react-icons/io5";

const UserSettings = () => {
  const { t } = useTranslation();
  const dashboardRef = useRef(null);
  const generalRef = useRef(null);
  const processRef = useRef(null);
  const securityRef = useRef(null);
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
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollThreshold = 100;
      if (window.scrollY > scrollThreshold) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const scrollToSection = (ref) => {
    ref.current.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className={` ${customLight} user-settings-container rounded-4 shadow-lg`}>
      <Container className="py-4">
        <div className="row">
          <div className="col-12">
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
