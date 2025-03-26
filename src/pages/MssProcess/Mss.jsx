import React, { useEffect, useState } from "react";
import { Select, Spin, message, Card, Table, Tooltip } from "antd";
import axios from "axios";
import { Button, Col, Row, Container } from "react-bootstrap";
import { DownloadOutlined, BookOutlined, CalendarOutlined } from "@ant-design/icons";
import API from "../../CustomHooks/MasterApiHooks/api";

const { Option } = Select;

const Mss = ({projectId , processId , lotNo , projectName}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [importedData, setImportedData] = useState([]); // State for imported data
  const [quantitySheetData,setQuantitySheetData] = useState([]);
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


  // Table columns for imported data
  const columns = [
    {
      title: "Paper Title",
      dataIndex: "paperTitle",
      key: "paperTitle",
    },
    {
      title: "Course Name",
      dataIndex: "courseName",
      key: "courseName",
    },
    {
      title: "NEP Code",
      dataIndex: "nepCode",
      key: "nepCode",
    },
  ];

  return (
    <Container fluid className="mt-4">
      <Row className="justify-content-center">
        <Col xs={12} md={10} lg={8}>
          <Card title="Search & Import QP Masters" className="shadow-sm">
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
                          onClick={() => handleImport(item)}
                          disabled={importing === item.qpMasterId}
                        />
                      </Tooltip>
                      <Tooltip title="Import All by Course Name">
                        <BookOutlined
                          style={{ fontSize: "18px", cursor: "pointer", color: "#52c41a" }}
                        />
                      </Tooltip>
                      <Tooltip title="Import All by Semester">
                        <CalendarOutlined
                          style={{ fontSize: "18px", cursor: "pointer", color: "#faad14" }}
                        />
                      </Tooltip>
                    </Col>
                  </Row>
                </Option>
              ))}
            </Select>
          </Card>

          {/* Imported Data Table */}
          {/* {importedData && ( */}
            <Card title="Imported Data" className="shadow-sm mt-4">
              <Table
                dataSource={importedData}
                columns={columns}
                rowKey="qpMasterId"
                pagination={false}
              />
            </Card>
          {/* )} */}
        </Col>
      </Row>
    </Container>
  );
};

export default Mss;
