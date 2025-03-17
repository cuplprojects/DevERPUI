import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { Select, Tooltip } from "antd";
import "antd/dist/reset.css";
import themeStore from "./../../store/themeStore";
import { useStore } from "zustand";
import API from "../../CustomHooks/MasterApiHooks/api";
import { useParams } from "react-router-dom";

const { Option } = Select;

const QPMiddleArea = () => {
  const { groupId, groupName } = useParams();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [isGroupSelected, setIsGroupSelected] = useState(false);
  const [selectedGroupName, setSelectedGroupName] = useState("");
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

  const handleAddClick = () => {
    navigate(`/Add-Paper/${selectedGroupId}/${selectedGroupName}`);
  };

  // Fetching groups from API
  useEffect(() => {
    const getGroups = async () => {
      try {
        const response = await API.get("/Groups");
        setGroups(response.data);
      } catch (error) {
        console.error("Failed to fetch groups", error);
      }
    };
    getGroups();
  }, []);

  const handleGroupChange = (value) => {
    const selectedGroup = groups.find((group) => group.id === value);
    setSelectedGroupId(value);
    setSelectedGroupName(selectedGroup ? selectedGroup.name : "");
    setIsGroupSelected(true);
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ height: "80vh" }}
    >
      <div
        className="d-flex flex-column align-items-center justify-content-center p-4"
        style={{
          height: "80vh",
          backgroundColor: "#e9ecef",
          borderRadius: "10px",
          width: "100%",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        }}
      >
        <div>
          <h1
            className={`${customDarkText} mb-4`}
            style={{
              fontSize: "5rem",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            QP-Masters
          </h1>
          <Row className="mb-3 w-100 justify-content-center">
            <Col className="d-flex justify-content-between w-100">
              <Select
                showSearch
                placeholder="Select Group"
                className="m-2 w-100"
                onChange={handleGroupChange}
                value={selectedGroupId}
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
              >
                {groups.map((group) => (
                  <Option key={group.id} value={group.id}>
                    {group.name}
                  </Option>
                ))}
              </Select>
              <Select placeholder="Select Type" className="m-2 w-100">
                <Option value="type1">Type 1</Option>
                <Option value="type2">Type 2</Option>
              </Select>
              <Select placeholder="Select Course" className="m-2 w-100">
                <Option value="course1">Course 1</Option>
                <Option value="course2">Course 2</Option>
              </Select>
              <Select placeholder="Select Semester" className="m-2 w-100">
                <Option value="semester1">Semester 1</Option>
                <Option value="semester2">Semester 2</Option>
              </Select>
            </Col>
          </Row>
          <Row className="w-100 justify-content-center">
            <Col className="d-flex justify-content-center">
              <Button
                variant="outline-primary"
                className="me-2"
                style={{ borderRadius: "5px" }}
              >
                Apply & View
              </Button>
              {/* <Button variant="outline-success" style={{ borderRadius: "5px" }}>
                View All
              </Button> */}
            </Col>
          </Row>
          <Row className="w-100 justify-content-center mt-3">
            <span className={`${customDarkText} text-center fs-2 fw-bold`}>
              OR
            </span>
          </Row>
          <Row className="w-100 justify-content-center mt-3">
            <Col className="d-flex justify-content-center">
              <Tooltip
                title={!isGroupSelected ? "Please select a group first" : ""}
              >
                <span>
                  <Button
                    variant="outline-secondary"
                    style={{ borderRadius: "5px" }}
                    className="me-2"
                    onClick={handleAddClick}
                    disabled={!isGroupSelected}
                  >
                    Add
                  </Button>
                </span>
              </Tooltip>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};

export default QPMiddleArea;
