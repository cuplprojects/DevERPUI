import React, { useEffect } from 'react';
import { Modal, Form, Input, DatePicker, Select } from 'antd';
import dayjs from 'dayjs';

const { Option } = Select;

const EditTask = ({ task, onUpdate, onCancel }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({
      title: task.title,
      date: dayjs(task.date),
      status: task.status,
    });
  }, [task]);

 const handleOk = () => {
  form.validateFields().then(async (values) => {
    try {
      const updatedTask = {
        id: task.id,
        taskName: values.title,
        taskDate: values.date.format('YYYY-MM-DD'),
        status: values.status,
      };

      await axios.put(`https://localhost:7212/api/DailyTask/${task.id}`, updatedTask);
      message.success('Task updated successfully');
      onUpdate(); // let parent know to refresh
    } catch (error) {
      message.error('Failed to update task');
    }
  });
};

  return (
    <Modal
      open={true}
      title="Edit Task"
      onCancel={onCancel}
      onOk={handleOk}
      okText="Update"
    >
      <Form form={form} layout="vertical">
        <Form.Item name="title" label="Title" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="date" label="Date" rules={[{ required: true }]}>
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="status" label="Status" rules={[{ required: true }]}>
          <Select>
            <Option value="Pending">Pending</Option>
            <Option value="Completed">Completed</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditTask;
