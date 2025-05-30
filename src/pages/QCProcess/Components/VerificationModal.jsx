import React from 'react';
import { Button, Badge, Checkbox, InputNumber, Input } from 'antd';
import { Modal } from 'react-bootstrap';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';

const VerificationModal = ({
  isModalVisible,
  handleModalClose,
  selectedRecord,
  tempVerification,
  setTempVerification,
  handleFinalVerification,
  handleRejectVerification,
  handleEditClick,
  isEditMode,
  editFormData,
  handleInputChange,
  handleSaveChanges,
  handleEditCancel,
  isSaving,
  selectedRecordIndex,
  filteredData,
  handlePreviousRecord,
  handleNextRecord,
  customDark,
  customLight,
  customBtn,
  customLightBorder,
  customLightText,
  projectType
}) => {
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
    verificationItem: {
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: 'rgba(0,0,0,0.02)',
      },
    },
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

    // Combine required fields with optional fields that have data
    // const verificationKeys = [...requiredFields, ...optionalFieldsWithData];

    // Check if all required fields are verified
    const verifiedFields = Object.keys(tempVerification).filter(key => tempVerification[key]);
    const allRequiredVerified = requiredFields.every(field => verifiedFields.includes(field.keyname));

    // Check if all optional fields with data are verified
    const allOptionalWithDataVerified = optionalFieldsWithData.every(field =>
      verifiedFields.includes(field.keyname)
    );

    return allRequiredVerified && allOptionalWithDataVerified && verifiedFields.length > 0;
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
        <div className="verification-item p-4 border-bottom hover-highlight" style={rowStyle}>
          <div className="d-flex align-items-center">
            {record.action === 'verify' && !isEditMode && (
              <div className="me-4">
                <Checkbox
                  checked={tempVerification[field] || record.verified?.[field]}
                  onChange={() => handleVerificationChange(field)}
                  disabled={
                    // Only disable if it's an ABCD field with no data
                    (isValueEmpty && isAbcdField) ||
                    // Or if the record is already verified and not in re-verify status
                    (record.verified?.status === true && record.mssStatus !== 5)
                  }
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
                <span className={`text-uppercase fw-semibold ${isValueEmpty && isAbcdField ? 'text-muted' : 'text-secondary'} letter-spacing-1`}>
                  {label}
                </span>
                {isValueEmpty && isAbcdField && (
                  <span className="ms-2 text-muted fst-italic small">(No data)</span>
                )}
              </div>
              <div className="verification-value flex-grow-1 ps-4 border-start">
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
                  <span className={`${isValueEmpty ? 'text-muted fst-italic' : 'fw-medium'}`}>
                    {isValueEmpty ? (isAbcdField ? 'No data available' : '') : value}
                  </span>
                )}
              </div>
              {!isEditMode && (
                <div className={`verification-status ms-3 d-flex align-items-center ${
                  isValueEmpty && isAbcdField ? 'text-muted' :
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
              )}
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
          {verificationItem('Structure', record.structureOfPaper, 'structureOfPaper')}
          {projectType === 1 && verificationItem('Series', record.series, 'series')}
          {verificationItem('Max Marks', record.maxMarks, 'maxMarks')}
        </div>

        <div className="action-buttons p-4 mt-2 bg-light rounded-bottom">
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
                {record.action === 'verify' && (
                  <>
                    <div className="col-12 col-md-6 col-lg-3 d-flex justify-content-center">
                      <Button
                        variant="success"
                        disabled={!allFieldsVerified() || record.verified?.status === true}
                        onClick={handleFinalVerification}
                        className="d-flex align-items-center gap-2 px-3 py-2 fw-medium w-100"
                      >
                        <CheckCircleOutlined />
                        {record.verified?.status === true ? 'Already Verified' : 'Mark Verified'}
                      </Button>
                    </div>
                    <div className="col-12 col-md-6 col-lg-3 d-flex justify-content-center">
                      <Button
                        variant="danger"
                        onClick={handleRejectVerification}
                        disabled={allFieldsVerified() || record.verified?.status === true}
                        className="d-flex align-items-center gap-2 px-3 py-2 fw-medium w-100"
                      >
                        <CloseCircleOutlined />
                        {record.verified?.status === true ? 'Cannot Reject' : 'Mark Rejected'}
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
    );
  };

  return (
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
              <span className={`fs-4 ${selectedRecord?.action === 'verify' ? 'text-primary' :
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
  );
};

export default VerificationModal;
