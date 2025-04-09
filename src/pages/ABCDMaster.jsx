import React, { useEffect, useState } from 'react';
import { Container, Card, Form, Row, Col, Button, Table, InputGroup } from 'react-bootstrap';
import Select from 'react-select';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import API from '../CustomHooks/MasterApiHooks/api';
import themeStore from './../store/themeStore';
import { useStore } from 'zustand';
import { success, error } from '../CustomHooks/Services/AlertMessageService';
import { FaSearch } from 'react-icons/fa';

const ABCDMaster = () => {
  const { getCssClasses } = useStore(themeStore);
  const cssClasses = getCssClasses();
  const [customDark, customMid, customLight, customBtn, customDarkText, customLightText, customLightBorder, customDarkBorder] = cssClasses;
  const [columns, setColumns] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [showTable, setShowTable] = useState(false);  // Add this line
  const [selectedValues, setSelectedValues] = useState({
    A: '',
    B: '',
    C: '',
    D: ''
  });

  // Add new state for all configurations
  const [allConfigurations, setAllConfigurations] = useState([]);

  // Add new state for pagination and search
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');

  // Add function to fetch all configurations
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

  // Update fetchGroups
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

  // Add new state for sessions
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  
  // Add function to fetch sessions
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await API.get('/Session');
        setSessions(res.data);
      } catch (err) {
        error('Error fetching sessions');
      }
    };
  
    fetchSessions();
  }, []);
  
  // Update handleSaveConfiguration
  const handleSaveConfiguration = async () => {
    if (!selectedGroupId) {
      error('Please select a group first');
      return;
    }
  
    if (!selectedSessionId) {
      error('Please select a session first');
      return;
    }
  
    if (!selectedValues.A || !selectedValues.B || !selectedValues.C || !selectedValues.D) {
      error('Please select all ABCD values before saving');
      return;
    }
  
    try {
      const selectedSession = sessions.find(s => s.sessionId === parseInt(selectedSessionId));
      const configData = {
        GroupId: parseInt(selectedGroupId),
        SessionId: parseInt(selectedSessionId),
        A: `${selectedValues.A.split(',')
          .filter(val => !val.startsWith('session:'))
          .join(' ')}`,  // Removed duplicate session prefix
        B: selectedValues.B,
        C: selectedValues.C,
        D: selectedValues.D
      };

      await API.post('/ABCD', configData);
      await fetchAllConfigurations();
      handleReset();
      success('Configuration saved successfully');
    } catch (err) {
      error(`Failed to save configuration: ${err.message}`);
    }
  };

  // Add useEffect to fetch configurations on component mount
  useEffect(() => {
    fetchAllConfigurations();
  }, []);

  // Add filtered configurations based on search term
  const filteredConfigurations = allConfigurations.filter(config => {
    const groupName = groups.find(g => g.id === config.groupId)?.name || `Group ${config.groupId}`;
    const sessionName = sessions.find(s => s.sessionId === config.sessionId)?.session || '';
    
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
    setSelectedSessionId('');
    setShowTable(false);
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
    if (Object.values(newValues).every(val => val !== '')) {
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

  // Add handleSessionChange function
  const handleSessionChange = (e) => {
    setSelectedSessionId(e.target.value);
    setShowTable(false);
    setSelectedValues({ A: '', B: '', C: '', D: '' });
  };

  // Helper function to get all selected values except for the current label
  const getSelectedValuesExcept = (currentLabel) => {
    return Object.entries(selectedValues)
      .filter(([label, value]) => label !== currentLabel && value !== '')
      .map(([_, value]) => value);
  };

  // Add new function for drag and drop
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = selectedValues.A.split(',').filter(Boolean);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setSelectedValues(prev => ({
      ...prev,
      A: items.join(',')
    }));
  };

  // Modify the Label A render part
  const renderLabelASelect = () => {
    const options = columns
      .filter(col => ['typeid', 'examtypeid', 'courseid'].includes(col.toLowerCase()))
      .map(col => ({ value: col, label: col }));

    // Add selected session to options if it exists
    if (selectedSessionId) {
      const selectedSession = sessions.find(s => s.sessionId === parseInt(selectedSessionId));
      if (selectedSession) {
        options.unshift({ 
          value: `${selectedSession.session}`, 
          label: ` ${selectedSession.session}` 
        });
      }
    }

    const handleCustomInput = (e) => {
      if (e.key === 'Enter' && e.target.value.trim()) {
        const newValue = e.target.value.trim();
        const currentValues = selectedValues.A ? selectedValues.A.split(',') : [];
        currentValues.push(newValue);
        handleValueChange('A', currentValues.join(','));
        e.target.value = '';
      }
    };

    return (
      <>
        <Form.Control
          type="text"
          placeholder="Type custom value and press "
          onKeyPress={handleCustomInput}
          className="mb-2"
        />
        <Select
          isMulti
          closeMenuOnSelect={false}
          value={selectedValues.A.split(',').filter(Boolean).map(val => {
            if (val.startsWith('session:')) {
              return { value: val, label: `Session: ${val.split(':')[1]}` };
            }
            return { value: val, label: val };
          })}
          options={options}
          onChange={(selected) => {
            const values = selected ? selected.map(s => s.value).join(',') : '';
            handleValueChange('A', values);
          }}
          className="mb-2"
        />
        
        {selectedValues.A && (
          <>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="droppable-list">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="border rounded p-2"
                  >
                    {selectedValues.A.split(',').filter(Boolean).map((item, index) => (
                      <Draggable
                        key={item}
                        draggableId={item}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-light p-2 mb-1 rounded"
                          >
                            {item.startsWith('session:') ? `Session: ${item.split(':')[1]}` : item}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </>
        )}
      </>
    );
  };

  // Modify the ABCD Selection Grid render part
  return (
    <Container className="py-4">
      {/* Configuration Card */}
      <h4 className="mb-2 fw-bold text-center fs-2">Group ABCD Configuration</h4>
      <Card className={`shadow-sm rounded-3 mb-4 border-0 ${customDark === "dark-dark" ? `${customDark} border` : ''}`}>
       
        <Card.Body className={`px-4 py-2 ${customDark === "dark-dark" ? customMid : ''}`}>
          <Form>
            {/* Group and Session Selectors */}
            <Row className="mb-4">
              <Col md={3}>
                <Form.Label className="fw-bold text-secondary mb-2"> Group </Form.Label>
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

              <Col md={3}>
                <Form.Label className="fw-bold text-secondary mb-2"> Session </Form.Label>
                <Form.Select
                  value={selectedSessionId}
                  onChange={handleSessionChange}
                  className="rounded-2 border-secondary-subtle"
                >
                  <option value="">Select a Session</option>
                  {sessions.map((session) => (
                    <option key={session.sessionId} value={session.sessionId}>
                      {session.session}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            </Row>

            {/* ABCD Selection Grid */}
            <Row className="g-4 mb-2">
              {['A', 'B', 'C', 'D'].map((label) => (
                <Col md={label === 'A' ? 3 : 3} key={label}>
                  
                    <Card.Body className="p-3">
                      <Form.Group>
                        <Form.Label className="fw-bold text-secondary mb-2">
                          Label {label}
                        </Form.Label>
                        {label === 'A' ? (
                          renderLabelASelect()
                        ) : (
                          <Form.Select
                            value={selectedValues[label]}
                            onChange={(e) => handleValueChange(label, e.target.value)}
                            className="rounded-2 border-secondary-subtle"
                          >
                            <option value="">Select Column</option>
                            {columns
                              .filter(col => 
                                !['typeid', 'examtypeid'].includes(col.toLowerCase()) && 
                                !getSelectedValuesExcept(label).includes(col)
                              )
                              .map((col) => (
                                <option key={col} value={col}>{col}</option>
                              ))
                            }
                          </Form.Select>
                        )}
                      </Form.Group>
                    </Card.Body>
                  
                </Col>
              ))}
            </Row>

            {/* Action Buttons */}
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
                Save
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* Configuration Summary Card */}
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

          {/* Add Pagination */}
          {filteredConfigurations.length > 0 && (
            <div className="p-3 border-top">
              {renderPagination()}
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ABCDMaster;


