import React, { useEffect, useState } from "react";
import { Select, Spin, message, Card, Table, Tooltip, Collapse, Dropdown, Menu, Checkbox } from "antd";
import axios from "axios";
import { Button, Col, Row, Container } from "react-bootstrap";
import { DownloadOutlined, BookOutlined, CalendarOutlined, CheckCircleOutlined, DeleteOutlined, UpOutlined, DownOutlined } from "@ant-design/icons";
import API from "../../CustomHooks/MasterApiHooks/api";
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const { Option } = Select;
const { Panel } = Collapse;

const Mss = ({ projectId, processId, lotNo, projectName }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [importedData, setImportedData] = useState([]);
  const [quantitySheetData, setQuantitySheetData] = useState([]);
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [courseOptions, setCourseOptions] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [languageOptions, setLanguageOptions] = useState([]);
  const [collapseSearch, setCollapseSearch] = useState(false);
  
  // Add state for dropdown selections
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [selectedSemesters, setSelectedSemesters] = useState([]);
  const [courseDropdownVisible, setCourseDropdownVisible] = useState(false);
  const [semesterDropdownVisible, setSemesterDropdownVisible] = useState(false);
  
  // Roman numeral options
  const courseRomanOptions = ['I', 'II', 'III', 'IV', 'V'];
  const semesterRomanOptions = ['I', 'II', 'III', 'IV', 'V', 'VI'];

  useEffect(() => {
    fetchQuantitySheetData();
    fetchCourseOptions();
    fetchSubjectOptions();
    fetchLanguageOptions();
  }, [projectId]);

  const fetchResults = async (value, newPage = 1, append = false) => {
    if (!value) {
      setData([]);
      setHasMore(false);
      return;
    }

    setLoading(true);
    try {
      const response = await API.get(
        `/QPMasters/SearchInQpMaster?search=${value}&page=${newPage}&pageSize=5`
      );

      setHasMore(response.data.length > 0);
      setData((prevData) => (append ? [...prevData, ...response.data] : response.data));
      setPage(newPage);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setHasMore(true);
    fetchResults(value, 1);
  };

  const handleShowMore = () => {
    fetchResults(searchTerm, page + 1, true);
  };

  const handleImport = async (item) => {
    setImporting(item.qpMasterId);
    try {
      await API.post(`/QPMasters/InsertIntoQuantitySheet?projectId=${projectId}`, item.qpMasterId, {
        headers: { "Content-Type": "application/json" },
      });

      message.success(`Imported "${item.paperTitle}" successfully!`);

      // Update the imported data state
      setImportedData((prevData) => [...prevData, item]);

      // Fetch updated quantity sheet data after successful import
      await fetchQuantitySheetData();

    } catch (error) {
      console.error("Import failed:", error);
      message.error("Failed to import data.");
    } finally {
      setImporting(null);
    }
  };

  const fetchQuantitySheetData = async () => {
    try {
      const response = await API.get(`/QuantitySheet/byProject/${projectId}`);
      setQuantitySheetData(response.data);
      console.log("Quantity Sheet Data:", response.data);
    } catch (error) {
      console.error("Error fetching quantity sheet data:", error);
    }
  };

  const fetchCourseOptions = async () => {
    try {
      const response = await API.get('/Courses');
      setCourseOptions(response.data);
    } catch (error) {
      console.error("Error fetching course options:", error);
    }
  };

  const fetchSubjectOptions = async () => {
    try {
      const response = await API.get('/Subjects');
      setSubjectOptions(response.data);
    } catch (error) {
      console.error("Error fetching subject options:", error);
    }
  };

  const fetchLanguageOptions = async () => {
    try {
      const response = await API.get('/Languages');
      setLanguageOptions(response.data);
    } catch (error) {
      console.error("Error fetching language options:", error);
    }
  };

  // Table columns for imported data
  const columns = [
    {
      title: "Catch No",
      dataIndex: "catchNo",
      key: "catchNo",
      responsive: ['sm'],
    },
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
      responsive: ['sm'],
    },
    {
      title: "Language",
      dataIndex: "languageId",
      key: "languageId",
      responsive: ['sm'],
      render: (languageIds) => Array.isArray(languageIds) ? languageIds.join(', ') : languageIds
    },
    {
      title: "Max Marks",
      dataIndex: "maxMarks",
      key: "maxMarks",
      responsive: ['sm'],
    }
  ];

  // Add these handlers for the action buttons
  const handleMarkReceived = async (data) => {
    try {
      // Update the mssStatus to "Completed" (2)
      const updatedData = { ...data, mssStatus: 2 };

      // Call API to update the record
      await API.put(`/QuantitySheet/update/${data.quantitySheetId}`, updatedData);

      message.success("Item marked as received successfully");

      // Refresh the data
      await fetchQuantitySheetData();
    } catch (error) {
      console.error("Failed to mark as received:", error);
      message.error("Failed to mark as received");
    }
  };

  const handleRemove = async (data) => {
    try {
      // Call API to delete the record
      await API.delete(`/QuantitySheet/${data.quantitySheetId}`);

      message.success("Item removed successfully");

      // Refresh the data
      await fetchQuantitySheetData();
    } catch (error) {
      console.error("Failed to remove item:", error);
      message.error("Failed to remove item");
    }
  };

  // Custom cell renderer for action buttons
  const ActionCellRenderer = (params) => {
    return (
      <div className="d-flex gap-2 justify-content-center">
        <Button
          variant="outline-success"
          size="sm"
          onClick={() => handleMarkReceived(params.data)}
          disabled={params.data.mssStatus === 2} // Disable if already marked as received
          title="Mark as Received"
        >
          <CheckCircleOutlined />
        </Button>
        <Button
          variant="outline-danger"
          size="sm"
          onClick={() => handleRemove(params.data)}
          title="Remove"
        >
          <DeleteOutlined />
        </Button>
      </div>
    );
  };

  // Define AG Grid column definitions
  const columnDefs = [
    {
      headerName: "Catch No",
      field: "catchNo",
      editable: true,
      sortable: true,
      filter: true,
      width: 120
    },
    {
      headerName: "Duration",
      field: "duration",
      editable: true,
      sortable: true,
      filter: true,
      width: 120
    },
    {
      headerName: "A",
      field: "courseId",
      editable: true,
      sortable: true,
      filter: true,
      width: 150,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: courseOptions.map(course => course.courseId),
        valueFormatter: (params) => {
          const course = courseOptions.find(c => c.courseId === params.value);
          return course ? course.courseName : '';
        }
      },
      valueFormatter: (params) => {
        const course = courseOptions.find(c => c.courseId === params.value);
        return course ? course.courseName : '';
      }
    },
    {
      headerName: "B",
      field: "subjectId",
      editable: true,
      sortable: true,
      filter: true,
      width: 150,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: subjectOptions.map(subject => subject.subjectId),
        valueFormatter: (params) => {
          const subject = subjectOptions.find(s => s.subjectId === params.value);
          return subject ? subject.subjectName : '';
        }
      },
      valueFormatter: (params) => {
        const subject = subjectOptions.find(s => s.subjectId === params.value);
        return subject ? subject.subjectName : '';
      }
    },
    {
      headerName: "Language",
      field: "languageId",
      editable: true,
      sortable: true,
      filter: true,
      width: 150,
      valueFormatter: (params) => {
        if (!params.value) return '';
        if (Array.isArray(params.value)) {
          return params.value.map(id => {
            const language = languageOptions.find(l => l.languageId === id);
            return language ? language.languageName : id;
          }).join(', ');
        }
        return params.value;
      }
    },
    {
      headerName: "Max Marks",
      field: "maxMarks",
      editable: true,
      sortable: true,
      filter: true,
      width: 120,
      valueParser: (params) => {
        return Number(params.newValue);
      }
    },
    {
      headerName: "NEP Code",
      field: "nepCode",
      editable: true,
      sortable: true,
      filter: true,
      width: 130
    },
    {
      headerName: "Private Code",
      field: "privateCode",
      editable: true,
      sortable: true,
      filter: true,
      width: 130
    },
    {
      headerName: "MSS Status",
      field: "mssStatus",
      editable: true,
      sortable: true,
      filter: true,
      width: 120,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: [0, 1, 2, 3],
        valueFormatter: (params) => {
          const statusMap = {
            0: 'Pending',
            1: 'Started',
            2: 'Completed'
          };
          return statusMap[params.value] || '';
        }
      },
      valueFormatter: (params) => {
        const statusMap = {
          0: 'Pending',
          1: 'Started',
          2: 'Completed'
        };
        return statusMap[params.value] || '';
      }
    },
    {
      headerName: "Actions",
      field: "actions",
      sortable: false,
      filter: false,
      editable: false,
      pinned: 'right',
      width: 120,
      cellRenderer: ActionCellRenderer
    }
  ];

  // Default grid options
  const defaultColDef = {
    flex: 1,
    minWidth: 100,
    resizable: true,
  };

  // Grid ready event handler
  const onGridReady = (params) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
    params.api.sizeColumnsToFit();
  };

  // Cell value changed handler
  const onCellValueChanged = async (params) => {
    console.log("Cell value changed:", params);

    try {
      // Prepare the updated data for API
      const updatedData = params.data;

      // Call API to update the quantity sheet record
      await API.put(`/QuantitySheet/update/${updatedData.quantitySheetId}`, updatedData);

      message.success("Data updated successfully");
    } catch (error) {
      console.error("Failed to update data:", error);
      message.error("Failed to update data");

      // Refresh grid to revert to previous state if update failed
      gridApi.refreshCells();
    }
  };

  // Course dropdown menu
  const courseDropdownMenu = (
    <Menu onClick={(e) => e.domEvent.stopPropagation()}>
      <Menu.Item key="title" disabled style={{ cursor: 'default', fontWeight: 'bold' }}>
        Select Courses
      </Menu.Item>
      <Menu.Divider />
      {courseRomanOptions.map((option) => (
        <Menu.Item key={option} onClick={(e) => e.domEvent.stopPropagation()}>
          <Checkbox
            checked={selectedCourses.includes(option)}
            onChange={(e) => {
              e.stopPropagation();
              if (e.target.checked) {
                setSelectedCourses([...selectedCourses, option]);
              } else {
                setSelectedCourses(selectedCourses.filter(item => item !== option));
              }
            }}
            onClick={(e) => e.stopPropagation()}
          >
            Course {option}
          </Checkbox>
        </Menu.Item>
      ))}
      <Menu.Divider />
      <Menu.Item key="apply">
        <Button 
          variant="primary" 
          size="sm" 
          block
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // Handle apply logic for courses
            message.success(`Importing courses: ${selectedCourses.join(', ')}`);
            setSelectedCourses([]);
            setCourseDropdownVisible(false); // Close dropdown after apply
          }}
          disabled={selectedCourses.length === 0}
        >
          Apply
        </Button>
      </Menu.Item>
    </Menu>
  );

  // Semester dropdown menu
  const semesterDropdownMenu = (
    <Menu onClick={(e) => e.domEvent.stopPropagation()}>
      <Menu.Item key="title" disabled style={{ cursor: 'default', fontWeight: 'bold' }}>
        Select Semesters
      </Menu.Item>
      <Menu.Divider />
      {semesterRomanOptions.map((option) => (
        <Menu.Item key={option} onClick={(e) => e.domEvent.stopPropagation()}>
          <Checkbox
            checked={selectedSemesters.includes(option)}
            onChange={(e) => {
              e.stopPropagation();
              if (e.target.checked) {
                setSelectedSemesters([...selectedSemesters, option]);
              } else {
                setSelectedSemesters(selectedSemesters.filter(item => item !== option));
              }
            }}
            onClick={(e) => e.stopPropagation()}
          >
            Semester {option}
          </Checkbox>
        </Menu.Item>
      ))}
      <Menu.Divider />
      <Menu.Item key="apply">
        <Button 
          variant="primary" 
          size="sm" 
          block
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // Handle apply logic for semesters
            message.success(`Importing semesters: ${selectedSemesters.join(', ')}`);
            setSelectedSemesters([]);
            setSemesterDropdownVisible(false); // Close dropdown after apply
          }}
          disabled={selectedSemesters.length === 0}
        >
          Apply
        </Button>
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="mt-4">
      <Row className="w-50">
        <Col xs={12} md={12} lg={12}>
          <Collapse
            defaultActiveKey={['1']}
            expandIconPosition="right"
          >
            <Panel
              header="Search & Import QP Masters"
              key="1"
              className=""
            >
              <Card className="shadow-sm">
                <Select
                  showSearch
                  value={searchTerm}
                  placeholder="Search QP Master..."
                  onSearch={handleSearch}
                  onChange={setSearchTerm}
                  notFoundContent={loading ? <Spin size="small" /> : "No results found"}
                  style={{ width: "100%", marginBottom: "16px" }}
                  dropdownRender={(menu) => (
                    <div>
                      {menu}
                      {hasMore && data.length > 0 && (
                        <div className="text-center p-2">
                          <Button variant="outline-primary" size="sm" onClick={handleShowMore}>
                            Show More
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                >
                  {data.map((item) => (
                    <Option key={item.qpMasterId} value={item.paperTitle}>
                      <Row className="align-items-center p-2">
                        <Col xs={12} md={8}>
                          <strong>{item.paperTitle}</strong>
                          <br />
                          <small>
                            <strong>Course Name:</strong> {item.courseName} &nbsp; | &nbsp;
                            <strong>NEP Code:</strong> {item.nepCode}
                          </small>
                        </Col>
                        <Col xs={12} md={4} className="d-flex flex-row justify-content-end gap-3">
                          <Tooltip title="Import Individual">
                            <DownloadOutlined
                              style={{ fontSize: "18px", cursor: "pointer", color: importing === item.qpMasterId ? "gray" : "#1890ff" }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleImport(item);
                              }}
                              disabled={importing === item.qpMasterId}
                            />
                          </Tooltip>
                          
                          {/* Course Dropdown */}
                          <Dropdown 
                            overlay={courseDropdownMenu} 
                            trigger={['click']}
                            visible={courseDropdownVisible}
                            onVisibleChange={(visible) => setCourseDropdownVisible(visible)}
                          >
                            <div onClick={(e) => {
                              e.stopPropagation();
                              setCourseDropdownVisible(!courseDropdownVisible);
                            }}>
                              <Tooltip title="Import All by Course Name">
                                <BookOutlined
                                  style={{ fontSize: "18px", cursor: "pointer", color: "#52c41a" }}
                                />
                              </Tooltip>
                            </div>
                          </Dropdown>
                          
                          {/* Semester Dropdown */}
                          <Dropdown 
                            overlay={semesterDropdownMenu} 
                            trigger={['click']}
                            visible={semesterDropdownVisible}
                            onVisibleChange={(visible) => setSemesterDropdownVisible(visible)}
                          >
                            <div onClick={(e) => {
                              e.stopPropagation();
                              setSemesterDropdownVisible(!semesterDropdownVisible);
                            }}>
                              <Tooltip title="Import All by Semester">
                                <CalendarOutlined
                                  style={{ fontSize: "18px", cursor: "pointer", color: "#faad14" }}
                                />
                              </Tooltip>
                            </div>
                          </Dropdown>
                        </Col>
                      </Row>
                    </Option>
                  ))}
                </Select>
              </Card>
            </Panel>
          </Collapse>
        </Col>
      </Row>
      <Row className="justify-content-cente">
        <Col xs={12} md={12} lg={12}>
          {/* AG Grid for Quantity Sheet Data */}
          <Card title="Quantity Sheet Data" className="shadow-sm mt-4">
            <div
              className="ag-theme-alpine"
              style={{
                height: 400,
                width: '100%'
              }}
            >
              <AgGridReact
                rowData={quantitySheetData}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                onGridReady={onGridReady}
                onCellValueChanged={onCellValueChanged}
                pagination={true}
                paginationPageSize={10}
                rowSelection="multiple"
                enableCellTextSelection={true}
                stopEditingWhenCellsLoseFocus={true}
                suppressRowClickSelection={true}
                undoRedoCellEditing={true}
                undoRedoCellEditingLimit={20}
                suppressMovableColumns={false}
                suppressColumnVirtualisation={false}
              />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Mss;
