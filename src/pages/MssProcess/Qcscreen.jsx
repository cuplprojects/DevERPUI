import React, { useState } from 'react';
import { Card, Button, Space, Progress, Tabs, Checkbox, Row, Col, Table } from 'antd';
import { useStore } from 'zustand';
import themeStore from '../../store/themeStore';
import { useTranslation } from 'react-i18next';

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
  const { getCssClasses } = useStore(themeStore);
  const cssClasses = getCssClasses();
  const [customDark, customMid, customLight, customBtn, customDarkText, customLightText, customLightBorder, customDarkBorder] = cssClasses;
  const { t } = useTranslation();

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
        <div>
          <Space direction="vertical" align="center" size={4}>
            
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
        <div >
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
        <div >
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
          className={`${customBtn} ${customLightBorder} hover-effect`}
          icon={<CheckCircleOutlined style={{ color: '#52c41a', fontSize: '18px' }} />}
          size="middle"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 12px',
            borderRadius: '6px',
            transition: 'all 0.3s ease'
          }}
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
 

  return (
    <div className={`container ${customLight} rounded py-2 shadow-lg ${customDark === "dark-dark" ? 'border' : ''}`}>
      <style>
        {`
          .custom-table .ant-table {
            background: ${customDark === "dark-dark" ? '#141414' : '#fff'};
          }
          .custom-table .ant-table-thead > tr > th {
            background-color: ${customDark === "dark-dark" ? '#1f1f1f' : '#f0f7ff'} !important;
            color: ${customDark === "dark-dark" ? '#fff' : '#1f2937'} !important;
            border-bottom: 2px solid ${customDark === "dark-dark" ? '#2d2d2d' : '#e6f4ff'} !important;
          }
          .custom-table .ant-table-tbody > tr > td {
            background-color: ${customDark === "dark-dark" ? '#141414' : '#fff'} !important;
            color: ${customDark === "dark-dark" ? '#fff' : '#1f2937'} !important;
            border-bottom: 1px solid ${customDark === "dark-dark" ? '#2d2d2d' : '#f0f0f0'} !important;
          }
          .custom-table .ant-table-tbody > tr:hover > td {
            background-color: ${customDark === "dark-dark" ? '#1f1f1f' : '#fafafa'} !important;
          }
          .custom-table .ant-table-cell-row-hover {
            background-color: ${customDark === "dark-dark" ? '#1f1f1f' : '#fafafa'} !important;
          }
          .custom-table .ant-pagination-item {
            background-color: ${customDark === "dark-dark" ? '#141414' : '#fff'};
            border-color: ${customDark === "dark-dark" ? '#434343' : '#d9d9d9'};
          }
          .custom-table .ant-pagination-item-active {
            border-color: #1890ff;
          }
          .custom-table .ant-pagination-item a {
            color: ${customDark === "dark-dark" ? '#fff' : '#1f2937'};
          }
          .custom-table .ant-table-bordered .ant-table-cell {
            border-right: 1px solid ${customDark === "dark-dark" ? '#2d2d2d' : '#f0f0f0'} !important;
          }
          .custom-table .ant-table-bordered .ant-table-container {
            border: 1px solid ${customDark === "dark-dark" ? '#2d2d2d' : '#f0f0f0'} !important;
            border-right: none !important;
            border-bottom: none !important;
          }
        `}
      </style>
      <Card className={customLight}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end',
          alignItems: 'center', 
          marginBottom: '16px' 
        }}>
          <Space size="large">
            <div style={{ position: 'relative' }}>
              <div className={`d-flex align-items-center`} 
                   style={{ 
                     padding: '8px 16px',
                     borderRadius: '8px',
                     backgroundColor: customDark === "dark-dark" ? '#1f1f1f' : '#f6ffed',
                     border: `1px solid ${customDark === "dark-dark" ? '#434343' : '#b7eb8f'}`,
                     transition: 'all 0.3s ease',
                     cursor: 'pointer',
                     boxShadow: selectedRecord?.action === 'verified' ? '0 2px 8px rgba(82, 196, 26, 0.15)' : 'none'
                   }}
                   onClick={(e) => {
                     e.stopPropagation();
                     if (selectedRecord) handlePreview(selectedRecord, 'verified');
                   }}
              >
                <CheckCircleOutlined style={{
                  color: selectedRecord?.action === 'verified' ? '#52c41a' : 
                         customDark === "dark-dark" ? '#8c8c8c' : '#52c41a',
                  fontSize: '24px',
                  marginRight: '12px'
                }} />
                <span style={{
                  color: customDark === "dark-dark" ? '#fff' : '#52c41a',
                  fontWeight: '500'
                }}>
                  
                </span>
              </div>
              <span style={{ 
                position: 'absolute',
                top: '-10px',
                right: '-10px',
                backgroundColor: customDark === "dark-dark" ? '#141414' : '#fff',
                color: '#52c41a',
                padding: '0px 8px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                border: `1px solid ${customDark === "dark-dark" ? '#434343' : '#b7eb8f'}`,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                {data.filter(item => Object.values(item.verified).every(v => v)).length}
              </span>
            </div>

            <div style={{ position: 'relative' }}>
              <div className={`d-flex align-items-center`}
                   style={{ 
                     padding: '8px 16px',
                     borderRadius: '8px',
                     backgroundColor: customDark === "dark-dark" ? '#1f1f1f' : '#fff1f0',
                     border: `1px solid ${customDark === "dark-dark" ? '#434343' : '#ffa39e'}`,
                     transition: 'all 0.3s ease',
                     cursor: 'pointer',
                     boxShadow: selectedRecord?.action === 'reject' ? '0 2px 8px rgba(255, 77, 79, 0.15)' : 'none'
                   }}
                   onClick={(e) => {
                     e.stopPropagation();
                     if (selectedRecord) handlePreview(selectedRecord, 'reject');
                   }}
              >
                <CloseCircleOutlined style={{
                  color: selectedRecord?.action === 'reject' ? '#ff4d4f' : 
                         customDark === "dark-dark" ? '#8c8c8c' : '#ff4d4f',
                  fontSize: '24px',
                  marginRight: '12px'
                }} />
                <span style={{
                  color: customDark === "dark-dark" ? '#fff' : '#ff4d4f',
                  fontWeight: '500'
                }}>
                  
                </span>
              </div>
              {selectedRecord && (
                <span style={{ 
                  position: 'absolute',
                  top: '-10px',
                  right: '-10px',
                  backgroundColor: customDark === "dark-dark" ? '#141414' : '#fff',
                  color: '#ff4d4f',
                  padding: '0px 8px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  border: `1px solid ${customDark === "dark-dark" ? '#434343' : '#ffa39e'}`,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  {selectedRecord ? Object.values(selectedRecord.verified).filter(v => !v).length : 0}
                </span>
              )}
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
              scroll={{ x: 'max-content', y: 800 }}
              onRow={(record) => ({
                onClick: () => handlePreview(record),
              })}
              rowKey="srNo"
              size="middle"
              bordered
              className={`${customDark === "default-dark" ? "thead-default" : ""
              }
          ${customDark === "red-dark" ? "thead-red" : ""}
          ${customDark === "green-dark" ? "thead-green" : ""}
          ${customDark === "blue-dark" ? "thead-blue" : ""}
          ${customDark === "dark-dark" ? "thead-dark" : ""}
          ${customDark === "pink-dark" ? "thead-pink" : ""}
          ${customDark === "purple-dark" ? "thead-purple" : ""}
          ${customDark === "light-dark" ? "thead-light" : ""}
          ${customDark === "brown-dark" ? "thead-brown" : ""} `}
            />
          </Col>
          {selectedRecord && (
            <Col span={8}>
              <PreviewPanel
                record={selectedRecord}
                style={{
                  height: '800px',
                  overflowY: 'auto',
                  border: `2px solid ${customDark === "dark-dark" ? '#2d2d2d' : '#1890ff'}`,
                  boxShadow: '0 0 10px rgba(24, 144, 255, 0.2)',
                  borderRadius: '8px',
                  backgroundColor: customDark === "dark-dark" ? '#141414' : '#fafafa'
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