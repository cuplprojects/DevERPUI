import React, { useState } from 'react';
import { Card, Button, Space, Progress, Tabs, Checkbox, Row, Col, Table } from 'antd';
import { 
  SearchOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined, 
  NumberOutlined, 
  FileTextOutlined, 
  TranslationOutlined, 
  CheckCircleOutlined,
  CloseCircleOutlined,
  CaretUpOutlined,
  CaretDownOutlined,
  SwapOutlined
} from '@ant-design/icons';

const QcProcess = () => {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([
    {
      srNo: 1,
      catchNo: 'NP-710',
      language: ['Hindi', 'English'],
      status: 100,
      verified: {
        catchNo: false,
        language: false,
        maxMarks: false,
        questions: false
      }
    },
    {
      srNo: 2,
      catchNo: 'NP-711',
      language: ['Hindi', 'English'],
      status: 75,
      verified: {
        catchNo: false,
        language: false,
        maxMarks: false,
        questions: false
      }
    },
    {
      srNo: 3,
      catchNo: 'NP-712',
      language: ['Hindi', 'English'],
      status: 50,
      verified: {
        catchNo: false,
        language: false,
        maxMarks: false,
        questions: false
      }
    },
    {
      srNo: 4,
      catchNo: 'NP-713',
      language: ['Hindi', 'English'],
      status: 25,
      verified: {
        catchNo: false,
        language: false,
        maxMarks: false,
        questions: false
      }
    },
  ]);

  // Remove the duplicate PreviewPanel and fix the column structure
  // Remove the second columns declaration and update the existing one at the top
  const columns = [
    {
      title: () => (
        <div style={{ textAlign: 'center', padding: '12px 0', color: '#1f2937', fontWeight: 600 }}>
          <Space direction="vertical" align="center" size={4}>
            <NumberOutlined style={{ fontSize: '18px', color: '#1890ff' }} />
            <span style={{ fontSize: '14px' }}>Sr.No</span>
          </Space>
        </div>
      ),
      dataIndex: 'srNo',
      key: 'srNo',
      width: 80,
      align: 'center',
      sorter: (a, b) => a.srNo - b.srNo,
    },
    // Update other column headers with the same style
    {
      title: () => (
        <div style={{ textAlign: 'center', padding: '12px 0', color: '#1f2937', fontWeight: 600 }}>
          <Space direction="vertical" align="center" size={4}>
            
            <span style={{ fontSize: '14px' }}>Catch No</span>
          </Space>
        </div>
      ),
      dataIndex: 'catchNo',
      key: 'catchNo',
      width: 120,
      align: 'center',
      render: (text, record) => (
        <div style={{ 
          padding: '2px',
          backgroundColor: record.verified?.catchNo ? '#f6ffed' : '#fff1f0',
          border: `1px solid ${record.verified?.catchNo ? '#b7eb8f' : '#ffa39e'}`,
          borderRadius: '4px',
          textAlign: 'center'
        }}>
          {text}
          {record.verified?.catchNo ? 
            <CheckCircleOutlined style={{ color: '#52c41a', marginLeft: '8px' }} /> : 
            <CloseCircleOutlined style={{ color: '#ff4d4f', marginLeft: '8px' }} />
          }
        </div>
      ),
    },

    {
      title: () => (
        <Space style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <TranslationOutlined style={{ fontSize: '16px' }} />
          <span style={{ marginLeft: '8px' }}>Language</span>
        </Space>
      ),
      dataIndex: 'language',
      key: 'language',
      width: 120,
      render: (text, record) => (
        <div style={{ 
          padding: '2px',
          backgroundColor: record.verified?.language ? '#f6ffed' : '#fff1f0',
          border: `1px solid ${record.verified?.language ? '#b7eb8f' : '#ffa39e'}`,
          borderRadius: '4px',
          textAlign: 'center'
        }}>
          {record.language.join(' / ')}
          {record.verified?.language ? 
            <CheckCircleOutlined style={{ color: '#52c41a', marginLeft: '8px' }} /> : 
            <CloseCircleOutlined style={{ color: '#ff4d4f', marginLeft: '8px' }} />
          }
        </div>
      ),
    },
    {
      title: () => (
        <Space>
          <FileTextOutlined />
          <span>Max Marks</span>
        </Space>
      ),
      dataIndex: 'maxMarks',
      key: 'maxMarks',
      width: 120,
      render: (_, record) => (
        <div style={{ 
          padding: '2px',
          backgroundColor: record.verified?.maxMarks ? '#f6ffed' : '#fff1f0',
          border: `1px solid ${record.verified?.maxMarks ? '#b7eb8f' : '#ffa39e'}`,
          borderRadius: '4px',
          textAlign: 'center'
        }}>
          {record.verified?.maxMarks ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : <CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
        </div>
      ),
    },
    {
      title: () => (
        <Space>
         
          <span>No. of Questions</span>
        </Space>
      ),
      dataIndex: 'questions',
      key: 'questions',
      width: 120,
      render: (_, record) => (
        <div style={{ 
          padding: '2px',
          backgroundColor: record.verified?.questions ? '#f6ffed' : '#fff1f0',
          border: `1px solid ${record.verified?.questions ? '#b7eb8f' : '#ffa39e'}`,
          borderRadius: '4px',
          textAlign: 'center'
        }}>
          {record.verified?.questions ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : <CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
        </div>
      ),
    },
    {
      title: () => (
        <Space>
          <CheckCircleOutlined />
          <span>Status</span>
        </Space>
      ),
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (_, record) => {
        const allVerified = Object.values(record.verified).every(value => value === true);
        return (
          <div style={{ 
            padding: '2px',
            backgroundColor: allVerified ? '#f6ffed' : '#fff1f0',
            border: `1px solid ${allVerified ? '#b7eb8f' : '#ffa39e'}`,
            borderRadius: '4px',
            textAlign: 'center'
          }}>
            {allVerified ? <CheckCircleOutlined style={{ color: '#00b96b', fontSize: '24px' }} /> : <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: '24px' }} />}
          </div>
        );
      }
    },
    {
      title: () => (
        <div style={{ textAlign: 'center', padding: '12px 0', color: '#1f2937', fontWeight: 600 }}>
          <Space direction="vertical" align="center" size={4}>
            <span style={{ fontSize: '14px' }}>Action</span>
          </Space>
        </div>
      ),
      key: 'action',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<CheckCircleOutlined />}
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            handlePreview(record, 'verify');
          }}
        >
          Verify
        </Button>
      ),
    }
  ]; // End of columns array

  // Add new preview panel component
  const PreviewPanel = ({ record }) => {
    if (!record) return null;

    const handleVerificationChange = (field) => {
      const newData = data.map(item => {
        if (item.srNo === record.srNo) {
          const updatedVerified = {
            ...item.verified,
            [field]: !item.verified[field]
          };
          return {
            ...item,
            verified: updatedVerified
          };
        }
        return item;
      });
      setData(newData);
      setSelectedRecord({ ...record, verified: newData.find(item => item.srNo === record.srNo).verified });
    };

    const shouldShowItem = (field) => {
      if (record.action === 'verify') return true;
      if (record.action === 'verified') return record.verified[field];
      if (record.action === 'reject') return !record.verified[field];
      return true;
    };

    const verificationItem = (label, value, field) => {
      if (!shouldShowItem(field)) return null;

      return (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px',
          borderBottom: '1px solid #f0f0f0',
          backgroundColor: record.verified[field] ? '#f6ffed' : '#fff',
          transition: 'all 0.3s ease'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ 
              fontSize: '14px', 
              color: '#8c8c8c',
              marginBottom: '4px'
            }}>{label}</span>
            <span style={{ 
              fontSize: '16px', 
              fontWeight: '500',
              color: '#262626'
            }}>{value}</span>
          </div>
          {record.action === 'verify' ? (
            <Checkbox
              checked={record.verified[field]}
              onChange={() => handleVerificationChange(field)}
              style={{ marginLeft: '20px' }}
            >
              <span style={{ 
                color: record.verified[field] ? '#52c41a' : '#ff4d4f',
                fontWeight: '500'
              }}>
                Verify
              </span>
            </Checkbox>
          ) : (
            <span style={{ 
              color: record.verified[field] ? '#52c41a' : '#ff4d4f',
              fontWeight: '500'
            }}>
              {record.verified[field] ? 'Verified' : 'Not Verified'}
            </span>
          )}
        </div>
      );
    };

    return (
      <Card 
        title={<div style={{ 
          fontSize: '16px', 
          fontWeight: '600',
          color: record.action === 'verify' ? '#1890ff' : 
                record.action === 'verified' ? '#52c41a' : '#ff4d4f'
        }}>
          {record.action === 'verify' ? 'MSS Verify' : 
           record.action === 'verified' ? 'MSS Verified Items' : 'MSS Rejected Items'}
        </div>}
        style={{ 
          marginTop: 16,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderRadius: '8px',
          border: `2px solid ${
            record.action === 'verify' ? '#1890ff' : 
            record.action === 'verified' ? '#52c41a' : '#ff4d4f'
          }`
        }}
        bodyStyle={{ padding: 0 }}
      >
        <div style={{ padding: '8px' }}>
          {verificationItem('Catch No', record.catchNo, 'catchNo')}
          {verificationItem('Language', 'Hindi / English', 'language')}
          {verificationItem('Max Marks', '100', 'maxMarks')}
          {verificationItem('No. of Questions', '100', 'questions')}
          
          {/* Add action buttons at the bottom */}
          {record.action === 'verify' && (
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '8px',
              padding: '16px',
              borderTop: '1px solid #f0f0f0',
              marginTop: '8px'
            }}>
              <Button
                style={{ backgroundColor: '#52c41a', color: 'white' }}
                icon={<CheckCircleOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePreview(record, 'verified');
                }}
              >
                Verified
              </Button>
              <Button
                danger
                icon={<CloseCircleOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePreview(record, 'reject');
                }}
              >
                Reject
              </Button>
            </div>
          )}
        </div>
      </Card>
    );
  };

  // Add tabs for different lots
  const items = [
    { key: 'lot-1', label: 'Lot-1' },
    { key: 'lot-2', label: 'Lot-2' },
    { key: 'lot-3', label: 'Lot-3' },
    { key: 'lot-4', label: 'Lot-4' },
    { key: 'lot-5', label: 'Lot-5' },
    { key: 'lot-6', label: 'Lot-6' },
    { key: 'lot-7', label: 'Lot-7' },
    { key: 'lot-8', label: 'Lot-8' },
  ];

  // Modify the handlePreview function to update the row status when verified
  const handlePreview = (record, action = 'verify') => {
    if (action === 'verified') {
      // Update the data to mark the row as verified
      const newData = data.map(item => {
        if (item.srNo === record.srNo) {
          return {
            ...item,
            isVerified: true // Add this new property
          };
        }
        return item;
      });
      setData(newData);
    }
    
    if (selectedRecord?.srNo === record.srNo) {
      setSelectedRecord(null);
    } else {
      setSelectedRecord({ ...record, action });
    }
  };

  // Update the tableStyles object
  // Remove these standalone components and keep them in the return statement
  const tableStyles = {
    table: {
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      borderRadius: '8px',
      overflow: 'hidden',
      backgroundColor: 'white',
    },
    previewCard: {
      marginTop: '16px',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
    },
    progressBar: {
      marginBottom: '16px'
    },
    tabs: {
      marginBottom: '16px'
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <style>
        {`
          .custom-table .ant-table-thead > tr > th {
            background-color: #f0f7ff !important;
            border-bottom: 2px solid #e6f4ff !important;
          }
          .custom-table .ant-table-thead > tr > th::before {
            display: none !important;
          }
          .verified-row {
            background-color: #f6ffed !important;
          }
          .verified-row:hover > td {
            background-color: #d9f7be !important;
          }
        `}
      </style>
      <Card>
        <Progress 
          percent={90} 
          status="active" 
          strokeColor={{ from: '#108ee9', to: '#87d068' }}
          style={tableStyles.progressBar}
        />
        <Tabs
          items={items}
          type="card"
          style={tableStyles.tabs}
        />
        <Row gutter={16}>
          <Col span={selectedRecord ? 16 : 24}>
            <Table
              columns={columns}
              dataSource={data}
              pagination={{
                pageSize: 5,
                showSizeChanger: true,
                showQuickJumper: true,
                pageSizeOptions: [5, 10, 20, 30, 40, 50],
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
              }}
              scroll={{ 
                x: 'max-content',
                y: 400
              }}
              onRow={(record) => ({
                onClick: () => handlePreview(record),
              })}
              rowKey="srNo"
              size="middle"
              bordered
              style={tableStyles.table}
              className="custom-table"
            />
          </Col>
          {selectedRecord && (
            <Col span={8}>
              <PreviewPanel 
                record={selectedRecord} 
                style={{
                  ...tableStyles.previewCard,
                  height: '100%',
                  border: '2px solid #1890ff',
                  boxShadow: '0 0 10px rgba(24, 144, 255, 0.2)',
                  borderRadius: '8px',
                  backgroundColor: '#fafafa'
                }}
              />
            </Col>
          )}
        </Row>
      </Card>
    </div>
  );
};

export default QcProcess;