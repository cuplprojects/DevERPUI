import React, { useState, useEffect } from "react";
import { Table, Input, Button, Space, message, DatePicker, Select, InputNumber } from "antd";
import { Modal, Row, Col, Form as BootstrapForm } from 'react-bootstrap';
import { CheckCircleOutlined, EditOutlined } from "@ant-design/icons";
import API from "../../CustomHooks/MasterApiHooks/api";
import Highlighter from "react-highlight-words";
import themeStore from "../../store/themeStore";
import { useStore } from "zustand";
import moment from "moment";

const MSSTable = ({
  quantitySheetData,
  fetchQuantitySheetData,
  languageOptions,
  tableSearchTerm,
  currentPage,
  pageSize,
  handleTableChange,
  rejectedActive,handleUpdateItem,
}) => {
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [formData, setFormData] = useState({});

  const { getCssClasses } = useStore(themeStore);
  const [customDark] = getCssClasses();

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

    // Initialize form data with current record values
    const initialFormData = {
      catchNo: record.catchNo || '',
      nepCode: record.nepCode || '',
      paperTitle: record.paperTitle || '',
      duration: record.duration || '',
      languageId: record.languageId || [],
      paperNumber: record.paperNumber || '',
      quantity: record.quantity || 0,
      maxMarks: record.maxMarks || 0,
      uniqueCode: record.uniqueCode || '',
      examDate: record.examDate || '',
      examTime: record.examTime || '',
      structureOfPaper: record.structureOfPaper || '',
    };

    setFormData(initialFormData);
    setEditModalVisible(true);
  };

  const handleModalClose = () => {
    setEditModalVisible(false);
    setCurrentRecord(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      examDate: date ? moment(date).format('DD-MM-YYYY') : ''
    }));
  };

  const handleLanguageChange = (selectedOptions) => {
    setFormData(prev => ({
      ...prev,
      languageId: selectedOptions
    }));
  };

  const handleNumberChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      if (!currentRecord) return;

      // Create a clean payload for the API
      const payload = {
        quantitySheetId: currentRecord.quantitySheetId,
        catchNo: formData.catchNo,
        nepCode: formData.nepCode,
        paperTitle: formData.paperTitle,
        duration: formData.duration,
        languageId: formData.languageId,
        paperNumber: formData.paperNumber,
        quantity: formData.quantity,
        maxMarks: formData.maxMarks,
        uniqueCode: formData.uniqueCode,
        examTime: formData.examTime,
        structureOfPaper: formData.structureOfPaper || '',
        examDate: formData.examDate || '',
        mssStatus: currentRecord.mssStatus,
        ttfStatus: currentRecord.ttfStatus,
        projectId: currentRecord.projectId,
        courseId: currentRecord.courseId,
        subjectId: currentRecord.subjectId,
        processId: currentRecord.processId,
        lotNo: currentRecord.lotNo,
        percentageCatch: currentRecord.percentageCatch,
        qpId: currentRecord.qpId
      };

      // Call the API to update the item
      await API.put('/QuantitySheet/bulk-update', [payload]);

      message.success('Item updated successfully');
      setEditModalVisible(false);
      setCurrentRecord(null);
      await fetchQuantitySheetData();
    } catch (error) {
      console.error('Failed to update item:', error);
      message.error('Failed to update item');
    }
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
              return language ? language.languageName : id;
            })
            .join(", ");
        }
        return text;
      },
      sorter: (a, b) => {
        const aLanguages = a.languageId.map(
          (id) => languageOptions.find((l) => l.languageId === id)?.languageName
        );
        const bLanguages = b.languageId.map(
          (id) => languageOptions.find((l) => l.languageId === id)?.languageName
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
      title: "Private Code",
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
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            onClick={() => handleEditClick(record)}
          >
            <EditOutlined /> Edit
          </Button>
          {rejectedActive ? (
            <Button
              type="link"
              onClick={() => handleUpdateItem(record)}
              title="Update Item"
            >
              Update
            </Button>
          ) : (
            <Button
              type="link"
              onClick={() => handleMarkReceived(record)}
              disabled={record.mssStatus === 2}
              title="Mark as Received"
            >
              <CheckCircleOutlined />
            </Button>
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
        <Modal.Header closeButton>
          <Modal.Title>Assign Date and Time</Modal.Title>
        </Modal.Header>
        <Modal.Body>
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
        <Modal.Footer>
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
          total: filteredData.length,
          onChange: handleTableChange,
        }}
        onChange={(pagination, filters, sorter, extra) => {
          console.log("params", pagination, filters, sorter, extra);
        }}
      />

      {/* Edit Modal */}
      <Modal
        show={editModalVisible}
        onHide={handleModalClose}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Quantity Sheet</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentRecord && (
            <Row>
              <Col md={6}>
                <BootstrapForm.Group className="mb-3">
                  <BootstrapForm.Label>Catch No</BootstrapForm.Label>
                  <BootstrapForm.Control
                    type="text"
                    name="catchNo"
                    value={formData.catchNo || ''}
                    onChange={handleInputChange}
                    required
                  />
                </BootstrapForm.Group>
              </Col>
              <Col md={6}>
                <BootstrapForm.Group className="mb-3">
                  <BootstrapForm.Label>NEP Code</BootstrapForm.Label>
                  <BootstrapForm.Control
                    type="text"
                    name="nepCode"
                    value={formData.nepCode || ''}
                    onChange={handleInputChange}
                  />
                </BootstrapForm.Group>
              </Col>
              <Col md={12}>
                <BootstrapForm.Group className="mb-3">
                  <BootstrapForm.Label>Paper Title</BootstrapForm.Label>
                  <BootstrapForm.Control
                    type="text"
                    name="paperTitle"
                    value={formData.paperTitle || ''}
                    onChange={handleInputChange}
                    required
                  />
                </BootstrapForm.Group>
              </Col>
              <Col md={6}>
                <BootstrapForm.Group className="mb-3">
                  <BootstrapForm.Label>Duration</BootstrapForm.Label>
                  <BootstrapForm.Control
                    type="text"
                    name="duration"
                    value={formData.duration || ''}
                    onChange={handleInputChange}
                  />
                </BootstrapForm.Group>
              </Col>
              <Col md={6}>
                <BootstrapForm.Group className="mb-3">
                  <BootstrapForm.Label>Languages</BootstrapForm.Label>
                  <Select
                    mode="multiple"
                    style={{ width: '100%' }}
                    placeholder="Select languages"
                    value={formData.languageId}
                    onChange={handleLanguageChange}
                  >
                    {languageOptions.map(option => (
                      <Select.Option key={option.languageId} value={option.languageId}>
                        {option.languageName}
                      </Select.Option>
                    ))}
                  </Select>
                </BootstrapForm.Group>
              </Col>
              <Col md={6}>
                <BootstrapForm.Group className="mb-3">
                  <BootstrapForm.Label>Paper Number</BootstrapForm.Label>
                  <BootstrapForm.Control
                    type="text"
                    name="paperNumber"
                    value={formData.paperNumber || ''}
                    onChange={handleInputChange}
                  />
                </BootstrapForm.Group>
              </Col>
              <Col md={6}>
                <BootstrapForm.Group className="mb-3">
                  <BootstrapForm.Label>Quantity</BootstrapForm.Label>
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    value={formData.quantity}
                    onChange={(value) => handleNumberChange('quantity', value)}
                  />
                </BootstrapForm.Group>
              </Col>
              <Col md={6}>
                <BootstrapForm.Group className="mb-3">
                  <BootstrapForm.Label>Max Marks</BootstrapForm.Label>
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    value={formData.maxMarks}
                    onChange={(value) => handleNumberChange('maxMarks', value)}
                  />
                </BootstrapForm.Group>
              </Col>
              <Col md={6}>
                <BootstrapForm.Group className="mb-3">
                  <BootstrapForm.Label>Private Code</BootstrapForm.Label>
                  <BootstrapForm.Control
                    type="text"
                    name="uniqueCode"
                    value={formData.uniqueCode || ''}
                    onChange={handleInputChange}
                  />
                </BootstrapForm.Group>
              </Col>
              <Col md={6}>
                <BootstrapForm.Group className="mb-3">
                  <BootstrapForm.Label>Exam Date</BootstrapForm.Label>
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD-MM-YYYY"
                    value={formData.examDate ? moment(formData.examDate, 'DD-MM-YYYY') : null}
                    onChange={handleDateChange}
                  />
                </BootstrapForm.Group>
              </Col>
              <Col md={6}>
                <BootstrapForm.Group className="mb-3">
                  <BootstrapForm.Label>Exam Time</BootstrapForm.Label>
                  <BootstrapForm.Control
                    type="text"
                    name="examTime"
                    value={formData.examTime || ''}
                    onChange={handleInputChange}
                  />
                </BootstrapForm.Group>
              </Col>
              <Col md={12}>
                <BootstrapForm.Group className="mb-3">
                  <BootstrapForm.Label>Structure of Paper</BootstrapForm.Label>
                  <BootstrapForm.Control
                    as="textarea"
                    rows={3}
                    name="structureOfPaper"
                    value={formData.structureOfPaper || ''}
                    onChange={handleInputChange}
                  />
                </BootstrapForm.Group>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MSSTable;
