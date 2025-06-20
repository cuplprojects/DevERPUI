import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Button, message, DatePicker, Select } from "antd";
import API from "../CustomHooks/MasterApiHooks/api";
import { createDispatch } from "../CustomHooks/ApiServices/dispatchService";

const DispatchFormModal = ({ show, handleClose, processId, projectId, lotNo, fetchDispatchData }) => {
  const [form] = Form.useForm();
  const [modeCount, setModeCount] = useState(0);
  const [messengerList, setMessengerList] = useState([]);

  useEffect(() => {
    const fetchMessengers= async () => {
      try{
      const response = await API.get('User/messenger');
      const data = await response.data;
      console.log(data)
      setMessengerList(data);
    } catch (error) {
      console.error(error);
      }
    };
  fetchMessengers();
      }, []);

  const onFinish = async (values) => {
    const dispatchDetails = [];

    for (let i = 0; i < modeCount; i++) {
      dispatchDetails.push({
        vehicleType: values[`vehicleType_${i}`],
        vehicleNumber: values[`vehicleNumber_${i}`],
        driverName: values[`driverName_${i}`],
        driverMobile: values[`driverMobile_${i}`],
        messengerName: values[`messengerName_${i}`],
        messengerMobile: values[`messengerMobile_${i}`],
      });
    }

    const submitData = {
      processId,
      projectId,
      lotNo,
      boxCount: values.boxCount,
      dispatchDate: values.dispatchDate,
      modeCount,
      dispatchDetails,
      status: false
    };

    try {
      await createDispatch(submitData);
      form.resetFields();
      setModeCount(0);
      handleClose(true);
    } catch (error) {
      message.error("Failed to create dispatch");
    }
  };

  return (
    <Modal
      title="Dispatch Details"
      open={show}
      onCancel={() => {
        form.resetFields();
        setModeCount(0);
        handleClose();
      }}
      footer={[
        <Button key="cancel" onClick={() => {
          form.resetFields();
          setModeCount(0);
          handleClose();
        }}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={() => form.submit()}>
          Submit
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Number of Boxes"
          name="boxCount"
          rules={[{ required: true, message: "Please enter number of boxes" }]}
        >
          <Input type="number" min={1} />
        </Form.Item>

        <Form.Item
          label="Dispatch Date"
          name="dispatchDate"
          rules={[{ required: true, message: "Please enter Dispatch date" }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          label="Number of Modes of Transport"
          name="modeCount"
          rules={[{ required: true, message: "Please enter number of modes" }]}
        >
          <Input
            type="number"
            min={1}
            onChange={(e) => setModeCount(parseInt(e.target.value || "0", 10))}
          />
        </Form.Item>

        {Array.from({ length: modeCount }, (_, index) => (
          <div key={index} style={{ padding: "12px", border: "1px solid #d9d9d9", marginBottom: "16px", borderRadius: 6 }}>
            <h4>Mode {index + 1}</h4>
            <Form.Item label="Vehicle Type" name={`vehicleType_${index}`} rules={[{ required: true, message: "Enter vehicle type" }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Vehicle Number" name={`vehicleNumber_${index}`} rules={[{ required: true, message: "Enter vehicle number" }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Driver Name" name={`driverName_${index}`} rules={[{ required: true, message: "Enter driver name" }]}>
              <Input />
            </Form.Item>
            <Form.Item
              label="Driver Mobile Number"
              name={`driverMobile_${index}`}
              rules={[
                { required: true, message: "Enter driver mobile number" },
                { pattern: /^[0-9]{10}$/, message: "Enter valid 10-digit number" },
              ]}
            >
              <Input />
            </Form.Item>
           <Form.Item
  label="Messenger"
  name={`messengerName_${index}`}
  rules={[{ required: true, message: "Please select a messenger" }]}
>
  <Select
    placeholder="Select Messenger"
    onChange={(value) => {
      const messenger = messengerList.find((m) => m.fullName === value);
      form.setFieldsValue({
        [`messengerMobile_${index}`]: messenger?.mobileNo || ""
      });
    }}
  >
    {messengerList.map((messenger) => (
      <Select.Option key={messenger.id} value={messenger.fullName}>
        {messenger.fullName}
      </Select.Option>
    ))}
  </Select>
</Form.Item>

<Form.Item
  label="Messenger Mobile Number"
  name={`messengerMobile_${index}`}
  rules={[
    { required: true, message: "Enter messenger mobile number" },
    { pattern: /^[0-9]{10}$/, message: "Enter valid 10-digit number" },
  ]}
>
  <Input disabled />
</Form.Item>

            
          </div>
        ))}
      </Form>
    </Modal>
  );
};

export default DispatchFormModal;


// import React from "react";
// import { Modal, Form, Input, Button, message,DatePicker } from "antd";
// import { createDispatch } from "../CustomHooks/ApiServices/dispatchService";

// const DispatchFormModal = ({ show, handleClose, processId, projectId, lotNo, fetchDispatchData }) => {
//   const [form] = Form.useForm();

//   const onFinish = async (values) => {
//     const submitData = {
//       ...values,
//       processId,
//       projectId,
//       lotNo,
//       status: false // Initialize dispatch with pending status
//     };
  

//     try {
//       await createDispatch(submitData);
//       form.resetFields();
//       handleClose(true); // Pass success=true to trigger refetch and success message
//     } catch (error) {
//       message.error("Failed to create dispatch");
//     }
//   };

//   return (
//     <Modal
//       title="Dispatch Details"
//       open={show}
//       onCancel={() => {
//         form.resetFields();
//         handleClose();
//       }}
//       footer={[
//         <Button 
//           key="cancel" 
//           onClick={() => {
//             form.resetFields();
//             handleClose();
//           }}
//         >
//           Cancel
//         </Button>,
//         <Button key="submit" type="primary" onClick={() => form.submit()}>
//           Submit
//         </Button>,
//       ]}
//     >
//       <Form form={form} layout="vertical" onFinish={onFinish}>
//         <Form.Item
//           label="Number of Boxes"
//           name="boxCount"
//           rules={[{ required: true, message: "Please enter number of boxes" }]}
//         >
//           <Input type="number" min={1} />
//         </Form.Item>

//         <Form.Item
//           label = "Dispatch Date"
//           name="dispatchDate"
//           rules={[{ required: true, message: "Please enter Dispatch date"}]} 
//         >
//           <DatePicker style={{ width: '100%' }} />

//         </Form.Item>
//         <Form.Item
//           label="Messenger Name"
//           name="messengerName"
//           rules={[{ required: true, message: "Please enter messenger name" }]}
//         >
//           <Input />
//         </Form.Item>

//         <Form.Item
//           label="Messenger Mobile Number"
//           name="messengerMobile"
//           rules={[
//             { required: true, message: "Please enter messenger mobile number" },
//             {
//               pattern: /^[0-9]{10}$/,
//               message: "Please enter valid 10 digit mobile number",
//             },
//           ]}
//         >
//           <Input />
//         </Form.Item>

//         <Form.Item
//           label="Mode of Dispatch"
//           name="dispatchMode"
//           rules={[
//             { required: true, message: "Please enter mode of dispatch" },
//           ]}
//         >
//           <Input />
//         </Form.Item>

//         <Form.Item label="Vehicle Number" name="vehicleNumber">
//           <Input />
//         </Form.Item>

//         <Form.Item label="Driver Name" name="driverName">
//           <Input />
//         </Form.Item>

//         <Form.Item
//           label="Driver Mobile Number"
//           name="driverMobile"
//           rules={[
//             {
//               pattern: /^[0-9]{10}$/,
//               message: "Please enter valid 10 digit mobile number",
//             },
//           ]}
//         >
//           <Input />
//         </Form.Item>
//       </Form>
//     </Modal>
//   );
// };

// export default DispatchFormModal;

