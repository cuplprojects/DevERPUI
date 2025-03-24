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
  Typography
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
  BookOutlined
} from '@ant-design/icons';

const { Search } = Input;
const { Option } = Select;

const Mss = () => {
  // State management
  const [searchText, setSearchText] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [searchResults, setSearchResults] = useState([]);

  // Add dummy data
  useEffect(() => {
    const dummyData = [
      {
        id: 1,
        courseName: 'Bachelor of Computer Science',
        nepCode: 'CS101',
        semester: 'Odd',
        paperTitle: 'Introduction to Programming'
      },
      {
        id: 2,
        courseName: 'Bachelor of Arts',
        nepCode: 'BA201',
        semester: 'Even',
        paperTitle: 'Modern Literature'
      },
      {
        id: 3,
        courseName: 'Bachelor of Commerce',
        nepCode: 'BC301',
        semester: 'Annual',
        paperTitle: 'Business Economics'
      },
      {
        id: 4,
        courseName: 'Bachelor of Science',
        nepCode: 'BS401',
        semester: 'Odd',
        paperTitle: 'Physics Fundamentals'
      },
      {
        id: 5,
        courseName: 'Bachelor of Technology',
        nepCode: 'BT501',
        semester: 'Even',
        paperTitle: 'Digital Electronics'
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
      title: () => (
        <Space>
          <BookOutlined style={{ fontSize: '16px' }} />
          <span>Course Name</span>
        </Space>
      ),
      dataIndex: 'courseName',
      key: 'courseName',
    },
    {
      title: () => (
        <Space>
          <FileAddOutlined style={{ fontSize: '16px' }} />
          <span>NEP Code</span>
        </Space>
      ),
      dataIndex: 'nepCode',
      key: 'nepCode',
    },
    {
      title: () => (
        <Space>
          <CalendarOutlined style={{ fontSize: '16px' }} />
          <span>Semester</span>
        </Space>
      ),
      dataIndex: 'semester',
      key: 'semester',
    },
    {
      title: () => (
        <Space>
          <FileAddOutlined style={{ fontSize: '16px' }} />
          <span>Paper Title</span>
        </Space>
      ),
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
            icon={<CheckCircleOutlined style={{ fontSize: '14px' }} />}
          >
             Received
          </Button>
        </Space>
      ),
    },
  ];

  // Add new handler for MSS Received
  const handleMssReceived = (record) => {
    message.success(`MSS Received for: ${record.paperTitle}`);
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
                <TeamOutlined /> Group
              </Typography.Text>
            </div>
            <Select
              placeholder="Select Group"
              style={{ width: '55%' }}
              onChange={setSelectedGroup}
              size="small"
            >
              {/* Add group options */}
            </Select>
          </Col>
          <Col span={6}>
            <div style={{ marginBottom: '8px' }}>
              <Typography.Text type="secondary">
                <AppstoreOutlined /> Type
              </Typography.Text>
            </div>
            <Select
              placeholder="Select Type"
              style={{ width: '55%' }}
              onChange={setSelectedType}
              size="small"
            >
              {/* Add type options */}
            </Select>
          </Col>
          <Col span={6}>
            <div style={{ marginBottom: '8px' }}>
              <Typography.Text type="secondary">
                <CalendarOutlined /> Semester
              </Typography.Text>
            </div>
            <Select
              placeholder="Select Semester"
              style={{ width: '55%' }}
              onChange={setSelectedSemester}
              size="small"
            >
              <Option value="odd">Odd</Option>
              <Option value="even">Even</Option>
              <Option value="annual">Annual</Option>
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
            Import
          </Button>

          <Table
            columns={columns}
            dataSource={searchResults}
            rowKey="id"
            size="small"
          />
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
