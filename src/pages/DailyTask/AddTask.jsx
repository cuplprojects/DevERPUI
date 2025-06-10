import React, { useState } from 'react';
import { Card, Form, Input, DatePicker, Button, Select, message } from 'antd';
import dayjs from 'dayjs';
import EditTask from './EditTask';

const { Option } = Select;

const AddTask = () => {
  const [form] = Form.useForm();
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);

  const onFinish = async (values) => {
  try {
    const newTask = {
      taskName: values.title,
      taskDate: values.date.format('YYYY-MM-DD'),
      status: values.status,
    };

    await axios.post('https://localhost:7212/api/DailyTask', newTask);
    message.success('Task added successfully');
    form.resetFields();
  } catch (error) {
    message.error('Failed to add task');
  }
};

  const handleEdit = (task) => {
    setEditingTask(task);
  };

  const updateTask = (updatedTask) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
    setEditingTask(null);
    message.success('Task updated');
  };

  return (
    <Card title="Add New Task">
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ status: 'Pending', date: dayjs() }}
      >
        <Form.Item
          name="title"
          label="Task Title"
          rules={[{ required: true, message: 'Please enter task title' }]}
        >
          <Input placeholder="Enter task title" />
        </Form.Item>

        <Form.Item
          name="date"
          label="Date"
          rules={[{ required: true, message: 'Please select a date' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="status"
          label="Status"
          rules={[{ required: true, message: 'Please select status' }]}
        >
          <Select>
            <Option value="Pending">Pending</Option>
            <Option value="Completed">Completed</Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Add Task
          </Button>
        </Form.Item>
      </Form>

      {/* Show added tasks */}
      {tasks.map((task) => (
        <Card
          key={task.id}
          type="inner"
          title={task.title}
          style={{ marginTop: 16 }}
          extra={<a onClick={() => handleEdit(task)}>Edit</a>}
        >
          <p>Date: {task.date}</p>
          <p>Status: {task.status}</p>
        </Card>
      ))}

      {/* Edit Modal */}
      {editingTask && (
        <EditTask
          task={editingTask}
          onUpdate={updateTask}
          onCancel={() => setEditingTask(null)}
        />
      )}
    </Card>
  );
};

export default AddTask;
