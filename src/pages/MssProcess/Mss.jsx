import React, { useEffect, useState } from "react";
import { Select, Spin, message, Card, Table, Tooltip, Collapse, Dropdown, Checkbox } from "antd";
import axios from "axios";
import { Button, Col, Row, Container } from "react-bootstrap";
import { DownloadOutlined, BookOutlined, CalendarOutlined, CheckCircleOutlined, DeleteOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import API from "../../CustomHooks/MasterApiHooks/api";
import MSSTable from "./MSSTable"; // Import the new component
import PaperDetailModal from './PaperDetailModal'; // Import the new modal component
import "./mss.css";

const { Option } = Select;
const { Panel } = Collapse;

const Mss = ({ projectId, processId, lotNo, projectName }) => {
  const [searchTerm, setSearchTerm] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [importedData, setImportedData] = useState([]);
  const [quantitySheetData, setQuantitySheetData] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [languageOptions, setLanguageOptions] = useState([]);
  const [collapseSearch, setCollapseSearch] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Simplified state for selections
  const [selectedCourses, setSelectedCourses] = useState(['Course I']);  // Default first option selected
  const [selectedSemesters, setSelectedSemesters] = useState(['Semester I']);  // Default first option selected

  // Fixed options - simplified

  useEffect(() => {
    fetchQuantitySheetData();
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
      setSelectedItem(null); // Close the modal after import
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

  const handleRejectedQCsClick = () => {
    console.log("Rejected QCs clicked");
    // You can show a modal, dropdown, or navigate to another page
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

  // Simplified dropdown content for courses
  const courseDropdownContent = (
    <div style={{ background: 'white', padding: '15px', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', width: '250px' }}>
      <h6 style={{ marginBottom: '15px' }}>Select Courses</h6>

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
      <Row className="w-100 d-flex justify-content-left align-items-center">
        <div className="d-flex align-items-center justify-content-between">
          <Col xs={12} md={12} lg={5} className="d-flex align-items-center">
            <Collapse defaultActiveKey={['1']} expandIconPosition="right" className="flex-grow-1">
              <div className="shadow-sm w-100">
                <Select
                  showSearch
                  value={searchTerm}
                  placeholder="Search QP Master..."
                  onSearch={handleSearch}
                  onChange={(value) => setSearchTerm(value || null)}
                  notFoundContent={loading ? <Spin size="small" /> : "No results found"}
                  style={{ width: "100%" }}
                  allowClear={true}
                  defaultOpen={false}
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
                      <Row
                        className="align-items-center p-2"
                        onClick={() => setSelectedItem(item)}
                        style={{ cursor: 'pointer' }}
                      >
                        <Col xs={12} md={8}>
                          <strong>{item.paperTitle}</strong>
                          <br />
                          <small>
                            <strong>Course Name:</strong> {item.courseName} &nbsp; | &nbsp;
                            <strong>NEP Code:</strong> {item.nepCode} &nbsp; | &nbsp;
                            <strong>Semester:</strong> {item.examTypeName}
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
                        </Col>
                      </Row>
                    </Option>
                  ))}
                </Select>
              </div>
            </Collapse>

            {/* Rejected QC Records Icon */}
            <Tooltip title="View Rejected QCs">
              <ExclamationCircleOutlined
                style={{ fontSize: "22px", color: "#ff4d4f", cursor: "pointer", marginLeft: "10px" }}
                onClick={handleRejectedQCsClick}
              />
            </Tooltip>
          </Col>
        </div>
      </Row>

      <Row className="justify-content-center">
        <Col xs={12} md={12} lg={12}>
          {/* AG Grid for Quantity Sheet Data */}
          <Card title="Quantity Sheet Data" className="shadow-sm mt-4">
            <MSSTable
              quantitySheetData={quantitySheetData}
              fetchQuantitySheetData={fetchQuantitySheetData}
              languageOptions={languageOptions}
            />
          </Card>
        </Col>
      </Row>

      {/* Paper Modal */}
      <PaperDetailModal
        visible={!!selectedItem}
        item={selectedItem}
        onCancel={() => setSelectedItem(null)}
        onImport={handleImport}
        importing={importing}
      />
    </div>
  );
};

export default Mss;
