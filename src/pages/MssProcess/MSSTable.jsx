import React, { useState } from "react";
import { Table, Input, Button, Space, message, DatePicker } from "antd";
import { Modal } from 'react-bootstrap';
import { CheckCircleOutlined, EditOutlined } from "@ant-design/icons";
import API from "../../CustomHooks/MasterApiHooks/api";
import Highlighter from "react-highlight-words";
import EditQuantitySheetModal from "./EditQuantitySheetModal";


const MSSTable = ({
  quantitySheetData,
  fetchQuantitySheetData,
  languageOptions,
  tableSearchTerm,
  currentPage,
  pageSize,
  handleTableChange,
  totalRecords,
  rejectedActive, handleUpdateItem, cssClasses
}) => {
  console.log(quantitySheetData)
  console.log(totalRecords)
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
      sorter: (a, b) => a.catchNo.localeCompare(b.catchNo),
      ...getColumnSearchProps("catchNo"),
      editable: true,
    },
    {
      title: "NEP Code",
      dataIndex: "nepCode",
      key: "nepCode",
      sorter: (a, b) => a.nepCode.localeCompare(b.nepCode),
      ...getColumnSearchProps("nepCode"),
      editable: true,
    },
    {
      title: "Course",
      dataIndex: "courseName",
      key: "courseName",
      sorter: (a, b) => a.courseName.localeCompare(b.courseName),
      ...getColumnSearchProps("courseName"),

    },
    {
      title: "Subject",
      dataIndex: "subjectName",
      key: "subjectName",
      sorter: (a, b) => a.subjectName.localeCompare(b.subjectName),
      ...getColumnSearchProps("subjectName"),

    },
    {
      title: "Paper Title",
      dataIndex: "paperTitle",
      key: "paperTitle",
      sorter: (a, b) => a.paperTitle.localeCompare(b.paperTitle),
      ...getColumnSearchProps("paperTitle"),
      editable: true,
    },
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
      sorter: (a, b) => a.duration.localeCompare(b.duration),
      ...getColumnSearchProps("duration"),
      editable: true,
    },
    {
      title: "Language",
      dataIndex: "languageId",
      key: "languageId",
      render: (text) => {
        if (!text) return "";
        if (Array.isArray(text)) {
          return text
            .map((id) => {
              const language = languageOptions.find((l) => l.languageId === id);
              return language ? language.languages : id;
            })
            .join(", ");
        }
        return text;
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
      sorter: (a, b) => (a.paperNumber || '').localeCompare(b.paperNumber || ''),
      ...getColumnSearchProps("paperNumber"),

    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      sorter: (a, b) => a.quantity - b.quantity,
      ...getColumnSearchProps("quantity"),

    },
    {
      title: "Max Marks",
      dataIndex: "maxMarks",
      key: "maxMarks",
      sorter: (a, b) => a.maxMarks - b.maxMarks,
      ...getColumnSearchProps("maxMarks"),


    },
    {
      title: "Unique Code",
      dataIndex: "uniqueCode",
      key: "uniqueCode",
      sorter: (a, b) => (a.uniqueCode || '').localeCompare(b.uniqueCode || ''),
      ...getColumnSearchProps("uniqueCode"),
      editable: true,
    },
    {
      title: "Exam Date",
      dataIndex: "examDate",
      key: "examDate",
      sorter: (a, b) => (a.examDate || '').localeCompare(b.examDate || ''),
      ...getColumnSearchProps("examDate"),

    },
    {
      title: "Exam Time",
      dataIndex: "examTime",
      key: "examTime",
      sorter: (a, b) => (a.examTime || '').localeCompare(b.examTime || ''),
      ...getColumnSearchProps("examTime"),
      editable: true,
    },
    {
      title: "Structure of Paper",
      dataIndex: "structureOfPaper",
      key: "structureOfPaper",
      sorter: (a, b) => (a.structureOfPaper || '').localeCompare(b.structureOfPaper || ''),
      ...getColumnSearchProps("structureOfPaper"),
      editable: true,
    },
    {
      title: "Actions",
      key: "actions",
      fixed: 'right',
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

  const filteredData = quantitySheetData.filter((record) =>
    Object.values(record).some((value) =>
      value
        ? value.toString().toLowerCase().includes(tableSearchTerm.toLowerCase())
        : false
    )
  );

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
${customDark === "brown-dark" ? "thead-brown" : ""} `}
        responsive={true}
        columns={columns}
        dataSource={filteredData}
        rowKey="quantitySheetId"
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: totalRecords,
        }}
        onChange={(pagination, filters, sorter, extra) => {
          console.log("params", pagination, filters, sorter, extra);
          handleTableChange(pagination);
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