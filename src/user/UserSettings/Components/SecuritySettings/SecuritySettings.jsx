import React from 'react'
import { Card, Row, Col } from 'react-bootstrap'
import ChangePassword from "./Components/ChangePassword"
import ScreenLockPin from './Components/ScreenLockPin'

const SecuritySettings = ({ t }) => {
    return (
        <div>
            <Row>
                <Col xs={12}>

                    <ChangePassword/>
                    <ScreenLockPin/>
                </Col>
            </Row>
        </div>
    )
}

export default SecuritySettings
