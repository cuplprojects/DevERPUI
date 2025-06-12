import React, { useState } from 'react'
import { Container, Tabs, Tab } from 'react-bootstrap'
import CuDashboardSettings from './Components/CuDashboardSettings'
import GeneralSettings from './Components/GeneralSettings'
import ProcessScreenSettings from './Components/ProcessScreenSettings'
import 'bootstrap/dist/css/bootstrap.min.css'
import './UserSettings.css'
import { useTranslation } from "react-i18next";
import SecuritySettings from './Components/SecuritySettings/SecuritySettings'

const UserSettings = () => {
  const [activeKey, setActiveKey] = useState('dashboard')
  const { t } = useTranslation();
  return (
    <div className="user-settings-container rounded-4">
      <Container fluid className="py-4">
        <div className="row">
          <div className="col-12">
            <div className="d-flex align-items-center mb-4">
              <i className="bi bi-gear-fill me-3 text-primary" style={{ fontSize: '1.5rem' }}></i>
              <h2 className="mb-0">{t('userSettings')}</h2>
            </div>

            <Tabs
              id="user-settings-tabs"
              activeKey={activeKey}
              onSelect={(k) => setActiveKey(k)}
              className="user-settings-tabs"
              variant="tabs"
            >
              <Tab eventKey="dashboard" title={t('dashboardSettings')}>
                <div className="tab-content-wrapper p-4">
                  <CuDashboardSettings t={t}/>
                </div>
              </Tab>

              <Tab eventKey="general" title={t('generalSettings')}>
                <div className="tab-content-wrapper p-4">
                  <GeneralSettings t={t}/>
                </div>
              </Tab>

              <Tab eventKey="process" title={t('processSettings')}>
                <div className="tab-content-wrapper p-4">
                  <ProcessScreenSettings t={t}/>
                </div>
              </Tab>
              <Tab eventKey="security" title={t('securitySettings')}>
                <div className="tab-content-wrapper p-4">
                  <SecuritySettings t={t}/>
                </div>
              </Tab>
            </Tabs>
          </div>
        </div>
      </Container>
    </div>
  )
}

export default UserSettings
