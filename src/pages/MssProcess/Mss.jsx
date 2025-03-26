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
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [languageOptions, setLanguageOptions] = useState([]);
  const [collapseSearch, setCollapseSearch] = useState(false);
  
  // Simplified state for selections
  const [selectedCourses, setSelectedCourses] = useState(['Course I']);  // Default first option selected
  const [selectedSemesters, setSelectedSemesters] = useState(['Semester I']);  // Default first option selected
  
  // Fixed options - simplified
  const courseOptions = [
    { label: 'Course I', value: 'Course I' },
    { label: 'Course II', value: 'Course II' },
    { label: 'Course III', value: 'Course III' },
    { label: 'Course IV', value: 'Course IV' }
  ];
  
  const semesterOptions = [
    { label: 'Semester I', value: 'Semester I' },
    { label: 'Semester II', value: 'Semester II' },
    { label: 'Semester III', value: 'Semester III' },
    { label: 'Semester IV', value: 'Semester IV' }
  ];

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
        values: courseOptions.map(course => course.value),
        valueFormatter: (params) => {
          const course = courseOptions.find(c => c.value === params.value);
          return course ? course.label : '';
        }
      },
      valueFormatter: (params) => {
        const course = courseOptions.find(c => c.value === params.value);
        return course ? course.label : '';
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
        values: subjectOptions.map(subject => subject.value),
        valueFormatter: (params) => {
          const subject = subjectOptions.find(s => s.value === params.value);
          return subject ? subject.label : '';
        }
      },
      valueFormatter: (params) => {
        const subject = subjectOptions.find(s => s.value === params.value);
        return subject ? subject.label : '';
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

  // Simplified dropdown content for courses
  const courseDropdownContent = (
    <div style={{ background: 'white', padding: '15px', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', width: '250px' }}>
      <h6 style={{ marginBottom: '15px' }}>Select Courses</h6>
      {courseOptions.map(course => (
        <div key={course.value} style={{ marginBottom: '10px' }}>
          <Checkbox
            checked={selectedCourses.includes(course.value)}
            onChange={e => {
              if (e.target.checked) {
                setSelectedCourses([...selectedCourses, course.value]);
              } else {
                setSelectedCourses(selectedCourses.filter(item => item !== course.value));
              }
            }}
          >
            {course.label}
          </Checkbox>
        </div>
      ))}
      <Button
        type="primary"
        style={{ width: '100%', marginTop: '15px' }}
        onClick={() => {
          console.log('Selected courses:', selectedCourses);
          message.success(`Selected courses: ${selectedCourses.join(', ')}`);
        }}
      >
        Apply
      </Button>
    </div>
  );
  
  // Simplified dropdown content for semesters
  const semesterDropdownContent = (
    <div style={{ background: 'white', padding: '15px', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', width: '250px' }}>
      <h6 style={{ marginBottom: '15px' }}>Select Semesters</h6>
      {semesterOptions.map(semester => (
        <div key={semester.value} style={{ marginBottom: '10px' }}>
          <Checkbox
            checked={selectedSemesters.includes(semester.value)}
            onChange={e => {
              if (e.target.checked) {
                setSelectedSemesters([...selectedSemesters, semester.value]);
              } else {
                setSelectedSemesters(selectedSemesters.filter(item => item !== semester.value));
              }
            }}
          >
            {semester.label}
          </Checkbox>
        </div>
      ))}
      <Button
        type="primary"
        style={{ width: '100%', marginTop: '15px' }}
        onClick={() => {
          console.log('Selected semesters:', selectedSemesters);
          message.success(`Selected semesters: ${selectedSemesters.join(', ')}`);
        }}
      >
        Apply
      </Button>
    </div>
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
                      <Tooltip title="Import All by Course Name">
                            <Dropdown
                              overlay={courseDropdownContent}
                              trigger={['click']}
                              placement="bottomRight"
                            >
                        <BookOutlined
                          style={{ fontSize: "18px", cursor: "pointer", color: "#52c41a" }}
                                onClick={(e) => e.stopPropagation()}
                        />
                            </Dropdown>
                      </Tooltip>
                          
                          {/* Semester Dropdown */}
                      <Tooltip title="Import All by Semester">
                            <Dropdown
                              overlay={semesterDropdownContent}
                              trigger={['click']}
                              placement="bottomRight"
                            >
                        <CalendarOutlined
                          style={{ fontSize: "18px", cursor: "pointer", color: "#faad14" }}
                                onClick={(e) => e.stopPropagation()}
                        />
                            </Dropdown>
                      </Tooltip>
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
