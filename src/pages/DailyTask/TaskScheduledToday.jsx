import React, { useState, useEffect } from 'react';
import {
  Card,
  DatePicker,
  List,
  Badge,
  Typography,
  Row,
  Col,
  Empty,
  Modal,
  Form,
  Input,
  Button,
  Select,
  message,
} from 'antd';
import { CalendarOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import axios from 'axios';
import EditTask from './EditTask';

const { Title } = Typography;
const { Option } = Select;

const TaskScheduledToday = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [tasks, setTasks] = useState([]);
  const [form] = Form.useForm();
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editTask, setEditTask] = useState(null);

  const fetchTasks = async (date) => {
    try {
      const response = await axios.get(
        `https://localhost:7212/api/DailyTask?date=${date.format('YYYY-MM-DD')}`
      );
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    }
  };

  const addTask = async (values) => {
    try {
      const newTask = {
        taskName: values.title,
        taskDate: values.date.format('YYYY-MM-DD'),
        status: values.status,
      };

      await axios.post('https://localhost:7212/api/DailyTask', newTask);
      message.success('Task added successfully');
      setAddModalVisible(false);
      fetchTasks(selectedDate); // refresh task list
      form.resetFields();
    } catch (error) {
      console.error('Error adding task:', error);
      message.error('Failed to add task');
    }
  };

  const updateTask = (updatedTask) => {
    // For simplicity: only update locally (backend PUT endpoint not defined yet)
    const updated = tasks.map((task) =>
      task.id === updatedTask.id ? updatedTask : task
    );
    setTasks(updated);
    setEditTask(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'green';
      case 'Pending':
        return 'volcano';
      default:
        return 'blue';
    }
  };

  useEffect(() => {
    fetchTasks(selectedDate);
  }, [selectedDate]);

  return (
    <Card
      title={
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={4} style={{ margin: 0 }}>
              <CalendarOutlined style={{ marginRight: 8 }} />
              Tasks on {selectedDate.format('MMMM D, YYYY')}
            </Title>
          </Col>
          <Col>
            <DatePicker
              value={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              format="YYYY-MM-DD"
              allowClear={false}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              style={{ marginLeft: 8 }}
              onClick={() => setAddModalVisible(true)}
            >
              Add Task
            </Button>
          </Col>
        </Row>
      }
    >
      {tasks.length === 0 ? (
        <Empty description="No tasks scheduled for this day." />
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={tasks}
          renderItem={(task) => (
            <List.Item
              actions={[
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() =>
                    setEditTask({
                      ...task,
                      title: task.taskName,
                      date: dayjs(task.taskDate),
                    })
                  }
                >
                  Edit
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={task.taskName}
                description={<Badge color={getStatusColor(task.status)} text={task.status} />}
              />
            </List.Item>
          )}
        />
      )}

      {/* Add Task Modal */}
      <Modal
        title="Add New Task"
        open={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        onOk={() => {
          form.validateFields().then(addTask).catch(() => {});
        }}
        okText="Add"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ status: 'Pending', date: selectedDate }}
        >
          <Form.Item
            name="title"
            label="Task Title"
            rules={[{ required: true, message: 'Please enter a title' }]}
          >
            <Input />
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
            rules={[{ required: true, message: 'Please select a status' }]}
          >
            <Select>
              <Option value="Pending">Pending</Option>
              <Option value="Completed">Completed</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Task Modal */}
      {editTask && (
        <EditTask
          task={editTask}
          onUpdate={updateTask}
          onCancel={() => setEditTask(null)}
        />
      )}
    </Card>
  );
};

export default TaskScheduledToday;
