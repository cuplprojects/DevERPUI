// import React, { useState } from "react";
// import { Container, Row, Col, Button } from "react-bootstrap";
// import "bootstrap/dist/css/bootstrap.min.css";
// import { Select, Input, Upload, Space } from "antd";
// import { UploadOutlined, CloseOutlined } from "@ant-design/icons";
// import "antd/dist/reset.css";
// import * as XLSX from 'xlsx';

// const { Option } = Select;

// const ImportPage = () => {
//   const [file, setFile] = useState(null);
//   const [columns, setColumns] = useState([]);
//   const [selectedColumns, setSelectedColumns] = useState({});
//   const [manualInputs, setManualInputs] = useState({});
//   const [isFileUploaded, setIsFileUploaded] = useState(false);

//   const handleUpload = (file) => {
//     const reader = new FileReader();
//     reader.onload = (e) => {
//       const data = new Uint8Array(e.target.result);
//       const workbook = XLSX.read(data, { type: 'array' });
//       const firstSheetName = workbook.SheetNames[0];
//       const worksheet = workbook.Sheets[firstSheetName];
//       const headers = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0] || [];
//       const cleanedHeaders = headers.map(h => (h ? h.toString().trim() : ""));
//       setColumns(cleanedHeaders);
//       setFile(file);
//       setIsFileUploaded(true);
//     };
//     reader.readAsArrayBuffer(file);
//     return false;
//   };

//   const handleRemoveFile = () => {
//     setFile(null);
//     setColumns([]);
//     setSelectedColumns({});
//     setManualInputs({});
//     setIsFileUploaded(false);
//   };

//   const handleSelect = (value, field) => {
//     setSelectedColumns((prev) => ({
//       ...prev,
//       [field]: value,
//     }));
//   };

//   const handleManualInput = (e, field) => {
//     const { value } = e.target;
//     setManualInputs((prev) => ({
//       ...prev,
//       [field]: value,
//     }));
//   };

//   const getAvailableColumns = (currentField) => {
//     const selectedValues = Object.entries(selectedColumns)
//       .filter(([key]) => key !== currentField)
//       .map(([, value]) => value);
//     return columns.filter((col) => !selectedValues.includes(col));
//   };

//   const renderField = (label, field, isDropdown) => {
//     if (isFileUploaded) {
//       return (
//         <>
//           <h5>{label}</h5>
//           <Select
//             placeholder="Select Field"
//             className="mb-3"
//             style={{ width: "100%" }}
//             onChange={(value) => handleSelect(value, field)}
//             value={selectedColumns[field]}
//             allowClear
//           >
//             {getAvailableColumns(field).map((col) => (
//               <Option key={col} value={col}>
//                 {col}
//               </Option>
//             ))}
//           </Select>
//         </>
//       );
//     }

//     return (
//       <>
//         <h5>{label}</h5>
//         {isDropdown ? (
//           <Select
//             placeholder={`Select ${label}`}
//             className="mb-3"
//             style={{ width: "100%" }}
//             onChange={(value) => handleManualInput({ target: { value } }, field)}
//             value={manualInputs[field]}
//           >
//             <Option value="option1">Option 1</Option>
//             <Option value="option2">Option 2</Option>
//           </Select>
//         ) : (
//           <Input
//             placeholder={`Enter ${label}`}
//             className="mb-3"
//             onChange={(e) => handleManualInput(e, field)}
//             value={manualInputs[field] || ""}
//           />
//         )}
//       </>
//     );
//   };

//   const handleAdd = () => {
//     if (isFileUploaded) {
//       console.log("Mapped Excel Columns:");
//       console.log(selectedColumns);
//     } else {
//       console.log("Manual Inputs:");
//       console.log(manualInputs);
//     }
//   };

//   return (
//     <Container
//       fluid
//       className="vh-100 d-flex flex-column justify-content-center align-items-center bg-light"
//     >
//       <Row className="w-75">
//         <Col>
//           <Row className="mb-3">
//             <Col>
//               <h1 className="mb-4">Add Paper</h1>
//             </Col>
//             <Col className="d-flex justify-content-end">
//               {!isFileUploaded && (
//                 <Upload
//                   showUploadList={false}
//                   beforeUpload={handleUpload}
//                 >
//                   <Button icon={<UploadOutlined />}>Import Excel</Button>
//                 </Upload>
//               )}
//               {isFileUploaded && (
//                 <Space>
//                   <span className="fs-5">{file.name}</span>
//                   <Button onClick={handleRemoveFile} danger>
//                     <CloseOutlined />
//                   </Button>
//                 </Space>
//               )}
//             </Col>
//           </Row>
//           {isFileUploaded && (
//             <h2 className="text-center">Map Fields from Selected Excel File</h2>
//           )}
//           <Row>
//             <Col md={6}>
//               {renderField("Group", "group", true)}
//               {renderField("Paper Title", "paperTitle", false)}
//               {renderField("Paper Number", "paperNumber", false)}
//               {renderField("Exam Type", "examType", true)}
//               {renderField("Max Marks", "maxMarks", false)}
//               {renderField("Duration", "duration", false)}
//             </Col>
//             <Col md={6}>
//               {renderField("Subject", "subject", true)}
//               {renderField("Course", "course", true)}
//               {renderField("NEP Code / Paper Code", "nepCode", false)}
//               {renderField("Course Code / Private Code", "courseCode", false)}
//               {renderField("Language", "language", true)}
//               {renderField("Type", "type", true)}

//               <Button type="primary" className="mt-3 w-100" onClick={handleAdd}>
//                 Add
//               </Button>
//             </Col>
//           </Row>
//         </Col>
//       </Row>
//     </Container>
//   );
// };

// export default ImportPage;

import React, { useState, useMemo } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { Select, Input, Upload, Space } from "antd";
import { UploadOutlined, CloseOutlined } from "@ant-design/icons";
import "antd/dist/reset.css";
import * as XLSX from "xlsx";
import { RiFileExcel2Fill } from "react-icons/ri";
import { MdDeleteForever } from "react-icons/md";
import themeStore from "./../../store/themeStore";
import { useStore } from "zustand";

const { Option } = Select;

const ImportPage = () => {
  const [file, setFile] = useState(null);
  const [columns, setColumns] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState({});
  const [manualInputs, setManualInputs] = useState({});
  const [excelData, setExcelData] = useState([]);
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const themeState = useStore(themeStore);
  const cssClasses = useMemo(() => themeState.getCssClasses(), [themeState]);
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

  const handleUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      const headers = Object.keys(jsonData[0] || {});
      const cleanedHeaders = headers.map((h) => (h ? h.toString().trim() : ""));
      setColumns(cleanedHeaders);
      setExcelData(jsonData);
      setFile(file);
      setIsFileUploaded(true);
    };
    reader.readAsArrayBuffer(file);
    return false;
  };

  const handleRemoveFile = () => {
    setFile(null);
    setColumns([]);
    setSelectedColumns({});
    setManualInputs({});
    setExcelData([]);
    setIsFileUploaded(false);
  };

  const handleSelect = (value, field) => {
    setSelectedColumns((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleManualInput = (e, field) => {
    const { value } = e.target;
    setManualInputs((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getAvailableColumns = (currentField) => {
    const selectedValues = Object.entries(selectedColumns)
      .filter(([key]) => key !== currentField)
      .map(([, value]) => value);
    return columns.filter((col) => !selectedValues.includes(col));
  };

  const renderField = (label, field, isDropdown) => {
    if (isFileUploaded) {
      return (
        <>
          <h5>{label}</h5>
          <Select
            placeholder="Select Field"
            className="mb-3"
            style={{ width: "100%" }}
            onChange={(value) => handleSelect(value, field)}
            value={selectedColumns[field]}
            allowClear
          >
            {getAvailableColumns(field).map((col) => (
              <Option key={col} value={col}>
                {col}
              </Option>
            ))}
          </Select>
        </>
      );
    }

    return (
      <>
        <h5>{label}</h5>
        {isDropdown ? (
          <Select
            placeholder={`Select ${label}`}
            className="mb-3"
            style={{ width: "100%" }}
            onChange={(value) =>
              handleManualInput({ target: { value } }, field)
            }
            value={manualInputs[field]}
          >
            <Option value="option1">Option 1</Option>
            <Option value="option2">Option 2</Option>
          </Select>
        ) : (
          <Input
            placeholder={`Enter ${label}`}
            className="mb-3"
            onChange={(e) => handleManualInput(e, field)}
            value={manualInputs[field] || ""}
          />
        )}
      </>
    );
  };

  const handleClear = () => {
    setManualInputs((prev) => ({}));
  };

  const handleAdd = () => {
    if (isFileUploaded) {
      const mappedData = excelData.map((row) => {
        const mappedRow = {};
        Object.entries(selectedColumns).forEach(([key, colName]) => {
          mappedRow[key] = row[colName] ?? "";
        });
        return mappedRow;
      });

      console.log("Mapped Row Data:");
      console.log(mappedData);
    } else {
      console.log("Manual Input Data:");
      console.log(manualInputs);
    }
  };

  return (
    <Container
      fluid
      className=" d-flex flex-column justify-content-center align-items-center bg-light rounded p-3"
    >
      <Row className="w-75">
        <Col>
          <Row className="mb-3">
            <Col>
              <h1 className={`mb-4 ${customDarkText}`}>Add Paper</h1>
            </Col>
            <Col className="d-flex justify-content-end">
              {!isFileUploaded && (
                <Upload showUploadList={false} beforeUpload={handleUpload}>
                  <Button icon={<UploadOutlined />}>Import Excel</Button>
                </Upload>
              )}
              {isFileUploaded && (
                <Space>
                  <span className="fs-5 ms-2 d-flex align-items-center ">
                    <RiFileExcel2Fill color="green" size={24} />
                    {file.name}
                  </span>
                  <MdDeleteForever
                    size={30}
                    color="red"
                    onClick={handleRemoveFile}
                    className="c-pointer"
                    title="Remove file"
                  />
                </Space>
              )}
            </Col>
          </Row>
          {isFileUploaded && (
            <h2 className="text-center">Map Fields from Selected Excel File</h2>
          )}
          <Row>
            <Col md={6}>
              {renderField("Group", "group", true)}
              {renderField("Paper Title", "paperTitle", false)}
              {renderField("Paper Number", "paperNumber", false)}
              {renderField("Exam Type", "examType", true)}
              {renderField("Max Marks", "maxMarks", false)}
              {renderField("Duration", "duration", false)}
            </Col>
            <Col md={6}>
              {renderField("Subject", "subject", true)}
              {renderField("Course", "course", true)}
              {renderField("NEP Code / Paper Code", "nepCode", false)}
              {renderField("Course Code / Private Code", "courseCode", false)}
              {renderField("Language", "language", true)}
              {renderField("Type", "type", true)}
              <Row>
                <Col md={6}>
                  <Button
                    type="primary"
                    className="mt-3 w-100"
                    onClick={handleAdd}
                  >
                    Add
                  </Button></Col>
                  <Col md={6}>
                  <Button
                    type="primary"
                    className="mt-3 w-100"
                    onClick={handleClear}
                  >
                    Clear
                  </Button>{" "}
                </Col>
              </Row>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default ImportPage;
