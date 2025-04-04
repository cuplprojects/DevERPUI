import React, { useEffect, useState } from "react";
import { Form, Upload, Button, Select, message, Spin, Menu, Modal } from "antd";
import { Row, Col } from "react-bootstrap";
import { UploadOutlined, CloseOutlined, DeleteOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import themeStore from "../store/themeStore";
import { useStore } from "zustand";
import ViewQuantitySheet from "./../pages/ViewQuantitySheet";
import { useParams } from "react-router-dom";
import API from "../CustomHooks/MasterApiHooks/api";
import { useTranslation } from "react-i18next";
import { decrypt } from "./../Security/Security";
import { IoMdEye } from "react-icons/io";
import { success, error, warning } from "./../CustomHooks/Services/AlertMessageService";
import UpdateQuantitySheet from "./UpdateQuantitySheet";
// Helper function to convert Excel date number to JS Date
const convertExcelDate = (excelDate) => {
  if (!excelDate) return null;
  // Check if excelDate is a number (Excel serial date)
  if (!isNaN(excelDate)) {
    // Excel dates are number of days since 1/1/1900
    return new Date((excelDate - 25569) * 86400 * 1000);
  }
  // If it's already a date string, parse it
  return new Date(excelDate);
};

const QtySheetUpload = () => {
  const { t } = useTranslation();
  const { encryptedProjectId } = useParams();
  const projectId = decrypt(encryptedProjectId);
  const { getCssClasses } = useStore(themeStore);
  const cssClasses = getCssClasses();
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
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [columns, setColumns] = useState([]);
  const [form] = Form.useForm();
  const [headers, setHeaders] = useState([]);
  const [fieldMappings, setFieldMappings] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [showMappingFields, setShowMappingFields] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [showBtn, setShowBtn] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [lots, setLots] = useState([]);
  const [selectedLotNo, setSelectedLotNo] = useState(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [dispatchedLots, setDispatchedLots] = useState([]);
  const [isLotsFetched, setIsLotsFetched] = useState(false);
  const [existingLots, setExistingLots] = useState([]); // To hold the existing lots in the system
  const [mappedData, setMappeddata] = useState([]);
  const [unreleasedLots, setUnReleasedLots] = useState([]);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showConfigDisclaimer, setShowConfigDisclaimer] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [showDeleteButton, setShowDeleteButton] = useState(false);
  const [hasUploadedFile, setHasUploadedFile] = useState(false);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    // Show config disclaimer only when no lots are found
    if (!isLotsFetched && !showDisclaimer) {
      setShowConfigDisclaimer(true);
    } else {
      setShowConfigDisclaimer(false);
    }
  }, [isLotsFetched, showDisclaimer]);

  useEffect(() => {
    const checkTransactionExistence = async () => {
      if (selectedLotNo && showTable) {
        // Check if selectedLotNo is not null
        try {
          // const response = await API.get(`/Transactions/exists/${projectId}`);
          const response = await API.get(
            `/Transactions/exists/${projectId}?LotNo=${selectedLotNo}`
          );
          const hasDispatched = response.data;
          // Only show delete button if there are no transactions AND a file has been uploaded
          setShowDeleteButton(
            !hasDispatched && (hasUploadedFile || isLotsFetched)
          );
        } catch (error) {
          console.error("Failed to check transaction existence:", error);
          setShowDeleteButton(true);
        }
      } else {
        setShowDeleteButton(false); // Reset delete button visibility if selectedLotNo is null
      }
    };

    checkTransactionExistence();
  }, [hasUploadedFile, isLotsFetched, selectedLotNo, showTable]); // Run when hasUploadedFile changes

  useEffect(() => {
    const fetchProjectName = async () => {
      try {
        const response = await API.get(`/Project/${projectId}`);
        setProjectName(response.data.name);
      } catch (error) {
        console.error(t("failedToFetchProjectName"), error);
      }
    };

    fetchProjectName();
  }, [projectId, t]);

  useEffect(() => {
    const fetchDispatchedLots = async () => {
      try {
        if (projectId && selectedLotNo) {
          const response = await API.get(
            `/Dispatch/project/${projectId}/lot/${selectedLotNo}`
          );
          const dispatchedLotStatus = response.data.map(
            (dispatch) => dispatch.lotNo
          );
          setDispatchedLots(dispatchedLotStatus);
        }
      } catch (error) {
        console.error("Failed to fetch dispatched lots status:", error);
      }
    };

    fetchDispatchedLots();
  }, [projectId, selectedLotNo]);

  useEffect(() => {
    const fetchUnReleasedLots = async () => {
      try {
        const response = await API.get(
          `/QuantitySheet/UnReleasedLots?ProjectId=${projectId}`
        );
        setUnReleasedLots(response.data);
      } catch (error) {
        console.error("Failed to fetch dispatched lots status:", error);
      }
    };

    fetchUnReleasedLots();
  }, [projectId]);

  const handleRightClick = (e, lotNo) => {
    // Only allow right click if the lot is in unreleasedLots
    if (unreleasedLots.includes(lotNo)) {
      e.preventDefault(); // Prevent default context menu
      setSelectedLotNo(lotNo);
      setContextMenuPosition({ x: e.clientX, y: e.clientY });
      setIsDropdownVisible(true);
    }
  };

  // Handle clicking outside context menu
  useEffect(() => {
    const handleClickOutside = () => {
      setIsDropdownVisible(false);
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const releaseForProduction = async () => {
    try {
      const lotNo = selectedLotNo;

      // Using axios to make the POST request
      const response = await API.post("/QuantitySheet/ReleaseForProduction", {
        lotNo: lotNo,
        projectId: projectId,
      });

      // Check if the response was successful
      if (response.status === 200) {
        success(`${t("lot")} ${lotNo} ${t("releasedForProduction")}`);
      } else {
        error(t("failedToReleaseLot"));
      }
    } catch (error) {
      console.error("Error releasing lot:", error);
      error(t("errorReleasinglot"));
    }
  };


  const handleUpload = async () => {
    setIsLoading(true);
    setShowMappingFields(false)
    let mappedData;
    try {
      mappedData = await createMappedData();
      if (!mappedData || !Array.isArray(mappedData) || mappedData.length === 0) {
        error(t("mappedDataInvalidOrEmpty"));
        setUploading(false);
        resetState();
        return;
      }

      const finalPayload = mappedData.map((item) => {
        const examDate = item.ExamDate ? convertExcelDate(item.ExamDate) : null;
        const lotNo = String(item.LotNo || "").trim();
        const catchNo = String(item.CatchNo || "").trim();
        const innerEnvelope = String(item.InnerEnvelope || "").trim();
        console.log(projectId)
        return {
          catchNo: item.CatchNo || "",
          paperNumber: item.PaperNumber || "",
          paperTitle: item.PaperTitle || "",
          maxMarks: item.MaxMarks || 0,
          duration: item.Duration || "",
          courseId: item.CourseId || 0,
          subjectId: item.SubjectId || 0,
          innerEnvelope: item.InnerEnvelope || "",
          outerEnvelope: item.OuterEnvelope || 0,
          examDate: examDate ? examDate.toISOString() : "",
          examTime: item.ExamTime || "",
          lotNo: item.LotNo || "",
          quantity: Number(item.Quantity) || 0,
          percentageCatch: Number(item.percentageCatch) || 0,
          projectId: Number(projectId),
          processId: [0],
          status: 0,
          qpId: 0,
          mssStatus: 0,
          ttfStatus: 0,
          pages: item.Pages || 0,
          stopCatch: 0,
          languageId: item.LanguageId || [0],
          examtypeId: item.ExamTypeId || 0,
          nepCode: item.NEPCode || "",
          privateCode: item.PrivateCode || "",
        };
      });

      const response = await API.post("/QuantitySheet", finalPayload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      setDataSource(finalPayload);
      success(t("quantitySheetUpdatedSuccessfully"));
      fetchLots();
      setHasUploadedFile(true);
      resetState();
    } catch (err) {
      error(t("failedToUploadQuantitySheet"));
      console.error(t("uploadFailed"), err.response?.data || err.message);
    } finally {
      setIsLoading(false);
    }
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
          console.error("The first row (headers) is not an array.", jsonData[0]);
          resolve([]);
          return;
        }
        const rows = jsonData.slice(1);

        let mappedData = [];

        for (let row of rows) {
          const rowData = {};

          for (let property in fieldMappings) {
            let headers = fieldMappings[property];
            if (!Array.isArray(headers)) headers = [headers];

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
                if (["LotNo", "CatchNo", "InnerEnvelope"].includes(property)) {
                  value = String(value).trim();
                  console.log(`${property} value before sending:`, value, `Type:`, typeof value);
                }
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
            rowData["SubjectId"] = await getSubjectIdByName(rowData["SubjectId"]);
          } catch (err) {
            console.error("Error fetching or inserting Subject:", err);
            rowData["SubjectId"] = 0;
          }

          try {
            rowData["TypeId"] = await getTypeIdByName(rowData["TypeId"]);
          } catch (err) {
            console.error("Error fetching or inserting TypeId:", err);
            rowData["TypeId"] = 0;
          }

          try {
            rowData["LanguageId"] = await getLanguageIdByName(rowData["LanguageId"]);
          } catch (err) {
            console.error("Error fetching or inserting Language:", err);
            rowData["LanguageId"] = 0;
          }

          try {
            rowData["ExamTypeId"] = await getExamTypeIdByName(rowData["ExamTypeId"]);
          } catch (err) {
            console.error("Error fetching or inserting ExamTypeId:", err);
            rowData["ExamTypeId"] = 0;
          }

          rowData["projectId"] = projectId;
          rowData["percentageCatch"] = "0";

          mappedData.push(rowData);
        }
        resolve(mappedData);
      };
      reader.readAsArrayBuffer(selectedFile);
    });
  };

  const getColumns = async () => {
    try {
      const response = await API.get("/QuantitySheet/Columns");
      setColumns(response.data);
    } catch (error) {
      console.error(t("failedToFetchColumns"), error);
    }
  };

  useEffect(() => {
    getColumns();
    fetchLots();
  }, []);

  const handleFileUpload = (file) => {
    setFileList([file]);
    setSelectedFile(file);
    setIsProcessingFile(true);
    setShowTable(false);
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
          error(t("noValidDataFoundInFile"));
          setIsProcessingFile(false);
          return;
        }

        const excelHeaders = filteredData[0];
        setHeaders(excelHeaders);

        setShowMappingFields(true);
        setShowDisclaimer(true);

        const autoMappings = {};
        columns.forEach((col) => {
          const matchingHeaders = excelHeaders.filter(
            (header) => header?.toLowerCase() === col?.toLowerCase()
          );
          autoMappings[col] = matchingHeaders.length > 0 ? matchingHeaders : [];
        });
        setFieldMappings(autoMappings);
        success(t("fileProcessedSuccessfully"));
      } catch (err) {
        error(t("errorProcessingFile"));
        console.error("File processing error:", err);
      } finally {
        setIsProcessingFile(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleMappingChange = (property, value) => {
    setFieldMappings((prev) => {
      const newMappings = { ...prev };
      newMappings[property] = value || [];
      return newMappings;
    });
  };

  const getAvailableOptions = (property) => {
    const selectedValues = Object.values(fieldMappings).flat();
    return headers
      .filter((header) => !selectedValues.includes(header))
      .map((header) => ({ label: header, value: header }));
  };

  const resetState = () => {
    setFieldMappings({});
    setHeaders([]);
    setShowMappingFields(false);
    setSelectedFile(null);
    setFileList([]);
    setShowTable(false);
    setShowDisclaimer(false);
    setIsUpdateMode(false);
  };

  const fetchLots = async () => {
    try {
      const response = await API.get(`/QuantitySheet/Lots?ProjectId=${projectId}`);
      const lotsData = response.data;
      setLots(lotsData);
      setExistingLots(lotsData);
      setIsLotsFetched(lotsData.length > 0);
    } catch (err) {
      error(t("failedToFetchLots"));
      console.error(t("failedToFetchLots"), err);
    }
  };
  const handleDownloadTemplate = () => {
    const link = document.createElement("a");
    link.href = "path_to_your_template_file.xlsx"; // local QS file
    link.download = "QtySheet-Input.xlsx";
    link.click();
  };

  const handleLotClick = (lotNo) => {
    if (selectedLotNo === lotNo) {
      setShowTable(!showTable); // Toggle table visibility
      setShowBtn(!showBtn);
    } else {
      setSelectedLotNo(lotNo);
      setShowTable(true); // Show table for the selected lot
      setShowBtn(true);
    }
  };

  const menu = (
    <Menu
      style={{
        position: "fixed",
        top: contextMenuPosition.y,
        left: contextMenuPosition.x,
        zIndex: 1000,
        outline: "2px solid white",
      }}
      className={`${customLight} rounded-3 border-3 ${customDarkBorder} ${customDarkText} `}
    >
      <Menu.Item
        key="1"
        onClick={releaseForProduction}
        className={`w-100 rounded-3 `}
      >
        {t("releaseForProduction")}
      </Menu.Item>
    </Menu>
  );

  const handleDelete = async () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setIsLoading(true);
    try {
      await API.delete(`/QuantitySheet/DeleteByProjectId/${projectId}?LotNo=${selectedLotNo}`);
      setShowTable(false)
      fetchLots();
      setHasUploadedFile(false);
      setShowDeleteButton(true);
      success(t("quantitySheetDeletedSuccessfully"));
    } catch (error) {
      console.error("Failed to delete quantity sheet:", error);
      error(t("failedToDeleteQuantitySheet"));
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const resetEditingMode = () => {
    setIsUpdateMode(false);
    resetState();
    setShowDeleteButton(true);
    setShowTable(false);
    setShowBtn(false);
    setSelectedLotNo(null);
    setIsLotsFetched(true); // Keep the initial state
    fetchLots();
  };
  const getCourseIdByName = async (courseName) => {
    console.log("Course Name being passed to API:", courseName);
    try {
      const courseResponse = await API.get(`Course/GetCourse?courseName=${courseName}`);
      let courseId = courseResponse.data;
      if (!courseId) {
        const newCourseResponse = await API.post("/Course", { CourseName: courseName });
        courseId = newCourseResponse.data.courseId;
      }
      return courseId;
    } catch (err) {
      console.error("Error in fetching or inserting course:", err);
      throw err;
    }
  };

  const getSubjectIdByName = async (subject) => {
    try {
      const subjectResponse = await API.get(`Subject/Subject?subject=${subject}`);
      let subjectId = subjectResponse.data;
      if (!subjectId) {
        const newsubjectResponse = await API.post("/Subject", { SubjectName: subject });
        subjectId = newsubjectResponse.data.subjectId;
      }
      return subjectId;
    } catch (err) {
      console.error("Error in fetching or inserting subject:", err);
      throw err;
    }
  };

  const getTypeIdByName = async (type) => {
    try {
      const typeResponse = await API.get(`PaperTypes/Type?type=${type}`);
      let typeId = typeResponse.data;
      if (!typeId) {
        console.error("Type does not exist", type);
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
      const languageResponse = await API.get(`Language/Language?language=${encodedLanguage}`);
      let languageId = languageResponse.data;
      if (!languageId) {
        const newLanguageResponse = await API.post("/Language", { language: language });
        languageId = newLanguageResponse.data.languageId;
      }
      return languageId;
    } catch (err) {
      console.error("Error in fetching or inserting language:", err);
      throw err;
    }
  };

  const getExamTypeIdByName = async (examtype) => {
    try {
      const examtypeResponse = await API.get(`ExamType/ExamType?examtype=${examtype}`);
      let examtypeId = examtypeResponse.data;
      if (!examtypeId) {
        console.error("ExamType does not exist", examtype);
      }
      return examtypeId;
    } catch (err) {
      console.error("Error in fetching or inserting exam type:", err);
      throw err;
    }
  };

  return (
    <div className={`container-fluid ${customDarkText} rounded shadow-lg ${customLight} ${customLightBorder}`}>
      <Row className="mt-2 mb-1">
        <Col lg={12}>
          <div className="text-center p-2 d-flex justify-content-around align-items-center">
            <h4 className={`${customDarkText} fw-bold m-0`}>
              {t("Quantity Sheet")}
            </h4>
            <h5 className={`${customDarkText} custom-zoom-btn m-0`}>
              {projectName}
            </h5>
          </div>
          <hr className="mt-2 mb-1" />
        </Col>
      </Row>

      {showConfigDisclaimer && (
        <Row className="mb-3">
          <Col lg={8} className="mx-auto">
            <div className="alert alert-warning text-center p-1">
              {t(
                "Warning: Once you upload the quantity sheet, project configuration cannot be changed."
              )}
            </div>
          </Col>
        </Row>
      )}

      <Row className="mb-2">
        <Col lg={12}>
          <Form layout="vertical">
            <Form.Item
              name="file"
              rules={[{ required: true, message: t("pleaseSelectAFile") }]}
            >
              <div className="d-flex align-items-center">
                {!isLotsFetched ? (
                  <Upload
                    onRemove={(file) => {
                      const index = fileList.indexOf(file);
                      const newFileList = fileList.slice();
                      newFileList.splice(index, 1);
                      setFileList(newFileList);
                    }}
                    beforeUpload={handleFileUpload}
                    fileList={fileList}
                    className="flex-grow-1"
                  >
                    <Button className="fs-4 custom-zoom-btn w-100 d-flex align-items-center p-2">
                      <UploadOutlined />
                      <span className="d-none d-sm-inline">{t("selectFile")}</span>
                      <span className="d-inline d-sm-none">{t("upload")}</span>
                    </Button>
                  </Upload>
                ) : (
                  <Button
                    className={customBtn}
                    type="primary"
                    onClick={() => {
                      setIsLotsFetched(false);
                      setShowTable(false);
                      setShowBtn(false);
                    }}
                  >
                    {t("updateFile")}
                  </Button>
                )}
                {showDeleteButton && (
                  <Button
                    type="primary"
                    danger
                    onClick={handleDelete}
                    className="ms-2"
                  >
                    <DeleteOutlined />
                    <span>{t("deleteFile")}</span>
                  </Button>
                )}
              </div>
            </Form.Item>

            {fileList.length > 0 && showDisclaimer && (
              <Form.Item>
                <Button
                  className={customBtn}
                  type="primary"
                  onClick={handleUpload}
                  loading={isLoading}
                >
                  {t("uploadLots")}
                </Button>
              </Form.Item>
            )}
            <Form.Item>
              <div className="d-flex flex-wrap gap-2">
                {lots.map((lotNo, index) => {
                  const isDispatched = dispatchedLots.includes(lotNo);
                  return (
                    <Button
                      key={index}
                      className={`${
                        selectedLotNo === lotNo
                          ? "bg-white text-dark border-dark"
                          : customBtn
                      } d-flex align-items-center justify-content-center p-2`}
                      type="primary"
                      onClick={() => handleLotClick(lotNo)}
                      onContextMenu={(e) => handleRightClick(e, lotNo)}
                    >
                      {t("lot")} - {lotNo}{" "}
                      {isDispatched ? (
                        <BsCheckCircleFill className="ms-1 text-success" />
                      ) : (
                        <IoMdEye className="ms-1" />
                      )}
                    </Button>
                  );
                })}
              </div>
            </Form.Item>
          </Form>
          {!showTable && (
            <div className="d-flex justify-content-end mb-2">
              <Button
                className={`${customBtn} d-flex align-items-center gap-2`}
                type="primary"
                onClick={resetEditingMode}
              >
                <CloseOutlined />
              </Button>
            </div>
          )}
          {isUpdateMode && (
            <UpdateQuantitySheet
              projectId={projectId}
              onClose={() => {
                setIsUpdateMode(false);
                setIsLotsFetched(true);
                resetState();
                setShowDeleteButton(true);
                setShowTable(false);
                setShowBtn(false);
                setSelectedLotNo(null);
                fetchLots();
              }}
            />
          )}
          <ViewQuantitySheet
            project={projectId}
            selectedLotNo={selectedLotNo}
            showBtn={showBtn}
            showTable={showTable}
            lots={lots}
          />
        </Col>
      </Row>
      {isDropdownVisible && menu}

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteConfirm}
        onHide={() => setShowDeleteConfirm(false)}
      >
        <Modal.Header className={`${customDark} ${customLightText}`}>
          <Modal.Title>
            {t("confirmDelete")} {`->`} {projectName}{" "}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className={`${customLight}`}>
          {t("areYouSureDeleteQuantitySheet")}
        </Modal.Body>
        <Modal.Footer className={`${customDark}`}>
          <Button
            variant="secondary"
            className={`${customBtn}`}
            onClick={() => setShowDeleteConfirm(false)}
          >
            {t("cancel")}
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            {t("delete")}
          </Button>
        </Modal.Footer>
      </Modal>
      {isProcessingFile && (
        <div className="text-center my-3">
          <Spin size="large" tip="Processing file..." />
        </div>
      )}
      {showDisclaimer && (
        <div className="text-danger mb-3 fw-bold text-center">
          {t("mapTheExcelHeaderWithTheirRespectedDefinedFields")}
        </div>
      )}
      {showMappingFields && headers.length > 0 && (
        <Row className="mt-2 mb-2">
          <Col lg={12}>
            <table className="table table-bordered table-striped">
              <thead>
                <tr>
                  <th style={{ width: "50%" }}>{t("fields")}</th>
                  <th style={{ width: "50%" }}>{t("excelHeader")}</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(fieldMappings).map((property) => (
                  <tr key={property}>
                    <td>{property}</td>
                    <td>
                      <Select
                        mode={property === "InnerEnvelope" ? "multiple" : "default"}
                        allowClear
                        value={fieldMappings[property]}
                        onChange={(value) => handleMappingChange(property, value)}
                        options={getAvailableOptions(property)}
                        style={{ width: "100%" }}
                        dropdownMatchSelectWidth={false}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Col>
        </Row>
      )}
      {isLoading && <Spin size="large" tip="Loading..." />}
    </div>
  );
};


export default QtySheetUpload;
