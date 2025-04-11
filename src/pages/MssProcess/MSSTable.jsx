import React, { useState, useEffect, useRef } from "react";
import { Input, Button, Space, message, Select, Pagination } from "antd";
import { CheckCircleOutlined, DeleteOutlined } from "@ant-design/icons";
import API from "../../CustomHooks/MasterApiHooks/api";
import Highlighter from "react-highlight-words";
import themeStore from "../../store/themeStore";
import { useStore } from "zustand";
import { HotTable } from '@handsontable/react';
import 'handsontable/dist/handsontable.full.css';
import { registerAllModules } from 'handsontable/registry';

// Register all Handsontable modules
registerAllModules();

const { Option } = Select;

const MSSTable = ({
  quantitySheetData,
  fetchQuantitySheetData,
  languageOptions,
  tableSearchTerm,
  currentPage,
  pageSize,
  handleTableChange,
}) => {
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const { getCssClasses } = useStore(themeStore);
  const hotTableRef = useRef(null);
  const [
    customDark,
    customMid,
    customLight,
    customBtn,
    customDarkText,
    customLightText,
    customLightBorder,
    customDarkBorder,
    customThead,
  ] = getCssClasses();

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

  // Transform data for Handsontable
  const transformDataForHandsontable = () => {
    const filteredData = quantitySheetData.filter((record) =>
      Object.values(record).some((value) =>
        value
          ? value.toString().toLowerCase().includes(tableSearchTerm.toLowerCase())
          : false
      )
    );
    
    return filteredData.map(record => {
      const languageNames = Array.isArray(record.languageId) 
        ? record.languageId.map(id => {
            const language = languageOptions.find(l => l.languageId === id);
            return language ? language.languageName : id;
          }).join(', ') 
        : record.languageId || '';
      
      return [
        record.catchNo,
        record.duration,
        record.courseName,
        record.subjectName,
        languageNames,
        record.maxMarks,
        record.nepCode,
        record.uniqueCode,
        record.mssStatus === 2 ? 'Received' : 'Mark as Received',
        record.quantitySheetId // Hidden column for ID reference
      ];
    });
  };

  const allHandsontableData = transformDataForHandsontable();
  
  // Apply pagination to data
  const paginatedData = allHandsontableData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Calculate total pages
  const totalItems = allHandsontableData.length;

  const columns = [
    { title: 'S.No', data: 'sno', type: 'numeric', readOnly: true, width: 50,
      renderer: function(instance, td, row, col, prop, value, cellProperties) {
        td.innerHTML = row + 1;
        return td;
      }
    },
    { title: 'Catch No', data: 0, type: 'text' },
    { title: 'Duration', data: 1, type: 'numeric' },
    { title: 'Course', data: 2, type: 'text' },
    { title: 'Subject', data: 3, type: 'text' },
    { title: 'Language', data: 4, type: 'text' },
    { title: 'Max Marks', data: 5, type: 'numeric' },
    { title: 'NEP Code', data: 6, type: 'text' },
    { title: 'Private Code', data: 7, type: 'text' },
    { 
      title: 'Actions', 
      data: 8, 
      type: 'text',
      readOnly: true,
      renderer: function(instance, td, row, col, prop, value, cellProperties) {
        td.innerHTML = value === 'Received' 
          ? '<span style="color: green;">✓ Received</span>' 
          : '<button class="action-button">Mark as Received</button>';
        return td;
      }
    },
    
  ];

  // Handle click on action button in the table
  useEffect(() => {
    const handleTableClick = (event) => {
      if (event.target.className === 'action-button') {
        const hotInstance = hotTableRef.current.hotInstance;
        const selectedRow = hotInstance.getSelectedLast()[0];
        if (selectedRow !== undefined) {
          const quantitySheetId = hotInstance.getDataAtCell(selectedRow, 9); // Get ID from hidden column
          const record = quantitySheetData.find(item => item.quantitySheetId === quantitySheetId);
          if (record) {
            handleMarkReceived(record);
          }
        }
      }
    };

    document.addEventListener('click', handleTableClick);
    return () => {
      document.removeEventListener('click', handleTableClick);
    };
  }, [quantitySheetData]);

  // Pagination change handler
  const onPaginationChange = (page, pageSize) => {
    handleTableChange({ current: page, pageSize: pageSize });
  };

  return (
    <div className="table-responsive" style={{ overflowX: 'auto', width: '100%' }}>
      <HotTable
        ref={hotTableRef}
        data={paginatedData}
        colHeaders={columns.map(col => col.title)}
        columns={columns}
        width="100%"
        height="auto"
        licenseKey="non-commercial-and-evaluation"
        manualColumnResize={true}
        manualRowResize={true}
        manualColumnMove={true}
        manualRowMove={true}
        contextMenu={true}
        stretchH="all"
        filters={true}
        dropdownMenu={['filter_by_condition', 'filter_by_value', 'filter_action_bar']}
       
        beforeOnCellMouseDown={(event, coords) => {
          if (coords.row >= 0 && coords.col === -1) {
            return true;
          }
        }}
       
        afterRowMove={(movedRows, finalIndex) => {
          const pageOffset = (currentPage - 1) * pageSize;
          const actualMovedRows = movedRows.map(row => row + pageOffset);
          const actualFinalIndex = finalIndex + pageOffset;
          
          const newData = [...allHandsontableData];
          
          const movingRows = actualMovedRows.map(index => newData[index]);
          actualMovedRows.sort((a, b) => b - a).forEach(index => {
            newData.splice(index, 1);
          });
          
          newData.splice(actualFinalIndex, 0, ...movingRows);
          
          const hotInstance = hotTableRef.current.hotInstance;
          hotInstance.loadData(newData.slice(
            (currentPage - 1) * pageSize,
            currentPage * pageSize
          ));
        }}
      />
      
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={totalItems}
          onChange={onPaginationChange}
          showSizeChanger
          pageSizeOptions={[5, 10, 20, 50, 100]}
          showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
        />
      </div>
    </div>
  );
};

export default MSSTable;
