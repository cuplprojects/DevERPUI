import React, { useEffect, useState } from "react";
import {
  Select,
  Spin,
  message,
  Card,
  Tooltip,
  Collapse,
  Input,
  Badge,
} from "antd";
import { Button, Col, Row } from "react-bootstrap";
import {
  CloseCircleOutlined,
  DownloadOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import API from "../../CustomHooks/MasterApiHooks/api";
import MSSTable from "./MSSTable";
import PaperDetailModal from "./PaperDetailModal";
import "./mss.css";
import themeStore from "../../store/themeStore";
import { useStore } from "zustand";
import { HiRefresh } from "react-icons/hi";
import UpdateRejectedItemModal from "./Components/UpdateRejectedItemModal";

const { Option } = Select;

const Mss = ({ projectId, processId, lotNo, projectName }) => {
  const { getCssClasses } = useStore(themeStore);
  const cssClasses = getCssClasses();
  const [
    customDark,
    customMid,
    customLight,
    customBtn,
    customDarkText,
    customLightText,
    customLightBorder,
    customDarkBorder,
  ] = cssClasses;
  const [searchTerm, setSearchTerm] = useState(null);
  const [tableSearchTerm, setTableSearchTerm] = useState("");
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [quantitySheetData, setQuantitySheetData] = useState([]);
  const [rejectedQuantitySheetData, setRejectedQuantitySheetData] = useState(
    []
  );
  const [languageOptions, setLanguageOptions] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [rejectedActive, setRejectedActive] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedRejectedItem, setSelectedRejectedItem] = useState(null);

  useEffect(() => {
    setSearchTerm(null);
    setTableSearchTerm("");
  }, [projectId, processId, lotNo]);

  useEffect(() => {
    fetchQuantitySheetData();
    fetchSubjectOptions();
    fetchLanguageOptions();
    fetchSelectedGroupAndSem();
  }, [projectId, processId, lotNo]);

  const fetchSelectedGroupAndSem = async () => {
    try {
      const response = await API.get(`/Project/${projectId}`);
      setSelectedGroup(response.data.groupId);
      setSelectedSemester(response.data.examTypeId);
    } catch (error) {
      console.error("Error fetching selected group:", error);
    }
  };

  const fetchResults = async (value, newPage = 1, append = false) => {
    if (!value) {
      setData([]);
      setHasMore(false);
      return;
    }

    setLoading(true);
    try {
      const response = await API.get(
        `/QPMasters/SearchInQpMaster?search=${value}&groupId=${selectedGroup}&examTypeId=${selectedSemester}&pageSize=${newPage}`
      );

      setHasMore(response.data.length > 0);
      setData((prevData) =>
        append ? [...prevData, ...response.data] : response.data
      );
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

  const fetchSubjectOptions = async () => {
    try {
      const response = await API.get("/Subject");
      setSubjectOptions(response.data);
    } catch (error) {
      console.error("Error fetching subject options:", error);
    }
  };

  const fetchLanguageOptions = async () => {
    try {
      const response = await API.get("/Languages");
      setLanguageOptions(response.data);
    } catch (error) {
      console.error("Error fetching language options:", error);
    }
  };

  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  const fetchQuantitySheetData = async () => {
    try {
      const response = await API.get(
        `/QuantitySheet/CatchByproject?ProjectId=${projectId}`
      );
      setQuantitySheetData(response.data);
      console.log("Quantity Sheet Data -", response.data);
    } catch (error) {
      console.error("Error fetching quantity sheet data:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await API.get(`/QC/ByProject?projectId=${projectId}`);
        setFilteredData(response.data);
        console.log("Filtered Data -", response.data);
      } catch (error) {
        console.error("Failed to fetch data", error);
      }
    };
    fetchData();
  }, []);

  const filterDataByStatus = () => {
    const rejectedItems = filteredData.filter(
      (item) => item.verified?.status === false
    );
    const rejectedIds = rejectedItems.map((item) => item.quantitysheetId);
    const matchedData = quantitySheetData.filter((item) =>
      rejectedIds.includes(item.quantitySheetId)
    );
    setRejectedQuantitySheetData(matchedData);
    setRejectedCount(matchedData.length);
    console.log("Rejected QuantitySheet IDs:", rejectedIds);
    console.log("Final Filtered Quantity Sheet Data:", matchedData);
  };

  useEffect(() => {
    if (filteredData.length && quantitySheetData.length) {
      filterDataByStatus();
    }
  }, [filteredData, quantitySheetData]);

  const handleUpdateItem = (item) => {
    setSelectedRejectedItem(item);
    setShowUpdateModal(true);
  };
  
  const handleCloseUpdateModal = () => {
    setShowUpdateModal(false);
    setSelectedRejectedItem(null);
  };
  
  const handleUpdateSubmit = (updatedItem) => {
    // Handle update logic here
    console.log("Updated Item:", updatedItem);
  };

  return (
    <div className="mt-4" style={{ maxWidth: "100%", overflowX: "hidden" }}>
      <Row className="w-100 d-flex justify-content-between align-items-center">
        <Col xs={12} md={6} lg={6} className="d-flex align-items-center">
          <Collapse
            defaultActiveKey={["1"]}
            expandIconPosition="right"
            className="flex-grow-1 border-0"
          >
            <div className="w-100 mb-2 border-0">
              <Select
                showSearch
                value={searchTerm}
                placeholder="Search QP Master..."
                onSearch={handleSearch}
                onChange={(value) => setSearchTerm(value || null)}
                notFoundContent={
                  loading ? <Spin size="small" /> : "No results found"
                }
                style={{ width: "100%" }}
                allowClear={true}
                defaultOpen={false}
                dropdownRender={(menu) => (
                  <div>
                    {menu}
                    {hasMore && data.length > 0 && (
                      <div className="text-center p-2">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={handleShowMore}
                        >
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
                      style={{ cursor: "pointer" }}
                    >
                      <Col xs={12} md={8}>
                        <strong>{item.paperTitle}</strong>
                        <br />
                        <small>
                          <strong>Course Name:</strong> {item.courseName} &nbsp;
                          | &nbsp;
                          <strong>NEP Code:</strong> {item.nepCode} &nbsp; |
                          &nbsp;
                          <strong>Semester:</strong> {item.examTypeName}
                        </small>
                      </Col>
                    </Row>
                  </Option>
                ))}
              </Select>
            </div>
          </Collapse>
          <Tooltip title="Rejected Items" className="ms-2">
            <Badge color="#ff4d4f" count={rejectedCount}>
              <CloseCircleOutlined
                onClick={() => setRejectedActive(true)}
                className="fs-3"
                style={{ color: "#ff4d4f" }}
              />
            </Badge>
          </Tooltip>
          <Tooltip title="Refresh" className="ms-2">
            <HiRefresh
              onClick={() => setRejectedActive(false)}
              className="fs-3"
              color="blue"
            />
          </Tooltip>
        </Col>
        <Col
          xs={12}
          md={6}
          lg={6}
          className="d-flex justify-content-end align-items-center"
        >
          <Input.Search
            placeholder="Search within table..."
            value={tableSearchTerm}
            onChange={(e) => setTableSearchTerm(e.target.value)}
            style={{ width: 200, marginRight: 10 }}
          />
          <Select
            value={pageSize}
            onChange={(value) => setPageSize(value)}
            style={{ width: 100 }}
          >
            <Option value={5}>5</Option>
            <Option value={10}>10</Option>
            <Option value={20}>20</Option>
            <Option value={50}>50</Option>
            <Option value={100}>100</Option>
          </Select>
        </Col>
      </Row>

      <Row className="justify-content-center">
        <Col xs={12} md={12} lg={12} className="">
          <MSSTable
            quantitySheetData={
              rejectedActive ? rejectedQuantitySheetData : quantitySheetData
            }
            fetchQuantitySheetData={fetchQuantitySheetData}
            languageOptions={languageOptions}
            tableSearchTerm={tableSearchTerm}
            currentPage={currentPage}
            pageSize={pageSize}
            handleTableChange={handleTableChange}
            rejectedActive={rejectedActive}
            handleUpdateItem={handleUpdateItem}
          />
          <UpdateRejectedItemModal
            show={showUpdateModal}
            handleClose={handleCloseUpdateModal}
            item={selectedRejectedItem}
            onUpdate={handleUpdateSubmit}
          />
        </Col>
      </Row>

      <PaperDetailModal
        visible={!!selectedItem}
        item={selectedItem}
        onCancel={() => {
          setSelectedItem(null);
          setSearchTerm(null);
        }}
        importing={importing}
        cssClasses={cssClasses}
        projectId={projectId}
        fetchQuantitySheetData={fetchQuantitySheetData}
        setSearchTerm={setSearchTerm}
      />
    </div>
  );
};

export default Mss;
