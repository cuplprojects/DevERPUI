import React from 'react'
import { Card, Row, Col } from 'react-bootstrap'

const GeneralSettings = ({t}) => {
  return (
    <div>
      <Row>
        <Col xs={12}>
          <Card className="settings-card">
            <Card.Header>
              <div className="d-flex align-items-center">
                <i className="bi bi-gear-fill me-2 text-primary"></i>
                <h5 className="mb-0">{t('generalSettings')}</h5>
              </div>
            </Card.Header>
            <Card.Body>
              <p className="text-muted mb-4">
                Manage your general application preferences and account settings.
              </p>
              {/* General settings content will be added here */}
              <div className="alert alert-info border-0">
                <div className="d-flex align-items-center">
                  <i className="bi bi-gear me-2"></i>
                  <span>General settings configuration coming soon...</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default GeneralSettings
