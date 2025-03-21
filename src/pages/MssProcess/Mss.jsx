import React, { useState, useEffect } from 'react';
import {
  Input,
  Select,
  Button,
  Table,
  Modal,
  Checkbox,
  message,
  Space,
  Card,
  Row,
  Col,
  Typography,
  InputNumber
} from 'antd';
import {
  PlusOutlined,
  TeamOutlined,
  AppstoreOutlined,
  CalendarOutlined,
  SearchOutlined,
  ImportOutlined,
  FileAddOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  BookOutlined,
  EditOutlined,
  SaveOutlined
} from '@ant-design/icons';

const { Search } = Input;
const { Option } = Select;

const Mss = () => {
  // State management
  const [searchText, setSearchText] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSemesters, setSelectedSemesters] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isTableVisible, setIsTableVisible] = useState(false); // State to control table visibility
  const [editingKey, setEditingKey] = useState('');
  const [receivedRows, setReceivedRows] = useState([]);

  // Add dummy data
  useEffect(() => {
    const dummyData = [
      {
        id: 1,
        courseName: 'Bachelor of Computer Science',
        nepCode: 'CS101',
        semester: 'Odd',
        paperTitle: 'Introduction to Programming',
        catchNumber: 'Catch-001' // Placeholder catch number
      },
      {
        id: 2,
        courseName: 'Bachelor of Arts',
        nepCode: 'BA201',
        semester: 'Even',
        paperTitle: 'Modern Literature',
        catchNumber: 'Catch-002' // Placeholder catch number
      },
      {
        id: 3,
        courseName: 'Bachelor of Commerce',
        nepCode: 'BC301',
        semester: 'Annual',
        paperTitle: 'Business Economics',
        catchNumber: 'Catch-003' // Placeholder catch number
      },
      {
        id: 4,
        courseName: 'Bachelor of Science',
        nepCode: 'BS401',
        semester: 'Odd',
        paperTitle: 'Physics Fundamentals',
        catchNumber: 'Catch-004' // Placeholder catch number
      },
      {
        id: 5,
        courseName: 'Bachelor of Technology',
        nepCode: 'BT501',
        semester: 'Even',
        paperTitle: 'Digital Electronics',
        catchNumber: 'Catch-005' // Placeholder catch number
      }
    ];

    setSearchResults(dummyData);
  }, []);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCatches, setSelectedCatches] = useState([]);
  const [currentRecord, setCurrentRecord] = useState(null);

  // Table columns configuration
  const columns = [
    {
      title: 'Catch Number',
      dataIndex: 'catchNumber',
      key: 'catchNumber',
      render: (text, record) => {
        if (editingKey === record.id) {
          return (
            <InputNumber
              defaultValue={text}
              onPressEnter={() => saveEdits(record.id)}
              onBlur={() => saveEdits(record.id)}
            />
          );
        }
        return text;
      },
    },
    {
      title: 'Course Name',
      dataIndex: 'courseName',
      key: 'courseName',
    },
    {
      title: 'NEP Code',
      dataIndex: 'nepCode',
      key: 'nepCode',
    },
    {
      title: 'Semester',
      dataIndex: 'semester',
      key: 'semester',
    },
    {
      title: 'Paper Title',
      dataIndex: 'paperTitle',
      key: 'paperTitle',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="default"
            size="small"
            onClick={() => handleMssReceived(record)}
            icon={<CheckCircleOutlined />}
            style={{
              backgroundColor: receivedRows.includes(record.id) ? '#52c41a' : '',
              borderColor: receivedRows.includes(record.id) ? '#52c41a' : '',
              color: receivedRows.includes(record.id) ? '#fff' : '',
            }}
          >
            Received
          </Button>
          {editingKey === record.id ? (
            <Button
              type="primary"
              size="small"
              onClick={() => saveEdits(record.id)}
              icon={<SaveOutlined />}
            >
              Save
            </Button>
          ) : (
            <Button
              type="default"
              size="small"
              onClick={() => editCatchNumber(record.id)}
              icon={<EditOutlined />}
            >
              Edit
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // Add new handler for MSS Received
  const handleMssReceived = (record) => {
    message.success(`MSS Received for: ${record.paperTitle}`);
    setReceivedRows((prev) => [...prev, record.id]);
    // Implement MSS received logic here
  };

  // Handlers
  const handleSearch = (value) => {
    setSearchText(value);
    // Implement API call to fetch search results
  };

  const handleImportRecord = (record) => {
    // Implement single record import logic
    message.success(`Imported record: ${record.paperTitle}`);
  };

  const handleImportAllFromCourse = () => {
    // Implement bulk import logic for selected course
    message.success('Imported all records from the selected course');
    setIsTableVisible(true); // Show the table when "Import All" is clicked
  };

  const handleShowCatches = (record) => {
    setCurrentRecord(record);
    setIsModalVisible(true);
    // Fetch catches for the selected record
  };

  const handleCatchSelection = (selectedCatchIds) => {
    setSelectedCatches(selectedCatchIds);
  };

  const handleImportCatches = () => {
    // Implement catch import logic
    message.success('Selected catches imported successfully');
    setIsModalVisible(false);
  };

  const editCatchNumber = (key) => {
    setEditingKey(key);
  };

  const saveEdits = (key) => {
    const newData = [...searchResults];
    const index = newData.findIndex((item) => key === item.id);
    if (index > -1) {
      const item = newData[index];
      newData.splice(index, 1, {
        ...item,
        catchNumber: document.querySelector(`input[value="${item.catchNumber}"]`).value,
      });
      setSearchResults(newData);
      setEditingKey('');
    }
  };

  // Random course names
  const courseOptions = [
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'History'
  ];

  const semesterOptions = [
    'Semester 1',
    'Semester 2',
    'Semester 3',
    'Semester 4',
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={
          <Space>
            <FileAddOutlined />
            <Typography.Title level={4} style={{ margin: 0 }}>MSS Process</Typography.Title>
          </Space>
        }
      >
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <div style={{ marginBottom: '8px' }}>
              <Typography.Text type="secondary">
                <BookOutlined /> Course
              </Typography.Text>
            </div>
            <Select
              placeholder="Select Course"
              style={{ width: '55%' }}
              onChange={(value) => setSelectedCourse(value)}
              size="small"
            >
              {courseOptions.map((course, index) => (
                <Option key={index} value={course}>
                  {course}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            <div style={{ marginBottom: '8px' }}>
              <Typography.Text type="secondary">
                <CalendarOutlined /> Semester
              </Typography.Text>
            </div>
            <Select
              mode="multiple"
              placeholder="Select Semesters"
              style={{ width: '55%' }}
              onChange={(value) => setSelectedSemesters(value)}
              size="small"
              disabled={!selectedCourse}
            >
              {semesterOptions.map((semester, index) => (
                <Option key={index} value={semester}>
                  {semester}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={4}>
            <div style={{ marginBottom: '8px' }}>
              <Typography.Text type="secondary">
                <SearchOutlined /> Search
              </Typography.Text>
            </div>
            <Search
              placeholder="Search papers..."
              onSearch={handleSearch}
              enterButton={<SearchOutlined />}
              size="small"
            />
          </Col>
        </Row>

        <div style={{ marginTop: '16px' }}>
          {selectedCourse && (
            <Button
              type="primary"
              icon={<DownloadOutlined style={{ fontSize: '16px' }} />}
              onClick={handleImportAllFromCourse}
              style={{
                marginBottom: '16px',
                background: '#1890ff',
                borderColor: '#1890ff',
                boxShadow: '0 2px 0 rgba(24,144,255,0.2)',
                transition: 'all 0.3s ease',
                padding: '6px 15px',
                height: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                '&:hover': {
                  background: '#40a9ff',
                  borderColor: '#40a9ff',
                  transform: 'translateY(-1px)'
                }
              }}
              size="middle"
              className="import-button"
            >
              Import All
            </Button>
          )}

          {isTableVisible && (
            <Table
              columns={columns}
              dataSource={searchResults}
              rowKey="id"
              size="small"
            />
          )}
        </div>

        <Modal
          title={
            <Space>
              <PlusOutlined />
              <span>Select Catches</span>
            </Space>
          }
          visible={isModalVisible}
          onOk={handleImportCatches}
          onCancel={() => setIsModalVisible(false)}
        >
          <Checkbox.Group onChange={handleCatchSelection}>
            {/* Add catch options */}
          </Checkbox.Group>
        </Modal>
      </Card>
    </div>
  );
};

export default Mss;
