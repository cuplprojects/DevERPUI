import React, { useEffect, useState } from 'react';
import { Card, Button, Space, Row, Col, Table, Badge, Tooltip } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  ArrowLeftOutlined,
  CheckOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import API from '../../CustomHooks/MasterApiHooks/api';
import { success, error } from '../../CustomHooks/Services/AlertMessageService';
import { useTranslation } from 'react-i18next';
import { useStore } from 'zustand';
import themeStore from '../../store/themeStore';
import VerificationModal from './Components/VerificationModal';

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
  const [projectType, setProjectType] = useState('');
  const [selectedRecordIndex, setSelectedRecordIndex] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

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
      render: (_, __, index) => index + 1,
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
      render: (_, record) => renderVerificationStatusOnly(record, 'language'),
      sorter: (a, b) => String(a.language || '').localeCompare(String(b.language || '')),
    },
    {
      title: 'Max Marks',
      dataIndex: 'maxMarks',
      key: 'maxMarks',
      align: 'center',
      render: (_, record) => renderVerificationStatusOnly(record, 'maxMarks'),
      sorter: (a, b) => (a.maxMarks || 0) - (b.maxMarks || 0),
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      align: 'center',
      render: (_, record) => renderVerificationStatusOnly(record, 'duration'),
      sorter: (a, b) => (a.duration || 0) - (b.duration || 0),
    },
    {
      title: 'Structure of Paper',
      dataIndex: 'structure',
      key: 'structure',
      align: 'center',
      render: (_, record) => renderVerificationStatusOnly(record, 'structure'),
      sorter: (a, b) => String(a.structure || '').localeCompare(String(b.structure || '')),
    },
    {
      title: 'A',
      dataIndex: 'a',
      key: 'a',
      align: 'center',
      render: (_, record) => renderVerificationStatusOnly(record, 'a'),
      sorter: (a, b) => String(a.a || '').localeCompare(String(b.a || '')),
    },
    {
      title: 'B',
      dataIndex: 'b',
      key: 'b',
      align: 'center',
      render: (_, record) => renderVerificationStatusOnly(record, 'b'),
      sorter: (a, b) => String(a.b || '').localeCompare(String(b.b || '')),
    },
    {
      title: 'C',
      dataIndex: 'c',
      key: 'c',
      align: 'center',
      render: (_, record) => renderVerificationStatusOnly(record, 'c'),
      sorter: (a, b) => String(a.c || '').localeCompare(String(b.c || '')),
    },
    {
      title: 'D',
      dataIndex: 'd',
      key: 'd',
      align: 'center',
      render: (_, record) => renderVerificationStatusOnly(record, 'd'),
      sorter: (a, b) => String(a.d || '').localeCompare(String(b.d || '')),
    },
    ...(projectType === 1 ? [{
      title: 'Series',
      dataIndex: 'series',
      key: 'series',
      align: 'center',
      render: (_, record) => renderVerificationStatusOnly(record, 'series'),
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
          onClick={() => handlePreview(record, 'verify')}
        >
          {record.verified?.status === true ? 'Verified' : record.verified?.status === false ? 'Rejected' : record.mssStatus == 5 ? 'Re-Verify' : 'Verify'}
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

  const handleEditClick = () => {
    if (selectedRecord) {
      // Initialize edit form data with current record values
      setEditFormData({
        catchNo: selectedRecord.catchNo || '',
        paperNumber: selectedRecord.paperNumber || '',
        paperTitle: selectedRecord.paperTitle || '',
        nepCode: selectedRecord.nepCode || '',
        uniqueCode: selectedRecord.uniqueCode || '',
        maxMarks: selectedRecord.maxMarks || 0,
        duration: selectedRecord.duration || '',
        structureOfPaper: selectedRecord.structureOfPaper || '',
        quantity: selectedRecord.quantity || 0,
        languageId: selectedRecord.languageId || []
      });
      setIsEditMode(true);
    }
  };

  const handleEditCancel = () => {
    setIsEditMode(false);
    setEditFormData({});
  };

useEffect(()=>{
  console.log("Selected Record -",selectedRecord)
  console.log("Edit Form Data -",editFormData)
  console.log("Is Edit Mode -",isEditMode)
  console.log("Table Data -",data)
},[editFormData,isEditMode,selectedRecord,data])

  const handleInputChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      // Create payload for the API
      const payload = [{
        quantitySheetId: selectedRecord.quantitysheetId,
        catchNo: editFormData.catchNo,
        nepCode: editFormData.nepCode,
        paperTitle: editFormData.paperTitle,
        duration: editFormData.duration,
        languageId: editFormData.languageId,
        paperNumber: editFormData.paperNumber,
        quantity: parseInt(editFormData.quantity, 10),
        maxMarks: parseInt(editFormData.maxMarks, 10),
        uniqueCode: editFormData.uniqueCode,
        examTime: selectedRecord.examTime || '',
        structureOfPaper: editFormData.structureOfPaper || '',
        examDate: selectedRecord.examDate || '',
        mssStatus: selectedRecord.mssStatus, 
        ttfStatus: selectedRecord.ttfStatus, 
        projectId: selectedRecord.projectId,
        courseId: selectedRecord.courseId,
        subjectId: selectedRecord.subjectId,
        processId: selectedRecord.processId || [0],
        lotNo: selectedRecord.lotNo,
        percentageCatch: selectedRecord.percentageCatch || 0,
        qpId: selectedRecord.qpId || 0,
        pages: selectedRecord.pages || 0,
        innerEnvelope: selectedRecord.innerEnvelope || '',
        outerEnvelope: selectedRecord.outerEnvelope || 0,
        status: selectedRecord.status || 0,
        stopCatch: selectedRecord.stopCatch || 0,
        examTypeId: selectedRecord.examTypeId || 0
      }];

      // Call the API to update the item - using PUT method instead of POST
      await API.put('/QuantitySheet/bulk-update', payload);

      // Refresh the data
      const response = await API.get(`/QC/ByProject?projectId=${projectId}`);
      const transformedData = response.data.map(item => ({
        ...item,
        verified: item.verified || {},
      }));
      setData(transformedData);
      setFilteredData(transformedData);

      // Update the selected record with new data
      const updatedRecord = transformedData.find(item => item.quantitysheetId === selectedRecord.quantitysheetId);
      if (updatedRecord) {
        setSelectedRecord({...updatedRecord, action: selectedRecord.action});
      }

      // Exit edit mode
      setIsEditMode(false);
      setEditFormData({});

      success(t('recordUpdated'));
    } catch (err) {
      console.error('Failed to update record', err);
      error(t('failedToUpdateRecord'));
    } finally {
      setIsSaving(false);
    }
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
              rowClassName={(_, index) => index % 2 === 0 ? 'table-row-light' : 'table-row-dark'}
              onRow={(record) => ({
                onClick: () => handlePreview(record),
              })}
              rowKey="srNo"
            />
          </Col>
        </Row>

        <VerificationModal
          isModalVisible={isModalVisible}
          handleModalClose={handleModalClose}
          selectedRecord={selectedRecord}
          tempVerification={tempVerification}
          setTempVerification={setTempVerification}
          handleFinalVerification={handleFinalVerification}
          handleRejectVerification={handleRejectVerification}
          handleEditClick={handleEditClick}
          isEditMode={isEditMode}
          editFormData={editFormData}
          handleInputChange={handleInputChange}
          handleSaveChanges={handleSaveChanges}
          handleEditCancel={handleEditCancel}
          isSaving={isSaving}
          selectedRecordIndex={selectedRecordIndex}
          filteredData={filteredData}
          handlePreviousRecord={handlePreviousRecord}
          handleNextRecord={handleNextRecord}
          customDark={customDark}
          customLight={customLight}
          customBtn={customBtn}
          customLightBorder={customLightBorder}
          customLightText={customLightText}
          projectType={projectType}
        />
      </Card>
    </div>
  );
};

export default QcProcess;
