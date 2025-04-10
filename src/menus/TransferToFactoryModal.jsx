import React, { useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import API from '../CustomHooks/MasterApiHooks/api';
import { useStore } from 'zustand';
import themeStore from '../store/themeStore';
import { useTranslation } from 'react-i18next';

const TransferToFactoryModal = ({ show, handleClose, data }) => {
    const { t } = useTranslation();
    const themeState = useStore(themeStore);
    const cssClasses = themeState.getCssClasses();
    const [customDark, customMid, customLight, customBtn, customDarkText, customLightText] = cssClasses;

    // Force re-render when theme changes
    useEffect(() => {
        // This empty dependency array ensures cssClasses are always fresh
    }, [cssClasses]);

    const handleConfirm = async () => {
        try {
            const updatePromises = data.map(async (row) => {
                await API.put(`/QuantitySheet/UpdateTTF?id=${row.srNo}&ttfStatus=1`);
            });

            // Wait for all the update requests to finish
            await Promise.all(updatePromises);

            // Close the modal after successful updates
            handleClose();
        } catch (error) {
            console.error('Error updating ttfStatus:', error);
        }
    };


    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton className={`${customDark} ${customDarkText}`}>
                <Modal.Title className={customLightText}>{t('transfertofactory')}</Modal.Title>
            </Modal.Header>
            <Modal.Body className={`${customLight} ${customDarkText}`}>
                {Array.isArray(data) && data.length > 0 ? (
                    <>
                        <div className="mb-3">
                            <span className="fw-bold">{t('selectedCatches')}: </span>
                            {data.map(row => row.catchNumber).join(', ')}
                        </div>
                        <div className='mb-3'>
                            <span className='fw-bold'>{t('totalItems')}: </span>
                            {data.length}
                        </div>
                    </>
                ) : (
                    <div>{t('noDataAvailable')}</div>
                )}
            </Modal.Body>
            <Modal.Footer className={`${customLight} ${customDarkText}`}>
                <Button
                    variant="danger"
                    onClick={handleClose}
                    className={`${customBtn} border-0`}
                >
                    {t('close')}
                </Button>
                <Button
                    onClick={handleConfirm}
                    className={`${customBtn} border-0`}
                >
                    {t('transfertofactory')}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default TransferToFactoryModal;
