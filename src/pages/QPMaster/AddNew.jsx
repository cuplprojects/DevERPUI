import React, { useState, useMemo, useEffect } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { Select, Input } from "antd";
import "antd/dist/reset.css";
import themeStore from "./../../store/themeStore";
import { useStore } from "zustand";
import { useNavigate, useParams } from "react-router-dom";
import { FaHome } from "react-icons/fa";
const { Option } = Select;

const ImportPage = () => {
  const { groupId, groupName } = useParams();
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

  const handleImportClick = () => {
    navigate(`/Import-Paper/${groupId}/${groupName}`);
  };

  const handleManualInput = (e, field) => {
    const { value } = e.target;
    setManualInputs((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  useEffect(() => {
    setManualInputs((prev) => ({
      ...prev,
      group: groupId, // or you can use groupName if needed
    }));
  }, [groupId, groupName]);

  const renderField = (
    label,
    field,
    isDropdown,
    isDisabled = false,
    fixedValue = null
  ) => {
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
            disabled={isDisabled}
          >
            {fixedValue ? (
              <Option value={fixedValue.value}>{fixedValue.label}</Option>
            ) : (
              <>
                <Option value="option1">Option 1</Option>
                <Option value="option2">Option 2</Option>
              </>
            )}
          </Select>
        ) : (
          <Input
            placeholder={`Enter ${label}`}
            className="mb-3"
            onChange={(e) => handleManualInput(e, field)}
            value={manualInputs[field] || ""}
            disabled={isDisabled}
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
              <div>
                <FaHome
                  className="me-2 c-pointer"
                  color="blue"
                  size={30}
                  onClick={handleHomeClick}
                />
                <Button
                  type="primary"
                  className={` border-0 ${customBtn}`}
                  onClick={handleImportClick}
                >
                  Import
                </Button>
              </div>
            </Col>
          </Row>
          {isFileUploaded && (
            <h2 className="text-center">Map Fields from Selected Excel File</h2>
          )}
          <Row>
            <Col md={6}>
              {renderField("Group", "group", true, true, {
                label: `${groupName} (ID: ${groupId})`,
                value: groupId,
              })}
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
