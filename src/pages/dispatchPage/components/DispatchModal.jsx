
import React, { useEffect, useState } from "react";
import { Form, Input, Button as AntButton, message, DatePicker, Select } from "antd";
import { Modal as BootstrapModal, Button as BsButton, Row, Col } from "react-bootstrap";
import API from "./../../../CustomHooks/MasterApiHooks/api";
import { createDispatch, updateDispatch } from "./../../../CustomHooks/ApiServices/dispatchService";
import dayjs from "dayjs";
import { useTranslation } from 'react-i18next';

const DispatchFormModal = ({ show, editData, handleClose, processId, projectId, lotNo, cssClasses }) => {
    const [form] = Form.useForm();
    const [modeCount, setModeCount] = useState(0);
    const [messengerList, setMessengerList] = useState([]);
    const { t } = useTranslation();
    const [customDark, customMid, customLight, customBtn, customDarkText, customLightText, customLightBorder, customDarkBorder] = cssClasses;
    useEffect(() => {
        if (editData) {
            setModeCount(editData.modeCount || 0);
            const fields = {
                boxCount: editData.boxCount,
                dispatchDate: dayjs(editData.dispatchDate),
                modeCount: editData.modeCount
            };

            editData.dispatchDetails?.forEach((item, index) => {
                fields[`vehicleType_${index}`] = item.vehicleType;
                fields[`vehicleNumber_${index}`] = item.vehicleNumber;
                fields[`driverName_${index}`] = item.driverName;
                fields[`driverMobile_${index}`] = item.driverMobile;
                fields[`messengerName_${index}`] = item.messengerName;
                fields[`messengerMobile_${index}`] = item.messengerMobile;
            });

            form.setFieldsValue(fields);
        } else {
            form.resetFields();
            setModeCount(0);
        }
    }, [editData, form]);

    useEffect(() => {
        const fetchMessengers = async () => {
            try {
                const response = await API.get("User/messenger");
                const data = await response.data;
                setMessengerList(data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchMessengers();
    }, []);

    const onFinish = async (values) => {
        const dispatchDetails = [];

        for (let i = 0; i < modeCount; i++) {
            dispatchDetails.push({
                vehicleType: values[`vehicleType_${i}`],
                vehicleNumber: values[`vehicleNumber_${i}`],
                driverName: values[`driverName_${i}`],
                driverMobile: values[`driverMobile_${i}`],
                messengerName: values[`messengerName_${i}`],
                messengerMobile: values[`messengerMobile_${i}`],
            });
        }

        const submitData = {
            id: editData?.id,
            processId,
            projectId,
            lotNo,
            boxCount: values.boxCount,
            dispatchDate: values.dispatchDate?.toISOString?.() || values.dispatchDate,
            modeCount,
            messengerName: "",
            messengerMobile: "",
            dispatchMode: "",
            vehicleNumber: "",
            driverName: "",
            driverMobile: "",
            createdAt: editData?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: false,
            dispatchDetails,
        };

        try {
            if (editData?.id) {
                await updateDispatch(editData.id, submitData);
                message.success("Dispatch updated successfully");
            } else {
                await createDispatch(submitData);
                message.success("Dispatch created successfully");
            }

            form.resetFields();
            setModeCount(0);
            handleClose(true);
        } catch (error) {
            console.error("Failed to submit dispatch", error);
            message.error("Failed to submit dispatch");
        }
    };

    const handleCancel = () => {
        form.resetFields();
        setModeCount(0);
        handleClose();
    };

    return (
        <BootstrapModal show={show} onHide={handleCancel} size="lg" centered>
            <BootstrapModal.Header closeButton className={`${customDark} ${customLightText}`}>
                <BootstrapModal.Title>{t('dispatchDetails')}</BootstrapModal.Title>
            </BootstrapModal.Header>
            <BootstrapModal.Body className={`${customLight}`}>

                <Form
                    key={editData?.id || "create"}
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                >
                    <Row>
                        <Col lg={4}>
                            <Form.Item
                                label="Number of Boxes"
                                name="boxCount"
                                rules={[{ required: true, message: "Please enter number of boxes" }]}
                            >
                                <Input type="number" min={1} />
                            </Form.Item>
                        </Col>
                        <Col lg={4}>
                            <Form.Item
                                label="Dispatch Date"
                                name="dispatchDate"
                                rules={[{ required: true, message: "Please enter Dispatch date" }]}
                            >
                                <DatePicker style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                        <Col lg={4}>
                            <Form.Item
                                label="Number of Modes of Transport"
                                name="modeCount"
                                rules={[{ required: true, message: "Please enter number of modes" }]}
                            >
                                <Input
                                    type="number"
                                    min={1}
                                    onChange={(e) =>
                                        setModeCount(parseInt(e.target.value || "0", 10))
                                    }
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    
                    {Array.from({ length: modeCount }, (_, index) => (
                        <div
                            key={index}
                            style={{
                                padding: "12px",
                                border: "1px solid #d9d9d9",
                                marginBottom: "16px",
                                borderRadius: 6,
                            }}
                        >
                            <h5>Mode {index + 1}</h5>
                            <Form.Item
                                label="Vehicle Type"
                                name={`vehicleType_${index}`}
                                rules={[{ required: true, message: "Enter vehicle type" }]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                label="Vehicle Number"
                                name={`vehicleNumber_${index}`}
                                rules={[{ required: true, message: "Enter vehicle number" }]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                label="Driver Name"
                                name={`driverName_${index}`}
                                rules={[{ required: true, message: "Enter driver name" }]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                label="Driver Mobile Number"
                                name={`driverMobile_${index}`}
                                rules={[
                                    { required: true, message: "Enter driver mobile number" },
                                    {
                                        pattern: /^[0-9]{10}$/,
                                        message: "Enter valid 10-digit number",
                                    },
                                ]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                label="Messenger"
                                name={`messengerName_${index}`}
                                rules={[{ required: true, message: "Please select a messenger" }]}
                            >
                                <Select
                                    placeholder="Select Messenger"
                                    onChange={(value) => {
                                        const messenger = messengerList.find(
                                            (m) => m.fullName === value
                                        );
                                        form.setFieldsValue({
                                            [`messengerMobile_${index}`]: messenger?.mobileNo || "",
                                        });
                                    }}
                                >
                                    {messengerList.map((messenger) => (
                                        <Select.Option key={messenger.id} value={messenger.fullName}>
                                            {messenger.fullName}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item
                                label="Messenger Mobile Number"
                                name={`messengerMobile_${index}`}
                                rules={[
                                    { required: true, message: "Enter messenger mobile number" },
                                    {
                                        pattern: /^[0-9]{10}$/,
                                        message: "Enter valid 10-digit number",
                                    },
                                ]}
                            >
                                <Input disabled />
                            </Form.Item>
                        </div>
                    ))}
                </Form>
            </BootstrapModal.Body>
            <BootstrapModal.Footer className={`${customDark} `}>
                <BsButton variant="secondary" onClick={handleCancel}>
                    Cancel
                </BsButton>
                <BsButton variant="primary" onClick={() => form.submit()}>
                    Submit
                </BsButton>
            </BootstrapModal.Footer>
        </BootstrapModal>
    );
};

export default DispatchFormModal;


