import React, { useRef } from 'react';
import { Container, Nav } from 'react-bootstrap';
import CuDashboardSettings from './Components/CuDashboardSettings';
import GeneralSettings from './Components/GeneralSettings';
import ProcessScreenSettings from './Components/ProcessScreenSettings';
import 'bootstrap/dist/css/bootstrap.min.css';
import './UserSettings.css';
import { useTranslation } from "react-i18next";
import SecuritySettings from './Components/SecuritySettings/SecuritySettings';
import { Dropdown } from 'react-bootstrap';

const UserSettings = () => {
  const { t } = useTranslation();
  const dashboardRef = useRef(null);
  const generalRef = useRef(null);
  const processRef = useRef(null);
  const securityRef = useRef(null);

  const scrollToSection = (ref) => {
    ref.current.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="user-settings-container rounded-4">
      <Container fluid className="py-4">
        <div className="row">
          <div className="col-12">
            <div className="d-flex align-items-center mb-4">
              <i className="bi bi-gear-fill me-3 text-primary" style={{ fontSize: '1.5rem' }}></i>
              <h2 className="mb-0">{t('userSettings')}</h2>
            </div>

            <Nav variant="tabs" className="user-settings-tabs">
              <Nav.Item>
                <Nav.Link onClick={() => scrollToSection(dashboardRef)}>{t('dashboardSettings')}</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link onClick={() => scrollToSection(generalRef)}>{t('generalSettings')}</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link onClick={() => scrollToSection(processRef)}>{t('processSettings')}</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link onClick={() => scrollToSection(securityRef)}>{t('securitySettings')}</Nav.Link>
              </Nav.Item>
            </Nav>

            <div className="container-fluid p-4">
              <div ref={dashboardRef} className="mb-4">
                <h2>{t('dashboardSettings')}</h2>
                <CuDashboardSettings t={t} />
              </div>
              <div className="my-4">
                <hr className="my-2" />
              </div>
              <div ref={generalRef} className="mb-4">
                <h2>{t('generalSettings')}</h2>
                <GeneralSettings t={t} />
              </div>
              <div className="my-4">
                <hr className="my-2" />
              </div>
              <div ref={processRef} className="mb-4">
                <h2>{t('processSettings')}</h2>
                <ProcessScreenSettings t={t} />
              </div>
              <div className="my-4">
                <hr className="my-2" />
              </div>
              <div ref={securityRef} className="mb-4">
                <h2>{t('securitySettings')}</h2>
                <SecuritySettings t={t} />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default UserSettings;
