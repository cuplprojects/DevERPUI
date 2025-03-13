import axios from 'axios'
import React, { useEffect, useState } from 'react'
import API from '../../CustomHooks/MasterApiHooks/api'
import { Select, Form, Upload, Button, Row, Col } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useStore } from 'zustand'
import themeStore from '../../store/themeStore'
import * as XLSX from "xlsx";
const Import = () => {
    const [form] = Form.useForm();
    const [group, setGroup] = useState([]);
    const [columns, setColumns] = useState([
        "TypeId", "NEPCode", "PrivateCode", "SubjectId", "PaperNumber", "PaperTitle",
        "MaxMarks", "Duration", "LanguageId", "CourseId", "ExamTypeId"
    ]);
    const [groupId, setGroupId] = useState(null); // Store selected group ID
    const [fileList, setFileList] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fieldMappings, setFieldMappings] = useState({});
    const [headers, setHeaders] = useState([]);
    const [isProcessingFile, setIsProcessingFile] = useState(false);
    const [showTable, setShowTable] = useState(false);
    const [showBtn, setShowBtn] = useState(true);
    const [mappedData, setMappedData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showMappingFields, setShowMappingFields] = useState(false);
    const { t } = useTranslation();
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

    useEffect(() => {
        const getGroups = async () => {
            try {
                const response = await API.get('/Groups');
                setGroup(response.data);
            } catch (error) {
                console.error(t('failedtofetchGroup'), error);
            }
        };
        getGroups();
    }, []);

    const handleGroupSelect = (value) => {
        setGroupId(value);
    };

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
                    console.error(t("noValidDataFoundInFile"));
                    setIsProcessingFile(false);
                    return;
                }

                // Extract headers and set them for mapping
                const excelHeaders = filteredData[0];
                setHeaders(excelHeaders);

                setShowMappingFields(true);
                setShowBtn(true);

                // Dynamically build the field mappings based on multiple headers per field
                const autoMappings = {};
                columns.forEach((col) => {
                    const matchingHeaders = excelHeaders.filter(
                        (header) => header?.toLowerCase() === col?.toLowerCase()
                    );
                    autoMappings[col] = matchingHeaders.length > 0 ? matchingHeaders : [];
                });

                setFieldMappings(autoMappings);
                console.log("Field Mappings: ", autoMappings);
            } catch (err) {
                console.error("File processing error:", err);
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
                    console.error("The first row (headers) is not an array.", jsonData[0]);
                    resolve([]);
                    return;
                }
    
                const rows = jsonData.slice(1);
                const mappedData = [];
    
                // For each row, map the data
                for (let row of rows) {
                    const rowData = {};
    
                    // Iterate over each field in fieldMappings
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
    
                    // Fetch courseId based on course name
                    try {
                        let courseId = await getCourseIdByName(rowData['CourseId']);
                        rowData['CourseId'] = courseId; // Set courseId to the row data
                    } catch (err) {
                        console.error("Error fetching or inserting courseId:", err);
                        rowData['CourseId'] = 0; // Fallback if no course is found or insertion fails
                    }

                    try {
                        let subjectId = await getSubjectIdByName(rowData['SubjectId']);
                        rowData['SubjectId'] = subjectId; // Set courseId to the row data
                    } catch (err) {
                        console.error("Error fetching or inserting Subject:", err);
                        rowData['SubjectId'] = 0; // Fallback if no course is found or insertion fails
                    }
                    

                    try {
                        let typeId = await getTypeIdByName(rowData['TypeId']);
                        rowData['TypeId'] = typeId; // Set courseId to the row data
                    } catch (err) {
                        console.error("Error fetching or inserting TypeId:", err);
                        rowData['TypeId'] = 0; // Fallback if no course is found or insertion fails
                    }

                    try {
                        let languageId = await getLanguageIdByName(rowData['LanguageId']);
                        rowData['LanguageId'] = languageId; // Set courseId to the row data
                    } catch (err) {
                        console.error("Error fetching or inserting Language:", err);
                        rowData['LanguageId'] = 0; // Fallback if no course is found or insertion fails
                    }

                    try {
                        let examtypeId = await getExamTypeIdByName(rowData['ExamTypeId']);
                        rowData['ExamTypeId'] = examtypeId; // Set courseId to the row data
                    } catch (err) {
                        console.error("Error fetching or inserting ExamTypeId:", err);
                        rowData['ExamTypeId'] = 0; // Fallback if no course is found or insertion fails
                    }
                    
    
                    rowData["groupId"] = groupId; // Add group ID
                    mappedData.push(rowData);
                }
    
                setMappedData(mappedData);
                resolve(mappedData);
            };
    
            reader.readAsArrayBuffer(selectedFile);
        });
    };

    const getCourseIdByName = async (courseName) => {
        try {
            // Attempt to get the courseId based on course name
            const courseResponse = await API.get(`Course?courseName=${courseName}`);
            let courseId = courseResponse.data;
    
            if (!courseId) {
                // If course not found, insert a new course
                console.log("Course not found. Inserting new course.");
                const newCourseResponse = await API.post('/Course', {
                    CourseName: courseName,
                });
                courseId = newCourseResponse.data.courseId; // Get the ID of the newly created course
            }
    
            return courseId;
        } catch (err) {
            console.error("Error in fetching or inserting course:", err);
            throw err; // Propagate the error
        }
    };

    const getSubjectIdByName = async (subject) => {
        try {
            // Attempt to get the courseId based on course name
            const subjectResponse = await API.get(`Subject?subject=${subject}`);
            let subjectId = subjectResponse.data;
    
            if (!subjectId) {
                // If course not found, insert a new course
                console.log("subject not found. Inserting new subject.");
                const newsubjectResponse = await API.post('/Subject', {
                    SubjectName: subject,
                });
                subjectId = newsubjectResponse.data.subjectId; // Get the ID of the newly created course
            }
    
            return subjectId;
        } catch (err) {
            console.error("Error in fetching or inserting course:", err);
            throw err; // Propagate the error
        }
    };
    
    const getTypeIdByName = async (type) => {
        try {
            // Attempt to get the courseId based on course name
            const typeResponse = await API.get(`PaperTypes/Type?type=${type}`);
            let typeId = typeResponse.data;
    
            if (!typeId) {
                // If course not found, insert a new course
                console.log("Type not found. Inserting new type.");
                const newTypeResponse = await API.post("Course", {
                    types: type,
                });
                typeId = newTypeResponse.data.typeId; // Get the ID of the newly created course
            }
    
            return typeId;
        } catch (err) {
            console.error("Error in fetching or inserting type:", err);
            throw err; // Propagate the error
        }
    };

    const getLanguageIdByName = async (language) => {
        try {
            // Attempt to get the courseId based on course name
            const languageResponse = await API.get(`Language/Language?language=${language}`);
            let languageId = languageResponse.data;
    
            if (!languageId) {
                // If course not found, insert a new course
                console.log("Type not found. Inserting new type.");
                const newLanguageResponse = await API.post("/Language", {
                    languages: language,
                });
                languageId = newLanguageResponse.data.languageId; // Get the ID of the newly created course
            }
    
            return languageId;
        } catch (err) {
            console.error("Error in fetching or inserting type:", err);
            throw err; // Propagate the error
        }
    };

    const getExamTypeIdByName = async (examtype) => {
        try {
            // Attempt to get the courseId based on course name
            const examtypeResponse = await API.get(`ExamType/ExamType?examtype=${examtype}`);
            let examtypeId = examtypeResponse.data;
    
            if (!examtypeId) {
                // If course not found, insert a new course
                console.log("Type not found. Inserting new type.");
                const newexamtypeResponse = await API.post("/ExamType", {
                    typeName: examtype,
                });
                examtypeId = newexamtypeResponse.data.examtypeId; // Get the ID of the newly created course
            }
    
            return examtypeId;
        } catch (err) {
            console.error("Error in fetching or inserting type:", err);
            throw err; // Propagate the error
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
                setIsLoading(false);
                return;
            }
    
            const finalPayload = mappedData.map((item) => ({
                groupId: item.groupId || 0, // Ensure groupId is passed
                typeId: item.TypeId || 0,
                nepCode: String(item.NEPCode || "string"),
                privateCode: item.PrivateCode || "string",
                subjectId: item.SubjectId || 0,
                paperNumber: item.PaperNumber || "string",
                paperTitle: item.PaperTitle || "string",
                maxMarks: item.MaxMarks || 0,
                duration: item.Duration || "string",
                languageId: item.LanguageId || 0,
                customizedField1: item.customizedField1 || "string",
                customizedField2: item.customizedField2 || "string",
                customizedField3: item.customizedField3 || "string",
                courseId: item.CourseId || 0, // Now we use courseId instead of courseName
                examTypeId: item.ExamTypeId || 0
            }));
    
            const response = await API.post("/QPMasters", finalPayload, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
    
            console.log("Upload Success:", response.data);
            setMappedData(finalPayload); // Update state with the final payload
            console.log(t("quantitySheetUploadedSuccessfully"));
        } catch (error) {
            console.error(t("failedToUploadQuantitySheet"));
        } finally {
            setIsLoading(false);
        }
    };
    

    const handleMappingChange = (property, value) => {
        setFieldMappings((prevMappings) => {
            return {
                ...prevMappings,
                [property]: value,
            };
        });
    };
    

    return (
        <div>
            <h4>Import Excel</h4>
            <h6>Select Group</h6>

            <Form layout="vertical" form={form}>
                <Form.Item
                    name="file"
                    rules={[{ required: true, message: t("pleaseSelectAFile") }]}
                >
                    <div className="d-flex align-items-center">
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
                                <span className="d-none d-sm-inline">
                                    {t("selectFile")}
                                </span>
                                <span className="d-inline d-sm-none">
                                    {t("upload")}
                                </span>
                            </Button>
                        </Upload>
                    </div>
                </Form.Item>

                {fileList.length > 0 && (
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

                {showMappingFields && headers.length > 0 && (
                    <Row className="mt-2 mb-2">
                        <Col lg={12}>
                            <table className="table table-bordered table-striped">
                                <thead>
                                    <tr>
                                        <th style={{ width: "50%" }}> {t("fields")} </th>
                                        <th style={{ width: "50%" }}> {t("excelHeader")} </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.keys(fieldMappings).map((property) => (
                                        <tr key={property}>
                                            <td>{property} </td>
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
                        </Col>
                    </Row>
                )}
            </Form>

            <Select
                className="w-25"
                placeholder={t("selectGroup")}
                onChange={handleGroupSelect}
            >
                {group.map((gr) => (
                    <Select.Option key={gr.id} value={gr.id}>
                        {gr.name}
                    </Select.Option>
                ))}
            </Select>
        </div>
    );
};

export default Import;
