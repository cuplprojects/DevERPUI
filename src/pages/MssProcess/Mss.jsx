import React, { useEffect, useState, useRef } from "react";
import {
  Select,
  Spin,
  message,
  Card,
  Tooltip,
  Collapse,
  Input,
  Badge,
  Tabs,
  Table,
  Tag,
} from "antd";
import { Button, Col, Row } from "react-bootstrap";
import { CloseCircleOutlined, SearchOutlined, EditOutlined, DatabaseOutlined, PlusOutlined } from "@ant-design/icons";
import API from "../../CustomHooks/MasterApiHooks/api";
import MSSTable from "./MSSTable";
import "./mss.css";
import themeStore from "../../store/themeStore";
import { useStore } from "zustand";
import { HiRefresh } from "react-icons/hi";
import UpdateRejectedItemModal from "./Components/UpdateRejectedItemModal";
import PaperDetailForm from "./PaperDetailForm";

const { Option } = Select;
const { TabPane } = Tabs;

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

  // Search QP Master states
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Saved data (Quantity Sheet) states
  const [quantitySheetData, setQuantitySheetData] = useState([]);
  const [allQuantitySheetData, setAllQuantitySheetData] = useState([]); // Store all data for searching
  const [rejectedQuantitySheetData, setRejectedQuantitySheetData] = useState([]);
  const [languageOptions, setLanguageOptions] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [rejectedActive, setRejectedActive] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedRejectedItem, setSelectedRejectedItem] = useState(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [savedSearchTerm, setSavedSearchTerm] = useState("");

  // Group/Semester states used by QP search API
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(1);
  const searchDebounceRef = useRef(null);

  // Tabs and Edit Import states
  const [activeTab, setActiveTab] = useState("search");
  const [editItem, setEditItem] = useState(null); // item selected to edit/import
  const [editIsNew, setEditIsNew] = useState(false);

  useEffect(() => {
    setSearchTerm("");
  }, [projectId, processId, lotNo]);

  useEffect(() => {
    if (projectId) {
      fetchQuantitySheetData();
    }
  }, [currentPage, pageSize]);

  useEffect(() => {
    fetchQuantitySheetData();
    fetchLanguageOptions();
    fetchSelectedGroupAndSem();

    // Also fetch all data for searching in saved data tab
    fetchAllQuantitySheetData();
  }, [projectId, processId, lotNo]);

  const fetchSelectedGroupAndSem = async () => {
    try {
      const response = await API.get(`/Project/${projectId}`);
      setSelectedGroupId(response.data.groupId);
      setSelectedSemester(response.data.examTypeId);
      return response.data; // return so callers can use values immediately
    } catch (error) {
      console.error("Error fetching selected group:", error);
      return null;
    }
  };

  const fetchResults = async (value, newPage = 1, append = false, groupIdOverride = null, semesterOverride = null) => {
    if (!value) {
      setData([]);
      setHasMore(false);
      return;
    }

    setLoading(true);
    try {
      const gid = groupIdOverride ?? selectedGroupId;
      const sem = semesterOverride ?? selectedSemester;
      const response = await API.get(
        `/QPMasters/SearchInQpMaster?search=${encodeURIComponent(value)}&groupId=${gid ?? 0}&examTypeId=${sem ?? 0}&pageSize=${newPage}`
      );

      const items = Array.isArray(response.data) ? response.data : (response.data?.data ?? []);
      setHasMore(items.length > 0);
      setData((prevData) => (append ? [...prevData, ...items] : items));
      setPage(newPage);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (value) => {
    const trimmed = (value || '').trim();
    setSearchTerm(value);
    if (!trimmed) {
      setData([]);
      setHasMore(false);
      return;
    }
    setHasMore(true);
    // Ensure group/semester loaded before searching
    if (!selectedGroupId || !selectedSemester) {
      const proj = await fetchSelectedGroupAndSem();
      const gid = proj?.groupId ?? selectedGroupId ?? 0;
      const sem = proj?.examTypeId ?? selectedSemester ?? 0;
      await fetchResults(trimmed, 1, false, gid, sem);
      return;
    }
    await fetchResults(trimmed, 1);
  };

  const handleShowMore = () => {
    fetchResults(searchTerm, page + 1, true);
  };

  const fetchLanguageOptions = async () => {
    try {
      const response = await API.get("/Language");
      setLanguageOptions(response.data);
    } catch (error) {
      console.error("Error fetching language options:", error);
    }
  };

  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  // Fetch all data for the project (used for searching)
  const fetchAllQuantitySheetData = async () => {
    try {
      const response = await API.get(
        `/QuantitySheet/CatchByproject?ProjectId=${projectId}&pageSize=1000&currentpage=1`
      );
      setAllQuantitySheetData(response.data.data);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching all quantity sheet data:", error);
      return [];
    }
  };

  // Fetch paginated data (used for normal display)
  const fetchQuantitySheetData = async () => {
    try {
      if (isSearchMode) {
        if (allQuantitySheetData.length === 0) {
          const allData = await fetchAllQuantitySheetData();
          setQuantitySheetData(allData);
        } else {
          setQuantitySheetData(allQuantitySheetData);
        }
      } else {
        const response = await API.get(
          `/QuantitySheet/CatchByproject?ProjectId=${projectId}&pageSize=${pageSize}&currentpage=${currentPage}`
        );
        setQuantitySheetData(response.data.data);
        setTotalRecords(response.data.totalrecords);
      }
    } catch (error) {
      console.error("Error fetching quantity sheet data:", error);
    }
  };

  // QC filter data to compute rejected
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await API.get(`/QC/ByProject?projectId=${projectId}`);
        setFilteredData(response.data);
      } catch (error) {
        console.error("Failed to fetch data", error);
      }
    };
    fetchData();
  }, []);

  const filterDataByStatus = () => {
    const rejectedItems = filteredData.filter((item) => item.mssStatus === 4);
    const rejectedIds = rejectedItems.map((item) => item.quantitysheetId);
    const matchedData = quantitySheetData.filter((item) =>
      rejectedIds.includes(item.quantitySheetId)
    );
    setRejectedQuantitySheetData(matchedData);
    setRejectedCount(matchedData.length);
  };

  useEffect(() => {
    if (filteredData.length && quantitySheetData.length) {
      filterDataByStatus();
    }
  }, [filteredData, quantitySheetData]);

  const handleUpdateItem = (item) => {
    setSelectedRejectedItem({ item, filteredData });
    setShowUpdateModal(true);
  };

  const handleCloseUpdateModal = () => {
    setShowUpdateModal(false);
    setSelectedRejectedItem(null);
  };

  const handleUpdateSubmit = async (updatedItem) => {
    try {
      await API.put(`/QuantitySheet/update/${updatedItem.quantitySheetId}`, updatedItem);
      message.success("Item updated successfully");
      fetchQuantitySheetData();
    } catch (error) {
      console.error("Failed to update item:", error);
      message.error("Failed to update item");
    }
  };

  const handleAddPaper = () => {
    // Create a dummy item for the new paper
    const dummyItem = {
      qpMasterId: 0,
      paperTitle: "",
      paperNumber: "",
      courseName: "",
      subjectId: 0,
      examTypeName: "",
      nepCode: "",
      uniqueCode: "",
      quantity: 0,
      languageIds: [],
      isNewPaper: true,
    };
    setEditItem(dummyItem);
    setEditIsNew(true);
    setActiveTab("edit");
  };

  const handleImportFromSearch = (record) => {
    setEditItem(record);
    setEditIsNew(false);
    setActiveTab("edit");
  };

  const handleImported = () => {
    setActiveTab("saved");
    // refresh saved data
    fetchQuantitySheetData();
    // clear edit state
    setEditItem(null);
    setEditIsNew(false);
  };

  // QP Master results table columns
  const qpColumns = [
    {
      title: "Paper Title",
      dataIndex: "paperTitle",
      key: "paperTitle",
      ellipsis: true,
      render: (text) => {
        if (!text) return "";
        return (
          <Tooltip title={text} placement="topLeft">
            <Tag color="purple" className="mss-tag">
              <span style={{ display: "inline-block", maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {text}
              </span>
            </Tag>
          </Tooltip>
        );
      },
    },
    {
      title: "Course",
      dataIndex: "courseName",
      key: "courseName",
      ellipsis: true,
      render: (text) => (text ? <Tag color="magenta" className="mss-tag">{text}</Tag> : ""),
    },
    {
      title: "NEP Code",
      dataIndex: "nepCode",
      key: "nepCode",
      render: (text) => (text ? <Tag color="geekblue" className="mss-tag">{text}</Tag> : ""),
    },
    {
      title: "Semester",
      dataIndex: "examTypeName",
      key: "examTypeName",
      render: (text) => (text ? <Tag color="green" className="mss-tag">{text}</Tag> : ""),
    },
    {
      title: "Action",
      key: "action",
      fixed: "right",
      render: (_, record) => (
        <Button
          size="sm"
          className={`${customBtn} border-0`}
          onClick={() => handleImportFromSearch(record)}
        >
          Edit & Import
        </Button>
      ),
    },
  ];

  return (
    <div className="mt-1" style={{ maxWidth: "100%", overflowX: "hidden" }}>


      <Tabs className="mss-tabs" activeKey={activeTab} onChange={setActiveTab}>
        {/* Tab 1: Search Question Paper */}
        <TabPane tab={<span><SearchOutlined style={{ marginRight: 6 }} /> Search Question Paper</span>} key="search">
          <Row className="w-100 d-flex align-items-center mt-2 mb-3">
            <Col xs={12} md={8} lg={5} className="d-flex align-items-center gap-2">
              <Input.Search
                placeholder="Search QP Master..."
                value={searchTerm}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchTerm(val);
                  // Debounce live search
                  if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
                  searchDebounceRef.current = setTimeout(() => handleSearch(val), 400);
                }}
                onSearch={handleSearch}
                enterButton
                allowClear
              />
              <Button className={`${customBtn} border-0 text-nowrap d-inline-flex align-items-center`} size="sm" onClick={handleAddPaper}>
                <PlusOutlined style={{ marginRight: 6 }} /> Add Paper
              </Button>
            </Col>
            {searchTerm && (
              <Col xs={12} md={4} lg={2} className="mt-2 mt-md-0 d-flex justify-content-end">
                <Tooltip title="Load more results">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={handleShowMore}
                    disabled={!hasMore || loading}
                  >
                    Show More
                  </Button>
                </Tooltip>
              </Col>
            )}
          </Row>

          {data && data.length > 0 && (
            <Table
              rowKey={(r) => r.qpMasterId || r.paperTitle}
              dataSource={data}
              columns={qpColumns}
              loading={loading}
              pagination={false}
              scroll={{ x: true }}
              className={`${customDark === "default-dark" ? "thead-default" : ""}
${customDark === "red-dark" ? "thead-red" : ""}
${customDark === "green-dark" ? "thead-green" : ""}
${customDark === "blue-dark" ? "thead-blue" : ""}
${customDark === "dark-dark" ? "thead-dark" : ""}
${customDark === "pink-dark" ? "thead-pink" : ""}
${customDark === "purple-dark" ? "thead-purple" : ""}
${customDark === "light-dark" ? "thead-light" : ""}
${customDark === "brown-dark" ? "thead-brown" : ""} mss-table`}
              bordered
              size="middle"
              sticky
            />
          )}
        </TabPane>

        {/* Tab 2: Edit / Add New (dynamic title) */}
        <TabPane
          tab={
            <span>
              {editIsNew ? (
                <>
                  <PlusOutlined style={{ marginRight: 6 }} /> Add new 
                </>
              ) : (
                <>
                  <EditOutlined style={{ marginRight: 6 }} /> Edit 
                </>
              )}
            </span>
          }
          key="edit"
        >
          <div className="mss-tab-content-gap">
            {editItem ? (
              <PaperDetailForm
                item={editItem}
                cssClasses={cssClasses}
                projectId={projectId}
                onCancel={() => {
                  setEditItem(null);
                  setActiveTab("search");
                }}
                onImported={handleImported}
                isNewPaper={editIsNew}
              />
            ) : (
              <div className="p-3">{editIsNew ? "Fill the form to add a new paper." : "Select a paper from the Search tab to edit/import."}</div>
            )}
          </div>
        </TabPane>

        {/* Tab 3: Saved Data */}
        <TabPane
          tab={
            <span>
              <DatabaseOutlined style={{ marginRight: 6 }} />
              Saved Data
              {rejectedCount > 0 && (
                <Badge
                  count={rejectedCount}
                  size="small"
                  style={{ backgroundColor: "#ff4d4f", marginLeft: 8 }}
                />
              )}
            </span>
          }
          key="saved"
        >
          <Row className="w-100 d-flex justify-content-between align-items-center mb-3 mt-2">
           

            <Col xs={12} md={6} lg={5} className="d-flex justify-content-end align-items-center gap-2">
              <Input.Search
                placeholder="Search within saved data (all columns)"
                value={savedSearchTerm}
                onChange={(e) => {
                  const newSearchTerm = e.target.value;
                  setSavedSearchTerm(newSearchTerm);
                  // Switch to search mode for saved data
                  if (newSearchTerm && newSearchTerm.trim() !== "") {
                    if (!isSearchMode) {
                      setIsSearchMode(true);
                      fetchAllQuantitySheetData().then((d) => setQuantitySheetData(d));
                    }
                  } else {
                    if (isSearchMode) {
                      setIsSearchMode(false);
                      setSavedSearchTerm("");
                      fetchQuantitySheetData();
                    }
                  }
                }}
                onSearch={(val) => {
                  const trimmed = (val || '').trim();
                  setSavedSearchTerm(trimmed);
                  if (trimmed) {
                    if (!isSearchMode) {
                      setIsSearchMode(true);
                      fetchAllQuantitySheetData().then((d) => setQuantitySheetData(d));
                    }
                  } else {
                    if (isSearchMode) {
                      setIsSearchMode(false);
                      fetchQuantitySheetData();
                    }
                  }
                }}
                enterButton
                allowClear
                style={{ width: 320, marginRight: 10 }}
              />

              <Select value={pageSize} onChange={(value) => setPageSize(value)} style={{ width: 100 }}>
                <Option value={5}>5</Option>
                <Option value={10}>10</Option>
                <Option value={20}>20</Option>
                <Option value={50}>50</Option>
                <Option value={100}>100</Option>
              </Select>
            </Col>
            <Col xs={12} md={6} lg={6} className="d-flex align-items-center">
              <Tooltip title="Rejected Items" className="me-2">
                <Badge color="#ff4d4f" count={rejectedCount}>
                  <CloseCircleOutlined
                    onClick={() => {
                      if (rejectedCount > 0) {
                        setRejectedActive(true);
                        if (isSearchMode) {
                          const allRejectedItems = filteredData.filter((item) => item.mssStatus === 4);
                          setRejectedQuantitySheetData(allRejectedItems);
                        }
                      }
                    }}
                    className="fs-2"
                    style={{ color: "#ff4d4f", cursor: rejectedCount > 0 ? "pointer" : "not-allowed" }}
                  />
                </Badge>
              </Tooltip>

              <Tooltip title="Refresh" className="ms-2">
                <HiRefresh
                  onClick={() => {
                    setRejectedActive(false);
                    if (isSearchMode) {
                      fetchAllQuantitySheetData();
                    } else {
                      fetchQuantitySheetData();
                    }
                  }}
                  className="fs-2"
                  color="blue"
                />
              </Tooltip>
            </Col>
          </Row>

          <MSSTable
            quantitySheetData={rejectedActive ? rejectedQuantitySheetData : quantitySheetData}
            fetchQuantitySheetData={fetchQuantitySheetData}
            languageOptions={languageOptions}
            tableSearchTerm={savedSearchTerm}
            currentPage={currentPage}
            pageSize={pageSize}
            handleTableChange={handleTableChange}
            rejectedActive={rejectedActive}
            handleUpdateItem={handleUpdateItem}
            cssClasses={cssClasses}
            totalRecords={totalRecords}
            projectId={projectId}
            isSearchMode={isSearchMode}
          />

          <UpdateRejectedItemModal
            cssClasses={cssClasses}
            languageOptions={languageOptions}
            show={showUpdateModal}
            handleClose={handleCloseUpdateModal}
            data={selectedRejectedItem}
            onUpdate={handleUpdateSubmit}
            projectId={projectId}
          />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Mss;