import React, { useEffect, useState, useRef } from 'react';
import { Card, Button, Space, Row, Col, Table, Badge, Tooltip, Input, Select, Progress, Checkbox, InputNumber } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckOutlined,
  SyncOutlined,
  SearchOutlined,
  ClockCircleOutlined,
  StarOutlined,
  GlobalOutlined,
  UnorderedListOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import API from '../../CustomHooks/MasterApiHooks/api';
import { success, error } from '../../CustomHooks/Services/AlertMessageService';
import { useTranslation } from 'react-i18next';
import { useStore } from 'zustand';
import themeStore from '../../store/themeStore';
import './QCProcess.css';

const { Search } = Input;
const { Option } = Select;

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
  const [projectType, setProjectType] = useState('');
  const [selectedRecordIndex, setSelectedRecordIndex] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [languageFilter, setLanguageFilter] = useState('all');
  const catchListRef = useRef(null);

  //state for fetching the compelte original data of the selected record
  const [ogData , setOgData] = useState([]);

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

  // Function to fetch data that can be called from multiple places
  const fetchData = async () => {
    try {
      // console.log("Fetching QC data for project:", projectId);
      const response = await API.get(`/QC/ByProject?projectId=${projectId}`);
      const transformedData = response.data.map(item => ({
        ...item,
        verified: item.verified || {},
      }));
      // console.log("Fetched QC data:", transformedData);
      setData(transformedData);
      setFilteredData(transformedData);
    } catch (error) {
      console.error('Failed to fetch data', error);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [projectId]);

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
    // Check if the field is structureOfPaper and handle it specially
    const verified = field === 'structureOfPaper'
      ? record.verified?.structureOfPaper
      : record.verified?.[field];

    // Log verification status for debugging
    // if (field === 'structureOfPaper') {
    //   console.log(`Structure verification status for record ${record.catchNo}:`, verified);
    // }

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
      dataIndex: 'structureOfPaper',
      key: 'structureOfPaper',
      align: 'center',
      render: (_, record) => renderVerificationStatusOnly(record, 'structureOfPaper'),
      sorter: (a, b) => String(a.structureOfPaper || '').localeCompare(String(a.structureOfPaper || '')),
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
    } else {
      setTempVerification(record.verified || {});
      setSelectedRecord({ ...record, action });
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
        languageId: selectedRecord.languageId || [],
        language: selectedRecord.language || ''
      });
      console.log("Edit form data initialized:", {
        ...selectedRecord,
        structureOfPaper: selectedRecord.structureOfPaper || ''
      });
      setIsEditMode(true);
    }
  };

  const handleEditCancel = () => {
    setIsEditMode(false);
    setEditFormData({});
  };

  const handleInputChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const fetchOgData = async () =>{
    try{
      const response = await API.get(`/QuantitySheet/${selectedRecord.quantitysheetId}`);
      setOgData(response.data);
      // console.log("Original Data -",response.data)
    }
    catch(error){
      console.error('Failed to fetch data', error);
    }
  }
  useEffect(()=>{
    if(selectedRecord){
      fetchOgData();
    }
  },[selectedRecord])

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);

      // Log the edit form data for debugging
      // console.log("Edit form data before save:", editFormData);

      // Create payload for the API
      const payload = [{
        // Include the fields for update
        duration: editFormData.duration,
        structureOfPaper: editFormData.structureOfPaper || '',
        maxMarks: parseInt(editFormData.maxMarks, 10),
        languageId: editFormData.languageId,
        language: editFormData.language, // Include language field

        // Include other fields as needed
        quantitySheetId: selectedRecord.quantitysheetId,
        catchNo: editFormData.catchNo,
        nepCode: ogData[0].nepCode,
        paperTitle: ogData[0].paperTitle,
        paperNumber: ogData[0].paperNumber,
        quantity: parseInt(ogData[0].quantity, 10),
        uniqueCode: ogData[0].uniqueCode,
        examTime: ogData[0].examTime || '',
        examDate: ogData[0].examDate || '',
        mssStatus: ogData[0].mssStatus,
        ttfStatus: ogData[0].ttfStatus,
        projectId: ogData[0].projectId,
        courseId: ogData[0].courseId,
        subjectId: ogData[0].subjectId,
        processId: ogData[0].processId || [0],
        lotNo: ogData[0].lotNo,
        percentageCatch: ogData[0].percentageCatch || 0,
        qpId: ogData[0].qpId || 0,
        pages: ogData[0].pages || 0,
        innerEnvelope: ogData[0].innerEnvelope || '',
        outerEnvelope: ogData[0].outerEnvelope || 0,
        status: ogData[0].status || 0,
        stopCatch: ogData[0].stopCatch || 0,
        examTypeId: ogData[0].examTypeId || 0
      }];

      // console.log("Payload Data for update:", payload);

      // Call the API to update the item - using PUT method instead of POST
      await API.put('/QuantitySheet/bulk-update', payload);

      // Refresh the data using the fetchData function
      await fetchData();

      // Update the selected record with new data from the refreshed data
      const updatedRecord = data.find(item => item.quantitysheetId === selectedRecord.quantitysheetId);
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
    // Log the tempVerification data to debug
    // console.log("tempVerification data:", tempVerification);
    // console.log("Selected record:", selectedRecord);

    // Ensure structureOfPaper is included in the verification data
    const structureVerification = tempVerification.structureOfPaper !== undefined
      ? tempVerification.structureOfPaper
      : false;

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
      StructureOfPaper: structureVerification, // Use the verified value
      ProjectId: projectId
    };

    // console.log("Prepared QC data:", baseData);

    return projectType === 1 ? { ...baseData, Series: tempVerification.series } : baseData;
  };

  const postQcData = async (qcData) => {
    try {
      // Log the data being sent to the API
      // console.log("Sending QC data to API:", qcData);

      const response = await API.post('/QC', qcData);
      if (response.status === 200 || response.status === 201) {
        // console.log("QC data successfully posted, response:", response.data);

        // Refresh the data from the server to ensure we have the latest state
        await fetchData();

        // Reset state
        setSelectedRecord(null);
        setTempVerification({});
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

  // Calculate counts for status cards
  const pendingCount = data.filter((item) => Object.keys(item.verified).length === 0).length;
  const verifiedCount = data.filter((item) => item.verified?.status === true).length;
  const rejectedCount = data.filter((item) => item.verified?.status === false && item.mssStatus !== 5).length;
  const inProgressCount = data.filter((item) => item.mssStatus == 5 && Object.values(item.verified).some(value => value === true)).length;
  const reverifyCount = inProgressCount;

  // Filter data based on search and language
  const filteredCatchList = filteredData.filter(item => {
    const matchesSearch = searchText === '' || 
      item.catchNo?.toString().toLowerCase().includes(searchText.toLowerCase()) ||
      item.paperTitle?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.subject?.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesLanguage = languageFilter === 'all' || 
      (Array.isArray(item.language) ? item.language.includes(languageFilter) : item.language === languageFilter);
    
    return matchesSearch && matchesLanguage;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#1890ff';
      case 'verified': return '#52c41a';
      case 'rejected': return '#ff4d4f';
      case 'inProgress': return '#faad14';
      default: return '#8c8c8c';
    }
  };

  const getStatusText = (record) => {
    if (record.verified?.status === true) return 'Verified';
    if (record.verified?.status === false) return 'Rejected';
    if (record.mssStatus == 5 && Object.values(record.verified).some(value => value === true)) return 'In Progress';
    return 'Pending QC';
  };

  const getStatusTagColor = (record) => {
    const status = getStatusText(record);
    switch (status) {
      case 'Verified': return '#f6ffed';
      case 'Rejected': return '#fff1f0';
      case 'In Progress': return '#fff7e6';
      default: return '#f0f9ff';
    }
  };

  const getStatusTextColor = (record) => {
    const status = getStatusText(record);
    switch (status) {
      case 'Verified': return '#52c41a';
      case 'Rejected': return '#ff4d4f';
      case 'In Progress': return '#faad14';
      default: return '#1890ff';
    }
  };

  const allFieldsVerified = () => {
    // Required fields that must always be verified
    const requiredFields = [
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
        keyname: 'structureOfPaper'
      },
      ...(projectType === 1 ? [{
        name: 'Series',
        keyname: 'series'
      }] : []),
      {
        name: 'Max Marks',
        keyname: 'maxMarks'
      }
    ];

    // Optional fields that are only required if they have data
    const optionalFields = [
      { name: 'A', keyname: 'a' },
      { name: 'B', keyname: 'b' },
      { name: 'C', keyname: 'c' },
      { name: 'D', keyname: 'd' }
    ];

    // Filter optional fields to only include those that have data
    const optionalFieldsWithData = optionalFields.filter(field => {
      const value = selectedRecord[field.keyname];
      return value && (typeof value === 'string' ? value.trim() !== '' : true);
    });

    // Check if all required fields are verified
    const verifiedFields = Object.keys(tempVerification).filter(key => tempVerification[key]);
    const allRequiredVerified = requiredFields.every(field => verifiedFields.includes(field.keyname));

    // Check if all optional fields with data are verified
    const allOptionalWithDataVerified = optionalFieldsWithData.every(field =>
      verifiedFields.includes(field.keyname)
    );

    return allRequiredVerified && allOptionalWithDataVerified && verifiedFields.length > 0;
  };

  const handleVerificationChange = (field) => {
    setTempVerification((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const renderVerificationItem = (label, value, field) => {
    if (!selectedRecord) return null;

    const isValueEmpty = !value || (typeof value === 'string' && value.trim() === '') ||
      (Array.isArray(value) && value.length === 0);

    // Determine if this field is editable
    const isEditable = ['catchNo', 'paperNumber', 'paperTitle', 'nepCode', 'uniqueCode', 'maxMarks', 'duration', 'structureOfPaper', 'quantity', 'language'].includes(field);

    // Determine if this is an ABCD field
    const isAbcdField = ['a', 'b', 'c', 'd'].includes(field);

    // Apply disabled styling for empty ABCD fields
    const rowStyle = {
      transition: 'all 0.2s ease',
      opacity: isValueEmpty && isAbcdField ? 0.6 : 1,
      backgroundColor: isValueEmpty && isAbcdField ? '#f9f9f9' : 'transparent'
    };

    return (
      <div key={field} className="col-12 col-lg-6 mb-3">
        <div className={`p-4 border rounded h-100 checkpoint-item ${tempVerification[field] ? 'completed' : ''}`} style={rowStyle}>
          <div className="d-flex align-items-start gap-3">
            {selectedRecord.action === 'verify' && !isEditMode && (
              <div className="mt-1">
                <Checkbox
                  checked={tempVerification[field] || selectedRecord.verified?.[field]}
                  onChange={() => handleVerificationChange(field)}
                  disabled={
                    // Only disable if it's an ABCD field with no data
                    (isValueEmpty && isAbcdField) ||
                    // Or if the record is already verified and not in re-verify status
                    (selectedRecord.verified?.status === true && selectedRecord.mssStatus !== 5)
                  }
                  className="custom-checkbox"
                />
              </div>
            )}
            <div className="flex-grow-1">
              <h6 className="fw-semibold mb-2 text-capitalize">{label}</h6>
              <p className="text-muted small mb-2 d-none d-md-block">
                Verify the {field.toLowerCase()} field data.
              </p>
              <div className="mb-3">
                {isEditMode && isEditable ? (
                  field === 'maxMarks' || field === 'quantity' ? (
                    <InputNumber
                      value={editFormData[field]}
                      onChange={(value) => handleInputChange(field, value)}
                      style={{ width: '100%' }}
                      min={0}
                    />
                  ) : field === 'structureOfPaper' ? (
                    <Input.TextArea
                      value={editFormData[field]}
                      onChange={(e) => handleInputChange(field, e.target.value)}
                      rows={3}
                    />
                  ) : (
                    <Input
                      value={editFormData[field]}
                      onChange={(e) => handleInputChange(field, e.target.value)}
                    />
                  )
                ) : (
                  <div className="d-flex justify-content-between align-items-center">
                    <span className={`${isValueEmpty ? 'text-muted fst-italic' : 'fw-medium'}`}>
                      {isValueEmpty ? '' : value}
                    </span>
                    <span className="text-success small fw-semibold d-none d-sm-inline">
                      {tempVerification[field] ? '✓ Verified' : 'Status: Pending'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`${customLight} min-vh-100 qc-container`}>
      {/* Header */}
      <div >
        <div className="d-flex align-items-center justify-content-between">
          
          
        </div>
      </div>

      <div className="d-flex flex-column flex-lg-row">
        {/* Left Sidebar */}
        <div className="col-12 col-lg-4 p-3 border-end qc-sidebar slide-in-left" style={{ minHeight: 'calc(100vh - 80px)' }}>
          {/* Search and Filters */}
          <div className="mb-4">
            <div className="search-container mb-3">
              <Search
                placeholder="Search by Catch Number, Subject, Paper Title..."
                allowClear
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                
              />
            </div>
            <div className="filter-container">
              <Select
                value={statusFilter}
                onChange={filterDataByStatus}
                style={{ flex: 1 }}
                placeholder="All Status"
              >
                <Option value="all">All Status</Option>
                <Option value="pending">Pending QC</Option>
                <Option value="verified">Verified</Option>
                <Option value="rejected">Rejected</Option>
                <Option value="reverify">Re-Verify</Option>
              </Select>
              <Select
                value={languageFilter}
                onChange={setLanguageFilter}
                style={{ flex: 1 }}
                placeholder="All Languages"
              >
                <Option value="all">All Languages</Option>
                <Option value="English">English</Option>
                <Option value="Hindi">Hindi</Option>
              </Select>
            </div>
          </div>

          {/* Status Overview Cards */}
          <div className="mb-4 status-overview">
            <h6 className="mb-3 fw-semibold">QC Status Overview</h6>
            <div className="row g-2">
              <div className="col-6">
                <div
                  className="p-3 rounded text-center status-card pending"
                  style={{ backgroundColor: '#f0f9ff', border: '1px solid #bae7ff', cursor: 'pointer' }}
                  onClick={() => { filterDataByStatus('pending'); requestAnimationFrame(() => catchListRef?.current?.scrollTo({ top: 0, behavior: 'smooth' })); }}
                >
                  <div className="text-primary fw-bold fs-5">{pendingCount}</div>
                  <div className="text-primary small">Pending QC</div>
                </div>
              </div>
              <div className="col-6">
                <div
                  className="p-3 rounded text-center status-card verified"
                  style={{ backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', cursor: 'pointer' }}
                  onClick={() => { filterDataByStatus('verified'); requestAnimationFrame(() => catchListRef?.current?.scrollTo({ top: 0, behavior: 'smooth' })); }}
                >
                  <div className="text-success fw-bold fs-5">{verifiedCount}</div>
                  <div className="text-success small">Verified</div>
                </div>
              </div>
              <div className="col-6">
                <div
                  className="p-3 rounded text-center status-card rejected"
                  style={{ backgroundColor: '#fff1f0', border: '1px solid #ffccc7', cursor: 'pointer' }}
                  onClick={() => { filterDataByStatus('rejected'); requestAnimationFrame(() => catchListRef?.current?.scrollTo({ top: 0, behavior: 'smooth' })); }}
                >
                  <div className="text-danger fw-bold fs-5">{rejectedCount}</div>
                  <div className="text-danger small">Rejected</div>
                </div>
              </div>
              <div className="col-6">
                <div
                  className="p-3 rounded text-center status-card in-progress"
                  style={{ backgroundColor: '#fff7e6', border: '1px solid #ffd591', cursor: 'pointer' }}
                  onClick={() => { filterDataByStatus('reverify'); requestAnimationFrame(() => catchListRef?.current?.scrollTo({ top: 0, behavior: 'smooth' })); }}
                >
                  <div className="text-warning fw-bold fs-5">{inProgressCount}</div>
                  <div className="text-warning small">Re-Verify</div>
                </div>
              </div>
            </div>
          </div>

          {/* Catch List */}
          <div>
            <h6 className="mb-3 fw-semibold">Catch List</h6>
            <div className="catch-list" ref={catchListRef} style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {filteredCatchList.map((item, index) => (
                <div
                  key={item.quantitysheetId}
                  className={`p-3 mb-2 rounded cursor-pointer border catch-item ${
                    selectedRecord?.quantitysheetId === item.quantitysheetId 
                      ? 'selected' 
                      : ''
                  }`}
                  onClick={() => handlePreview(item, 'verify')}
                  style={{ transition: 'all 0.2s ease' }}
                >
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h6 className="mb-1 fw-bold">{item.catchNo}</h6>
                    <span
                      className="px-2 py-1 rounded-pill small status-tag"
                      style={{
                        backgroundColor: getStatusTagColor(item),
                        color: getStatusTextColor(item)
                      }}
                    >
                      {getStatusText(item)}
                    </span>
                  </div>
                  <div className="text-muted small mb-1">
                    <span className="d-none d-md-inline">{item.paperTitle || ''} {item.paperNumber ? `- ${item.paperNumber}` : ''}</span>
                    <span className="d-md-none">{item.paperTitle || ''}</span>
                  </div>
                  <div className="text-muted small mb-2">
                    <span className="d-none d-lg-inline">
                      {Array.isArray(item.language) ? item.language.join(', ') : item.language || ''} {item.duration ? `• ${item.duration} min` : ''} {item.maxMarks ? `• ${item.maxMarks} marks` : ''}
                    </span>
                    <span className="d-lg-none">
                      {Array.isArray(item.language) ? item.language.join(', ') : item.language || ''} {item.duration ? `• ${item.duration} min` : ''}
                    </span>
                  </div>
                  <div className="text-muted small d-none d-md-block">
                    {item.createdDate || item.createdAt || ''}
                  </div>
                  {item.verified?.status === true && (
                    <CheckCircleOutlined className="text-success position-absolute top-0 end-0 m-2" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="col-12 col-lg-8 p-3 qc-main-content slide-in-right">
          {selectedRecord ? (
            <div className="h-100">
              {/* Item Details Header */}
              <div className="mb-4 p-4 bg-white rounded shadow-sm main-content-header">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h4 className="mb-2 fw-bold">{selectedRecord.catchNo}</h4>
                    <h6 className="text-muted mb-2">{selectedRecord.paperTitle || ''} {selectedRecord.paperNumber ? `- ${selectedRecord.paperNumber}` : ''}</h6>
                  </div>
                  <div className="text-end">
                    <span
                      className="px-3 py-2 rounded-pill fw-semibold"
                      style={{
                        backgroundColor: getStatusTagColor(selectedRecord),
                        color: getStatusTextColor(selectedRecord)
                      }}
                    >
                      {getStatusText(selectedRecord)}
                    </span>
                    <div className="text-muted small mt-1">
                      {selectedRecord.startDate || selectedRecord.createdAt || ''}
                    </div>
                  </div>
                </div>
                
                                  <div className="d-flex flex-wrap gap-3 gap-md-4 text-muted">
                    <div className="d-flex align-items-center gap-2">
                      <GlobalOutlined />
                      <span className="d-none d-sm-inline">{Array.isArray(selectedRecord.language) ? selectedRecord.language.join(', ') : selectedRecord.language || ''}</span>
                      <span className="d-sm-none">{Array.isArray(selectedRecord.language) ? selectedRecord.language[0] : selectedRecord.language || ''}</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <ClockCircleOutlined />
                      <span>{selectedRecord.duration || ''} {selectedRecord.duration ? 'min' : ''}</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <StarOutlined />
                      <span>{selectedRecord.maxMarks || ''} {selectedRecord.maxMarks ? 'marks' : ''}</span>
                    </div>
                    <div className="d-flex align-items-center gap-2 d-none d-lg-flex">
                      <UnorderedListOutlined />
                      <span>{selectedRecord.series || ''}</span>
                    </div>
                  </div>
              </div>

              {/* Quality Control Checkpoints */}
              <div className="bg-white rounded shadow-sm p-4 checkpoints-section">
                <h5 className="mb-3 fw-semibold">Quality Control Checkpoints</h5>
                <p className="text-muted mb-4">
                  Verify all required fields before proceeding with the QC process.
                </p>
                
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-medium">Verification Progress</span>
                    <span className="text-muted">
                      {Object.values(tempVerification).filter(Boolean).length} of {Object.keys(tempVerification).length} fields verified
                    </span>
                  </div>
                  <Progress
                    percent={Object.keys(tempVerification).length > 0 ? 
                      (Object.values(tempVerification).filter(Boolean).length / Object.keys(tempVerification).length) * 100 : 0}
                    strokeColor="#1890ff"
                    showInfo={false}
                  />
                </div>

                {/* Checkpoints Grid */}
                <div className="row g-3">
                  {renderVerificationItem('A', selectedRecord.a, 'a')}
                  {renderVerificationItem('B', selectedRecord.b, 'b')}
                  {renderVerificationItem('C', selectedRecord.c, 'c')}
                  {renderVerificationItem('D', selectedRecord.d, 'd')}
                  {renderVerificationItem('Language', Array.isArray(selectedRecord.language) ? selectedRecord.language.join(', ') : typeof selectedRecord.language === 'string' ? selectedRecord.language.replace(/\s+/g, ', ') : '', 'language')}
                  {renderVerificationItem('Duration', selectedRecord.duration, 'duration')}
                  {renderVerificationItem('Structure', selectedRecord.structureOfPaper, 'structureOfPaper')}
                  {projectType === 1 && renderVerificationItem('Series', selectedRecord.series, 'series')}
                  {renderVerificationItem('Max Marks', selectedRecord.maxMarks, 'maxMarks')}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 p-4 bg-white rounded shadow-sm">
                <div className="container-fluid p-0">
                  {isEditMode ? (
                    <div className="row g-3 justify-content-center">
                      <div className="col-12 col-md-6 col-lg-4 d-flex justify-content-center">
                        <Button
                          variant="success"
                          onClick={handleSaveChanges}
                          className="d-flex align-items-center gap-2 px-3 py-2 fw-medium w-100"
                          disabled={isSaving}
                        >
                          <SaveOutlined />
                          {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </div>
                      <div className="col-12 col-md-6 col-lg-4 d-flex justify-content-center">
                        <Button
                          variant="secondary"
                          onClick={handleEditCancel}
                          className="d-flex align-items-center gap-2 px-3 py-2 fw-medium w-100"
                          disabled={isSaving}
                        >
                          <CloseOutlined />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="row g-3 justify-content-center">
                      {selectedRecord.action === 'verify' && (
                        <>
                          <div className="col-12 col-md-6 col-lg-3 d-flex justify-content-center">
                            <Button
                              variant="success"
                              disabled={!allFieldsVerified() || selectedRecord.verified?.status === true}
                              onClick={handleFinalVerification}
                              className="d-flex align-items-center gap-2 px-3 py-2 fw-medium w-100"
                            >
                              <CheckCircleOutlined />
                              {selectedRecord.verified?.status === true ? 'Already Verified' : 'Mark Verified'}
                            </Button>
                          </div>
                          <div className="col-12 col-md-6 col-lg-3 d-flex justify-content-center">
                            <Button
                              variant="danger"
                              onClick={handleRejectVerification}
                              disabled={allFieldsVerified() || selectedRecord.verified?.status === true}
                              className="d-flex align-items-center gap-2 px-3 py-2 fw-medium w-100"
                            >
                              <CloseCircleOutlined />
                              {selectedRecord.verified?.status === true ? 'Cannot Reject' : 'Mark Rejected'}
                            </Button>
                          </div>
                        </>
                      )}

                      <div className="col-12 col-md-6 col-lg-3 d-flex justify-content-center">
                        <Button
                          variant="primary"
                          onClick={handleEditClick}
                          className="d-flex align-items-center gap-2 px-3 py-2 fw-medium w-100"
                        >
                          <EditOutlined />
                          Edit Details
                        </Button>
                      </div>

                      <div className="col-12 col-md-6 col-lg-3 d-flex justify-content-center">
                        <div className="d-flex gap-2 w-100">
                          <Button
                            className={`${customBtn} ${customLightBorder} flex-grow-1 p-0`}
                            onClick={handlePreviousRecord}
                            disabled={selectedRecordIndex === 0}
                          >
                            <ArrowLeftOutlined />
                          </Button>
                          <Button
                            className={`${customBtn} ${customLightBorder} flex-grow-1 p-0`}
                            onClick={handleNextRecord}
                            disabled={selectedRecordIndex === filteredData.length - 1}
                          >
                            <ArrowRightOutlined />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="d-flex align-items-center justify-content-center h-100">
              <div className="text-center text-muted empty-state">
                <FileTextOutlined className="icon" />
                <h5>Select a catch from the list to view details</h5>
                <p>Choose any item from the left sidebar to start verification</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QcProcess;
