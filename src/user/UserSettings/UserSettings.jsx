import React, { useState } from 'react'
import { Container, Tabs, Tab } from 'react-bootstrap'
import CuDashboardSettings from './Components/CuDashboardSettings'
import GeneralSettings from './Components/GeneralSettings'
import ProcessScreenSettings from './Components/ProcessScreenSettings'
import 'bootstrap/dist/css/bootstrap.min.css'
import './UserSettings.css'

const UserSettings = () => {
  const [activeKey, setActiveKey] = useState('dashboard')

  return (
    <div className="user-settings-container rounded-4">
      <Container fluid className="py-4">
        <div className="row">
          <div className="col-12">
            <div className="d-flex align-items-center mb-4">
              <i className="bi bi-gear-fill me-3 text-primary" style={{ fontSize: '1.5rem' }}></i>
              <h2 className="mb-0">User Settings</h2>
            </div>

            <Tabs
              id="user-settings-tabs"
              activeKey={activeKey}
              onSelect={(k) => setActiveKey(k)}
              className="user-settings-tabs"
              variant="tabs"
            >
              <Tab eventKey="dashboard" title="Dashboard Settings">
                <div className="tab-content-wrapper p-4">
                  <CuDashboardSettings />
                </div>
              </Tab>

              <Tab eventKey="general" title="General Settings">
                <div className="tab-content-wrapper p-4">
                  <GeneralSettings />
                </div>
              </Tab>

              <Tab eventKey="process" title="Process Settings">
                <div className="tab-content-wrapper p-4">
                  <ProcessScreenSettings />
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
