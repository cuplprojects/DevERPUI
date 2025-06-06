import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Switch, Form, Pagination, Divider, DatePicker } from 'antd';
import { Modal } from 'react-bootstrap';
import API from '../CustomHooks/MasterApiHooks/api';
import { useMediaQuery } from 'react-responsive';
import themeStore from './../store/themeStore';
import { useStore } from 'zustand';
import { AiFillCloseSquare } from "react-icons/ai";
import { SortAscendingOutlined, SortDescendingOutlined, EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { Col, Row } from 'react-bootstrap';
import { FaSearch } from "react-icons/fa";
import { useTranslation } from 'react-i18next';
import { success, error } from '../CustomHooks/Services/AlertMessageService';
import moment from 'moment';

const Session = () => {
  const { t } = useTranslation();
  const { getCssClasses } = useStore(themeStore);
  const cssClasses = getCssClasses();
  const [customDark, customMid, customLight, customBtn, customDarkText, customLightText, customLightBorder, customDarkBorder] = cssClasses;
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editForm] = Form.useForm();
  const [form] = Form.useForm();
  const [editingSession, setEditingSession] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [editingStatus, setEditingStatus] = useState(true);
  const [originalData, setOriginalData] = useState({});
  const [searchText, setSearchText] = useState('');
  const [sortOrder, setSortOrder] = useState('ascend');
  const [sortField, setSortField] = useState('session');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });

  const fetchSessions = async () => {
    try {
      const response = await API.get('/Session');
      setSessions(response.data);
      setFilteredSessions(response.data);
    } catch (err) {
      error(t('failedToFetchSessions'));
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    const filtered = sessions.filter(session =>
      session.session.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredSessions(filtered);
    setCurrentPage(1);
  }, [searchText, sessions]);

  const handleAddSession = async (values) => {
    const { startYear, endYear, status } = values;
    const sessionName = `${startYear.year()}-${endYear.year()}`;

    const existingSession = sessions.find(s => s.session.toLowerCase() === sessionName.toLowerCase());
    if (existingSession) {
      error(t('sessionNameAlreadyExists'));
      return;
    }

    try {
      const newSession = { session: sessionName, status };
      await API.post('/Session', newSession);
      setSessions([...sessions, newSession]);
      setFilteredSessions([...filteredSessions, newSession]);
      fetchSessions();
      form.resetFields();
      setIsModalVisible(false);
      success(t('sessionAddedSuccessfully'));
    } catch (err) {
      error(t('failedToAddSession'));
    }
  };

  const handleEditSave = async (values) => {
    const { session, status } = values;
    if (!session.trim()) {
      error(t('sessionNameCannotBeEmpty'));
      return;
    }

    const existingSession = sessions.find(s =>
      s.session.toLowerCase() === session.toLowerCase() && s.sessionId !== editingSession.sessionId
    );

    if (existingSession) {
      error(t('sessionNameAlreadyExists'));
      return;
    }

    try {
      const updatedSession = { ...editingSession, session, status };
      await API.put(`/Session/${editingSession.sessionId}`, updatedSession);
      const updatedSessions = sessions.map(s =>
        s.sessionId === editingSession.sessionId ? updatedSession : s
      );
      setSessions(updatedSessions);
      setFilteredSessions(updatedSessions.filter(s =>
        s.session.toLowerCase().includes(searchText.toLowerCase())
      ));
      fetchSessions();
      setIsEditModalVisible(false);
      setEditingSession(null);
      success(t('sessionUpdatedSuccessfully'));
    } catch (err) {
      error(t('failedToUpdateSession'));
    }
  };

  const showEditModal = (record, index) => {
    setEditingSession(record);
    setEditingIndex(index);
    editForm.setFieldsValue({
      session: record.session,
      status: record.status
    });
    setIsEditModalVisible(true);
  };

  const handleEditCancel = () => {
    setIsEditModalVisible(false);
    setEditingSession(null);
    editForm.resetFields();
  };

  const handleSort = (field) => {
    const newSortOrder = field === sortField && sortOrder === 'ascend' ? 'descend' : 'ascend';
    setSortOrder(newSortOrder);
    setSortField(field);

    const sortedSessions = [...filteredSessions].sort((a, b) => {
      if (field === 'session') {
        return newSortOrder === 'ascend'
          ? a.session.localeCompare(b.session)
          : b.session.localeCompare(a.session);
      } else if (field === 'status') {
        return newSortOrder === 'ascend'
          ? (a.status === b.status ? 0 : a.status ? -1 : 1)
          : (a.status === b.status ? 0 : a.status ? 1 : -1);
      }
    });

    setFilteredSessions(sortedSessions);
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
      title: t('sessionName'),
      dataIndex: 'session',
      key: 'session',
      width: '40%',
      sorter: (a, b) => a.session.localeCompare(b.session),
    },
    {
      align: 'center',
      title: t('status'),
      dataIndex: 'status',
      key: 'status',
      width: '25%',
      sorter: (a, b) => a.status - b.status,
      render: (status) => (
        <Switch
          checked={status}
          disabled
          checkedChildren={t('active')}
          unCheckedChildren={t('inactive')}
        />
      ),
    },
    {
      align: 'left',
      title: t('action'),
      key: 'action',
      width: '25%',
      render: (_, record, index) => (
        <Button
          type="link"
          onClick={() => showEditModal(record, index)}
          className={`${customBtn} d-flex align-items-center`}
        >
          <EditOutlined className={`${customBtn} text-white`} />
          <span className="ms-1">{t('edit')}</span>
        </Button>
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
        {t("existingSessions")}
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
          {t('addSession')}
        </Button>
        <div className="d-flex align-items-center">
          <Input
            placeholder={t('searchSessions')}
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
        dataSource={filteredSessions.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
        columns={columns}
        rowKey="sessionId"
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
            total={filteredSessions.length}
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
          <Modal.Title>{t('addSession')}</Modal.Title>
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
            onFinish={handleAddSession}
            layout="vertical"
            className={`${customDark === "dark" ? `${customDark}` : ''}`}
          >
            <div className="d-flex justify-content-between align-items-center">
              <Form.Item
                name="startYear"
                label={<span className={`${customDark === "dark-dark" || customDark === "blue-dark" ? `text-white` : `${customDarkText}`} fs-5 `}>{t('startYear')}</span>}
                rules={[{ required: true, message: t('pleaseSelectStartYear') }]}
                className="flex-grow-1 me-3"
              >
                <DatePicker picker="year" placeholder={t('selectStartYear')} className="rounded-2" />
              </Form.Item>

              <Form.Item
                name="endYear"
                label={<span className={`${customDark === "dark-dark" || customDark === "blue-dark" ? `text-white` : `${customDarkText}`} fs-5 `}>{t('endYear')}</span>}
                rules={[
                  { required: true, message: t('pleaseSelectEndYear') },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('startYear').year() < value.year()) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error(t('endYearMustBeAfterStartYear')));
                    },
                  }),
                ]}
                className="flex-grow-1 me-3"
              >
                <DatePicker picker="year" placeholder={t('selectEndYear')} className="rounded-2" />
              </Form.Item>

              <Form.Item
                name="status"
                label={<span className={`${customDark === "dark-dark" || customDark === "blue-dark" ? `text-white` : `${customDarkText}`} fs-5 `}>{t('status')}</span>}
                valuePropName="checked"
                initialValue={true}
              >
                <Switch checkedChildren={t('active')} unCheckedChildren={t('inactive')} className="" />
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

      <Modal
        show={isEditModalVisible}
        onHide={handleEditCancel}
        centered
        size={isMobile ? 'sm' : 'md'}
        className={`rounded-2 ${customDark === "" ? `${customDark}` : ''}  `}
      >
        <Modal.Header closeButton={false} className={`rounded-top-2 ${customDark} ${customLightText} ${customDark === "dark-dark" ? `border ` : `border-0`} border d-flex justify-content-between `}>
          <Modal.Title>{t('editSession')}</Modal.Title>
          <AiFillCloseSquare
            size={35}
            onClick={handleEditCancel}
            className={`rounded-2 ${customDark === "dark-dark" ? "text-dark bg-white " : `${customDark} custom-zoom-btn text-white  ${customDarkBorder}`}`}
            aria-label={t('close')}
            style={{ cursor: 'pointer', fontSize: '1.5rem' }}
          />
        </Modal.Header>
        <Modal.Body className={`rounded-bottom-2 ${customMid} ${customDark === "dark-dark" ? `border border-top-0` : `border-0`}`}>
          <Form
            form={editForm}
            onFinish={handleEditSave}
            layout="vertical"
            className={`${customDark === "dark" ? `${customDark}` : ''}`}
          >
            <Form.Item
              name="session"
              label={<span className={`${customDark === "dark-dark" || customDark === "blue-dark" ? `text-white` : `${customDarkText}`} fs-5 `}>{t('sessionName')}</span>}
              rules={[{ required: true, message: t('pleaseEnterSessionName') }]}
            >
              <Input className="rounded-2" />
            </Form.Item>

            <Form.Item
              name="status"
              label={<span className={`${customDark === "dark-dark" || customDark === "blue-dark" ? `text-white` : `${customDarkText}`} fs-5 `}>{t('status')}</span>}
              valuePropName="checked"
            >
              <Switch checkedChildren={t('active')} unCheckedChildren={t('inactive')} />
            </Form.Item>

            <Form.Item>
              <Button type="" htmlType="submit" className={`rounded-2 ${customBtn} ${customDark === "dark-dark" ? `` : `border-0`} custom-zoom-btn`}>
                {t('update')}
              </Button>
            </Form.Item>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Session;
