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
import { CloseCircleOutlined } from "@ant-design/icons";
import API from "../../CustomHooks/MasterApiHooks/api";
import MSSTable from "./MSSTable";
import PaperDetailModal from "./PaperDetailModal";
import "./mss.css";
import themeStore from "../../store/themeStore";
import { useStore } from "zustand";
import { HiRefresh } from "react-icons/hi";
import UpdateRejectedItemModal from "./Components/UpdateRejectedItemModal";
import AddPaperForm from "../QPMaster/Components/AddPaperForm";


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
  const [allQuantitySheetData, setAllQuantitySheetData] = useState([]); // Store all data for searching
  const [rejectedQuantitySheetData, setRejectedQuantitySheetData] = useState(
    []
  );
  const [languageOptions, setLanguageOptions] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [selectedGroupName, setSelectedGroupName] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [rejectedActive, setRejectedActive] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedRejectedItem, setSelectedRejectedItem] = useState(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [showAddPaperModal, setShowAddPaperModal] = useState(false);
  const [newPaperItem, setNewPaperItem] = useState(null);

  useEffect(() => {
    setSearchTerm(null);
    setTableSearchTerm("");
  }, [projectId, processId, lotNo]);

  useEffect(() => {
    if (projectId) {
      fetchQuantitySheetData();
    }
  }, [currentPage, pageSize]);


  useEffect(() => {
    fetchQuantitySheetData();
    fetchSubjectOptions();
    fetchLanguageOptions();
    fetchSelectedGroupAndSem();

    // Also fetch all data for searching
    fetchAllQuantitySheetData();
  }, [projectId, processId, lotNo]);

  const fetchSelectedGroupAndSem = async () => {
    try {
      const response = await API.get(`/Project/${projectId}`);
      setSelectedGroupId(response.data.groupId);
      setSelectedSemester(response.data.examTypeId);
    } catch (error) {
      console.error("Error fetching selected group:", error);
    }
  };

  const getGroupName = async () => {
    try {
      const response = await API.get(`/Groups/${selectedGroupId}`);
      setSelectedGroupName(response.data.groupName);
    }
    catch (error) {
      console.error("Error fetching group name:", error);
    }
  }

  const fetchResults = async (value, newPage = 1, append = false) => {
    if (!value) {
      setData([]);
      setHasMore(false);
      return;
    }

    setLoading(true);
    try {
      const response = await API.get(
        `/QPMasters/SearchInQpMaster?search=${value}&groupId=${selectedGroupId}&examTypeId=${selectedSemester}&pageSize=${newPage}`
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
      const response = await API.get("/Language");
      setLanguageOptions(response.data);
    } catch (error) {
      console.error("Error fetching language options:", error);
    }
  };
  // console.log(languageOptions);
  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  // Fetch all data for the project (used for searching)
  const fetchAllQuantitySheetData = async () => {
    try {
      // Use a large page size to get all records in one request
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
      // If in search mode, use the all data
      if (isSearchMode) {
        // If we don't have all data yet, fetch it
        if (allQuantitySheetData.length === 0) {
          const allData = await fetchAllQuantitySheetData();
          setQuantitySheetData(allData);
        } else {
          setQuantitySheetData(allQuantitySheetData);
        }
      } else {
        // Normal paginated fetch
        const response = await API.get(
          `/QuantitySheet/CatchByproject?ProjectId=${projectId}&pageSize=${pageSize}&currentpage=${currentPage}`
        );
        // console.log(response.data);
        setQuantitySheetData(response.data.data);
        setTotalRecords(response.data.totalrecords);
      }
    } catch (error) {
      console.error("Error fetching quantity sheet data:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await API.get(`/QC/ByProject?projectId=${projectId}`);
        setFilteredData(response.data);
        // console.log("Filtered Data -", response.data);
      } catch (error) {
        console.error("Failed to fetch data", error);
      }
    };
    fetchData();
  }, []);

  const filterDataByStatus = () => {
    // console.log(filteredData)
    const rejectedItems = filteredData.filter(
      (item) => item.mssStatus === 4
    );
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
      // console.log("Payload Data -", updatedItem);
      // Make an API call to update the item
      await API.put(
        `/QuantitySheet/update/${updatedItem.quantitySheetId}`,
        updatedItem
      );
      message.success("Item updated successfully");
      // Refresh the data
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
      isNewPaper: true // Flag to identify this is a new paper
    };

    // Set the new paper item and show the modal
    setNewPaperItem(dummyItem);
    setShowAddPaperModal(true);
  };

  return (
    <div className="mt-4" style={{ maxWidth: "100%", overflowX: "hidden" }}>

      <Row className="w-100 d-flex justify-content-between align-items-center">

        {/* Search bar with buttons*/}
        <Col xs={12} md={6} lg={6} className="d-flex align-items-center">
          <Collapse
            defaultActiveKey={["1"]}
            expandIconPosition="end"
            className="flex-grow-1 border-0"
          >
            <div className="w-100  mb-2 border-0">
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
                // dropdownStyle={{ maxHeight: 800, overflow: 'auto' }} 
                dropdownRender={(menu) => (
                  <div > 
                    {menu}
                    {hasMore && data.length > 0 && (
                      <div className="text-center p-1">
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
                      className="align-items-center p-1 fs-"
                      onClick={() => setSelectedItem(item)}
                      style={{ cursor: "pointer", width: "100%" }}
                    >
                      <Col xs={12} md={8}>
                        <strong>{item.paperTitle}</strong>
                        <br />
                        Course Name: {item.courseName} &nbsp;
                        | &nbsp;
                        NEP Code: {item.nepCode} &nbsp; |
                        &nbsp;
                        Semester: {item.examTypeName}
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
                onClick={() => {
                  if (rejectedCount > 0) {
                    setRejectedActive(true);

                    // If in search mode, make sure we fetch all rejected items
                    if (isSearchMode) {
                      const allRejectedItems = filteredData.filter(item => item.mssStatus === 4);
                      setRejectedQuantitySheetData(allRejectedItems);
                    }
                  }
                }}
                className="fs-2"
                style={{
                  color: "#ff4d4f",
                  cursor: rejectedCount > 0 ? "pointer" : "not-allowed",
                }}
              />
            </Badge>
          </Tooltip>

          <Tooltip title="Refresh" className="ms-2">
            <HiRefresh
              onClick={() => {
                setRejectedActive(false);
                // If in search mode, make sure we're showing the correct data
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

        {/* Pagination and Search */}
        <Col xs={12} md={6} lg={6} className="d-flex justify-content-end align-items-center gap-2">
          <Button className={`${customBtn} border-0`} size="sm" onClick={handleAddPaper}>Add Paper</Button>

          <Input.Search
            placeholder="Search within table..."
            value={tableSearchTerm}
            onChange={(e) => {
              const newSearchTerm = e.target.value;
              setTableSearchTerm(newSearchTerm);

              // If search term is not empty, enter search mode and fetch all data
              if (newSearchTerm && newSearchTerm.trim() !== '') {
                if (!isSearchMode) {
                  setIsSearchMode(true);
                  fetchAllQuantitySheetData().then(data => {
                    setQuantitySheetData(data);
                  });
                }
              } else {
                // If search term is cleared, exit search mode and fetch paginated data
                if (isSearchMode) {
                  setIsSearchMode(false);
                  fetchQuantitySheetData();
                }
              }
            }}
            style={{ width: 200, marginRight: 10 }}
          />

          <Select value={pageSize} onChange={(value) => setPageSize(value)} style={{ width: 100 }}>
            <Option value={5}>5</Option>
            <Option value={10}>10</Option>
            <Option value={20}>20</Option>
            <Option value={50}>50</Option>
            <Option value={100}>100</Option>
          </Select>

        </Col>
      </Row>



      {/* Table */}
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

        </Col>
      </Row>

      {/* Modal for existing paper */}
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

      {/* Modal for adding new paper */}
      <PaperDetailModal
        visible={showAddPaperModal}
        item={newPaperItem}
        onCancel={() => {
          setShowAddPaperModal(false);
          setNewPaperItem(null);
        }}
        importing={importing}
        cssClasses={cssClasses}
        projectId={projectId}
        fetchQuantitySheetData={fetchQuantitySheetData}
        setSearchTerm={setSearchTerm}
        isNewPaper={true}
      />
    </div>
  );
};

export default Mss;
