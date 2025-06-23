import React, { useState, useEffect } from "react";
import { Row, Col } from "react-bootstrap";
import { Button, message, Card, Table, Modal } from "antd";
import { Tooltip } from "antd";
import { Modal as BootstrapModal, Button as Btn } from 'react-bootstrap';
import { IoClose } from "react-icons/io5";
import {
  getAllDispatches,
  updateDispatch
} from "../../CustomHooks/ApiServices/dispatchService";
import DispatchFormModal from "./components/DispatchModal";
import { useStore } from 'zustand';
import themeStore from '../../store/themeStore';
import { useTranslation } from 'react-i18next';
import { getProcessPercentages } from "../../CustomHooks/ApiServices/transacationService";
import { FaInfoCircle } from 'react-icons/fa';
import API from "../../CustomHooks/MasterApiHooks/api";

const DispatchPage = ({ projectId, processId, lotNo, fetchTransactions, projectName }) => {
  const { t } = useTranslation();
  const { getCssClasses } = useStore(themeStore);
  const cssClasses = getCssClasses();
  const [customDark, customMid, customLight, customBtn, customDarkText, customLightText, customLightBorder, customDarkBorder] = cssClasses;

  const [dispatchData, setDispatchData] = useState([]);
  const [dispatchModalVisible, setDispatchModalVisible] = useState(false);
  const [previousProcessStatus, setPreviousProcessStatus] = useState(false);
  const [processDetailsModalVisible, setProcessDetailsModalVisible] = useState(false);
  const [selectedDispatch, setSelectedDispatch] = useState(null);
  const [processPercentages, setProcessPercentages] = useState([]);
  const [projectProcesses, setProjectProcesses] = useState([]);
  const [editDispatch, setEditDispatch] = useState(null);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [confirmDispatchData, setConfirmDispatchData] = useState(null);


  const showConfirmModal = (dispatch) => {
    const allProcessesComplete = processPercentages.every(process => {
      const lotData = process.lots.find(lot => lot.lotNumber === dispatch.lotNo);
      return lotData?.percentage === 100;
    });

    if (!allProcessesComplete) {
      message.error(t("cannotCompleteDispatchAllProcessesIncomplete"));
      return;
    }

    setConfirmDispatchData(dispatch);
    setConfirmModalVisible(true);
  };

  const handleConfirmStatusUpdate = async () => {
    if (!confirmDispatchData) return;

    try {
      await updateDispatch(confirmDispatchData.id, {
        ...confirmDispatchData,
        status: true,
        completedAt: new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000)).toISOString(),
        updatedAt: new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000)).toISOString()
      });
      message.success(t("statusUpdateSuccess"));
      setConfirmModalVisible(false);
      fetchDispatchData();
    } catch (error) {
      console.error("Error updating status:", error);
      message.error(t("statusUpdateFailed"));
    }
  };



  const handleEditDispatch = (dispatch) => {
    setEditDispatch(dispatch);
    setDispatchModalVisible(true);
  }
  const fetchProjectProcesses = async () => {
    try {
      const response = await API.get(`/Processes`);
      const mappedProcesses = response.data
        .filter(process => process.id !== 14)
        .map(process => ({
          id: process.id,
          name: process.name,
          weightage: process.weightage,
          status: process.status,
          installedFeatures: process.installedFeatures,
          featureNames: process.featureNames,
          processType: process.processType,
          rangeStart: process.rangeStart,
          rangeEnd: process.rangeEnd
        }));
      setProjectProcesses(mappedProcesses);
    } catch (error) {
      console.error("Error fetching project processes:", error);
    }
  };

  const checkPreviousProcessStatus = async () => {
    try {
      const { processes } = await getProcessPercentages(projectId);
      const filteredProcesses = processes.filter(process => process.processId !== 14);
      setProcessPercentages(filteredProcesses);
    } catch (error) {
      console.error("Error checking process status:", error);
      setPreviousProcessStatus(false);
    }
  };

  const fetchDispatchData = async () => {
    try {
      const response = await getAllDispatches(projectId, lotNo);
      const mappedDispatchData = response.map(dispatch => ({
        ...dispatch,

        processes: processPercentages.map(process => {
          const lotData = process.lots.find(lot => lot.lotNumber === dispatch.lotNo);
          const projectProcess = projectProcesses.find(pp => pp.id === process.processId);
          return {
            processId: process.processId,
            percentage: lotData?.percentage || 0,
            sequence: projectProcess?.sequence,
            weightage: projectProcess?.weightage,
            name: projectProcess?.name
          };
        }).sort((a, b) => a.sequence - b.sequence)
      }));
      setDispatchData(mappedDispatchData);
    } catch (error) {
      console.error("Error fetching dispatch data:", error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = ("0" + date.getDate()).slice(-2);
    const month = ("0" + (date.getMonth() + 1)).slice(-2); // Months are zero-indexed
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  };


  useEffect(() => {
    if (projectId && processId && lotNo) {
      checkPreviousProcessStatus();
      fetchProjectProcesses();
    }
  }, [projectId, processId, lotNo]);

  useEffect(() => {
    if (processPercentages.length > 0 && projectProcesses.length > 0) {
      fetchDispatchData();
    }
  }, [processPercentages, projectProcesses]);

  const handleDispatchForm = () => {
    setDispatchModalVisible(true);
  };

  const handleCloseModal = async (success = false) => {
    setDispatchModalVisible(false);
    setEditDispatch(null);
    if (success) {
      await fetchDispatchData();
      message.success(t("dispatchCreatedSuccess"));
    }
  };

  // const showConfirmModal = (dispatch) => {
  //   const allProcessesComplete = processPercentages.every(process => {
  //     const lotData = process.lots.find(lot => lot.lotNumber === dispatch.lotNo);
  //     return lotData?.percentage === 100;
  //   });

  //   if (!allProcessesComplete) {
  //     message.error(t("cannotCompleteDispatchAllProcessesIncomplete"));
  //     return;
  //   }

  //   Modal.confirm({
  //     title: t("confirmStatusUpdate"),
  //     content: (
  //       <div>
  //         <p>{t("confirmDispatchComplete")}</p>
  //         <Table
  //           dataSource={[
  //             { label: t("projectName"), value: projectName || "N/A" },
  //             { label: t("lotNo"), value: dispatch.lotNo },
  //             { label: t("boxCount"), value: dispatch.boxCount },
  //             { label: t("dispatchDate"), value: formatDate(dispatch.dispatchDate) },
  //           ]}
  //           columns={[
  //             { title: t("field"), dataIndex: "label", key: "label" },
  //             { title: t("value"), dataIndex: "value", key: "value" },
  //           ]}
  //           pagination={false}
  //           bordered
  //           size="small"
  //         />
  //       </div>
  //     ),
  //     okText: t("yesComplete"),
  //     cancelText: t("cancel"),
  //     onOk: () => handleStatusUpdate(dispatch),
  //   });
  // };

  // const handleStatusUpdate = async (dispatch) => {
  //   try {
  //     await updateDispatch(dispatch.id, {
  //       ...dispatch,
  //       status: true,
  //       completedAt: new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000)).toISOString(),
  //       updatedAt: new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000)).toISOString()
  //     });
  //     message.success(t("statusUpdateSuccess"));
  //     fetchDispatchData();
  //   } catch (error) {
  //     console.error("Error updating status:", error);
  //     message.error(t("statusUpdateFailed"));
  //   }
  // };

  const showProcessDetailsModal = (dispatch) => {
    setSelectedDispatch(dispatch);
    setProcessDetailsModalVisible(true);
  };

  const dispatchTableColumns = [
    { title: t("processId"), dataIndex: "processId", key: "processId", align: "center" },
    { title: t("processName"), dataIndex: "name", key: "name" },
    { title: t("percentage"), dataIndex: "percentage", key: "percentage", align: "center" }
  ];

  const isCreateDispatchDisabled = lotNo === "51"
  const toolTipMessage = "Bifurcate Lots before creating dispatch";

  return (
    <Row className="mt-4 mb-4 justify-content-center">
      <Col xs={12} className="mb-3">
        <div className="d-flex justify-content-between align-items-center">
          <h4 className={`${customDarkText}`}>{t("dispatchDetails")}</h4>
          {dispatchData.length === 0 && (
            <Tooltip
              title={lotNo === "51" ? toolTipMessage : ""}
              placement="top"
              color="ff4d4f"
            >
              <Button type="primary"
                className={`${customDark} text-white ${customDark === 'dark-dark' ? "border" : ""}`}
                onClick={handleDispatchForm}
                disabled={isCreateDispatchDisabled}>

                {t("createDispatch")}
              </Button></Tooltip>
          )}
        </div>
      </Col>

      {dispatchData.length > 0 ? (
        dispatchData.map((dispatch) => (
          <Col xs={12} md={12} lg={8} key={dispatch.id} className="">
            <Card className={`mb-3 ${customLight} shadow-lg`} bordered={false}>
              <div className="d-flex justify-content-end">
                <div className="d-flex justify-content-end gap-3">
                  <FaInfoCircle
                    className="text-primary"
                    size={20}
                    title={t("processDetails")}
                    onClick={() => showProcessDetailsModal(dispatch)}
                    style={{ cursor: "pointer" }}
                  />

                  <Tooltip title={t("editDispatch")}>
                    <Button
                      size="small"
                      type="default"
                      onClick={() => handleEditDispatch(dispatch)}
                    >
                      {t("edit")}
                    </Button>
                  </Tooltip>

                </div>

              </div>
              <div className="mb-2 px-2">
                <div className={`fw-bold ${customDarkText}`}>
                  {t("lotNo")}: {dispatch.lotNo} | {t("boxCount")}: {dispatch.boxCount} | {t("dispatchDate")}: {formatDate(dispatch.dispatchDate)}
                </div>
              </div>
              <Table
                // style={{minWidth:'600px'}}
                className={`${customDark === "default-dark" ? "thead-default" : ""}
               ${customDark === "red-dark" ? "thead-red" : ""}
               ${customDark === "green-dark" ? "thead-green" : ""}
               ${customDark === "blue-dark" ? "thead-blue" : ""}
               ${customDark === "dark-dark" ? "thead-dark" : ""}
               ${customDark === "pink-dark" ? "thead-pink" : ""}
               ${customDark === "purple-dark" ? "thead-purple" : ""}
               ${customDark === "light-dark" ? "thead-light" : ""}
               ${customDark === "brown-dark" ? "thead-brown" : ""} custom-pagination shadow-lg`}
                dataSource={dispatch.dispatchDetails?.map((item, index) => ({
                  key: index,
                  mode: `Mode ${index + 1}`,
                  vehicleType: item.vehicleType || "N/A",
                  vehicleNumber: item.vehicleNumber || "N/A",
                  driverName: item.driverName || "N/A",
                  driverMobile: item.driverMobile || "N/A",
                  messengerName: item.messengerName || "N/A",
                  messengerMobile: item.messengerMobile || "N/A"
                })) || []}
                columns={[
                  { title: t("mode"), dataIndex: "mode", key: "mode" },
                  { title: t("vehicleType"), dataIndex: "vehicleType", key: "vehicleType" },
                  { title: t("vehicleNumber"), dataIndex: "vehicleNumber", key: "vehicleNumber" },
                  { title: t("driverName"), dataIndex: "driverName", key: "driverName" },
                  { title: t("driverMobile"), dataIndex: "driverMobile", key: "driverMobile" },
                  { title: t("messengerName"), dataIndex: "messengerName", key: "messengerName" },
                  { title: t("messengerMobile"), dataIndex: "messengerMobile", key: "messengerMobile" },
                ]}
                pagination={false}
                bordered
                size="small" />
              {!dispatch.status && processPercentages.every(process =>
                process.lots.find(lot =>
                  lot.lotNumber === dispatch.lotNo
                )?.percentage === 100
              ) && (
                  <div className="text-center mt-3">

                    <Button
                      type="primary"
                      size="small"
                      onClick={() => showConfirmModal(dispatch)}
                      disabled={String(dispatch.lotNo) === "51"}
                    >
                      {t("markAsComplete")}
                    </Button>
                  </div>
                )}
            </Card>
          </Col>
        ))
      ) : (
        <Col xs={12} md={6}>
          <Card className={customLight}>
            <div className={`text-center p-3 ${customDarkText} fs-4 fw-bold`}>
              {t("noDispatchData")}
            </div>
          </Card>
        </Col>
      )}

      <DispatchFormModal
        show={dispatchModalVisible}
        handleClose={handleCloseModal}
        processId={processId}
        projectId={projectId}
        lotNo={lotNo}
        fetchDispatchData={fetchDispatchData}
        editData={editDispatch}
      />

      <BootstrapModal
        show={processDetailsModalVisible}
        onHide={() => setProcessDetailsModalVisible(false)}
        size="lg" // You can adjust the size as needed
        aria-labelledby="contained-modal-title-vcenter"
        centered
        className=""
      >
        <BootstrapModal.Header className={`d-flex justify-content-between align-items-center ${customDark} ${customLightText} `}>
          <BootstrapModal.Title id="contained-modal-title-vcenter">
            {t("processDetails")}
          </BootstrapModal.Title>
          <Btn
            variant="link" // Use 'link' variant for a cleaner look
            className={customLightText} // Apply your custom class
            onClick={() => setProcessDetailsModalVisible(false)} // Close the modal
          >
            <IoClose size={30} />
          </Btn>
        </BootstrapModal.Header>
        <BootstrapModal.Body class={`${customLight} p-3`}>
          <div>
            <div className={`d-flex justify-content-around fw-bold ${customDarkText}`}>
              <p>{t("lotNo")} - {selectedDispatch?.lotNo}</p>
              {/* <p>{t("projectId")} {selectedDispatch?.projectId}</p> */}
              <p>{t("projectName")} - {projectName}</p>
            </div>
            <Table
              dataSource={selectedDispatch?.processes || []}
              columns={dispatchTableColumns}
              pagination={false}
              bordered
              size="small"
              className={`${customDark === "default-dark" ? "thead-default" : ""}
                     ${customDark === "red-dark" ? "thead-red" : ""}
                     ${customDark === "green-dark" ? "thead-green" : ""}
                     ${customDark === "blue-dark" ? "thead-blue" : ""}
                     ${customDark === "dark-dark" ? "thead-dark" : ""}
                     ${customDark === "pink-dark" ? "thead-pink" : ""}
                     ${customDark === "purple-dark" ? "thead-purple" : ""}
                     ${customDark === "light-dark" ? "thead-light" : ""}
                     ${customDark === "brown-dark" ? "thead-brown" : ""} custom-pagination shadow-lg`}
            />
          </div>
        </BootstrapModal.Body>
      </BootstrapModal>
      <BootstrapModal
        show={confirmModalVisible}
        onHide={() => setConfirmModalVisible(false)}
        size="md"
        centered
      >
        <BootstrapModal.Header className={`${customDark} ${customLightText}`}>
          <BootstrapModal.Title>{t("confirmStatusUpdate")}</BootstrapModal.Title>
          <Btn variant="link" className={customLightText} onClick={() => setConfirmModalVisible(false)}>
            <IoClose size={30} />
          </Btn>
        </BootstrapModal.Header>

        <BootstrapModal.Body className={`${customLight} p-3`}>
          <p>{t("confirmDispatchComplete")}</p>
          <Table
            dataSource={[
              { label: t("projectName"), value: projectName || "N/A" },
              { label: t("lotNo"), value: confirmDispatchData?.lotNo },
              { label: t("boxCount"), value: confirmDispatchData?.boxCount },
              { label: t("dispatchDate"), value: formatDate(confirmDispatchData?.dispatchDate) }
            ]}
            columns={[
              { title: t("field"), dataIndex: "label", key: "label" },
              { title: t("value"), dataIndex: "value", key: "value" }
            ]}
            pagination={false}
            bordered
            size="small"
          />
        </BootstrapModal.Body>

        <BootstrapModal.Footer className={`${customLight} d-flex justify-content-end`}>
          <Btn variant="secondary" onClick={() => setConfirmModalVisible(false)}>
            {t("cancel")}
          </Btn>
          <Btn variant="primary" onClick={handleConfirmStatusUpdate}>
            {t("yesComplete")}
          </Btn>
        </BootstrapModal.Footer>
      </BootstrapModal>

    </Row>
  );
};

export default DispatchPage;

