import React, { useEffect, useState } from "react";
import { Row, Col, Form, Input, DatePicker, Select, Button, message } from "antd";
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
        const [courseRes, subjectRes, examTypeRes, languageRes] = await Promise.all([
          API.get("/Course"),
          API.get("/Subject"),
          API.get("/ExamType"),
          API.get("/Language"),
        ]);
        setCourses(courseRes.data || []);
        setSubject(subjectRes.data || []);
        setExamType(examTypeRes.data || []);
        setLanguage(languageRes.data || []);
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
  <div className={customLight || ""} style={{ padding: 16, background: "#fff", borderRadius: 8 }}>
    {/* Section 1 - Read-only master data */}
    {!isNewPaper && (
      <>
        <div style={{ borderBottom: "2px solid #eee", marginBottom: 12 }}>
          <h5 style={{ color: "#1677ff", margin: "8px 0", fontSize: 14, fontWeight: 700 }}>
            Question Paper Master Data (Read-only)
          </h5>
        </div>

        <Row gutter={16}>
          <Col span={6}>
            <Form.Item label="NEP Code">
              <Input value={item?.nepCode || valuesAtTop.NEPCode || ""} disabled />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Paper Title">
              <Input value={item?.paperTitle || valuesAtTop.PaperTitle || ""} disabled />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Subject">
              <Input value={subjectName} disabled />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Course">
              <Input value={courseName} disabled />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Semester">
              <Input value={semesterName} disabled />
            </Form.Item>
          </Col>
        </Row>
      </>
    )}

    {/* Section 2 - Quantity Sheet Information */}
    <div style={{ borderBottom: "2px solid #eee", margin: "18px 0 12px" }}>
      <h5 style={{ color: "#52c41a", margin: 0, fontSize: 14, fontWeight: 700 }}>
        Quantity Sheet Information (Editable)
      </h5>
    </div>

    <Form form={form} layout="vertical">
      {/* First Row */}
      <Row gutter={16}>
        <Col span={6}>
          <Form.Item
            name="CatchNo"
            label="Catch Number *"
            rules={[{ required: true, message: "Catch number is required" }]}
          >
            <Input placeholder="Enter catch number" />
          </Form.Item>
        </Col>

        {isNewPaper ? (
          <>
            <Col span={6}>
              <Form.Item name="CourseId" label="Course">
                <Select allowClear showSearch optionFilterProp="children" placeholder="Search course">
                  {courses.map((c) => (
                    <Option key={c.courseId} value={c.courseId}>
                      {c.courseName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="ExamTypeId" label="Semester">
                <Select allowClear showSearch optionFilterProp="children" placeholder="Search semester">
                  {examType.map((e) => (
                    <Option key={e.examTypeId} value={e.examTypeId}>
                      {e.typeName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="PaperTitle" label="Paper Title">
                <Input allowClear />
              </Form.Item>
            </Col>
          </>
        ) : (
          <>
            <Col span={6}>
              <Form.Item name="PaperNumber" label="Paper #">
                <Input allowClear />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="UniqueCode" label="Unique Code">
                <Input allowClear />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="MaxMarks" label="Max Marks">
                <Input type="number" allowClear />
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
              <Form.Item name="PaperNumber" label="Paper #">
                <Input allowClear />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="SubjectId" label="Subject">
                <Select allowClear showSearch optionFilterProp="children" placeholder="Search subject">
                  {subject.map((s) => (
                    <Option key={s.subjectId} value={s.subjectId}>
                      {s.subjectName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="NEPCode" label="NEP Code">
                <Input allowClear />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="UniqueCode" label="Unique Code">
                <Input allowClear />
              </Form.Item>
            </Col>
          </>
        ) : (
          <>
            <Col span={6}>
              <Form.Item name="ExamTime" label="Exam Time">
                <Input allowClear placeholder="e.g., 03:00 PM to 05:00 PM" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="Duration" label="Duration">
                <Input allowClear />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="LanguageId" label="Language">
                <Select
                  mode="multiple"
                  allowClear
                  showSearch
                  optionFilterProp="children"
                  placeholder="Search languages"
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
              <Form.Item name="ExamDate" label="Exam Date">
                <DatePicker style={{ width: "100%" }} />
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
              <Form.Item name="MaxMarks" label="Max Marks">
                <Input type="number" allowClear />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="ExamDate" label="Exam Date">
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="ExamTime" label="Exam Time">
                <Input allowClear />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="LanguageId" label="Language">
                <Select
                  mode="multiple"
                  allowClear
                  showSearch
                  optionFilterProp="children"
                  placeholder="Search languages"
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
              <Form.Item name="InnerEnvelope" label="Inner Envelope">
                <Input allowClear />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="OuterEnvelope" label="Outer Envelope">
                <Input type="number" allowClear />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="Pages" label="Pages">
                <Input type="number" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="Quantity" label="Quantity">
                <Input type="number" />
              </Form.Item>
            </Col>
          </>
        )}
      </Row>

      {/* Final Row (textarea - full width) */}
      <Row gutter={16}>
        <Col span={12}>
              <Form.Item label="Select Paper Structure Template">
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="children"
                  placeholder="Select a structure"
                  onChange={handleStructureTemplateChange}
                  value={selectedTemplate}
                >
                  {Object.keys(structureTemplates).map((key) => (
                    <Option key={key} value={key}>
                      Template {key}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
        <Col span={12}>
          <Form.Item name="StructureOfPaper" label="Structure of Paper">
            <Input.TextArea rows={6} allowClear style={{ whiteSpace: "pre-wrap" }} />
          </Form.Item>
        </Col>
      </Row>

      {/* Buttons */}
      <Row justify="end" gutter={8} style={{ marginTop: 8 }}>
        <Col>
          <Button onClick={onCancel}>Back to Search</Button>
        </Col>
        <Col>
          <Button
            type="primary"
            onClick={handleSave}
            loading={saving}
            style={{ backgroundColor: "#28a745", borderColor: "#28a745" }}
          >
            Save & Import
          </Button>
        </Col>
      </Row>
    </Form>
  </div>
);

};

export default PaperDetailForm;
