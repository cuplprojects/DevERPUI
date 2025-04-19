import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Form, Pagination, Divider } from 'antd';
import { Modal } from 'react-bootstrap';
import API from '../CustomHooks/MasterApiHooks/api';
import { useMediaQuery } from 'react-responsive';
import themeStore from './../store/themeStore';
import { useStore } from 'zustand';
import { AiFillCloseSquare } from "react-icons/ai";
import { SortAscendingOutlined, SortDescendingOutlined, EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { FaSearch } from "react-icons/fa";
import { useTranslation } from 'react-i18next';
import { success, error } from '../CustomHooks/Services/AlertMessageService';

const ExamType = () => {
  const { t } = useTranslation();
  const { getCssClasses } = useStore(themeStore);
  const cssClasses = getCssClasses();
  const [customDark, customMid, customLight, customBtn, customDarkText, customLightText, customLightBorder, customDarkBorder] = cssClasses;
  const [examTypes, setExamTypes] = useState([]);
  const [filteredExamTypes, setFilteredExamTypes] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [editingType, setEditingType] = useState('');
  const [originalData, setOriginalData] = useState({});
  const [searchText, setSearchText] = useState('');
  const [sortOrder, setSortOrder] = useState('ascend');
  const [sortField, setSortField] = useState('typeName');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });

  const fetchExamTypes = async () => {
    try {
      const response = await API.get('/ExamType');
      setExamTypes(response.data);
      setFilteredExamTypes(response.data);
    } catch (err) {
      error(t('failedToFetchExamTypes'));
    }
  };

  useEffect(() => {
    fetchExamTypes();
  }, []);

  useEffect(() => {
    const filtered = examTypes.filter(examType =>
      examType.typeName.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredExamTypes(filtered);
    setCurrentPage(1);
  }, [searchText, examTypes]);

  const handleAddExamType = async (values) => {
    const { typeName, type } = values;

    const existingExamType = examTypes.find(e => e.typeName.toLowerCase() === typeName.toLowerCase());
    if (existingExamType) {
      error(t('examTypeNameAlreadyExists'));
      return;
    }

    try {
      const newExamType = { typeName, type };
      await API.post('/ExamType', newExamType);
      setExamTypes([...examTypes, newExamType]);
      setFilteredExamTypes([...filteredExamTypes, newExamType]);
      fetchExamTypes();
      form.resetFields();
      setIsModalVisible(false);
      success(t('examTypeAddedSuccessfully'));
    } catch (err) {
      error(t('failedToAddExamType'));
    }
  };

  const handleEditSave = async (record) => {
    if (!editingValue.trim()) {
      error(t('examTypeNameCannotBeEmpty'));
      return;
    }

    const examTypeToEdit = record;
    const updatedExamType = { ...examTypeToEdit, typeName: editingValue, type: editingType };

    const existingExamType = examTypes.find(e =>
      e.typeName.toLowerCase() === editingValue.toLowerCase() && e.examTypeId !== examTypeToEdit.examTypeId
    );

    if (existingExamType) {
      error(t('examTypeNameAlreadyExists'));
      return;
    }

    try {
      await API.put(`/ExamType/${examTypeToEdit.examTypeId}`, updatedExamType);
      const updatedExamTypes = examTypes.map(e =>
        e.examTypeId === examTypeToEdit.examTypeId ? updatedExamType : e
      );
      setExamTypes(updatedExamTypes);
      setFilteredExamTypes(updatedExamTypes.filter(e =>
        e.typeName.toLowerCase().includes(searchText.toLowerCase())
      ));
      fetchExamTypes();
      setEditingIndex(null);
      setEditingValue('');
      setEditingType('');
      success(t('examTypeUpdatedSuccessfully'));
    } catch (err) {
      error(t('failedToUpdateExamType'));
      setEditingValue(originalData.typeName);
      setEditingType(originalData.type);
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingValue(originalData.typeName);
    setEditingType(originalData.type);
  };

  const handleSort = (field) => {
    const newSortOrder = field === sortField && sortOrder === 'ascend' ? 'descend' : 'ascend';
    setSortOrder(newSortOrder);
    setSortField(field);

    const sortedExamTypes = [...filteredExamTypes].sort((a, b) => {
      if (field === 'typeName') {
        return newSortOrder === 'ascend'
          ? a.typeName.localeCompare(b.typeName)
          : b.typeName.localeCompare(a.typeName);
      } else if (field === 'type') {
        return newSortOrder === 'ascend'
          ? a.type.localeCompare(b.type)
          : b.type.localeCompare(a.type);
      }
    });

    setFilteredExamTypes(sortedExamTypes);
  };

  const columns = [
    {
      align: 'center',
      title: t('sn'),
      dataIndex: 'serial',
      key: 'serial',
      render: (text, record, index) => (currentPage - 1) * pageSize + index + 1,
      width: '10%',
    },
    {
      title: t('Semester'),
      dataIndex: 'typeName',
      key: 'typeName',
      width: '40%',
      sorter: (a, b) => a.typeName.localeCompare(b.typeName),
      render: (text, record, index) => (
        editingIndex === index ? (
          <Input
            value={editingValue}
            onChange={(e) => setEditingValue(e.target.value)}
            onPressEnter={() => handleEditSave(record)}
            style={{ width: '100%' }}
          />
        ) : (
          <span>{text}</span>
        )
      ),
    },
  
    {
      align: 'left',
      title: t('action'),
      key: 'action',
      width: '25%',
      render: (_, record, index) => (
        editingIndex === index ? (
          <div style={{ display: 'flex', justifyContent: '' }}>
            <Button type="link" onClick={() => handleEditSave(record)} className={`${customDark === "dark-dark" ? `${customMid} border` : `${customLight} ${customDarkBorder}`} text-white d-flex align-items-center`}>
              <SaveOutlined className={`${customDark === "dark-dark" ? `` : `${customDarkText}` } `}/>
              <span className={`${customDark === "dark-dark" ? `` : `${customDarkText}` } ms-1`}>{t('save')}</span>
            </Button>
            <Button type="link" onClick={handleCancelEdit} className={`${customDark === "dark-dark" ? `${customMid} border` : `${customLight} ${customDarkBorder}`} text-white ms-3 d-flex align-items-center`}>
              <CloseOutlined className={`${customDark === "dark-dark" ? `` : `${customDarkText}` } `}/>
              <span className={`${customDark === "dark-dark" ? `` : `${customDarkText}` } ms-1`}>{t('cancel')}</span>
            </Button>
          </div>
        ) : (
          <Button
            type="link"
            onClick={() => {
              setEditingIndex(index);
              setEditingValue(record.typeName);
              setEditingType(record.type);
              setOriginalData(record);
            }}
            className={`${customBtn} d-flex align-items-center`}
          >
            <EditOutlined className={`${customBtn} text-white`} />
            <span className="ms-1">{t('edit')}</span>
          </Button>
        )
      ),
    },
  ];

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalVisible(false);
  };

  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  return (
    <div style={{
      padding: isMobile ? '10px' : '20px',
      background: '#fff',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      overflowX: 'auto'
    }}
      className={`rounded-2 ${customDark === "dark-dark" ? `${customDark} border text-white` : `${customDarkText}`}`}>
      <Divider className={`fs-3 mt-0 ${customDarkText}`}>
        {t("Existing Semester")}
      </Divider>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: isMobile ? '10px' : '20px'
      }}
      >
        <Button type="" className={`mb-2 rounded-2 ${customBtn} ${customDark === "dark-dark" ? `border-white` : `border-0`} custom-zoom-btn `} onClick={showModal}>
          {t('Add Semester')}
        </Button>
        <div className="d-flex align-items-center">
          <Input
            placeholder={t('searchExamTypes')}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 200, height: 32 }}
            className={` mb-2 rounded-2 ${customDark === "dark-dark" ? ` ${customLightBorder} text-dark` : `${customDarkText}`} ${customDarkBorder}  rounded-end-0`}
            allowClear
          />
          <Button
            onClick={() => {/* Add search functionality here */ }}
            className={`mb-2 rounded-2 ${customBtn} ${customDark === "dark-dark" ? `border-white` : `border-0`} rounded-start-0`}
            style={{ height: 32 }}
          >
            <FaSearch />
          </Button>
        </div>
      </div>

      <Table
        dataSource={filteredExamTypes.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
        columns={columns}
        rowKey="examTypeId"
        pagination={false}
        bordered
        scroll={{ x: 'max-content' }}
        size={isMobile ? 'small' : 'middle'}
        className={`${customDark === "default-dark" ? "thead-default" : ""}
                    ${customDark === "red-dark" ? "thead-red" : ""}
                    ${customDark === "green-dark" ? "thead-green" : ""}
                    ${customDark === "blue-dark" ? "thead-blue" : ""}
                    ${customDark === "dark-dark" ? "thead-dark" : ""}
                    ${customDark === "pink-dark" ? "thead-pink" : ""}
                    ${customDark === "purple-dark" ? "thead-purple" : ""}
                    ${customDark === "light-dark" ? "thead-light" : ""}
                    ${customDark === "brown-dark" ? "thead-brown" : ""} `}
      />
      <div className="d-flex flex-wrap justify-content-end align-items-center mt-4">
        <div className="mb-3 mb-md-0 me-md-3">
        <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={filteredExamTypes.length}
            onChange={handlePageChange}
            showSizeChanger
            pageSizeOptions={['5', '10']}
            defaultPageSize={5}
            showQuickJumper={false}
            showTotal={(total, range) => `${range[0]}-${range[1]} ${t('of') } ${total} ${t('items')}`}
            className={`${customDark === "dark-dark" ? `bg-white` : ``} p-2 p-md-3 rounded`}
            responsive
            size="small"
          />
        </div>
      </div>
      <Modal
        show={isModalVisible}
        onHide={handleCancel}
        centered
        size={isMobile ? 'sm' : 'md'}
        className={`rounded-2 ${customDark === "" ? `${customDark}` : ''}  `}
      >
        <Modal.Header closeButton={false} className={`rounded-top-2 ${customDark} ${customLightText} ${customDark === "dark-dark" ? `border ` : `border-0`} border d-flex justify-content-between `}>
          <Modal.Title>{t('Semester')}</Modal.Title>
          <AiFillCloseSquare
            size={35}
            onClick={handleCancel}
            className={`rounded-2 ${customDark === "dark-dark" ? "text-dark bg-white " : `${customDark} custom-zoom-btn text-white  ${customDarkBorder}`}`}
            aria-label={t('close')}
            style={{ cursor: 'pointer', fontSize: '1.5rem' }}
          />
        </Modal.Header>
        <Modal.Body className={`rounded-bottom-2 ${customMid} ${customDark === "dark-dark" ? `border border-top-0` : `border-0`}`}>
          <Form
            form={form}
            onFinish={handleAddExamType}
            layout="vertical"
            className={`${customDark === "dark" ? `${customDark}` : ''}`}
          >
            <div className="d-flex justify-content-between align-items-center">
              <Form.Item
                name="typeName"
                label={<span className={`${customDark === "dark-dark" || customDark === "blue-dark" ? `text-white` : `${customDarkText}`} fs-6 `}>{t('Semester')}</span>}
                rules={[{ required: true, message: t('pleaseInput Semester') }]}
                className="flex-grow-1 me-3"
              >
                <Input placeholder={t('Semester')} className="rounded-2" />
              </Form.Item>

              
            </div>

            <Form.Item>
              <Button type="" htmlType="submit" className={`rounded-2 ${customBtn} ${customDark === "dark-dark" ? `` : `border-0`} custom-zoom-btn`}>
                {t('submit')}
              </Button>
            </Form.Item>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ExamType;
