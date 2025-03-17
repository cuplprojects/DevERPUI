// import React, { useState } from 'react';
// import { Form, Input, Button, message } from 'antd';
// import axios from 'axios';

// const AddNew = (groupId) => {
//     // Initialize form
//     const [form] = Form.useForm();

//     // Handle submit function
//     const handleSubmit = async (values) => {
//         try {
//             // Send data to API (example API endpoint)
//             const response = await axios.post('YOUR_API_URL_HERE', values);
//             if (response.status === 200) {
//                 message.success('Data added successfully!');
//                 form.resetFields(); // Optionally reset the form
//             }
//         } catch (error) {
//             // Handle error
//             message.error('Error adding data. Please try again.');
//         }
//     };

//     return (
//         <div>
//             <Form
//                 form={form}
//                 onFinish={handleSubmit}  // onFinish triggers the submit function
//             >
//                 <Form.Item
//                     label="Course"
//                     name="course"
//                     rules={[{ required: true, message: 'Course is required!' }]}
//                 >
//                     <Input />
//                 </Form.Item>

//                 <Form.Item
//                     label="Subject"
//                     name="subject"
//                     rules={[{ required: true, message: 'Subject is required!' }]}
//                 >
//                     <Input />
//                 </Form.Item>
//                 <Form.Item
//                     label="Paper Number"
//                     name="papernumber"
//                     rules={[{ required: true, message: 'Paper Number is required!' }]}
//                 >
//                     <Input />
//                 </Form.Item>
//                 <Form.Item
//                     label="Paper Title"
//                     name="papertitle"
//                     rules={[{ required: true, message: 'Paper Title is required!' }]}
//                 >
//                     <Input />
//                 </Form.Item>
//                 <Form.Item
//                     label="NEP Code"
//                     name="nepcode"
//                     rules={[{ required: true, message: 'Paper Title is required!' }]}
//                 >
//                     <Input />
//                 </Form.Item>

//                 <Form.Item
//                     label="Private Code"
//                     name="privatecode"
//                     rules={[{ required: true, message: 'Paper Title is required!' }]}
//                 >
//                     <Input />
//                 </Form.Item>

//                 <Form.Item
//                     label="Language"
//                     name="language"
//                     rules={[{ required: true, message: 'Language is required!' }]}
//                 >
//                     <Input />
//                 </Form.Item>

//                 <Form.Item
//                     label="Type"
//                     name="type"
//                     rules={[{ required: true, message: 'Type is required!' }]}
//                 >
//                     <Input />
//                 </Form.Item>

//                 <Form.Item
//                     label="ExamType"
//                     name="examtype"
//                     rules={[{ required: true, message: 'ExamType is required!' }]}
//                 >
//                     <Input />
//                 </Form.Item>

//                 <Form.Item
//                     label="Max Marks"
//                     name="maxmarks"
//                     rules={[{ required: true, message: 'Max Marks is required!' }]}
//                 >
//                     <Input />
//                 </Form.Item>

//                 <Form.Item
//                     label="Duration"
//                     name="duration"
//                     rules={[{ required: true, message: 'Duration is required!' }]}
//                 >
//                     <Input />
//                 </Form.Item>
//                 <Form.Item>
//                     <Button type="primary" htmlType="submit">
//                         Submit
//                     </Button>
//                 </Form.Item>
//             </Form>
//         </div>
//     );
// };

// export default AddNew;


import React, { useState, useMemo } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { Select, Input} from "antd";
import "antd/dist/reset.css";
import themeStore from "./../../store/themeStore";
import { useStore } from "zustand";
import { useNavigate } from "react-router-dom";
import { FaHome } from "react-icons/fa";
const { Option } = Select;

const ImportPage = () => {
  const navigate = useNavigate();
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

 
  const handleHomeClick = () => {
    navigate("/QP-Masters");
  };

  const handleManualInput = (e, field) => {
    const { value } = e.target;
    setManualInputs((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const renderField = (label, field, isDropdown) => {
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
            <Col className="d-flex justify-content-end align-items-center">
              <FaHome
                className="me-2 c-pointer"
                color="blue"
                size={30}
                onClick={handleHomeClick}
              />
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
                    className={`mt-3 w-100 border-0 ${customBtn}`}
                    onClick={handleAdd}
                  >
                    Add
                  </Button>
                </Col>
                <Col md={6}>
                  <Button
                    type="primary"
                    className={`mt-3 w-100 border-0 ${customBtn}`}
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
