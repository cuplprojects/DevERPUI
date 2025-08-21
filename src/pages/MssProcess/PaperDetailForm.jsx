import React, { useEffect, useState } from "react";
import { Row, Col, Form, Input, DatePicker, Select, Button, message, Card, Typography, Divider, Space, InputNumber } from "antd";
import moment from "moment";
import API from "../../CustomHooks/MasterApiHooks/api";

const { Option } = Select;

const structureTemplates = {
  1: `B.A./B.Com./B.Sc./B.H.Sc./BBA/BSC/BTM(First Year)
Examination, March-2025
Open Elective
Paper: S1-COAP2G
M.S. Office`,
  2: `B.A./B.Com./B.Sc./B.H.Sc./BBA/BSC/BTM(Second Year)
Examination, March-2025
Core Course
Paper: S2-COAP2G
Advanced M.S. Office`,
  3: `B.A./B.Com./B.Sc./B.H.Sc./BBA/BSC/BTM(Third Year)
Examination, March-2025
Elective Course
Paper: S3-COAP2G
Programming Fundamentals`,
};

/*
  PaperDetailForm (AntD-only layout)
  - item: existing paper object (if any)
  - cssClasses: optional styling classes (kept but optional)
  - isNewPaper: if true -> all fields editable; otherwise top summary is read-only
*/
const PaperDetailForm = ({
  item,
  cssClasses = [],
  projectId,
  onCancel,
  onImported,
  isNewPaper = false,
}) => {
  const [form] = Form.useForm();
  const [courses, setCourses] = useState([]);
  const [subject, setSubject] = useState([]);
  const [examType, setExamType] = useState([]);
  const [language, setLanguage] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [saving, setSaving] = useState(false);

  // inline UI styles for pleasant look
  const labelTextStyle = {
    fontSize: 12,
    color: "black",
    fontWeight: 500,
    whiteSpace: "normal",
    wordBreak: "break-word",
    overflowWrap: "anywhere",
    textOverflow: "unset",
    display: "block",
    lineHeight: 1.2,
  };
  const controlStyle = { borderRadius: 6 };
  const fullWidthControlStyle = { borderRadius: 6, width: "100%" };
  const cardStyle = { borderRadius: 10, boxShadow: "0 2px 10px rgba(0,0,0,0.06)" };
  const sectionTitleStyle = { color: "black", marginBottom: 8 };
  const quantityTitleStyle = { color: "#1f1f1f", marginTop: 8, marginBottom: 8 };
  const sectionBoxStyle = { background: "#fafafa", border: "1px solid #f0f0f0", borderRadius: 8, padding: 12, marginBottom: 12 };
  const renderLabel = (text) => <span style={labelTextStyle}>{text}</span>;

  // optional styling tokens if provided
  const [
    customDark,
    customMid,
    customLight,
    customBtn,
  ] = cssClasses;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, subjectRes, examTypeRes, languageRes, projectsRes] = await Promise.all([
          API.get("/Course"),
          API.get("/Subject"),
          API.get("/ExamType"),
          API.get("/Language"),
          API.get("/Project"),
        ]);
        setCourses(courseRes.data || []);
        setSubject(subjectRes.data || []);
        setExamType(examTypeRes.data || []);
        setLanguage(languageRes.data || []);
        // Directly populate StructureOfPaper from Project API by projectId
        try {
          const list = projectsRes.data || [];
          const proj = list.find((p) => p.projectId === projectId);
          const structure = (proj && typeof proj.structureOfPaper === "string") ? proj.structureOfPaper : "";
          if (structure) {
            form.setFieldsValue({ StructureOfPaper: structure });
          }
        } catch (e) {
          // ignore
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    };

    fetchData();

    // set initial form values (safe defaults)
    if (item) {
      if (isNewPaper) {
        form.setFieldsValue({
          QPId: 0,
          Quantity: 0,
          CourseId: "",
          SubjectId: 0,
          CatchNo: "",
          InnerEnvelope: "",
          OuterEnvelope: 0,
          PaperTitle: "",
          PaperNumber: "",
          ExamDate: null,
          ExamTime: "",
          MaxMarks: 0,
          Duration: "",
          LanguageId: [],
          ExamTypeId: 0,
          NEPCode: "",
          UniqueCode: "",
          StructureOfPaper: "",
          LotNo: "",
          Pages: 0,
        });
      } else {
        form.setFieldsValue({
          QPId: item.qpMasterId,
          Quantity: item.quantity ?? 0.0,
          CourseId: item.courseId ?? item.courseName ?? "",
          SubjectId: item.subjectId ?? 0,
          CatchNo: item.catchNo ?? "",
          InnerEnvelope: item.innerEnvelope ?? "",
          OuterEnvelope: item.outerEnvelope ?? 0,
          PaperTitle: item.paperTitle || "",
          PaperNumber: item.paperNumber || "",
          ExamDate: item.examDate ? moment(item.examDate) : null,
          ExamTime: item.examTime ?? "",
          MaxMarks: item.maxMarks ?? 0,
          Duration: item.duration ?? "",
          LanguageId: item.languageIds ?? [],
          ExamTypeId: item.examTypeId ?? item.examTypeName ?? 0,
          NEPCode: item.nepCode ?? "",
          UniqueCode: item.uniqueCode ?? "",
          StructureOfPaper: item.structureOfPaper ?? "",
          LotNo: item.lotNo ?? "",
          Pages: item.pages ?? 0,
        });
        // if there's an existing structure, try to find which template it matches (optional)
        const matchedKey = Object.keys(structureTemplates).find(
          (k) => structureTemplates[k] === item.structureOfPaper
        );
        if (matchedKey) setSelectedTemplate(matchedKey);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, isNewPaper, form]);

  const resolveCourseId = (values) => {
    // Accept numeric courseId, or fallback to item.courseId, or search by courseName
    let courseId = 0;
    if (typeof values.CourseId === "number" && values.CourseId !== 0) {
      courseId = values.CourseId;
    } else if (values.CourseId) {
      // maybe values.CourseId is a name (legacy), try to find
      const found = courses.find(
        (c) =>
          c.courseId === values.CourseId ||
          c.courseName === values.CourseId ||
          String(c.courseId) === String(values.CourseId)
      );
      courseId = found ? found.courseId : 0;
    } else if (item?.courseId) {
      courseId = item.courseId;
    } else if (item?.courseName) {
      const found = courses.find((c) => c.courseName === item.courseName);
      courseId = found ? found.courseId : 0;
    }
    return courseId;
  };

  const resolveExamTypeId = (values) => {
    if (typeof values.ExamTypeId === "number" && values.ExamTypeId !== 0) return values.ExamTypeId;
    if (item?.examTypeId) return item.examTypeId;
    // fallback: try by name
    const found = examType.find(
      (e) => e.typeName === values.ExamTypeId || e.typeName === item?.examTypeName
    );
    return found ? found.examTypeId : 0;
  };

  const buildPayload = (values, mssStatusFlag = 1) => {
    const courseId = resolveCourseId(values);
    const examTypeId = resolveExamTypeId(values);
    const subjectId = values.SubjectId ?? item?.subjectId ?? 0;

    return [
      {
        paperNumber: values.PaperNumber || item?.paperNumber || "",
        paperTitle: values.PaperTitle || item?.paperTitle || "",
        courseId: courseId,
        subjectId: subjectId,
        quantity: Number(values.Quantity ?? 0) || 0,
        examDate: values.ExamDate ? values.ExamDate.format("DD-MM-YYYY") : "",
        examTime: values.ExamTime || item?.examTime || "",
        maxMarks: Number(values.MaxMarks ?? item?.maxMarks ?? 0) || 0,
        duration: values.Duration || item?.duration || "",
        languageId: values.LanguageId?.length ? values.LanguageId : (item?.languageIds || []),
        examTypeId: examTypeId,
        nepCode: values.NEPCode || item?.nepCode || "",
        uniqueCode: values.UniqueCode || item?.uniqueCode || "",
        catchNo: values.CatchNo || item?.catchNo || 0,
        innerEnvelope: values.InnerEnvelope || item?.innerEnvelope || "",
        outerEnvelope: Number(values.OuterEnvelope ?? item?.outerEnvelope ?? 0) || 0,
        qpId: isNewPaper ? 0 : (item?.qpMasterId || 0),
        projectId: projectId,
        lotNo: values.LotNo || item?.lotNo || "51",
        processId: [0],
        pages: Number(values.Pages ?? item?.pages ?? 0) || 0,
        percentageCatch: 0,
        status: 0,
        stopCatch: 0,
        mssStatus: mssStatusFlag, // 1 = import/save, 0 = draft
        ttfStatus: 0,
        structureOfPaper: values.StructureOfPaper || item?.structureOfPaper || "",
      },
    ];
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const values = await form.validateFields();
      const finalPayload = buildPayload(values, 1);
      await API.post("/QuantitySheet", finalPayload, {
        headers: { "Content-Type": "application/json" },
      });
      message.success(isNewPaper ? "Paper added successfully!" : "Data imported successfully!");
      if (onImported) onImported();
    } catch (error) {
      console.error("Error saving data:", error);
      message.error("Failed to save data.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const values = await form.validateFields();
      const finalPayload = buildPayload(values, 0); // draft
      await API.post("/QuantitySheet", finalPayload, {
        headers: { "Content-Type": "application/json" },
      });
      message.success("Saved as draft.");
      if (onImported) onImported();
    } catch (error) {
      console.error("Error saving draft:", error);
      message.error("Failed to save draft.");
    } finally {
      setSaving(false);
    }
  };

  const handleStructureTemplateChange = (value) => {
    setSelectedTemplate(value);
    form.setFieldsValue({ StructureOfPaper: structureTemplates[value] || "" });
  };

  

  if (!item) return <div style={{ padding: 12 }}>Select a record to edit.</div>;

  // read-only summary values
  const valuesAtTop = form.getFieldsValue([
    "NEPCode",
    "PaperTitle",
    "SubjectId",
    "CourseId",
    "ExamTypeId",
  ]);

  const subjectName =
    subject.find((s) => s.subjectId === valuesAtTop.SubjectId)?.subjectName ||
    item?.subjectName ||
    "-";
  const courseName = (typeof valuesAtTop.CourseId === "number"
    ? courses.find((c) => c.courseId === valuesAtTop.CourseId)?.courseName
    : valuesAtTop.CourseId) || item?.courseName || "-";
  const semesterName =
    (typeof valuesAtTop.ExamTypeId === "number"
      ? examType.find((e) => e.examTypeId === valuesAtTop.ExamTypeId)?.typeName
      : valuesAtTop.ExamTypeId) || item?.examTypeName || "-";

 return (
  <Card
    className={customLight || ""}
    style={cardStyle}
    bodyStyle={{ padding: 20 }}
  >
    {/* Section 1 - Read-only master data */}
    {!isNewPaper && (
      <>
        <Typography.Title level={5} style={sectionTitleStyle}>
          Question Paper Master Data (Read-only)
        </Typography.Title>
        <Divider style={{ margin: "8px 0 16px" }} />

        <div style={sectionBoxStyle}>
          <Row gutter={20}>
            <Col span={6}>
              <Form.Item label={renderLabel("NEP Code")}>
                <Input style={controlStyle} value={item?.nepCode || valuesAtTop.NEPCode || ""} disabled placeholder="NEP code" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label={renderLabel("Paper Title")}>
                <Input style={controlStyle} value={item?.paperTitle || valuesAtTop.PaperTitle || ""} disabled placeholder="Paper title" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label={renderLabel("Subject")}>
                <Input style={controlStyle} value={subjectName} disabled placeholder="Subject" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label={renderLabel("Course")}>
                <Input style={controlStyle} value={courseName} disabled placeholder="Course" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label={renderLabel("Semester")}>
                <Input style={controlStyle} value={semesterName} disabled placeholder="Semester" />
              </Form.Item>
            </Col>
          </Row>
        </div>
      </>
    )}

    {/* Section 2 - Quantity Sheet Information */}
    <Typography.Title level={4} style={quantityTitleStyle}>
      Quantity Sheet Information
    </Typography.Title>
    <Divider style={{ margin: "4px 0 16px" }} />

    <Form form={form} layout="horizontal" size="small">
      {/* First Row */}
      <Row gutter={16}>
        <Col span={6}>
          <Form.Item
            name="CatchNo"
            label={renderLabel("Catch Number")}
            rules={[{ required: true, message: "Catch number is required" }]}
          >
            <Input style={controlStyle} placeholder="Enter catch number" allowClear />
          </Form.Item>
        </Col>

        {isNewPaper ? (
          <>
            <Col span={6}>
              <Form.Item name="CourseId" label={renderLabel("Course")}>
                <Select style={controlStyle} allowClear showSearch optionFilterProp="children" placeholder="Search course">
                  {courses.map((c) => (
                    <Option key={c.courseId} value={c.courseId}>
                      {c.courseName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="ExamTypeId" label={renderLabel("Semester")}>
                <Select style={controlStyle} allowClear showSearch optionFilterProp="children" placeholder="Search semester">
                  {examType.map((e) => (
                    <Option key={e.examTypeId} value={e.examTypeId}>
                      {e.typeName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="PaperTitle" label={renderLabel("Paper Title")}>
                <Input style={controlStyle} allowClear placeholder="Enter paper title" />
              </Form.Item>
            </Col>
          </>
        ) : (
          <>
            <Col span={6}>
              <Form.Item name="PaperNumber" label={renderLabel("Paper #")}>
                <Input style={controlStyle} allowClear placeholder="Enter paper number (e.g., S1-COAP2G)" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="UniqueCode" label={renderLabel("Unique Code")}>
                <Input style={controlStyle} allowClear placeholder="Enter unique code" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="MaxMarks" label={renderLabel("Max Marks")}>
                <InputNumber min={0} style={fullWidthControlStyle} placeholder="Enter maximum marks" />
              </Form.Item>
            </Col>
            
          </>
        )}
      </Row>

      {/* Second Row */}
      <Row gutter={16}>
        {isNewPaper ? (
          <>
            <Col span={6}>
              <Form.Item name="PaperNumber" label={renderLabel("Paper #")}>
                <Input style={controlStyle} allowClear placeholder="Enter paper number (e.g., S1-COAP2G)" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="SubjectId" label={renderLabel("Subject")}>
                <Select style={controlStyle} allowClear showSearch optionFilterProp="children" placeholder="Search subject">
                  {subject.map((s) => (
                    <Option key={s.subjectId} value={s.subjectId}>
                      {s.subjectName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="NEPCode" label={renderLabel("NEP Code")}>
                <Input style={controlStyle} allowClear placeholder="Enter NEP code" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="UniqueCode" label={renderLabel("Unique Code")}>
                <Input style={controlStyle} allowClear placeholder="Enter unique code" />
              </Form.Item>
            </Col>
          </>
        ) : (
          <>
            <Col span={6}>
              <Form.Item name="ExamTime" label={renderLabel("Exam Time")}>
                <Input style={controlStyle} allowClear placeholder="Enter exam time (e.g., 03:00 PM to 05:00 PM)" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="Duration" label={renderLabel("Duration")}>
                <Input style={controlStyle} allowClear placeholder="Enter duration (e.g., 3 hours)" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="LanguageId" label={renderLabel("Language")}>
                <Select
                  mode="multiple"
                  allowClear
                  showSearch
                  optionFilterProp="children"
                  placeholder="Select languages"
                  style={controlStyle}
                >
                  {language.map((l) => (
                    <Option key={l.languageId} value={l.languageId}>
                      {l.languages}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item name="ExamDate" label={renderLabel("Exam Date")}>
                <DatePicker style={fullWidthControlStyle} placeholder="Select exam date" />
              </Form.Item>
            </Col>
            
          </>
        )}
      </Row>

      {/* Third Row */}
      <Row gutter={16}>
        {isNewPaper ? (
          <>
            <Col span={6}>
              <Form.Item name="MaxMarks" label={renderLabel("Max Marks")}>
                <InputNumber min={0} style={fullWidthControlStyle} placeholder="Enter maximum marks" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="ExamDate" label={renderLabel("Exam Date")}>
                <DatePicker style={fullWidthControlStyle} placeholder="Select exam date" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="ExamTime" label={renderLabel("Exam Time")}>
                <Input style={controlStyle} allowClear placeholder="Enter exam time (e.g., 03:00 PM to 05:00 PM)" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="LanguageId" label={renderLabel("Language")}>
                <Select
                  mode="multiple"
                  allowClear
                  showSearch
                  optionFilterProp="children"
                  placeholder="Select languages"
                  style={controlStyle}
                >
                  {language.map((l) => (
                    <Option key={l.languageId} value={l.languageId}>
                      {l.languages}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </>
        ) : (
          <>
            <Col span={6}>
              <Form.Item name="InnerEnvelope" label={renderLabel("Inner Envelope")}>
                <Input style={controlStyle} allowClear placeholder="Enter inner envelope" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="OuterEnvelope" label={renderLabel("Outer Envelope")}>
                <InputNumber min={0} style={fullWidthControlStyle} placeholder="Enter outer envelope count" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="Pages" label={renderLabel("Pages")}>
                <InputNumber min={0} style={fullWidthControlStyle} placeholder="Enter number of pages" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="Quantity" label={renderLabel("Quantity")}>
                <InputNumber min={0} style={fullWidthControlStyle} placeholder="Enter quantity" />
              </Form.Item>
            </Col>
          </>
        )}
      </Row>

      {/* Final Row (textarea - full width) */}
      <Row gutter={16}>
        
        <Col span={12}>
          <Form.Item name="StructureOfPaper" label={renderLabel("Structure of Paper")}>
            <Input.TextArea rows={6} allowClear style={{ whiteSpace: "pre-wrap", borderRadius: 6 }} placeholder="Paste or write the structure of the paper here" showCount maxLength={1200} />
          </Form.Item>
        </Col>
      </Row>

      {/* Buttons */}
      <Row justify="end" gutter={8} style={{ marginTop: 8 }}>
        <Col>
          <Space>
            <Button onClick={onCancel} shape="default">Back to Search</Button>
            <Button
              type="primary"
              onClick={handleSave}
              loading={saving}
              shape="default"
              style={{ backgroundColor: "#28a745", borderColor: "#28a745" }}
            >
              Save & Import
            </Button>
          </Space>
        </Col>
      </Row>
    </Form>
  </Card>
);

};

export default PaperDetailForm;
