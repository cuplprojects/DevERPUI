import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import themeStore from '../store/themeStore';
import { useStore } from 'zustand';
import { useTranslation } from 'react-i18next';

const ColumnToggleModal = ({ show, handleClose, columnVisibility, setColumnVisibility, hasFeaturePermission, featureData, processId }) => {
    const themeState = useStore(themeStore);
    const cssClasses = themeState.getCssClasses();
    const { t } = useTranslation();
    const [customDark, customMid, customLight, customBtn, customDarkText, customLightText, customLightBorder, customDarkBorder] = cssClasses;

    useEffect(() => {
        // This empty dependency array ensures cssClasses are always fresh
    }, [cssClasses]);

    const handleToggle = (column) => {
        setColumnVisibility((prevVisibility) => {
            const newVisibility = {
                ...prevVisibility,
                [column]: !prevVisibility[column],
            };

            // Save to localStorage whenever visibility changes
            const userSettings = JSON.parse(localStorage.getItem('userSettings') || '{}');

            if (userSettings.settings && userSettings.settings.processScreenSettings) {
                // Ensure the key is in the correct format
                const key = column.replace(' ', '');
                const camelCaseKey = key.charAt(0).toLowerCase() + key.slice(1);

                // Remove any existing duplicate keys
                const defaultColumns = userSettings.settings.processScreenSettings.defaultColumns;
                Object.keys(defaultColumns).forEach(k => {
                    if (k.toLowerCase() === camelCaseKey.toLowerCase() && k !== camelCaseKey) {
                        delete defaultColumns[k];
                    }
                });

                // Update the key in the correct format
                userSettings.settings.processScreenSettings.defaultColumns[camelCaseKey] = newVisibility[column];
                localStorage.setItem('userSettings', JSON.stringify(userSettings));
            }

            return newVisibility;
        });
    };


    const columns = [
        { key: 'Interim Quantity', label: 'interimQuantity' },
        { key: 'Remarks', label: 'remarks' },
        { key: 'Team Assigned', label: 'teamAssigned' },
        { key: 'PaperTitle', label: 'paperTitle' },
        { key: 'Paper Details', label: 'paperDetails' },
        { key: 'Envelopes', label: 'envelopes' },
        { key: 'Course', label: 'course' },
        { key: 'Machine', label: 'machine' },
        { key: 'Zone', label: 'zone' },
        { key: 'Subject', label: 'subject' },
        { key: 'Exam Date', label: 'examDate' },
        { key: 'Exam Time', label: 'examTime' },
        { key: 'Pages', label: 'Pages' }
    ];

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton className={`${customDark} ${customDarkText}`}>
                <Modal.Title className={`${customLightText} fs-4`}>{t('toggleColumns')}</Modal.Title>
            </Modal.Header>
            <Modal.Body className={`${customLight} ${customDarkText} p-4`}>
                <Form>
                    <Row>
                        {columns.map(({ key, label }) => (
                            <Col key={key} xs={12} sm={6} md={4} lg={5}>
                                <Form.Group className="mb-3">
                                    <Form.Check
                                        type="switch"
                                        id={`custom-switch-${key}`}
                                        label={t(label)}
                                        checked={columnVisibility[key]}
                                        onChange={() => handleToggle(key)}
                                    />
                                </Form.Group>
                            </Col>
                        ))}
                    </Row>
                </Form>
            </Modal.Body>
            <Modal.Footer className={`${customLight} justify-content-center`}>
                <Button
                    className={`${customBtn} border-0 px-4 py-2 fs-5`}
                    onClick={handleClose}
                >
                    {t('close')}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ColumnToggleModal;
