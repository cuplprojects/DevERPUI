import React from 'react'
import { Card, Row, Col } from 'react-bootstrap'
import ChangePassword from "./Components/ChangePassword"
import ScreenLockPin from './Components/ScreenLockPin'

const SecuritySettings = ({ t }) => {
    return (
        <div>
            <Row className='d-flex align-items-center'>
                <Col md={6} xs={12}>
                    <ChangePassword/>
                </Col>
                <Col md={6} xs={12}>
                    <ScreenLockPin/>
                </Col>
            </Row>
        </div>
    )
}

export default SecuritySettings
