import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Switch, Form, Row, Col, message, Checkbox } from 'antd';
import { EditOutlined, UploadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useStore } from 'zustand';
import { useNavigate } from 'react-router-dom';
import API from '../../../CustomHooks/MasterApiHooks/api';
import themeStore from '../../../store/themeStore';
import EditProjectModal from '../components/EditProjectModal';
import AddProjectModal from '../components/AddProjectModal';
import { error, success } from '../../../CustomHooks/Services/AlertMessageService';
import { encrypt } from '../../../Security/Security';

const ProjectTab = ({ setActiveTabKey, setSelectedProject }) => {
  const { t } = useTranslation();
  const { getCssClasses } = useStore(themeStore);
  const cssClasses = getCssClasses();
  const [customDark, customMid, customLight, customBtn, customDarkText, customLightText, customLightBorder, customDarkBorder] = cssClasses;
  const [projectName, setProjectName] = useState('');
  const [projects, setProjects] = useState([]);
  const [groups, setGroups] = useState([]);
  const [types, setTypes] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [examTypes, setExamTypes] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [editingProject, setEditingProject] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedExamType, setSelectedExamType] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showSeriesFields, setShowSeriesFields] = useState(false);
  const [numberOfSeries, setNumberOfSeries] = useState(0);
  const [seriesNames, setSeriesNames] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');
  const [sortedInfo, setSortedInfo] = useState({});
  const [total, setTotal] = useState(0);
  const [showDescription, setShowDescription] = useState(false);
  const navigate = useNavigate();

  // Function to validate series input
  const validateSeriesInput = (_, value) => {
    if (!value) {
      return Promise.reject(new Error(t('pleaseEnterSeriesName')));
    }

    if (value.length !== numberOfSeries) {
      return Promise.reject(new Error(t('seriesNameMustMatchNumberOfSeries')));
    }

    // Convert to uppercase for validation
    value = value.toUpperCase();

    // Check if characters are sequential but can start from any letter
    const startCharCode = value.charCodeAt(0);
    for (let i = 1; i < value.length; i++) {
      if (value.charCodeAt(i) !== startCharCode + i) {
        return Promise.reject(new Error(t('charactersMustBeSequential')));
      }
    }

    return Promise.resolve();
  };

  useEffect(() => {
    getProjects();
    getGroups();
    getTypes();
    getSession();
    getExamType();
  }, []);

  const getProjects = async () => {
    try {
      const response = await API.get('/Project');
      setProjects(response.data);
      setTotal(response.data.length);
    } catch (err) {
      console.error('Failed to fetch projects', err);
      error(t('unableToFetchProjects'));
    }
  };

  const getGroups = async () => {
    try {
      const response = await API.get('/Groups');
      const activeGroups = response.data.filter(group => group.status === true);
      setGroups(activeGroups);
    } catch (err) {
      console.error('Failed to fetch groups', err);
      error(t('unableToFetchGroups'));
    }
  };

  const getTypes = async () => {
    try {
      const response = await API.get('/PaperTypes');
      const activeTypes = response.data.filter(type => type.status === true);
      setTypes(activeTypes);
    } catch (err) {
      console.error('Failed to fetch types', err);
      error(t('unableToFetchTypes'));
    }
  };

  const getSession = async () => {
    try {
      const response = await API.get('/Session');
      setSessions(response.data);
      // console.log(response);
    } catch (err) {
      console.error('Failed to fetch session', err);
      error(t('unableToFetchSession'));
    }
  };

  const getExamType = async () => {
    try {
      const response = await API.get('/ExamType');
      setExamTypes(response.data);
    } catch (err) {
      console.error('Failed to fetch exam type', err);
      error(t('unableToFetchExamType'));
    }
  };


  const handleAddProject = async (values) => {
    if (!selectedGroup || !selectedType || !selectedSession || !Array.isArray(selectedExamType) || selectedExamType.length === 0) {
      error(t('pleaseSelectGroupAndType'));
      return;
    }
    const selectedExamTypeIds = selectedExamType.map(exam => exam.examTypeId);
    const newProject = {
      name: projectName,
      status: values.status || true,
      description: values.description || '',
      groupId: selectedGroup.id,
      typeId: selectedType.typeId,
      examTypeId: selectedExamTypeIds,
      sessionId: selectedSession.sessionId,
      noOfSeries: numberOfSeries || 0,
      seriesName: seriesNames,
      quantityThreshold: values.quantityThreshold
    };

    try {
      const response = await API.post('/Project', newProject);
      getProjects();
      setProjects([...projects, response.data]);
      form.resetFields();
      setIsModalVisible(false);
      setProjectName('');
      setSelectedGroup(null);
      setSelectedType(null);
      setSelectedExamType([]);
      setSelectedSession(null);
      setNumberOfSeries(0); // Reset numberOfSeries
      setSeriesNames('');
      success(t('projectAddedSuccessfully'));
      setActiveTabKey("2");
      setSelectedProject(response.data.projectId);
    } catch (err) {
      console.error('Error adding project:', error);
      const errorMessage = err.response?.data || t('errorAddingProject');
      error(errorMessage);
    }
  };

  const handleEditSave = async (values) => {
    try {
      //const selectedTypeObj = types.find(type => type.typeId === values.type);
      //const selectedSessionObj = sessions.find(session => session.sessionId === values.session);

      const updatedProject = {
        ...editingProject,
        name: values.name,
        description: values.description,
        status: values.status,
        quantityThreshold: values.quantityThreshold,
        groupId: values.group,
        typeId: values.type,
        sessionId: values.session,
        examTypeId: values.examType,
        noOfSeries: numberOfSeries, // Use the state value directly
        seriesName: values.seriesNames
      };
      // console.log(updatedProject)


      await API.put(`/Project/${editingProject.projectId}`, updatedProject);
      const updatedProjects = projects.map(p =>
        p.projectId === editingProject.projectId ? updatedProject : p
      );
      setProjects(updatedProjects);
      setIsEditModalVisible(false);
      setEditingProject(null);
      setNumberOfSeries(0); // Reset numberOfSeries
      setNumberOfSeries('');
      success(t('projectUpdatedSuccessfully'));
    } catch (err) {
      console.error('Failed to update project:', err);
      error(t('failedToUpdateProject'));
    }
  };

  const columns = [
    {
      align: 'center',
      title: t('sn'),
      dataIndex: 'serial',
      key: 'serial',
      render: (text, record, index) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: t('projectName'),
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order,
      render: (text, record) => (
        <a onClick={() => {
          setActiveTabKey("2");
          setSelectedProject(record.projectId);
        }}>
          {text}
        </a>
      ),
    },
    ...(showDescription ? [{
      title: t('projectDescription'),
      dataIndex: 'description',
      key: 'description',
    }] : []),
    {
      title: t('status'),
      dataIndex: 'status',
      key: 'status',
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
      title: t('action'),
      key: 'action',
      render: (_, record) => (
        <div className="d-flex align-items-center justify-content-center">
          <Button
            className={`${customBtn} me-2`}
            onClick={() => {
              setEditingProject(record);
              setNumberOfSeries(record.noOfSeries); // Set numberOfSeries when editing
              setSeriesNames(record.seriesName);

              // Check if the project type is Booklet (typeId === 1 or types === 'Booklet')
              const projectType = types.find(type => type.typeId === record.typeId);
              if (projectType) {
                const isBooklet = projectType.typeId === 1 || projectType.types === 'Booklet';
                setShowSeriesFields(isBooklet);
                // console.log("Edit project - Type:", projectType.types, "TypeID:", projectType.typeId, "Show series fields:", isBooklet);
              }

              editForm.setFieldsValue({
                name: record.name,
                description: record.description,
                status: record.status,
                group: record.groupId,
                type: record.typeId,
                session: record.sessionId,
                typeName: record.examTypeId,
                numberOfSeries: record.noOfSeries,
                seriesNames: record.seriesName,
                quantityThreshold: record.quantityThreshold,
                examType: record.examTypeId
              });
              setIsEditModalVisible(true);
            }}
            icon={<EditOutlined />}
            title={t('edit')}
          >

          </Button>
          <Button
            className={`${customBtn}`}
            onClick={() => navigate(`/quantity-sheet-uploads/${encrypt(record.projectId)}`)}
            icon={<UploadOutlined />}
            title={t('Upload Quantity Sheet')}
          />
        </div>
      ),
    },
  ];

  const handleTableChange = (pagination, filters, sorter) => {
    setSortedInfo(sorter);
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  const filteredProjects = projects.filter(project =>
    Object.values(project).some(value =>
      value && value.toString().toLowerCase().includes(searchText.toLowerCase())
    )
  );

  const currentProjects = filteredProjects.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );


  const handleGroupChange = (event) => {
    const selectedGroupId = parseInt(event.target.value, 10);
    const selectedGroupObj = groups.find((group) => group.id === selectedGroupId);
    setSelectedGroup(selectedGroupObj);

    if (selectedGroupObj && selectedType && selectedSession && Array.isArray(selectedExamType) && selectedExamType.length > 0) {
      // Combine the selected exam types' names into a string for the project name
      const examTypeNames = selectedExamType.map((obj) => obj.typeName).join(', ');
      setProjectName(`${selectedGroupObj.name}-${selectedType.types} - ${selectedSession.session} - ${examTypeNames}`);
    } else {
      setProjectName('');
    }
  };

  const handleSessionChange = (event) => {
    const selectedSessionId = parseInt(event.target.value, 10);
    const selectedSessionObj = sessions.find((session) => session.sessionId === selectedSessionId);
    setSelectedSession(selectedSessionObj);

    if (selectedGroup && selectedType && selectedSessionObj && Array.isArray(selectedExamType) && selectedExamType.length > 0) {
      // Combine the selected exam types' names into a string for the project name
      const examTypeNames = selectedExamType.map((obj) => obj.typeName).join(', ');
      setProjectName(`${selectedGroup.name}-${selectedType.types} - ${selectedSessionObj.session} - ${examTypeNames}`);
    } else {
      setProjectName('');
    }
  };

  const handleExamTypeChange = (value) => {
    // Find the exam type objects corresponding to the selected IDs
    const selectedExamTypeObjs = examTypes.filter((type) => value.includes(type.examTypeId));

    // console.log(selectedExamTypeObjs); // Log the selected exam types

    setSelectedExamType(selectedExamTypeObjs);

    if (selectedGroup && selectedType && selectedSession && selectedExamTypeObjs.length > 0) {
      // Combine the selected exam types' names into a string for the project name
      const examTypeNames = selectedExamTypeObjs.map((obj) => obj.typeName).join(', ');
      // console.log(examTypeNames); // Log the combined exam type names

      setProjectName(`${selectedGroup.name}-${selectedType.types} - ${selectedSession.session} - ${examTypeNames}`);
    } else {
      setProjectName('');
    }
  };

  // const handleTypeChange = (event) => {
  //   const selecthandleTypeChangeedTypeId = parseInt(event.target.value, 10);
  //   const selectedTypeObj = types.find((type) => type.typeId === selectedTypeId);
  //   setSelectedType(selectedTypeObj);

  //   const typeName = selectedTypeObj.types;
  //   if (typeName === 'Booklet') {
  //     console.log("Booklet is found")
  //     setShowSeriesFields(true)
  //   }
  //   else{
  //     setShowSeriesFields(false)
  //   }
  //   if (selectedGroup && selectedTypeObj && selectedSession && selectedExamType) {
  //       setProjectName(`${selectedGroup.name}-${selectedTypeObj.types} - ${selectedSession.session} - ${selectedExamType.typeName}`);
  //   } else {
  //     setProjectName('');
  //   }
  // };

  const handleTypeChange = (event) => {
    const selectedTypeId = parseInt(event.target.value, 10);
    const selectedTypeObj = types.find((type) => type.typeId === selectedTypeId);
    setSelectedType(selectedTypeObj);

    // Check if type is Booklet (typeId === 1 or types === 'Booklet')
    if (selectedTypeObj) {
      const isBooklet = selectedTypeObj.typeId === 1 || selectedTypeObj.types === 'Booklet';
      setShowSeriesFields(isBooklet);
      // console.log("Type selected:", selectedTypeObj.types, "TypeID:", selectedTypeObj.typeId, "Show series fields:", isBooklet);
    } else {
      setShowSeriesFields(false);
    }

    if (selectedGroup && selectedTypeObj && selectedSession && Array.isArray(selectedExamType) && selectedExamType.length > 0) {
      // Combine the selected exam types' names into a string for the project name
      const examTypeNames = selectedExamType.map((obj) => obj.typeName).join(', ');
      setProjectName(`${selectedGroup.name}-${selectedTypeObj.types} - ${selectedSession.session} - ${examTypeNames}`);
    } else {
      setProjectName('');
    }
  };


  return (
    <>
      <Row justify="space-between" align="middle" style={{ marginBottom: '20px' }}>
        <Col xs={24} sm={12} style={{ textAlign: 'left' }}>
          <Button
            type="primary"
            className={`${customBtn} mt-1`}
            onClick={() => setIsModalVisible(true)}
          >
            {t('addNewProject')}
          </Button>
        </Col>
        <Col xs={24} sm={12} style={{ textAlign: 'right' }}>
          <Checkbox
            checked={showDescription}
            onChange={(e) => setShowDescription(e.target.checked)}
            className="me-3"
          >
            {t('showDescription')}
          </Checkbox>
          <Input.Search
            placeholder={t('searchProjects')}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: '100%', maxWidth: '300px' }}
            className={`${customDarkText} mt-1`}
          />
        </Col>
      </Row>

      <div className="table-responsive">
        <Table
          columns={columns}
          dataSource={currentProjects.map((project, index) => ({ ...project, serial: index + 1 }))}
          onChange={handleTableChange}
          pagination={{
            className: 'p-3 rounded rounded-top-0',
            current: currentPage,
            pageSize: pageSize,
            total: filteredProjects.length,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} ${t('of')} ${total} ${t('items')}`,
            pageSizeOptions: ['10', '15', '20']
          }}
          rowKey="projectId"
          bordered
          scroll={{ x: 'max-content' }}
          className={`${customDark === "default-dark" ? "thead-default" : ""}
              ${customDark === "red-dark" ? "thead-red" : ""}
              ${customDark === "green-dark" ? "thead-green" : ""}
              ${customDark === "blue-dark" ? "thead-blue" : ""}
              ${customDark === "dark-dark" ? "thead-dark" : ""}
              ${customDark === "pink-dark" ? "thead-pink" : ""}
              ${customDark === "purple-dark" ? "thead-purple" : ""}
              ${customDark === "light-dark" ? "thead-light" : ""}
              ${customDark === "brown-dark" ? "thead-brown" : ""} custom-pagination`}
        />
      </div>

      <AddProjectModal
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setProjectName('');
          setSelectedGroup(null);
          setSelectedType(null);
          setSelectedSession(null);
          setSelectedExamType(null);
          setNumberOfSeries(0); // Reset numberOfSeries
          setSeriesNames('');
        }}
        form={form}
        onFinish={handleAddProject}
        groups={groups}
        types={types}
        sessions={sessions}
        examTypes={examTypes}
        showSeriesFields={showSeriesFields}
        validateSeriesInput={validateSeriesInput}
        customDarkText={customDarkText}
        customDark={customDark}
        customMid={customMid}
        customLight={customLight}
        customBtn={customBtn}
        customLightText={customLightText}
        customLightBorder={customLightBorder}
        customDarkBorder={customDarkBorder}
        t={t}
        handleGroupChange={handleGroupChange}
        handleTypeChange={handleTypeChange}
        handleSessionChange={handleSessionChange}
        handleExamTypeChange={handleExamTypeChange}
        numberOfSeries={numberOfSeries}
        setNumberOfSeries={setNumberOfSeries}
        seriesNames={seriesNames}
        setSeriesNames={setSeriesNames}
        projectName={projectName}
        setProjectName={setProjectName}
        selectedGroup={selectedGroup}
        selectedType={selectedType}
        selectedExamType={selectedExamType}
        selectedSession={selectedSession}

      />

      <EditProjectModal
        visible={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          editForm.resetFields();
          setNumberOfSeries(0); // Reset numberOfSeries
          setSeriesNames('');
        }}
        form={editForm}
        onFinish={handleEditSave}
        groups={groups}
        types={types}
        sessions={sessions}
        examTypes={examTypes}
        showSeriesFields={showSeriesFields}
        validateSeriesInput={validateSeriesInput}
        customDarkText={customDarkText}
        customDark={customDark}
        customMid={customMid}
        customLight={customLight}
        customBtn={customBtn}
        customLightText={customLightText}
        customLightBorder={customLightBorder}
        customDarkBorder={customDarkBorder}
        numberOfSeries={numberOfSeries}
        setNumberOfSeries={setNumberOfSeries}
        handleExamTypeChange={handleExamTypeChange}
        handleTypeChange={(value) => {
          const typeId = parseInt(value, 10);
          const selectedTypeObj = types.find(type => type.typeId === typeId);
          if (selectedTypeObj) {
            const isBooklet = selectedTypeObj.typeId === 1 || selectedTypeObj.types === 'Booklet';
            setShowSeriesFields(isBooklet);
            // console.log("Edit modal type changed:", selectedTypeObj.types, "TypeID:", selectedTypeObj.typeId, "Show series fields:", isBooklet);
          } else {
            setShowSeriesFields(false);
          }
        }}
        seriesNames={seriesNames}
        setSeriesNames={setSeriesNames}
        t={t}
      />
    </>
  );
};

export default ProjectTab;
