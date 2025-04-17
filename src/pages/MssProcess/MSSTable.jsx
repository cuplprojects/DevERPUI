import React, { useState, useEffect, useRef } from "react";
import { Input, Button, Space, message, Select } from "antd";
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
  console.log(quantitySheetData)
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const { getCssClasses } = useStore(themeStore);
  const hotTableRef = useRef(null);
  const [originalData, setOriginalData] = useState([]);
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
  const [languageList, setLanguageList] = useState([]);

  useEffect(() => {
    setOriginalData([...quantitySheetData]);
  }, [quantitySheetData]);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await API.get('/Language');
        setLanguageList(response.data); // assuming array of { languageId, languageName }
      } catch (err) {
        console.error("Failed to fetch languages", err);
      }
    };

    fetchLanguages();
  }, []);


  const languageOption = languageList.map(lang => lang.languages);

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

      const languageString = Array.isArray(record.languages)
        ? record.languages.join(', ')
        : record.languages || '';

      return [
        record.catchNo,
        record.duration,
        record.courseName,
        record.subjectName,
        languageString,
        record.maxMarks,
        record.nepCode,
        record.uniqueCode,
        record.mssStatus === 2 ? 'Received' : 'Mark as Received',
        record.quantitySheetId // Hidden column for ID reference
      ];
    });
  };

  const handsontableData = transformDataForHandsontable();

  const columns = [
    {
      title: 'S.No', data: 'sno', type: 'numeric', readOnly: true, width: 50,
      renderer: function (instance, td, row, col, prop, value, cellProperties) {
        td.innerHTML = row + 1;
        return td;
      }
    },
    { title: 'Catch No', data: 0, type: 'text' },
    { title: 'Duration', data: 1, type: 'numeric' },
    { title: 'Course', data: 2, type: 'text' },
    { title: 'Subject', data: 3, type: 'text' },
    // {
    //   title: 'Language',
    //   data: 4,
    //   type: 'dropdown',
    //   source: languageOption,
    //   strict: false,
    //   allowInvalid: true,
    //   editor: 'dropdown',
    //   validator: (value, callback) => {
    //     callback(languageOption.includes(value));
    //   }
    // },
    // {
    //   title: 'Language',
    //   data: 4,
    //   type: 'dropdown',
    //   source: languageList.map(lang => lang.languages), // Use languageId instead of languageName
    //   strict: false,
    //   allowInvalid: true,
    //   editor: 'dropdown',
    //   validator: (value, callback) => {
    //     // Ensure that the value is one of the valid languageIds
    //     callback(languageList.some(lang => lang.languageId === value));
    //   },
    //   renderer: function (instance, td, row, col, prop, value, cellProperties) {
    //     const hotInstance = hotTableRef.current.hotInstance;
    //     const selectedLanguageId = hotInstance.getDataAtCell(row, col);  // languageId is stored here
    //     const record = quantitySheetData.find(item => item.quantitySheetId === hotInstance.getDataAtCell(row, 9));  // Get the record based on quantitySheetId
    
    //     if (record) {
    //       // Store the selected languageId in the record
    //       record.languageId = Array.isArray(selectedLanguageId) ? selectedLanguageId : [selectedLanguageId];
    //     }
    
    //     // Optionally render the language name instead of the languageId in the cell
    //     const selectedLanguage = languageList.find(lang => lang.languages === selectedLanguageId);
    //     td.innerHTML = selectedLanguage ? selectedLanguage.languages : "Select Language";  // Use the languageName for display
    //     console.log(selectedLanguage)
    //     return td;
    //   }
    // },
    {
  title: 'Language',
  data: 4,
  type: 'dropdown',
  source: languageList.map(lang => lang.languageId), // Set the source to languageId
  strict: false,
  allowInvalid: true,
  editor: 'dropdown',
  validator: (value, callback) => {
    // Ensure that the value is one of the valid languageIds
    callback(languageList.some(lang => lang.languageId === value));
  },
  renderer: function (instance, td, row, col, prop, value, cellProperties) {
    const hotInstance = hotTableRef.current.hotInstance;
    const selectedLanguageId = hotInstance.getDataAtCell(row, col);  // Get the languageId stored in the cell
    const record = quantitySheetData.find(item => item.quantitySheetId === hotInstance.getDataAtCell(row, 9));  // Find the record by quantitySheetId

    if (record) {
      // Store the selected languageId in the record
      record.languageId = Array.isArray(selectedLanguageId) ? selectedLanguageId : [selectedLanguageId];
    }

    // Find the language name from languageId to display it
    const selectedLanguage = languageList.find(lang => lang.languageId === selectedLanguageId);
    td.innerHTML = selectedLanguage ? selectedLanguage.languageName : "Select Language";  // Display the language name
    return td;
  }
},

    { title: 'Max Marks', data: 5, type: 'numeric' },
    { title: 'NEP Code', data: 6, type: 'text' },
    { title: 'Private Code', data: 7, type: 'text' },
    {
      title: 'Actions',
      data: 8,
      type: 'text',
      readOnly: true,
      renderer: function (instance, td, row, col, prop, value, cellProperties) {
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

  // const handleSave = async () => {
  //   const hotInstance = hotTableRef.current.hotInstance;
  //   const currentData = hotInstance.getData();    
  //   const updatedRecords = [];

  //   currentData.forEach((row, rowIndex) => {
  //     const originalRecord = originalData[rowIndex];
  //     if (!originalRecord) return;
  
  //     const updatedRecord = {};
  //     let isChanged = false;

  //     // Compare each field and add to updatedRecord only if changed
  //     if (row[1] !== originalRecord.catchNo) {
  //       updatedRecord.catchNo = row[1];
  //       isChanged = true;
  //     }

  //     if (row[2] !== originalRecord.duration) {
  //       updatedRecord.duration = row[2];
  //       isChanged = true;
  //     }

  //     if (row[3] !== originalRecord.courseName) {
  //       updatedRecord.courseName = row[3];
  //       isChanged = true;
  //     }

  //     if (row[4] !== originalRecord.subjectName) {
  //       updatedRecord.subjectName = row[4];
  //       isChanged = true;
  //     }

  //     if (parseInt(row[6], 10) !== originalRecord.maxMarks) {
  //       updatedRecord.maxMarks = parseInt(row[6], 10);
  //       isChanged = true;
  //     }

  //     if (row[7] !== originalRecord.nepCode) {
  //       updatedRecord.nepCode = row[7];
  //       isChanged = true;
  //     }

  //     if (row[8] !== originalRecord.uniqueCode) {
  //       updatedRecord.uniqueCode = row[8];
  //       isChanged = true;
  //     }

  //     const mssStatus = row[9] === 'Received' ? 2 : 1;
  //     if (mssStatus !== originalRecord.mssStatus) {
  //       updatedRecord.mssStatus = mssStatus;
  //       isChanged = true;
  //     }
  //     if (originalRecord.languageId !== row[5]) {
  //       const languageId = Array.isArray(row[5]) ? row[5] : [row[5]];
  //       if (languageId.length === 1 && languageId[0] === "") {
  //         updatedRecord.languageId = [];
  //       } else {
  //         updatedRecord.languageId = languageId;
  //       }
  //       isChanged = true;
  //     }
  
      
  //     if (isChanged) {
  //       updatedRecord.quantitySheetId = originalRecord.quantitySheetId;
  //       const fullupdatedRecords = ({ ...originalRecord, ...updatedRecord });
  //       delete fullupdatedRecords.languages;
  //       delete fullupdatedRecords.examTypes;
  //       delete fullupdatedRecords.courseName;
  //       delete fullupdatedRecords.subjectName;
  //       updatedRecords.push(fullupdatedRecords)
  //     }
  //   });

  //   if (updatedRecords.length === 0) {
  //     message.info("No changes to save.");
  //     return;
  //   }

  //   try {
  //     await API.put('/QuantitySheet/bulk-update', updatedRecords);
  //     message.success("Changes saved successfully");
  //     await fetchQuantitySheetData();
  //   } catch (error) {
  //     console.error("Failed to save changes:", error);
  //     message.error("Failed to save changes");
  //   }
  // };

  const handleSave = async () => {
    const hotInstance = hotTableRef.current.hotInstance;
    const currentData = hotInstance.getData();
    const updatedRecords = [];
  
    currentData.forEach((row, rowIndex) => {
      const originalRecord = originalData[rowIndex];
      if (!originalRecord) return;
  
      const updatedRecord = {};
      let isChanged = false;
  
      // Compare each field and add to updatedRecord only if changed
      if (row[1] !== originalRecord.catchNo) {
        updatedRecord.catchNo = row[1];
        isChanged = true;
      }
  
      if (row[2] !== originalRecord.duration) {
        updatedRecord.duration = row[2];
        isChanged = true;
      }
  
      if (row[3] !== originalRecord.courseName) {
        updatedRecord.courseName = row[3];
        isChanged = true;
      }
  
      if (row[4] !== originalRecord.subjectName) {
        updatedRecord.subjectName = row[4];
        isChanged = true;
      }
  
      if (parseInt(row[6], 10) !== originalRecord.maxMarks) {
        updatedRecord.maxMarks = parseInt(row[6], 10);
        isChanged = true;
      }
  
      if (row[7] !== originalRecord.nepCode) {
        updatedRecord.nepCode = row[7];
        isChanged = true;
      }
  
      if (row[8] !== originalRecord.uniqueCode) {
        updatedRecord.uniqueCode = row[8];
        isChanged = true;
      }
  
      const mssStatus = row[9] === 'Received' ? 2 : 1;
      if (mssStatus !== originalRecord.mssStatus) {
        updatedRecord.mssStatus = mssStatus;
        isChanged = true;
      }
  
      // Save languageId instead of language name
      if (originalRecord.languageId !== row[5]) {
        const languageId = Array.isArray(row[5]) ? row[5] : [row[5]];
        if (languageId.length === 1 && languageId[0] === "") {
          updatedRecord.languageId = [];
        } else {
          updatedRecord.languageId = languageId;
        }
        isChanged = true;
      }
  
      if (isChanged) {
        updatedRecord.quantitySheetId = originalRecord.quantitySheetId;
        const fullUpdatedRecord = { ...originalRecord, ...updatedRecord };
        delete fullUpdatedRecord.languages;
        delete fullUpdatedRecord.examTypes;
        delete fullUpdatedRecord.courseName;
        delete fullUpdatedRecord.subjectName;
        updatedRecords.push(fullUpdatedRecord);
      }
    });
  
    if (updatedRecords.length === 0) {
      message.info("No changes to save.");
      return;
    }
  
    try {
      await API.put('/QuantitySheet/bulk-update', updatedRecords);
      message.success("Changes saved successfully");
      await fetchQuantitySheetData();
    } catch (error) {
      console.error("Failed to save changes:", error);
      message.error("Failed to save changes");
    }
  };
  


  return (
    <div className="table-responsive" style={{ overflowX: 'auto', width: '100%' }}>
      <Button onClick={handleSave} type="primary" style={{ marginBottom: '10px' }}>
        Save Changes
      </Button>
      <HotTable
        ref={hotTableRef}
        data={handsontableData}
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
      />
    </div>
  );
};

export default MSSTable;
