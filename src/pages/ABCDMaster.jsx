import React, { useState, useEffect } from 'react'
import { Container, Card, Form, Row, Col, Button, Table, InputGroup } from 'react-bootstrap';
import API from '../CustomHooks/MasterApiHooks/api';
import themeStore from './../store/themeStore';
import { useStore } from 'zustand';
import { success, error } from '../CustomHooks/Services/AlertMessageService';
import { FaSearch, FaEdit } from 'react-icons/fa';

const ABCDMaster = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const { getCssClasses } = useStore(themeStore);
  const cssClasses = getCssClasses();
  const [customDark, customMid, customLight, customBtn, customDarkText, customLightText, customLightBorder, customDarkBorder] = cssClasses;
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [allConfigurations, setAllConfigurations] = useState([]);
  const [showTable, setShowTable] = useState(false);  // Add this line
  const [selectedValues, setSelectedValues] = useState({
    A: 'CourseId SessionId',
    B: '',
    C: '',
    D: '',
    sessionFormat: '2022-2023'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [editingConfig, setEditingConfig] = useState(null);
  const [editValues, setEditValues] = useState({
    A: 'CourseId SessionId',
    B: '',
    C: '',
    D: '',
    sessionFormat: '2022-2023'
  });
  const [columns, setColumns] = useState([]);

  const fetchAllConfigurations = async () => {
    try {
      const response = await API.get('/ABCD');
      setAllConfigurations(response.data);
    } catch (err) {
      error('Failed to fetch configurations');
    }
  };

  // Update fetchColumns
  useEffect(() => {
    const fetchColumns = async () => {
      try {
        const res = await API.get('/QPMasters/Columns');
        setColumns(res.data);
      } catch (err) {
        error('Error fetching columns');
      }
    };

    fetchColumns();
  }, []);

  const handleSaveConfiguration = async () => {
    if (!selectedGroupId) {
      error('Please select a group first');
      return;
    }

    if (!selectedValues.A || !selectedValues.B || !selectedValues.C || !selectedValues.D) {
      error('Please select all ABCD values before saving');
      return;
    }

    // Only check for existing configuration if we're creating a new one
    if (!editingConfig) {
      const existingConfig = allConfigurations.find(
        config => config.groupId === parseInt(selectedGroupId)
      );

      if (existingConfig) {
        const groupName = groups.find(g => g.id === parseInt(selectedGroupId))?.name || `Group ${selectedGroupId}`;
        error(`Configuration already exists for ${groupName}. Please select a different group.`);
        return;
      }
    }

    try {
      const configData = {
        ...(editingConfig && { abcdId: editingConfig.abcdId }),
        GroupId: parseInt(selectedGroupId),
        A: selectedValues.A,
        B: selectedValues.B,
        C: selectedValues.C,
        D: selectedValues.D,
        SessionFormat: selectedValues.sessionFormat
      };

      if (editingConfig) {
        await API.put(`/ABCD/${editingConfig.abcdId}`, configData);
        success('Configuration updated successfully');
      } else {
        await API.post('/ABCD', configData);
        success('Configuration saved successfully');
      }

      await fetchAllConfigurations();
      handleReset();
    } catch (err) {
      error(`Failed to ${editingConfig ? 'update' : 'save'} configuration: ${err.message}`);
    }
  };
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await API.get('/Groups');
        setGroups(res.data);
      } catch (err) {
        error('Error fetching groups');
      }
    };

    fetchGroups();
  }, []);

  useEffect(() => {
    fetchAllConfigurations();
  }, []);

  // Add filtered configurations based on search term
  const filteredConfigurations = allConfigurations.filter(config => {
    const groupName = groups.find(g => g.id === config.groupId)?.name || `Group ${config.groupId}`;
    return (
      groupName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      config.a?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      config.b?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      config.c?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      config.d?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sessionName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredConfigurations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredConfigurations.length / itemsPerPage);

  // Add pagination controls
  const renderPagination = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="d-flex justify-content-end mt-3">
        <nav>
          <ul className="pagination mb-0">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>
                Previous
              </button>
            </li>
            {pageNumbers.map(number => (
              <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                <button className="page-link" onClick={() => setCurrentPage(number)}>
                  {number}
                </button>
              </li>
            ))}
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}>
                Next
              </button>
            </li>
          </ul>
        </nav>
      </div>
    );
  };

  // Modify reset handler to only reset values
  // Modify reset handler
  const handleReset = () => {
    setSelectedValues({ A: '', B: '', C: '', D: '' });
    setSelectedGroupId('');
    setShowTable(false);
    setEditingConfig(null);
  };

  const handleValueChange = (label, value) => {
    if (label === 'A') {
      // For Label A, directly use the values from react-select
      setSelectedValues(prev => ({
        ...prev,
        [label]: value // value will already be in correct format from Select onChange
      }));
    } else {
      // For other labels, keep single selection
      setSelectedValues(prev => ({
        ...prev,
        [label]: value
      }));
    }

    // Update table visibility based on all labels being selected
    const newValues = { ...selectedValues, [label]: value };
    if (
      newValues.A.length > 0 &&
      newValues.B !== '' &&
      newValues.C !== '' &&
      newValues.D !== ''
    ) {
      setShowTable(true);
    } else {
      setShowTable(false);
    }
  };

  // Update handleGroupChange to include table visibility logic
  const handleGroupChange = (value) => {
    setSelectedGroupId(value);
    setShowTable(false);
    setSelectedValues({ A: '', B: '', C: '', D: '' });
  };

  const handleEdit = (config) => {
    setEditingConfig(config);
    setSelectedValues({
      A: config.a || '',
      B: config.b || '',
      C: config.c || '',
      D: config.d || ''
    });
    setSelectedGroupId(config.groupId.toString());
  };

  // Add handleEditValueChange function
  const handleEditValueChange = (label, value) => {
    setEditValues(prev => ({
      ...prev,
      [label]: value
    }));
  };

  return (
    <Container className="py-4">
      <h4 className="mb-2 fw-bold text-center fs-2">Group ABCD Configuration</h4>
      <Card className={`shadow-sm rounded-3 mb-4 border-0 ${customDark === "dark-dark" ? `${customDark} border` : ''}`}>
        <Card.Body className={`px-4 py-2 ${customDark === "dark-dark" ? customMid : ''}`}>
          <Form>
            {/* Group and Session Selectors */}
            <Row className="mb-4">
              <Col md={3}>
                <Form.Label className="fw-bold text-secondary mb-1"> Group <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  value={selectedGroupId}
                  onChange={(e) => handleGroupChange(e.target.value)}
                  className="rounded-2 border-secondary-subtle"
                >
                  <option value="">Select a Group</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name || `Group ${group.id}`}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            </Row>
            <Row className="mb-4">
              <Col md={6}>
                <Form.Group className="mb-4" controlId="formA">
                  <Form.Label className="fw-bold text-secondary mb-1">A</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedValues.A}
                    onChange={(e) =>
                      setSelectedValues(prev => ({
                        ...prev,
                        A: e.target.value
                      }))
                    }
                    placeholder="Enter format like 'CourseId Examination 2023 SessionId'"
                  />

                </Form.Group>
                <Form.Group className="mb-4" controlId="sessionFormat">
                  <Form.Label className="fw-bold text-secondary mb-1">Session Format</Form.Label>
                  <Form.Select
                    value={selectedValues.sessionFormat}
                    onChange={(e) =>
                      setSelectedValues(prev => ({
                        ...prev,
                        sessionFormat: e.target.value
                      }))
                    }
                  >
                    <option value="2022-2023">2022-2023</option>
                    <option value="2022-23">2022-23</option>
                    <option value="22-23">22-23</option>
                    <option value="22-2023">22-2023</option>
                  </Form.Select>
                </Form.Group>

              </Col>

              {['B', 'C', 'D'].map((label) => (
                <Col md={3} key={label}>
                  <Form.Label className="fw-bold text-secondary mb-1">{label}</Form.Label>
                  <Form.Select
                    value={selectedValues[label]}
                    onChange={(e) => handleValueChange(label, e.target.value)}
                  >
                    <option value="">Select a column</option>
                    {columns.map((col) => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </Form.Select>
                </Col>
              ))}
            </Row>
            <div className="d-flex justify-content-end gap-3 pt-3 border-top">
              <Button
                className={`px-4 ${customDark === "dark-dark" ? customDarkText : ''}`}
                variant={customDark === "dark-dark" ? "outline-light" : "light"}
                onClick={handleReset}
              >
                Reset
              </Button>
              <Button
                className={`px-4 fw-semibold ${customBtn}`}
                variant={customDark === "dark-dark" ? "outline-light" : "primary"}
                onClick={handleSaveConfiguration}
              >
                {editingConfig ? 'Update' : 'Save'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
      <Card className={`shadow-sm rounded-3 border-0 ${customDark === "dark-dark" ? `${customDark} border` : ''}`}>
        <Card.Body className={`p-0 ${customDark === "dark-dark" ? customMid : ''}`}>
          {/* Add Search Box */}
          <div className="p-3 border-bottom d-flex justify-content-end">
            <InputGroup style={{ width: '300px' }}>
              <InputGroup.Text className={customDark === "dark-dark" ? customDarkText : ''}>
                <FaSearch />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search configurations..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className={customDark === "dark-dark" ? customDarkText : ''}
                style={{ fontSize: '0.9rem' }}
              />
            </InputGroup>
          </div>
          <div className="table-responsive">
            <Table hover striped bordered className="mb-0 align-middle">
              <thead>
                <tr className={`${customLight}`}>
                  <th className="px-2 py-2 text-center" style={{ width: '5%' }}>Sr.</th>
                  <th className="px-2 py-2 text-center" style={{ width: '15%' }}>Group</th>
                  <th className="px-2 py-2 text-center" style={{ width: '20%' }}>
                    <span className="badge rounded-pill bg-success">A</span>
                  </th>
                  <th className="px-2 py-2 text-center" style={{ width: '15%' }}>
                    <span className="badge rounded-pill bg-success">B</span>
                  </th>
                  <th className="px-2 py-2 text-center" style={{ width: '15%' }}>
                    <span className="badge rounded-pill bg-success">C</span>
                  </th>
                  <th className="px-2 py-2 text-center" style={{ width: '15%' }}>
                    <span className="badge rounded-pill bg-success">D</span>
                  </th>
                  <th className="px-2 py-2 text-center" style={{ width: '5%' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((config, index) => (
                  <tr key={config.abcdId}>
                    <td className="px-2 py-2 text-center fw-medium">{indexOfFirstItem + index + 1}</td>
                    <td className="px-2 py-2 text-center fw-medium">
                      {groups.find(g => g.id === config.groupId)?.name || `Group ${config.groupId}`}
                    </td>
                    <td className="px-2 py-2 text-center">
                      <span className="text-secondary fw-medium">
                        {config.sessionId && sessions.find(s => s.sessionId === config.sessionId)?.session}
                        {config.a && config.a !== 'null' && (
                          <>
                            <br />
                            {config.a}
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-center">
                      <span className="text-secondary fw-medium">{config.b}</span>
                    </td>
                    <td className="px-2 py-2 text-center">
                      <span className="text-secondary fw-medium">{config.c}</span>
                    </td>
                    <td className="px-2 py-2 text-center">
                      <span className="text-secondary fw-medium">{config.d}</span>
                    </td>
                    <td className="px-2 py-2 text-center">
                      <Button
                        variant="link"
                        className="p-2"
                        onClick={() => handleEdit(config)}
                      >
                        <FaEdit className="text-primary" size={25} />
                      </Button>
                    </td>
                  </tr>
                ))}
                {currentItems.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      <i className="bi bi-inbox me-2"></i>
                      {searchTerm ? 'No matching configurations found' : 'No configurations found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>

        </Card.Body >
      </Card >
    </Container >

  )
}

export default ABCDMaster
