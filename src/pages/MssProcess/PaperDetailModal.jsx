import React, { useEffect } from "react";
import { Modal, Button, Form, Input, DatePicker, Select, message } from "antd";
import axios from "axios";
import moment from "moment";
import API from "../../CustomHooks/MasterApiHooks/api";

const { Option } = Select;

const PaperDetailModal = ({ visible, item, onCancel, onImport, importing }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (item) {
      console.log(item);
      // Set the form fields with the values from the item
      form.setFieldsValue({
        QPId: item.qpMasterId,
        Quantity: item.quantity ?? 0.0,
        CourseId: item.courseId ?? 0,
        SubjectId: item.subjectId ?? 0,
        CatchNo: "", // Initialize as an empty string to allow user input
        InnerEnvelope: item.innerEnvelope ?? "",
        OuterEnvelope: item.outerEnvelope ?? 0,
        PaperTitle: item.paperTitle,
        PaperNumber: item.paperNumber,
        ExamDate: item.examDate ? moment(item.examDate) : null,
        ExamTime: item.examTime ?? null,
        MaxMarks: item.maxMarks ?? 0,
        Duration: item.duration ?? "",
        LanguageId: item.languageId ?? [0],
        ExamTypeId: item.examTypeId ?? 0,
        NEPCode: item.nepCode ?? "",
        PrivateCode: item.privateCode ?? "",
      });
    }
  }, [item, form]);

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();

      // Format the payload according to the API's requirements
      const payload = [{
     
          paperTitle: values.PaperTitle,
          courseId: values.CourseId,
          subjectId: Number(values.SubjectId),
          quantity: Number(values.Quantity),
          examDate: values.ExamDate ? values.ExamDate.format('YYYY-MM-DD') : null,
          examTime: values.ExamTime,
          maxMarks: Number(values.MaxMarks),
          duration: values.Duration,
          languageId: [],
          examTypeId: Number(values.ExamTypeId),
          nepCode: values.NEPCode,
          privateCode: values.PrivateCode,
          catchNo: values.CatchNo,
          innerEnvelope: values.InnerEnvelope,
          outerEnvelope: Number(values.OuterEnvelope),
          qpId: item.qpMasterId, // Ensure QPId is sent correctly
          projectId:1, // Ensure ProjectId is sent correctly
          lotNo: "1001", // Assuming a default value for LotNo
          processId: [0], // Assuming a default value for ProcessId
          pages: 0, // Assuming a default value for Pages
          percentageCatch: 0, // Assuming a default value for PercentageCatch
          status: 0, // Assuming a default value for Status
          stopCatch: 0, // Assuming a default value for StopCatch
          mssStatus: 0, // Assuming a default value for MSSStatus
          ttfStatus: 0, // Assuming a default value for TTFStatus
       
      }];

      // Log the payload to inspect the data being sent
      console.log("Payload:", payload);

      // Send updated values to the server with the Authorization header
      await API.post("/QuantitySheet", payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      message.success("Data updated successfully!");
      onCancel(); // Close the modal after successful update
    } catch (error) {
      console.error("Error updating data:", error);
      message.error("Failed to update data.");
    }
  };

  if (!item) {
    return null; // Don't render the modal if item is null
  }

  return (
    <Modal
      title="Paper Details"
      visible={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="import"
          type="primary"
          onClick={handleUpdate}
          disabled={importing === item.qpMasterId}
        >
          Update
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item name="PaperTitle" label="Paper Title">
          <Input />
        </Form.Item>
        <Form.Item name="CourseId" label="Course ID">
          <Input />
        </Form.Item>
        <Form.Item name="SubjectId" label="Subject ID">
          <Input />
        </Form.Item>
        <Form.Item name="Quantity" label="Quantity">
          <Input type="number" />
        </Form.Item>
        <Form.Item name="ExamDate" label="Exam Date">
          <DatePicker />
        </Form.Item>
        <Form.Item name="ExamTime" label="Exam Time">
          <Input />
        </Form.Item>
        <Form.Item name="MaxMarks" label="Max Marks">
          <Input type="number" />
        </Form.Item>
        <Form.Item name="Duration" label="Duration">
          <Input />
        </Form.Item>
        <Form.Item name="LanguageId" label="Language ID">
          <Select mode="multiple">
            {/* Add options dynamically based on available languages */}
            <Option value={0}>Default Language</Option>
          </Select>
        </Form.Item>
        <Form.Item name="ExamTypeId" label="Exam Type ID">
          <Input />
        </Form.Item>
        <Form.Item name="NEPCode" label="NEP Code">
          <Input />
        </Form.Item>
        <Form.Item name="PrivateCode" label="Private Code">
          <Input />
        </Form.Item>
        <Form.Item name="CatchNo" label="Catch No">
          <Input />
        </Form.Item>
        <Form.Item name="InnerEnvelope" label="Inner Envelope">
          <Input />
        </Form.Item>
        <Form.Item name="OuterEnvelope" label="Outer Envelope">
          <Input type="number" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PaperDetailModal;
