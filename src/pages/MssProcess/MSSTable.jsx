import React, { useState, useEffect } from "react";
import { Table, Input, Button, Space, message, DatePicker, Tag } from "antd";
import { Modal } from 'react-bootstrap';
import { CheckCircleOutlined, EditOutlined } from "@ant-design/icons";
import API from "../../CustomHooks/MasterApiHooks/api";
import Highlighter from "react-highlight-words";
import EditQuantitySheetModal from "./EditQuantitySheetModal";
import { Tooltip } from "antd"; // Make sure this is imported


const MSSTable = ({
  quantitySheetData,
  fetchQuantitySheetData,
  languageOptions,
  tableSearchTerm,
  currentPage,
  pageSize,
  handleTableChange,
  totalRecords,
  rejectedActive,
  handleUpdateItem,
  cssClasses,
  isSearchMode,
  projectId
}) => {
  // console.log("quantitySheetData:", quantitySheetData)
  // console.log("totalRecords:", totalRecords)
  // console.log("First record structure:", quantitySheetData.length > 0 ? Object.keys(quantitySheetData[0]) : "No data")
  // console.log("First record examDate:", quantitySheetData.length > 0 ? quantitySheetData[0]?.examDate : "No data")
  const [searchText] = useState("");
  const [searchedColumn] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
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

  // Fallback: fetch StructureOfPaper from Project API when available
  const [projectStructureOfPaper, setProjectStructureOfPaper] = useState("");

  useEffect(() => {
    const fetchProjectStructure = async () => {
      try {
        if (!projectId) return;
        // Prefer direct project endpoint if available
        const response = await API.get(`/Project/${projectId}`);
        const structure = response?.data?.structureOfPaper;
        if (typeof structure === 'string') {
          setProjectStructureOfPaper(structure);
        } else {
          // Fallback: list endpoint then find
          const listRes = await API.get('/Project');
          const proj = (listRes?.data || []).find(p => p.projectId === projectId);
          if (proj && typeof proj.structureOfPaper === 'string') {
            setProjectStructureOfPaper(proj.structureOfPaper);
          }
        }
      } catch (e) {
        // Silently ignore; table will just use row value
      }
    };
    fetchProjectStructure();
  }, [projectId]);

  const handleMarkReceived = async (record) => {
    try {
      const updatedData = { ...record, mssStatus: 2 };
      await API.put(
        `/QuantitySheet/UpdateStatus?id=${record.quantitySheetId}`,
        updatedData
      );
      message.success("Item marked as received successfully");
      await fetchQuantitySheetData();
    } catch (error) {
      console.error("Failed to mark as received:", error);
      message.error("Failed to mark as received");
    }
  };

  const handleBulkUpdate = async () => {
    try {
      if (!selectedDate || !selectedTime) {
        message.error("Please select both date and time");
        return;
      }

      const updatedRows = selectedRows.map(row => {
        const { courseName, examTypes, languages, subjectName, ...rest } = row;
        return {
          ...rest,
          examDate: selectedDate.format('YYYY-MM-DD'),
          examTime: selectedTime
        };
      });

      await API.put('/QuantitySheet/bulk-update', updatedRows);

      message.success("Successfully updated selected items");
      setIsModalVisible(false);
      setSelectedRows([]);
      await fetchQuantitySheetData();
    } catch (error) {
      console.error("Failed to update items:", error);
      message.error("Failed to update items");
    }
  };

  const handleEditClick = (record) => {
    setCurrentRecord(record);
    setEditModalVisible(true);
  };

  const handleModalClose = () => {
    setEditModalVisible(false);
    setCurrentRecord(null);
  };

  // Removed unused handleRemove function

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleModalOk = () => {
    handleBulkUpdate();
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => confirm()}
          style={{ width: 188, marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => confirm()}
            icon={<CheckCircleOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters()}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <CheckCircleOutlined
        style={{ color: filtered ? "#1890ff" : undefined }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex]
          .toString()
          .toLowerCase()
          .includes(value.toLowerCase())
        : "",
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });



  const columns = [
    {
      title: "Catch No",
      dataIndex: "catchNo",
      key: "catchNo",
      width: 110,
      ellipsis: true,
      responsive: ['xs'],
      sorter: (a, b) => a.catchNo.localeCompare(b.catchNo),
      ...getColumnSearchProps("catchNo"),
      editable: true,
      render: (text) => (text ? <Tag color="blue">{text}</Tag> : ""),
    },
    {
      title: "NEP Code",
      dataIndex: "nepCode",
      key: "nepCode",
      width: 120,
      ellipsis: true,
      responsive: ['md'],
      sorter: (a, b) => a.nepCode.localeCompare(b.nepCode),
      ...getColumnSearchProps("nepCode"),
      editable: true,
      render: (text) => (text ? <Tag color="geekblue">{text}</Tag> : ""),
    },
    {
      title: "Course",
      dataIndex: "courseName",
      key: "courseName",
      width: 160,
      ellipsis: true,
      responsive: ['sm'],
      sorter: (a, b) => a.courseName.localeCompare(b.courseName),
      ...getColumnSearchProps("courseName"),
      render: (text) => (text ? <Tag color="purple">{text}</Tag> : ""),
    },
    {
      title: "Subject",
      dataIndex: "subjectName",
      key: "subjectName",
      width: 160,
      ellipsis: true,
      responsive: ['sm'],
      sorter: (a, b) => a.subjectName.localeCompare(b.subjectName),
      ...getColumnSearchProps("subjectName"),
      render: (text) => (text ? <Tag color="magenta">{text}</Tag> : ""),
    },
    {
      title: "Paper Title",
      dataIndex: "paperTitle",
      key: "paperTitle",
      width: 220,
      ellipsis: true,
      responsive: ['md'],
      sorter: (a, b) => a.paperTitle.localeCompare(b.paperTitle),
      ...getColumnSearchProps("paperTitle"),
      editable: true,
      render: (text) => {
        if (!text) return "";
        return (
          <Tooltip title={text} placement="topLeft">
            <span style={{ display: "inline-block", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {text}
            </span>
          </Tooltip>
        );
      },
    },
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
      width: 120,
      ellipsis: true,
      responsive: ['lg'],
      sorter: (a, b) => a.duration.localeCompare(b.duration),
      ...getColumnSearchProps("duration"),
      editable: true,
      render: (text) => (text ? <Tag color="gold">{text}</Tag> : ""),
    },
    {
      title: "Language",
      dataIndex: "languageId",
      key: "languageId",
      width: 200,
      ellipsis: true,
      responsive: ['lg'],
      render: (text) => {
        if (!text) return "";
        if (Array.isArray(text)) {
          const names = text
            .map((id) => {
              const language = languageOptions.find((l) => l.languageId === id);
              return language ? language.languages : id;
            })
            .filter(Boolean);
          return (
            <span>
              {names.map((name) => (
                <Tag color="green" key={name} className="mss-tag">{name}</Tag>
              ))}
            </span>
          );
        }
        return <Tag color="green">{text}</Tag>;
      },
      sorter: (a, b) => {
        const aLanguages = a.languageId.map(
          (id) => languageOptions.find((l) => l.languageId === id)?.languages
        );
        const bLanguages = b.languageId.map(
          (id) => languageOptions.find((l) => l.languageId === id)?.languages
        );
        return aLanguages.join(", ").localeCompare(bLanguages.join(", "));
      },
    },
    {
      title: "Paper#",
      dataIndex: "paperNumber", // Changed from paperNo to paperNumber to match API
      key: "paperNumber",
      width: 120,
      ellipsis: true,
      responsive: ['xs'],
      sorter: (a, b) => (a.paperNumber || '').localeCompare(b.paperNumber || ''),
      ...getColumnSearchProps("paperNumber"),
      render: (text) => (text ? <Tag color="volcano">{text}</Tag> : ""),
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      width: 120,
      ellipsis: true,
      responsive: ['xs'],
      sorter: (a, b) => a.quantity - b.quantity,
      ...getColumnSearchProps("quantity"),
      render: (value) => {
        const qty = Number(value) || 0;
        const color = qty >= 1000 ? "green" : qty >= 500 ? "gold" : "red";
        return <Tag color={color}>{qty}</Tag>;
      },
    },
    {
      title: "Max Marks",
      dataIndex: "maxMarks",
      key: "maxMarks",
      width: 120,
      ellipsis: true,
      responsive: ['lg'],
      sorter: (a, b) => a.maxMarks - b.maxMarks,
      ...getColumnSearchProps("maxMarks"),
      render: (value) => (value !== undefined && value !== null ? <Tag color="cyan">{value}</Tag> : ""),
    },
    {
      title: "Unique Code",
      dataIndex: "uniqueCode",
      key: "uniqueCode",
      width: 160,
      ellipsis: true,
      responsive: ['lg'],
      sorter: (a, b) => (a.uniqueCode || '').localeCompare(b.uniqueCode || ''),
      ...getColumnSearchProps("uniqueCode"),
      editable: true,
      render: (text) => (text ? <Tag color="lime">{text}</Tag> : ""),
    },
    {
      title: "Exam Date",
      dataIndex: "examDate",
      key: "examDate",
      width: 140,
      ellipsis: true,
      sorter: (a, b) => (a.examDate || '').localeCompare(b.examDate || ''),
      ...getColumnSearchProps("examDate"),
      render: (text) => {
        if (!text) return "";
        
        // Handle different date formats
        let displayDate = text;
        try {
          // If it's an ISO date string, format it to DD-MM-YYYY
          if (text.includes('T') || text.includes('-') && text.split('-')[0].length === 4) {
            const date = new Date(text);
            if (!isNaN(date.getTime())) {
              displayDate = date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
            }
          }
        } catch (e) {
          // If date parsing fails, use the original text
          displayDate = text;
        }
        
        return <Tag color="blue">{displayDate}</Tag>;
      },
    },
    {
      title: "Exam Time",
      dataIndex: "examTime",
      key: "examTime",
      width: 140,
      ellipsis: true,
      responsive: ['md'],
      sorter: (a, b) => (a.examTime || '').localeCompare(b.examTime || ''),
      ...getColumnSearchProps("examTime"),
      editable: true,
      render: (text) => (text ? <Tag color="geekblue">{text}</Tag> : ""),
    },


    {
      title: "Structure of Paper",
      dataIndex: "structureOfPaper",
      key: "structureOfPaper",
      width: 260,
      ellipsis: true,
      responsive: ['xl'],
      sorter: (a, b) => {
        const aVal = (a.structureOfPaper || projectStructureOfPaper || '');
        const bVal = (b.structureOfPaper || projectStructureOfPaper || '');
        return aVal.localeCompare(bVal);
      },
      ...getColumnSearchProps("structureOfPaper"),
      editable: true,
      render: (text) => {
        const value = text || projectStructureOfPaper;
        if (!value) return "";

        return (
          <Tooltip title={value} placement="topLeft">
            <div
              style={{
                maxWidth: 200,
                wordWrap: "break-word",
                whiteSpace: "normal",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {value}
            </div>
          </Tooltip>
        );
      },
    },


    {
      title: "Actions",
      key: "actions",
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space size="middle">

          {rejectedActive ? (
            <Button
              type="link"
              onClick={() => handleUpdateItem(record)}
              title="Update Item"
            >
              Update
            </Button>
          ) : (
            <>
              <Button
                type="link"
                onClick={() => handleEditClick(record)}
              >
                <EditOutlined />
              </Button>
              <Button
                type="link"
                onClick={() => handleMarkReceived(record)}
                disabled={record.mssStatus >= 2}
                title="Mark as Received"
              >
                <CheckCircleOutlined />
              </Button>
            </>
          )}
        </Space>
      ),
    }
  ];

  // Improved search function that handles all types of data
  const filteredData = tableSearchTerm
    ? quantitySheetData.filter((record) => {
        // Create a searchable string from all record values
        const searchableText = Object.entries(record)
          .map(([key, value]) => {
            // Skip non-searchable fields
            if (key === 'quantitySheetId' || key === 'projectId' || key === 'processId') {
              return '';
            }

            // Handle special case for languageId which is an array
            if (key === 'languageId' && Array.isArray(value)) {
              return value
                .map((id) => {
                  const language = languageOptions.find((l) => l.languageId === id);
                  return language ? language.languages : '';
                })
                .join(" ");
            }

            // Handle null/undefined values
            if (value === null || value === undefined) {
              return '';
            }

            // Handle objects
            if (typeof value === 'object') {
              try {
                return JSON.stringify(value);
              } catch (e) {
                return '';
              }
            }

            // Convert to string
            return String(value);
          })
          .join(" ")
          .toLowerCase();

        // Check if the search term is in the searchable text
        return searchableText.includes(tableSearchTerm.toLowerCase());
      })
    : quantitySheetData;

  const rowSelection = {
    onChange: (_, selectedRows) => {
      setSelectedRows(selectedRows);
    },
  };

  return (
    <div
      className="table-responsive"
      style={{ overflowX: "auto", width: "100%" }}
    >
      {selectedRows.length > 0 && (
        <Button
          type="primary"
          onClick={showModal}
          style={{ marginBottom: 16 }}
        >
          Assign Date & Time
        </Button>
      )}

      <Modal
        show={isModalVisible}
        onHide={handleModalCancel}
        centered
      >
        <Modal.Header closeButton className={`${customDark}`}>
          <Modal.Title className={`${customLightText}`}>Assign Date and Time</Modal.Title>
        </Modal.Header>
        <Modal.Body className={`${customLight}`}>
          <div style={{ marginBottom: 16 }}>
            <h4>Selected Catches:</h4>
            {selectedRows.map(row => (
              <div key={row.catchNo}>{row.catchNo}</div>
            ))}
          </div>
          <Space direction="vertical" size={12} style={{ width: '100%' }}>
            <DatePicker
              onChange={(date) => setSelectedDate(date)}
              style={{ width: '100%' }}
            />
            <Input
              placeholder="Enter Exam Time (HH:mm:ss)"
              onChange={(e) => setSelectedTime(e.target.value)}
              style={{ width: '100%' }}
            />
          </Space>
        </Modal.Body>
        <Modal.Footer className={`${customDark}`}>
          <Button variant="secondary" onClick={handleModalCancel}>
            Close
          </Button>
          <Button variant="primary" onClick={handleModalOk}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      <Table
        rowSelection={rowSelection}
        className={`${customDark === "default-dark" ? "thead-default" : ""}
${customDark === "red-dark" ? "thead-red" : ""}
${customDark === "green-dark" ? "thead-green" : ""}
${customDark === "blue-dark" ? "thead-blue" : ""}
${customDark === "dark-dark" ? "thead-dark" : ""}
${customDark === "pink-dark" ? "thead-pink" : ""}
${customDark === "purple-dark" ? "thead-purple" : ""}
${customDark === "light-dark" ? "thead-light" : ""}
${customDark === "brown-dark" ? "thead-brown" : ""} mss-table`}
        responsive={true}
        scroll={{ x: 'max-content' }}
        columns={columns}
        dataSource={filteredData}
        rowKey="quantitySheetId"
        bordered={true}
        size="middle"
        locale={{
          emptyText: isSearchMode || tableSearchTerm
            ? 'No results match your search.'
            : 'No data'
        }}
        sticky
        rowClassName={(record) => {
          if (record.mssStatus === 4) return 'row-rejected';
          if (record.mssStatus >= 2) return 'row-received';
          return 'row-pending';
        }}
        pagination={{
          current: isSearchMode || tableSearchTerm ? 1 : currentPage,
          pageSize: pageSize,
          total: isSearchMode || tableSearchTerm ? filteredData.length : totalRecords,
          showTotal: (total) => `Total ${total} items`,
        }}
        onChange={(pagination) => {
          // Only update pagination if we're not searching
          if (!isSearchMode && !tableSearchTerm) {
            handleTableChange(pagination);
          }
        }}
      />

      {/* Edit Modal */}
      <EditQuantitySheetModal
        show={editModalVisible}
        onHide={handleModalClose}
        record={currentRecord}
        languageOptions={languageOptions}
        onSuccess={fetchQuantitySheetData}
        cssClasses={cssClasses}
        fetchQuantitySheetData={fetchQuantitySheetData}
      />
    </div>
  );
};

export default MSSTable;