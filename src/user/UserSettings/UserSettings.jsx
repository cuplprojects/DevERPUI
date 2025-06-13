import React, { useEffect, useRef, useState } from 'react';
import { Container, Nav } from 'react-bootstrap';
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
            <div className="d-flex align-items-center mb-4">
              <i className="bi bi-gear-fill me-3 text-primary" style={{ fontSize: '1.5rem' }}></i>
              <h2 className={`${customDarkText} mb-0`}>{t('userSettings')}</h2>
            </div>
            <Nav
              variant="pills"
              className={`user-settings-tabs shadow-sm py-2 px-3 rounded-2 gap-2 flex-wrap ${isSticky ? 'sticky-on' : 'sticky-off'
                } ${customLightBorder} shadow-lg`}
              style={{ top: 60, zIndex: 1020 }}
            >

              <Nav.Item>
                <Nav.Link onClick={() => scrollToSection(dashboardRef)} className={`${customDarkText} fw-medium`}>
                  {t('dashboardSettings')}
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link onClick={() => scrollToSection(generalRef)} className={`${customDarkText} fw-medium`}>
                  {t('generalSettings')}
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link onClick={() => scrollToSection(processRef)} className={`${customDarkText} fw-medium`}>
                  {t('processSettings')}
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link onClick={() => scrollToSection(securityRef)} className={`${customDarkText} fw-medium`}>
                  {t('securitySettings')}
                </Nav.Link>
              </Nav.Item>
            </Nav>


            <div className="container-fluid p-4">
              <div ref={dashboardRef} className="mb-4">
                <h2 className={`${customDarkText}`}>{t('dashboardSettings')}</h2>
                <CuDashboardSettings t={t} getCssClasses={getCssClasses} IoSave={IoSave} />
              </div>
              <div className="my-4">
                <hr className="my-2" />
              </div>
              <div ref={generalRef} className="mb-4">
                <h2 className={`${customDarkText}`}>{t('generalSettings')}</h2>
                <GeneralSettings t={t} getCssClasses={getCssClasses} IoSave={IoSave} />
              </div>
              <div className="my-4">
                <hr className="my-2" />
              </div>
              <div ref={processRef} className="mb-4">
                <h2 className={`${customDarkText}`}>{t('processSettings')}</h2>
                <ProcessScreenSettings t={t} getCssClasses={getCssClasses} IoSave={IoSave} />
              </div>
              <div className="my-4">
                <hr className="my-2" />
              </div>
              <div ref={securityRef} className="mb-4">
                <h2 className={`${customDarkText}`}>{t('securitySettings')}</h2>
                <SecuritySettings t={t} getCssClasses={getCssClasses} IoSave={IoSave} />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default UserSettings;
