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
  SwapOutlined,
  ClockCircleOutlined,
  CalculatorOutlined,
} from '@ant-design/icons';

const QcProcess = () => {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tempVerification, setTempVerification] = useState({});

  const [data, setData] = useState([
    {
      srNo: 1,
      catchNo: 'NP-710',
      language: [''],
      status: 100,
      duration: '',
      structure: '',
      series: '',
      totalMarks: '',
      verified: {
        catchNo: false,
        language: false,
        maxMarks: false,
        questions: false,
        duration: false,
        structure: false,
        series: false,
        totalMarks: false
      }
    },
    {
      srNo: 2,
      catchNo: 'NP-711',
      language: [''],
      status: '',
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
      language: [''],
      status: '',
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
      language: [''],
      status: '',
      verified: {
        catchNo: false,
        language: false,
        maxMarks: false,
        questions: false
      }
    },
  ]);

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
      width: 115,
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
          <ClockCircleOutlined />
          <span>Duration</span>
        </Space>
      ),
      dataIndex: 'duration',
      key: 'duration',
      width: 120,
      render: (_, record) => (
        <div style={{
          padding: '2px',
          backgroundColor: record.verified?.duration ? '#f6ffed' : '#fff1f0',
          border: `1px solid ${record.verified?.duration ? '#b7eb8f' : '#ffa39e'}`,
          borderRadius: '4px',
          textAlign: 'center'
        }}>
          {record.duration}
          {record.verified?.duration ?
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
          <span>Structure of paper</span>
        </Space>
      ),
      dataIndex: 'structure',
      key: 'structure',
      width: 120,
      render: (_, record) => (
        <div style={{
          padding: '2px',
          backgroundColor: record.verified?.structure ? '#f6ffed' : '#fff1f0',
          border: `1px solid ${record.verified?.structure ? '#b7eb8f' : '#ffa39e'}`,
          borderRadius: '4px',
          textAlign: 'center'
        }}>
          {record.structure}
          {record.verified?.structure ?
            <CheckCircleOutlined style={{ color: '#52c41a', marginLeft: '8px' }} /> :
            <CloseCircleOutlined style={{ color: '#ff4d4f', marginLeft: '8px' }} />
          }
        </div>
      ),
    },
    {
      title: () => (
        <Space>
          <NumberOutlined />
          <span>Series</span>
        </Space>
      ),
      dataIndex: 'series',
      key: 'series',
      width: 100,
      render: (_, record) => (
        <div style={{
          padding: '2px',
          backgroundColor: record.verified?.series ? '#f6ffed' : '#fff1f0',
          border: `1px solid ${record.verified?.series ? '#b7eb8f' : '#ffa39e'}`,
          borderRadius: '4px',
          textAlign: 'center'
        }}>
          {record.series}
          {record.verified?.series ?
            <CheckCircleOutlined style={{ color: '#52c41a', marginLeft: '8px' }} /> :
            <CloseCircleOutlined style={{ color: '#ff4d4f', marginLeft: '8px' }} />
          }
        </div>
      ),
    },
    {
      title: () => (
        <Space>
          <CalculatorOutlined />
          <span>Total Marks</span>
        </Space>
      ),
      dataIndex: 'totalMarks',
      key: 'totalMarks',
      width: 120,
      render: (_, record) => (
        <div style={{
          padding: '2px',
          backgroundColor: record.verified?.totalMarks ? '#f6ffed' : '#fff1f0',
          border: `1px solid ${record.verified?.totalMarks ? '#b7eb8f' : '#ffa39e'}`,
          borderRadius: '4px',
          textAlign: 'center'
        }}>
          {record.totalMarks}
          {record.verified?.totalMarks ?
            <CheckCircleOutlined style={{ color: '#52c41a', marginLeft: '8px' }} /> :
            <CloseCircleOutlined style={{ color: '#ff4d4f', marginLeft: '8px' }} />
          }
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

    // Add shouldShowItem function definition
    const shouldShowItem = (field) => {
      if (record.action === 'verify') return true;
      if (record.action === 'verified') return record.verified[field];
      if (record.action === 'reject') return !record.verified[field];
      return true;
    };

    const handleVerificationChange = (field) => {
      setTempVerification(prev => ({
        ...prev,
        [field]: !prev[field]
      }));
    };

    // Add function to handle final verification
    // Update handleFinalVerification function
    const handleFinalVerification = (e) => {
      e.stopPropagation();
      const newData = data.map(item => {
        if (item.srNo === selectedRecord.srNo) {
          const updatedVerified = { ...item.verified };
          Object.keys(tempVerification).forEach(key => {
            updatedVerified[key] = tempVerification[key];
          });

          // Calculate status based on verified fields
          const totalFields = Object.keys(updatedVerified).length;
          const verifiedFields = Object.values(updatedVerified).filter(v => v).length;
          const status = (verifiedFields / totalFields) * 100;

          return {
            ...item,
            verified: updatedVerified,
            status: status
          };
        }
        return item;
      });

      setData(newData);
      handlePreview(selectedRecord, 'verified');
      setTempVerification({});
    };

    // Update handlePreview function
    const handlePreview = (record, action = 'verify') => {
      if (selectedRecord?.srNo === record.srNo && action === selectedRecord?.action) {
        setSelectedRecord(null);
        setTempVerification({});
      } else {
        const initialTemp = {};
        Object.keys(record.verified).forEach(key => {
          initialTemp[key] = record.verified[key];
        });
        setTempVerification(initialTemp);
        setSelectedRecord({ ...record, action });
      }
    };

    // Update verificationItem function
    const verificationItem = (label, value, field) => {
      if (!shouldShowItem(field)) return null;

      return (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px',
          borderBottom: '1px solid #f0f0f0',
          backgroundColor: tempVerification[field] ? '#f6ffed' : '#fff',
          transition: 'all 0.3s ease'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '14px', color: '#8c8c8c', marginBottom: '4px' }}>{label}</span>
            <span style={{ fontSize: '16px', fontWeight: '500', color: '#262626' }}>{value}</span>
          </div>
          {record.action === 'verify' ? (
            <Checkbox
              checked={tempVerification[field] || false}
              onChange={() => handleVerificationChange(field)}
              style={{ marginLeft: '20px' }}
            >
              <span style={{
                color: tempVerification[field] ? '#52c41a' : '#ff4d4f',
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

    // Update the action buttons section
    // Inside PreviewPanel component, update the Card title section
    return (
      <Card
        title={
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '16px',
            fontWeight: '600',
            color: record.action === 'verify' ? '#1890ff' :
              record.action === 'verified' ? '#52c41a' : '#ff4d4f'
          }}>
            <span>
              {record.action === 'verify' ? 'MSS Verify' :
                record.action === 'verified' ? 'MSS Verified Items' : 'MSS Rejected Items'}
            </span>

          </div>
        }
        style={{
          marginTop: 16,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderRadius: '8px',
          border: `2px solid ${record.action === 'verify' ? '#1890ff' :
              record.action === 'verified' ? '#52c41a' : '#ff4d4f'
            }`
        }}
        bodyStyle={{ padding: 0 }}
      >
        <div style={{ padding: '8px' }}>
          {verificationItem('Catch No', record.catchNo, 'catchNo')}
          {verificationItem('Language', 'Hindi / English', 'language')}
          {verificationItem('Duration', record.duration, 'duration')}
          {verificationItem('Structure', record.structure, 'structure')}
          {verificationItem('Series', record.series, 'series')}
          {verificationItem('Max Marks', '100', 'maxMarks')}
          {verificationItem('Total Marks', record.totalMarks, 'totalMarks')}
          {verificationItem('No. of Questions', '100', 'questions')}

          {/* Add action buttons at the bottom */}
          {record.action === 'verify' && (
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              padding: '10px',
              borderTop: '1px solid #f0f0f0',
              marginTop: '8px'
            }}>
              <Button
                style={{
                  backgroundColor: '#52c41a',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onClick={handleFinalVerification}
              >
                Mark Verified<CheckCircleOutlined style={{ marginLeft: 8 }} />
              </Button>
              <Button
                style={{
                  backgroundColor: '#ff4d4f',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePreview(record, 'reject');
                  setTempVerification({});
                }}
              >
                Rejected<CloseCircleOutlined style={{ marginLeft: 8 }} />
              </Button>
            </div>
          )}
        </div>
      </Card>
    );
  };



  // Modify the handlePreview function
  const handlePreview = (record, action = 'verify') => {
    if (selectedRecord?.srNo === record.srNo) {
      setSelectedRecord(null);
      setTempVerification({}); // Clear temp state when closing
    } else {
      // Initialize tempVerification with current verified state
      const initialTemp = {};
      Object.keys(record.verified).forEach(key => {
        initialTemp[key] = record.verified[key];
      });
      setTempVerification(initialTemp);
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
        `}
      </style>
      <Card>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', // Changed from space-between to flex-end
          alignItems: 'center', 
          marginBottom: '16px' 
        }}>
          <Space size="large">
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Button
                type="text"
                icon={<CheckCircleOutlined style={{
                  color: selectedRecord?.action === 'verified' ? '#52c41a' : '#8c8c8c',
                  fontSize: '33px'
                }} />}
                onClick={(e) => {
                  e.stopPropagation();
                  if (selectedRecord) handlePreview(selectedRecord, 'verified');
                }}
              />
              <span style={{
                backgroundColor: '#e6f7ff',
                color: '#52c41a',
                padding: '1px 8px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: '800'
              }}>
                {data.filter(item => 
                  Object.values(item.verified).every(v => v)
                ).length}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Button
                type="text"
                icon={<CloseCircleOutlined style={{
                  color: selectedRecord?.action === 'reject' ? '#ff4d4f' : '#8c8c8c',
                  fontSize: '33px'
                }} />}
                onClick={(e) => {
                  e.stopPropagation();
                  if (selectedRecord) handlePreview(selectedRecord, 'reject');
                }}
              />
              <span style={{
                backgroundColor: '#fff1f0',
                color: '#ff4d4f',
                padding: '1px 6px',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: '600'
              }}>
                {data.filter(item => 
                  Object.values(item.verified).some(v => !v)
                ).length}
              </span>
            </div>
          </Space>
        </div>
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
                y: 800  // Changed from 400 to 600 pixels
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
                  height: '800px', // Match table height
                  overflowY: 'auto', // Add scroll if content is too long
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