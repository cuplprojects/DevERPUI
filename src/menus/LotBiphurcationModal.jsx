import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import API from '../CustomHooks/MasterApiHooks/api';

const LotBiphurcationModal = ({
    visible,
    onClose,
    selectedLotNo,
    projectId,
    fetchQuantity,
    dispatchedLots = [],
}) => {
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [lotNo, setLotNo] = useState('');

    const handleSubmit = async () => {
        try {
            await API.post(`/QuantitySheet/UpdateLotNo?StartDate=${fromDate}&EndDate=${toDate}&newLotNo=${lotNo}&projectId=${projectId}`)
            onClose();
            setFromDate('')
            setToDate('')
            setLotNo('')
        }
        catch (error) {
            console.error("Failed to post data", error)
        }
    }

    return (
        <Modal show={visible} onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>Lot Bifurcation</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3" controlId="fromDate">
                        <Form.Label>From Date</Form.Label>
                        <Form.Control
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="toDate">
                        <Form.Label>To Date</Form.Label>
                        <Form.Control
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="lotNo">
                        <Form.Label>Lot No</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter Lot No"
                            value={lotNo}
                            onChange={(e) => setLotNo(e.target.value)}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Cancel
                </Button>
                <Button
                    variant="primary"
                    onClick={() => {
                        handleSubmit()
                    }}
                >
                    Submit
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default LotBiphurcationModal;
