import React, { useEffect, useState } from 'react';
import { Card, Button, Space, Checkbox, Row, Col, Table, Badge, Tooltip, Modal as AntModal } from 'antd';
import { Modal } from 'react-bootstrap';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  ArrowLeftOutlined,
  CheckOutlined,
  SyncOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import API from '../../CustomHooks/MasterApiHooks/api';
import { success, error } from '../../CustomHooks/Services/AlertMessageService';
import { useTranslation } from 'react-i18next';
import { useStore } from 'zustand';
import themeStore from '../../store/themeStore';

const customCheckboxStyle = `
  .custom-checkbox .ant-checkbox-checked .ant-checkbox-inner {
    background-color: #52c41a !important;
    border-color: #52c41a !important;
  }
  .custom-checkbox .ant-checkbox-wrapper:hover .ant-checkbox-inner,
  .custom-checkbox .ant-checkbox:hover .ant-checkbox-inner {
    border-color: #52c41a !important;
  }
  .custom-checkbox .ant-checkbox-checked::after {
    border-color: #52c41a !important;
  }
`;

const QcProcess = ({ projectId }) => {
  const { t } = useTranslation();
  const { getCssClasses } = useStore(themeStore);
  const cssClasses = getCssClasses();
  const [customDark, customMid, customLight, customBtn, customDarkText, customLightText, customLightBorder, customDarkBorder] = cssClasses;
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [tempVerification, setTempVerification] = useState({});
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showback, setShowback] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [projectType, setProjectType] = useState('')
  const [selectedRecordIndex, setSelectedRecordIndex] = useState(0);

  useEffect(() => {
    const fetchProjectType = async () => {
      try {
        const response = await API.get(`/Project/${projectId}`);
        setProjectType(response.data.typeId);
      } catch (error) {
        console.error('Failed to fetch project type', error);
      }
    };
    fetchProjectType();

  })

  // console.log(projectType)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await API.get(`/QC/ByProject?projectId=${projectId}`);
        const transformedData = response.data.map(item => ({
          ...item,
          verified: item.verified || {},
        }));
        setData(transformedData);
        setFilteredData((transformedData))
      } catch (error) {
        console.error('Failed to fetch data', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    // Add the custom styles to the document head
    const styleElement = document.createElement('style');
    styleElement.innerHTML = customCheckboxStyle;
    document.head.appendChild(styleElement);

    // Cleanup function to remove the styles when component unmounts
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const verificationkeys = [
    {
      name: 'Language',
      keyname: 'language'
    },
    {
      name: 'Duration',
      keyname: 'duration'
    },
    {
      name: 'Structure',
      keyname: 'structure'
    },
    ...(projectType === 1 ? [{
      name: 'Series',
      keyname: 'series'
    }] : []),
    {
      name: 'Max Marks',
      keyname: 'maxMarks'
    },
    {
      name: 'A',
      keyname: 'a'
    },
    {
      name: 'B',
      keyname: 'b'
    },
    {
      name: 'C',
      keyname: 'c'
    },
    {
      name: 'D',
      keyname: 'd'
    },

  ]

  const renderVerificationField = (record, field, text) => {
    const verified = record.verified?.[field];
    return (
      <div
        style={{
          padding: '2px',
          backgroundColor: verified ? '#f6ffed' : '#fff1f0',
          border: `1px solid ${verified ? '#52c41a' : '#ffa39e'}`,
          borderRadius: '4px',
          textAlign: 'center',
        }}
      >
        {text}
        {verified ? (
          <CheckCircleOutlined style={{ color: 'green', marginLeft: '8px' }} />
        ) : (
          <CloseCircleOutlined style={{ color: 'red', marginLeft: '8px' }} />
        )}
      </div>
    );
  };

  const renderVerificationStatusOnly = (record, field) => {
    const verified = record.verified?.[field];
    return (
      <div
        style={{
          padding: '2px',
          backgroundColor: verified ? '#f6ffed' : '#fff1f0',
          border: `1px solid ${verified ? '#52c41a' : '#ffa39e'}`,
          borderRadius: '4px',
          textAlign: 'center',
        }}
      >
        {verified ? (
          <CheckCircleOutlined style={{ color: 'green' }} />
        ) : (
          <CloseCircleOutlined style={{ color: 'red' }} />
        )}
      </div>
    );
  };

  const columns = [
    {
      title: 'Sr.No',
      dataIndex: 'srNo',
      key: 'srNo',
      align: 'center',
      width: 80,
      render: (_, record, index) => index + 1,
      sorter: (a, b) => a.srNo - b.srNo,
    },
    {
      title: 'Catch No',
      dataIndex: 'catchNo',
      key: 'catchNo',
      align: 'center',
      render: (text, record) => renderVerificationField(record, 'status', text),
      sorter: (a, b) => {
        if (typeof a.catchNo === 'number' && typeof b.catchNo === 'number') {
          return a.catchNo - b.catchNo;
        }
        return String(a.catchNo).localeCompare(String(b.catchNo));
      },
    },
    {
      title: 'Language',
      dataIndex: 'language',
      key: 'language',
      align: 'center',
      render: (text, record) => renderVerificationStatusOnly(record, 'language'),
      sorter: (a, b) => String(a.language || '').localeCompare(String(b.language || '')),
    },
    {
      title: 'Max Marks',
      dataIndex: 'maxMarks',
      key: 'maxMarks',
      align: 'center',
      render: (text, record) => renderVerificationStatusOnly(record, 'maxMarks'),
      sorter: (a, b) => (a.maxMarks || 0) - (b.maxMarks || 0),
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      align: 'center',
      render: (text, record) => renderVerificationStatusOnly(record, 'duration'),
      sorter: (a, b) => (a.duration || 0) - (b.duration || 0),
    },
    {
      title: 'Structure of Paper',
      dataIndex: 'structure',
      key: 'structure',
      align: 'center',
      render: (text, record) => renderVerificationStatusOnly(record, 'structure'),
      sorter: (a, b) => String(a.structure || '').localeCompare(String(b.structure || '')),
    },
    {
      title: 'A',
      dataIndex: 'a',
      key: 'a',
      align: 'center',
      render: (text, record) => renderVerificationStatusOnly(record, 'a'),
      sorter: (a, b) => String(a.a || '').localeCompare(String(b.a || '')),
    },
    {
      title: 'B',
      dataIndex: 'b',
      key: 'b',
      align: 'center',
      render: (text, record) => renderVerificationStatusOnly(record, 'b'),
      sorter: (a, b) => String(a.b || '').localeCompare(String(b.b || '')),
    },
    {
      title: 'C',
      dataIndex: 'c',
      key: 'c',
      align: 'center',
      render: (text, record) => renderVerificationStatusOnly(record, 'c'),
      sorter: (a, b) => String(a.c || '').localeCompare(String(b.c || '')),
    },
    {
      title: 'D',
      dataIndex: 'd',
      key: 'd',
      align: 'center',
      render: (text, record) => renderVerificationStatusOnly(record, 'd'),
      sorter: (a, b) => String(a.d || '').localeCompare(String(b.d || '')),
    },
    ...(projectType === 1 ? [{
      title: 'Series',
      dataIndex: 'series',
      key: 'series',
      align: 'center',
      render: (text, record) => renderVerificationStatusOnly(record, 'series'),
      sorter: (a, b) => String(a.series || '').localeCompare(String(b.series || '')),
    }] : []),
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Button
          className={`${customBtn} ${customLightBorder}`}
          icon={<CheckCircleOutlined />}
          size="large"
          onClick={(e) => handlePreview(record, 'verify')}
        >
          {record.verified?.status === true ? 'Verified' : record.verified?.status === false ?  'Rejected' : record.mssStatus==5 ? 'Re-Verify' : 'Verify'}
        </Button>
      ),
    },
  ];

  const handlePreview = (record, action = 'verify') => {
    if (selectedRecord?.quantitysheetId === record.quantitysheetId) {
      setSelectedRecord(null);
      setTempVerification({});
      setIsModalVisible(false);
    } else {
      setTempVerification(record.verified || {});
      setSelectedRecord({ ...record, action });
      setIsModalVisible(true);
      const currentIndex = filteredData.findIndex(item => item.quantitysheetId === record.quantitysheetId);
      setSelectedRecordIndex(currentIndex);
    }
  };

  const handlePreviousRecord = () => {
    if (selectedRecordIndex > 0) {
      const prevRecord = filteredData[selectedRecordIndex - 1];
      setTempVerification(prevRecord.verified || {});
      setSelectedRecord({ ...prevRecord, action: 'verify' });
      setSelectedRecordIndex(selectedRecordIndex - 1);
    }
  };

  const handleNextRecord = () => {
    if (selectedRecordIndex < filteredData.length - 1) {
      const nextRecord = filteredData[selectedRecordIndex + 1];
      setTempVerification(nextRecord.verified || {});
      setSelectedRecord({ ...nextRecord, action: 'verify' });
      setSelectedRecordIndex(selectedRecordIndex + 1);
    }
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedRecord(null);
    setTempVerification({});
  };

  const handleFinalVerification = async () => {
    if (!selectedRecord) return;
    const qcData = prepareQcData(true);
    await postQcData(qcData);
  };

  const handleRejectVerification = async () => {
    if (!selectedRecord) return;
    const qcData = prepareQcData(false);
    await postQcData(qcData);
  };

  const prepareQcData = (status) => {
    const baseData = {
      QuantitySheetId: selectedRecord.quantitysheetId,
      Language: tempVerification.language,
      MaxMarks: tempVerification.maxMarks,
      Duration: tempVerification.duration,
      Status: status,
      A: tempVerification.a,
      B: tempVerification.b,
      C: tempVerification.c,
      D: tempVerification.d,
      StructureOfPaper: tempVerification.structureOfPaper,
      ProjectId: projectId
    };

    return projectType === 1 ? { ...baseData, Series: tempVerification.series } : baseData;
  };

  const postQcData = async (qcData) => {
    try {
      const response = await API.post('/QC', qcData);
      if (response.status === 200 || response.status === 201) {
        console.log('QC data processed successfully', response.data);
        const updatedData = data.map((item) =>
          item.quantitysheetId === selectedRecord.quantitysheetId ? { ...item, verified: { ...tempVerification, status: qcData.Status } } : item
        );
        setData(updatedData);
        setFilteredData(updatedData);
        setSelectedRecord(null);
        setTempVerification({});
        setIsModalVisible(false);
        success(t('recordSent'));
      }
    } catch (error) {
      error(t('failedToSendResponse'));
      console.error('Error processing QC data', error);
    }
  };

  const filterDataByStatus = (status) => {
    setStatusFilter(status);
    if (status === 'verified') {
      setFilteredData(data.filter((item) => item.verified?.status === true));
      setShowback(true)
    } else if (status === 'rejected') {
      setFilteredData(data.filter((item) => item.verified?.status === false && item.mssStatus !== 5));
      setShowback(true)
    } else if (status === 'pending') {
      setFilteredData(data.filter((item) => Object.keys(item.verified).length === 0));
      setShowback(true)
    } else if (status === 'reverify') {
      setFilteredData(data.filter((item) => item.mssStatus == 5 && Object.values(item.verified).some(value => value === true)));
      setShowback(true)
    }
    else {
      setFilteredData(data)
      setShowback(false)
    }
  };

  const resetFilter = () => {
    setStatusFilter('all');
    setShowback(false)
    setFilteredData(data); // Reset to show all data
  };

  const allFieldsVerified = () => {
    var verified = (verificationkeys.length === Object.values(tempVerification).filter(Boolean).length) && Object.values(tempVerification).filter(Boolean).length != 0
    console.log(verificationkeys, Object.values(tempVerification).filter(Boolean))
    console.log(verified)
    return verified;
  };

  const PreviewPanel = ({ record }) => {
    if (!record) return null;

    const shouldShowItem = (field) => {
      if (record.action === 'verify') return true;
      return record.verified[field];
    };

    const verificationItem = (label, value, field) => {
      if (!shouldShowItem(field)) return null;

      const isValueEmpty = !value || (typeof value === 'string' && value.trim() === '') || 
                          (Array.isArray(value) && value.length === 0);

      return (
        <div className="verification-item p-4 border-bottom hover-highlight">
          <div className="d-flex align-items-center">
            {record.action === 'verify' && (
              <div className="me-4">
                <Checkbox 
                  checked={tempVerification[field] || record.verified?.[field]}
                  onChange={() => handleVerificationChange(field)}
                  disabled={isValueEmpty || (record.verified?.status === true && record.mssStatus !== 5)}
                  className="custom-checkbox"
                  style={{
                    '& .ant-checkbox-checked .ant-checkbox-inner': {
                      backgroundColor: '#52c41a',
                      borderColor: '#52c41a',
                    },
                    '& .ant-checkbox-wrapper:hover .ant-checkbox-inner, & .ant-checkbox:hover .ant-checkbox-inner': {
                      borderColor: '#52c41a',
                    }
                  }}
                />
              </div>
            )}
            <div className="d-flex align-items-center flex-grow-1 gap-4">
              <div className="verification-label" style={{ minWidth: '130px' }}>
                <span className="text-uppercase fw-semibold text-secondary letter-spacing-1">
                  {label}
                </span>
              </div>
              <div className="verification-value flex-grow-1 ps-4 border-start">
                <span className={`${isValueEmpty ? 'text-muted fst-italic' : 'fw-medium'}`}>
                  {value}
                </span>
              </div>
              <div className={`verification-status ms-3 d-flex align-items-center ${
                record.action === 'verify' 
                  ? (isValueEmpty ? 'text-muted' : (tempVerification[field] || record.verified?.[field]) ? 'text-success' : 'text-secondary')
                  : record.verified[field] ? 'text-success' : 'text-danger'
              }`}>
                {record.action === 'verify' ? (
                  isValueEmpty ? (
                    <Badge bg="light" text="dark" className="d-flex align-items-center gap-2 py-2 px-3">
                      
                     
                    </Badge>
                  ) : (
                    (tempVerification[field] || record.verified?.[field]) && (
                      <Badge bg="success" className="d-flex align-items-center gap-2 py-2 px-3">
                        
                        
                      </Badge>
                    )
                  )
                ) : (
                  <Badge 
                    bg={record.verified[field] ? 'success' : 'danger'} 
                    className="d-flex align-items-center gap-2 py-2 px-3"
                  >
                    {record.verified[field] ? (
                      <>
                        
                      </>
                    ) : (
                      <>
                       
                      </>
                    )}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    };

    const handleVerificationChange = (field) => {
      setTempVerification((prev) => ({
        ...prev,
        [field]: !prev[field],
      }));
    };

    return (
      <div className="preview-panel bg-white rounded-3 shadow-sm">
        <div className="verification-items">
          {verificationItem('A', record.a, 'a')}
          {verificationItem('B', record.b, 'b')}
          {verificationItem('C', record.c, 'c')}
          {verificationItem('D', record.d, 'd')}
          {verificationItem('Language', Array.isArray(record.language) ? record.language.join(', ') : typeof record.language === 'string' ? record.language.replace(/\s+/g, ', ') : '', 'language')}
          {verificationItem('Duration', record.duration, 'duration')}
          {verificationItem('Structure', record.structureOfPaper, 'structure')}
          {projectType === 1 && verificationItem('Series', record.series, 'series')}
          {verificationItem('Max Marks', record.maxMarks, 'maxMarks')}
        </div>

        {record.action === 'verify' && (
          <div className="action-buttons d-flex justify-content-center gap-4 p-4 mt-2 bg-light rounded-bottom">
            <Button
              variant="success"
              disabled={!allFieldsVerified() || record.verified?.status === true}
              onClick={handleFinalVerification}
              className="d-flex align-items-center gap-2 px-4 py-2 fw-medium"
              style={{ minWidth: '180px' }}
            >
              <CheckCircleOutlined />
              {record.verified?.status === true ? 'Already Verified' : 'Mark Verified'}
            </Button>
            <Button
              variant="danger"
              onClick={handleRejectVerification}
              disabled={allFieldsVerified() || record.verified?.status === true}
              className="d-flex align-items-center gap-2 px-4 py-2 fw-medium"
              style={{ minWidth: '180px' }}
            >
              <CloseCircleOutlined />
              {record.verified?.status === true ? 'Cannot Reject' : 'Mark Rejected'}
            </Button>
            <Button
              className={`${customBtn} ${customLightBorder}`}
              onClick={handlePreviousRecord}
              disabled={selectedRecordIndex === 0}
              size="sm"
            >
              <ArrowLeftOutlined /> Previous
            </Button>
            <Button
              className={`${customBtn} ${customLightBorder}`}
              onClick={handleNextRecord}
              disabled={selectedRecordIndex === filteredData.length - 1}
              size="sm"
            >
              Next <ArrowRightOutlined />
            </Button>
          </div>
        )}
      </div>
    );
  };

  const modalStyle = {
    '.modal-content': {
      borderRadius: '16px',
      border: 'none',
      boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
      overflow: 'hidden',
    },
    '.modal-header': {
      padding: '1.5rem 2rem',
      background: 'linear-gradient(to right, rgba(255,255,255,0.95), rgba(255,255,255,0.9))',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(0,0,0,0.08)',
    },
    '.modal-body': {
      maxHeight: 'calc(100vh - 200px)',
      overflowY: 'auto',
      padding: '2rem',
      '&::-webkit-scrollbar': {
        width: '8px',
      },
      '&::-webkit-scrollbar-track': {
        background: '#f1f1f1',
        borderRadius: '4px',
      },
      '&::-webkit-scrollbar-thumb': {
        background: '#c1c1c1',
        borderRadius: '4px',
        '&:hover': {
          background: '#a8a8a8',
        },
      },
    },
    '.modal-title': {
      fontSize: '1.5rem',
      fontWeight: '600',
      letterSpacing: '-0.5px',
    },
    '.btn-close': {
      opacity: '0.6',
      transition: 'all 0.2s',
      '&:hover': {
        opacity: '1',
        transform: 'scale(1.1)',
      },
    },
    '.verification-item': {
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: 'rgba(0,0,0,0.02)',
      },
    },
  };

  return (
    <div className={` ${customLight} rounded py-2 shadow-lg ${customDark === "dark-dark" ? 'border' : ''}`}>
      <Card>
        <div className='d-flex align-items-center justify-content-between'>
          <div className='d-flex align-items-center justify-content-between'>
            {showback && (
              <ArrowLeftOutlined className={`fs-5 p-1 rounded-3 ${customDark} ${customLightText}`} onClick={resetFilter} />
            )}
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
              <Space size="large">
                <Tooltip title="Verified Items">
                  <Badge color='#52c41a' count={data.filter((item) => item.verified?.status === true).length}>
                    <CheckCircleOutlined
                      onClick={() => filterDataByStatus('verified')}
                      className='fs-3'
                      style={{
                        color: '#52c41a',
                        padding: '8px',
                        borderRadius: '50%',
                        backgroundColor: statusFilter === 'verified' ? 'rgba(82, 196, 26, 0.3)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: statusFilter === 'verified' ? '0 0 8px rgba(82, 196, 26, 0.5)' : 'none'
                      }}
                    />
                  </Badge>
                </Tooltip>
                <Tooltip title="Rejected Items">
                  <Badge color='#ff4d4f' count={data.filter((item) => item.verified?.status === false && item.mssStatus !== 5).length}>
                    <CloseCircleOutlined
                      onClick={() => filterDataByStatus('rejected')}
                      className='fs-3'
                      style={{
                        color: '#ff4d4f',
                        padding: '8px',
                        borderRadius: '50%',
                        backgroundColor: statusFilter === 'rejected' ? 'rgba(255, 77, 79, 0.3)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: statusFilter === 'rejected' ? '0 0 8px rgba(255, 77, 79, 0.5)' : 'none'
                      }}
                    />
                  </Badge>
                </Tooltip>
                <Tooltip title="Pending Items">
                  <Badge color='#ffc107' count={data.filter((item) => Object.keys(item.verified).length === 0).length}>
                    <FileTextOutlined
                      onClick={() => filterDataByStatus('pending')}
                      className='fs-3'
                      style={{
                        color: '#8c8c8c',
                        padding: '8px',
                        borderRadius: '50%',
                        backgroundColor: statusFilter === 'pending' ? 'rgba(140, 140, 140, 0.3)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: statusFilter === 'pending' ? '0 0 8px rgba(140, 140, 140, 0.5)' : 'none'
                      }}
                    />
                  </Badge>
                </Tooltip>
                <Tooltip title="Re-verify Items">
                  <Badge color='#1890ff' count={data.filter((item) => item.mssStatus == 5 && Object.values(item.verified).some(value => value === true)).length}>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <SyncOutlined
                        onClick={() => filterDataByStatus('reverify')}
                        className='fs-2'
                        style={{
                          color: '#1890ff',
                          padding: '8px',
                          borderRadius: '50%',
                          backgroundColor: statusFilter === 'reverify' ? 'rgba(24, 144, 255, 0.1)' : 'transparent',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                      />
                      <CheckOutlined
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          fontSize: '12px',
                          color: '#1890ff'
                        }}
                      />
                    </div>
                  </Badge>
                </Tooltip>
              </Space>
            </div>
          </div>
        </div>

        <Row gutter={16}>
          <Col span={24}>
            <Table
              className={`${customDark === "default-dark" ? "thead-default" : ""}
                ${customDark === "red-dark" ? "thead-red" : ""}
                ${customDark === "green-dark" ? "thead-green" : ""}
                ${customDark === "blue-dark" ? "thead-blue" : ""}
                ${customDark === "dark-dark" ? "thead-dark" : ""}
                ${customDark === "pink-dark" ? "thead-pink" : ""}
                ${customDark === "purple-dark" ? "thead-purple" : ""}
                ${customDark === "light-dark" ? "thead-light" : ""}
                ${customDark === "brown-dark" ? "thead-brown" : ""}`}
              columns={columns}
              dataSource={filteredData}
              pagination={{
                pageSize: 5,
                total: filteredData.length,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
              }}
              bordered
              scroll={{ x: 1300, y: 400 }}
              rowClassName={(record, index) => index % 2 === 0 ? 'table-row-light' : 'table-row-dark'}
              onRow={(record) => ({
                onClick: () => handlePreview(record),
              })}
              rowKey="srNo"
              onChange={(pagination, filters, sorter) => {
                console.log('Table params changed:', { pagination, filters, sorter });
              }}
            />
          </Col>
        </Row>

        <Modal
          show={isModalVisible}
          onHide={handleModalClose}
          size="lg"
          backdrop="static"
          keyboard={false}
          centered
          className="qc-modal"
          style={modalStyle}
        >
          <Modal.Header className={`${customDark} ${customLightText} border-0`} closeButton>
            <Modal.Title className="w-100">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-4">
                 
                  <span className={`fs-4 ${
                    selectedRecord?.action === 'verify' ? 'text-primary' : 
                    selectedRecord?.action === 'verified' ? 'text-success' : 'text-danger'
                  }`}>
                    {selectedRecord?.action === 'verify' ? '' :
                     selectedRecord?.action === 'verified' ? 'MSS Verified Items' : 'MSS Rejected Items'}
                  </span>
                  <Badge 
                    bg={customDark === "default-dark" ? "primary" :
                        customDark === "red-dark" ? "danger" :
                        customDark === "green-dark" ? "success" :
                        customDark === "blue-dark" ? "info" :
                        customDark === "dark-dark" ? "dark" :
                        customDark === "pink-dark" ? "pink" :
                        customDark === "purple-dark" ? "purple" :
                        customDark === "light-dark" ? "light" :
                        customDark === "brown-dark" ? "warning" : "light"}
                    text="light"
                    className="px-4 py-2 rounded-pill d-flex align-items-center gap-2 fw-bold"
                  >
                    <span className="text-light">Catch No:</span>
                    <span className="fw-bold text-light">{selectedRecord?.catchNo}</span>
                  </Badge>
                </div>
              </div>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className={`${customLight} p-0`}>
            {selectedRecord && <PreviewPanel record={selectedRecord} />}
          </Modal.Body>
        </Modal>
      </Card>
    </div>
  );
};

export default QcProcess;
