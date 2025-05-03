import React, { useEffect, useRef, useState } from "react";
import API from "../../CustomHooks/MasterApiHooks/api";
import { Select, Form, Upload, Button, Row, Col } from "antd";
import { success, error } from "../../CustomHooks/Services/AlertMessageService";
import { UploadOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useStore } from "zustand";
import themeStore from "../../store/themeStore";
import * as XLSX from "xlsx";
import { useNavigate, useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Container from "react-bootstrap/Container";
import { Card } from "react-bootstrap";
import { decrypt, encrypt } from "./../../Security/Security";
import { FaHome } from "react-icons/fa";

const Import = () => {
  const { encryptedGroupId, encryptedGroupName } = useParams();
  const [groupId, setGroupId] = useState(null);
  const [groupName, setGroupName] = useState(null);
  const [form] = Form.useForm();
  const [columns, setColumns] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fieldMappings, setFieldMappings] = useState({});
  const [headers, setHeaders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showMappingFields, setShowMappingFields] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [showBtn, setShowBtn] = useState(false);
  const { t } = useTranslation();
  const { getCssClasses } = useStore(themeStore);
  const cssClasses = getCssClasses();
  const customDark = cssClasses[0];
  const customMid = cssClasses[1];
  const customLight = cssClasses[2];
  const customBtn = cssClasses[3];
  const customDarkText = cssClasses[4];
  const customLightText = cssClasses[5];
  const customLightBorder = cssClasses[6];
  const customDarkBorder = cssClasses[7];
  const navigate = useNavigate();
  const courseCache = useRef({});
  const subjectCache = useRef({});


  useEffect(() => {
    const decryptGroupId = decrypt(encryptedGroupId);
    const decryptGroupName = decrypt(encryptedGroupName);
    setGroupId(decryptGroupId);
    setGroupName(decryptGroupName);
  }, []);

  useEffect(() => {
    const getColumns = async () => {
      try {
        const response = await API.get("/QPMasters/Columns");
        setColumns(response.data);
      } catch (error) {
        console.error(t("failedtofetchColumns"), error);
      }
    };
    getColumns();
  }, [t]);

  const getAvailableOptions = (property) => {
    const selectedValues = Object.values(fieldMappings).flat();
    return headers
      .filter((header) => !selectedValues.includes(header))
      .map((header) => ({ label: header, value: header }));
  };

  const handleFileUpload = (file) => {
    setFileList([file]);
    setSelectedFile(file);
    setIsProcessingFile(true);
    setShowBtn(false);
    processFile(file);
    return false;
  };

  const processFile = async (file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const filteredData = jsonData.filter((row) =>
          row.some((cell) => cell !== null && cell !== "")
        );

        if (filteredData.length === 0) {
          console.error(t("noValidDataFoundInFile"));
          error(t("noValidDataFoundInFile"), false);
          setIsProcessingFile(false);
          return;
        }

        const excelHeaders = filteredData[0];
        setHeaders(excelHeaders);
        setShowMappingFields(true);
        setShowBtn(true);

        const autoMappings = {};
        columns.forEach((col) => {
          const matchingHeaders = excelHeaders.filter(
            (header) => header?.toLowerCase() === col?.toLowerCase()
          );
          autoMappings[col] = matchingHeaders.length > 0 ? matchingHeaders : [];
        });
        setFieldMappings(autoMappings);
      } catch (err) {
        console.error("File processing error:", err);
        error(t("fileProcessingError"), false);
      } finally {
        setIsProcessingFile(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const createMappedData = async () => {
    const reader = new FileReader();
    return new Promise((resolve) => {
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (!Array.isArray(jsonData[0])) {
          console.error(
            "The first row (headers) is not an array.",
            jsonData[0]
          );
          resolve([]);
          return;
        }
        const rows = jsonData.slice(1);
        const mappedData = [];
        for (let row of rows) {
          const rowData = {};
          for (let property in fieldMappings) {
            let headers = fieldMappings[property];
            if (!Array.isArray(headers)) {
              headers = [headers];
            }
            if (headers.length > 1) {
              const valueString = headers
                .map((header) => {
                  const index = jsonData[0].indexOf(header);
                  if (index !== -1) {
                    const value = row[index] || "";
                    return `${header}: ${value}`;
                  }
                  return null;
                })
                .filter(Boolean)
                .join(", ");
              rowData[property] = valueString;
            } else {
              const header = headers[0];
              const index = jsonData[0].indexOf(header);
              if (index !== -1) {
                let value = row[index] || "";
                rowData[property] = value || "";
              }
            }
          }
          try {
            let courseId = await getCourseIdByName(rowData["CourseId"]);
            rowData["CourseId"] = courseId;
          } catch (err) {
            console.error("Error fetching or inserting courseId:", err);
            rowData["CourseId"] = 0;
          }
          try {
            let subjectId = await getSubjectIdByName(rowData["SubjectId"]);
            rowData["SubjectId"] = subjectId;
          } catch (err) {
            console.error("Error fetching or inserting Subject:", err);
            rowData["SubjectId"] = 0;
          }
          try {
            let typeId = await getTypeIdByName(rowData["TypeId"]);
            rowData["TypeId"] = typeId;
          } catch (err) {
            console.error("Error fetching or inserting TypeId:", err);
            rowData["TypeId"] = 0;
          }
          try {
            let languageId = await getLanguageIdByName(rowData["LanguageId"]);
            rowData["LanguageId"] = languageId;
          } catch (err) {
            console.error("Error fetching or inserting Language:", err);
            rowData["LanguageId"] = 0;
          }
          try {
            let examtypeId = await getExamTypeIdByName(rowData["ExamTypeId"]);
            rowData["ExamTypeId"] = examtypeId;
          } catch (err) {
            console.error("Error fetching or inserting ExamTypeId:", err);
            rowData["ExamTypeId"] = 0;
          }
          rowData["groupId"] = groupId;
          mappedData.push(rowData);
        }
        resolve(mappedData);
      };
      reader.readAsArrayBuffer(selectedFile);
    });
  };

  const getCourseIdByName = async (courseName) => {
    if (courseCache.current[courseName]) {
      return courseCache.current[courseName];
    }
    try {
      const courseResponse = await API.get(
        `Course/GetCourse?courseName=${courseName}`
      );
      let courseId = courseResponse.data;
      if (!courseId) {
        const newCourseResponse = await API.post("/Course", {
          CourseName: courseName,
        });
        courseId = newCourseResponse.data.courseId;
      }
      courseCache.current[courseName] = courseId;
      return courseId;
    } catch (err) {
      console.error("Error in fetching or inserting course:", err);
      throw err;
    }
  };

  const getSubjectIdByName = async (subject) => {
    if (subjectCache.current[subject]) {
      return subjectCache.current[subject];
    }
    try {
      const subjectResponse = await API.get(
        `Subject/Subject?subject=${subject}`
      );
      let subjectId = subjectResponse.data;

      if (!subjectId) {
        const newsubjectResponse = await API.post("/Subject", {
          SubjectName: subject,
        });
        subjectId = newsubjectResponse.data.subjectId;
      }
      subjectCache.current[subject] = subjectId;
      return subjectId;
    } catch (err) {
      console.error("Error in fetching or inserting course:", err);
      throw err;
    }
  };

  const getTypeIdByName = async (type) => {
    try {
      const typeResponse = await API.get(`PaperTypes/Type?type=${type}`);
      let typeId = typeResponse.data;
      if (!typeId) {
        console.error("Type does not exist", type);
        error(t("typeDoesNotExist") + ": " + type, true);
      }
      return typeId;
    } catch (err) {
      console.error("Error in fetching or inserting type:", err);
      throw err;
    }
  };

  const getLanguageIdByName = async (language) => {
    try {
      const encodedLanguage = encodeURIComponent(language);
      const languageResponse = await API.get(
        `Language/Language?language=${encodedLanguage}`
      );
      let languageId = languageResponse.data;

      if (!languageId) {
        const newLanguageResponse = await API.post("/Language", {
          language: language,
        });
        languageId = newLanguageResponse.data.languageId;
      }
      return languageId;
    } catch (err) {
      console.error("Error in fetching or inserting type:", err);
      throw err;
    }
  };

  const getExamTypeIdByName = async (examtype) => {
    try {
      const examtypeResponse = await API.get(
        `ExamType/ExamType?examtype=${examtype}`
      );
      let examtypeId = examtypeResponse.data;
      if (!examtypeId) {
        console.error("ExamType does not exist", examtype);
        error(t("examTypeDoesNotExist") + ": " + examtype, true);
      }
      return examtypeId;
    } catch (err) {
      console.error("Error in fetching or inserting type:", err);
      throw err;
    }
  };

  const handleUpload = async () => {
    setIsLoading(true);
    setShowMappingFields(false);
    let mappedData;
    try {
      mappedData = await createMappedData();
      if (!mappedData || mappedData.length === 0) {
        console.error(t("mappedDataInvalidOrEmpty"));
        error(t("mappedDataInvalidOrEmpty"), false);
        setIsLoading(false);
        return;
      }
      const finalPayload = mappedData.map((item) => ({
        groupId: groupId,
        typeId: item.TypeId || 0,
        nepCode: String(item.NEPCode || ""),
        uniqueCode: item.UniqueCode || "",
        subjectId: item.SubjectId || 0,
        paperNumber: String(item.PaperNumber || ""),
        paperTitle: String(item.PaperTitle || ""),
        maxMarks: item.MaxMarks || 0,
        duration: item.Duration || "",
        languageId: item.LanguageId || [],
        customizedField1: item.customizedField1 || "",
        customizedField2: item.customizedField2 || "",
        customizedField3: item.customizedField3 || "",
        courseId: item.CourseId || 0,
        examTypeId: item.ExamTypeId || 0,
      }));

      const response = await API.post("/QPMasters", finalPayload, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      // console.log("Upload Success:", response.data);
      success(t("quantitySheetUploadedSuccessfully"), true);
      setFileList([]);
      setSelectedFile(null);
      setFieldMappings([]);
      setHeaders([]);
      setShowBtn(false);
    } catch (err) {
      console.error('Error adding QPMaster:', err);
      const errorMessage = err.response?.data || t('errorAddingQPMaster');
      error(errorMessage, false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHomeClick = () => {
    navigate("/QP-Masters");
  };

  const handleMappingChange = (property, value) => {
    setFieldMappings((prevMappings) => {
      return {
        ...prevMappings,
        [property]: value,
      };
    });
  };

  // Function to process field names
  const processFieldName = (name) => {
    return name.endsWith("Id") ? name.slice(0, -2) : name;
  };

  return (
    <Container className="">
      <Card>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center">
            <div className="flex-grow-1 text-center">
              <h1 className={`fw-bold ${customDarkText} m-0`}>Import Excel</h1>
              <p className="text-muted m-0">For <span className="fw-bold">{groupName}</span> group</p>
            </div>
            <FaHome
              className="ms-2 c-pointer"
              color="blue"
              size={30}
              onClick={handleHomeClick}
            />
          </div>

          <Form layout="vertical" form={form}>
            <Form.Item
              name="file"
              rules={[{ required: true, message: t("pleaseSelectAFile") }]}
            >
              <div className="d-flex align-items-center justify-content-between">
                <Upload
                  onRemove={(file) => {
                    const index = fileList.indexOf(file);
                    const newFileList = fileList.slice();
                    newFileList.splice(index, 1);
                    setFileList(newFileList);
                  }}
                  beforeUpload={handleFileUpload}
                  fileList={fileList}
                  className="flex-grow- me-2 fw-bold text-danger "
                >
                  <Button
                    className={`w-100 d-flex align-items-center p-2 ${customBtn} text-white`}
                  >
                    <UploadOutlined />
                    <span className="d-none d-sm-inline fs-5 p-2 text-white">
                      {t("selectFile")}
                    </span>
                    <span className={`d-inline d-sm-none fs-4 p-2 text-white`}>
                      {t("upload")}
                    </span>
                  </Button>
                </Upload>
                {fileList.length > 0 && (
                  <Button
                    className={`${customBtn}`}
                    type="primary"
                    onClick={handleUpload}
                    loading={isLoading}
                  >
                    {t("uploadQp")}
                  </Button>
                )}
              </div>
            </Form.Item>
            <Row className="mt-4 justify-content-center">
              <div className="table-responsive w-100">
                <table className="table table-bordered table-striped w-100">
                  <thead>
                    <tr>
                      <th style={{ width: "50%" }}> {t("fields")} </th>
                      <th style={{ width: "50%" }}> {t("excelHeader")} </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(fieldMappings).map((property) => (
                      <tr key={property}>
                        <td>{processFieldName(property)} </td>
                        <td>
                          <Select
                            allowClear
                            value={fieldMappings[property]}
                            onChange={(value) =>
                              handleMappingChange(property, value)
                            }
                            options={getAvailableOptions(property)}
                            style={{ width: "100%" }}
                            dropdownMatchSelectWidth={false}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Row>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Import;
