import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import axios from 'axios';

const AddNew = (groupId) => {
    // Initialize form
    const [form] = Form.useForm();

    // Handle submit function
    const handleSubmit = async (values) => {
        try {
            // Send data to API (example API endpoint)
            const response = await axios.post('YOUR_API_URL_HERE', values);
            if (response.status === 200) {
                message.success('Data added successfully!');
                form.resetFields(); // Optionally reset the form
            }
        } catch (error) {
            // Handle error
            message.error('Error adding data. Please try again.');
        }
    };

    return (
        <div>
            <Form
                form={form}
                onFinish={handleSubmit}  // onFinish triggers the submit function
            >
                <Form.Item
                    label="Course"
                    name="course"
                    rules={[{ required: true, message: 'Course is required!' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Subject"
                    name="subject"
                    rules={[{ required: true, message: 'Subject is required!' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Paper Number"
                    name="papernumber"
                    rules={[{ required: true, message: 'Paper Number is required!' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Paper Title"
                    name="papertitle"
                    rules={[{ required: true, message: 'Paper Title is required!' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="NEP Code"
                    name="nepcode"
                    rules={[{ required: true, message: 'Paper Title is required!' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Private Code"
                    name="privatecode"
                    rules={[{ required: true, message: 'Paper Title is required!' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Language"
                    name="language"
                    rules={[{ required: true, message: 'Language is required!' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Type"
                    name="type"
                    rules={[{ required: true, message: 'Type is required!' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="ExamType"
                    name="examtype"
                    rules={[{ required: true, message: 'ExamType is required!' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Max Marks"
                    name="maxmarks"
                    rules={[{ required: true, message: 'Max Marks is required!' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Duration"
                    name="duration"
                    rules={[{ required: true, message: 'Duration is required!' }]}
                >
                    <Input />
                </Form.Item>







                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Submit
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default AddNew;
