import React, { useState } from "react";
import { Table, Input, Button, Space, message, Select } from "antd";
import { CheckCircleOutlined, DeleteOutlined } from "@ant-design/icons";
import API from "../../CustomHooks/MasterApiHooks/api";
import Highlighter from "react-highlight-words";

const { Option } = Select;

const MSSTable = ({
  quantitySheetData,
  fetchQuantitySheetData,
  languageOptions,
}) => {
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");

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

  const handleRemove = async (record) => {
    try {
      await API.delete(`/QuantitySheet/${record.quantitySheetId}`);
      message.success("Item removed successfully");
      await fetchQuantitySheetData();
    } catch (error) {
      console.error("Failed to remove item:", error);
      message.error("Failed to remove item");
    }
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
      ...getColumnSearchProps("catchNo"),
    },
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
      ...getColumnSearchProps("duration"),
    },
    {
      title: "Course",
      dataIndex: "courseName",
      key: "courseName",
      ...getColumnSearchProps("courseName"),
    },
    {
      title: "Subject",
      dataIndex: "subjectName",
      key: "subjectName",
      ...getColumnSearchProps("subjectName"),
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
    },
    {
      title: "Max Marks",
      dataIndex: "maxMarks",
      key: "maxMarks",
      ...getColumnSearchProps("maxMarks"),
    },
    {
      title: "NEP Code",
      dataIndex: "nepCode",
      key: "nepCode",
      ...getColumnSearchProps("nepCode"),
    },
    {
      title: "Private Code",
      dataIndex: "privateCode",
      key: "privateCode",
      ...getColumnSearchProps("privateCode"),
    },
    // {
    //   title: "MSS Status",
    //   dataIndex: "mssStatus",
    //   key: "mssStatus",
    //   filters: [
    //     { text: "Pending", value: 0 },
    //     { text: "Started", value: 1 },
    //     { text: "Completed", value: 2 },
    //   ],
    //   onFilter: (value, record) => record.mssStatus === value,
    //   render: (text) => {
    //     const statusMap = {
    //       0: "Pending",
    //       1: "Started",
    //       2: "Completed",
    //     };
    //     return statusMap[text] || "";
    //   },
    // },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            onClick={() => handleMarkReceived(record)}
            disabled={record.mssStatus === 2}
            title="Mark as Received"
          >
            <CheckCircleOutlined />
          </Button>
          {/* <Button
            type="link"
            onClick={() => handleRemove(record)}
            title="Remove"
          >
            <DeleteOutlined />
          </Button> */}
        </Space>
      ),
    },
  ];

  return (
    <Table
      responsive={true}
      // autoLayout={true}
      columns={columns}
      dataSource={quantitySheetData}
      rowKey="quantitySheetId"
      pagination={{ pageSize: 10 }}
      onChange={(pagination, filters, sorter, extra) => {
        console.log("params", pagination, filters, sorter, extra);
      }}
    />
  );
};

export default MSSTable;
