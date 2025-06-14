import React, { useState, useEffect } from "react";
import { Container, Row, Col, Nav, Offcanvas } from "react-bootstrap";
import {
  FaUsers, FaProjectDiagram, FaBell, FaUserPlus, FaUserCog, FaListUl,
  FaCamera, FaCog, FaCaretDown, FaCaretLeft,
  FaCaretRight,
  FaCalendarAlt
} from 'react-icons/fa';
import { RiMenuFold4Fill, RiTeamFill, RiUserSettingsFill } from "react-icons/ri";
import { GiGears } from "react-icons/gi";
import { AiFillCloseSquare } from "react-icons/ai";
import { FaBookOpenReader, FaScrewdriverWrench } from "react-icons/fa6";
import { BiSolidCctv } from "react-icons/bi";
import { BsQuestionSquareFill } from "react-icons/bs";
import GroupManager from './Group';
import SessionManager from './Session';
import ExamTypeManager from './ExamType';
import LanguageManager from './Language';
import SubjectManager from './Subject';
import CourseManager from './Course';
import Project from './ProjectMaster/Project';
import Zone from './Zone';
import Type from './Type';
import AlarmMaster from './Alarm';
import Machine from './ProductionMachine';
import './../styles/Sidebar.css';
import AddUsers from '../sub-Components/addUsers';
import AllUsers from '../sub-Components/allUsers';
import CameraList from './CameraList';
import RolesAndDepartments from './Roles/RolePage';
import SystemSettings from './Configurtaion/SystemSettings';
import themeStore from './../store/themeStore';
import { useStore } from 'zustand';
import { hasPermission } from '../CustomHooks/Services/permissionUtils';
import { useTranslation } from 'react-i18next';
import SecurityQuestions from './SecurityQuestions';
import Teams from './team';
import DisplayPanel from './Panel/Panel';
import { TbCircleLetterMFilled, TbLanguage } from "react-icons/tb";
import { PiExamFill } from 'react-icons/pi';
import { MdSubject } from "react-icons/md";
import { SiCoursera } from "react-icons/si";
import { FaBook } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import ABCDMaster from "./ABCDMaster";
import TaskScheduledToday from "./DailyTask/TaskScheduledToday";




const Sidebar = () => {
  const { t } = useTranslation();
  const { getCssClasses } = useStore(themeStore);
  const [
    customDark,
    customMid,
    customLight,
    ,
    customDarkText,
    customLightText,
    customLightBorder,
    customDarkBorder,
  ] = getCssClasses();
  const navigate = useNavigate();

  const [selectedMenu, setSelectedMenu] = useState(
    localStorage.getItem("activeTab") || "group"
  );
  const [expandedMenus, setExpandedMenus] = useState({});
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleResize = () => window.innerWidth >= 992 && setShow(false);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const activeTab = localStorage.getItem("activeTab");
    if (activeTab) {
      const parentMenu = menuItems.find(
        (menu) =>
          menu.children &&
          menu.children.some((child) => child.key === activeTab)
      );
      if (parentMenu) {
        setExpandedMenus((prevState) => ({
          ...prevState,
          [parentMenu.key]: true,
        }));
      }
    }
  }, []);

  const handleMenuClick = (key) => {
    setSelectedMenu(key);
    localStorage.setItem("activeTab", key);
    if (key === "qpMasters") {
      navigate("/QP-Masters");
      localStorage.removeItem("activeTab");
    }
    if (!expandedMenus[key]) {
      setTimeout(() => setShow(false), 300);
    }
  };

  const toggleDropdown = (key) => {
    setExpandedMenus((prevState) => ({ ...prevState, [key]: !prevState[key] }));
  };

  const menuItems = [
    {
      key: "userManagement",
      icon: <RiUserSettingsFill />,
      label: t("userManagement"),
      permission: "2.1",
      children: [
        {
          key: "RolePage",
          icon: <FaUserCog />,
          label: t("role"),
          permission: "2.1.1",
        },
        {
          key: "addUser",
          icon: <FaUserPlus />,
          label: t("addUser"),
          permission: "2.1.2",
        },
        {
          key: "allUsers",
          icon: <FaListUl />,
          label: t("allUsers"),
          permission: "2.1.3",
        },
      ],
    },
    { key: 'systemSettings', icon: <FaCog />, label: t('processSettings'), permission: '2.10' },
    { key: 'qpMasters', icon: <FaBook />, label: t('qpMasters'), permission: '2.12' },
    { key: 'group', icon: <FaUsers />, label: t('group'), permission: '2.2' },
    { key: 'type', icon: <FaBookOpenReader />, label: t('projectType'), permission: '2.3' },
    { key: 'project', icon: <FaProjectDiagram />, label: t('project'), permission: '2.4' },
    { key: 'camera', icon: <FaCamera />, label: t('camera'), permission: '2.6' },
    { key: 'machine', icon: <GiGears />, label: t('productionMachines'), permission: '2.7' },
    { key: 'zone', icon: <BiSolidCctv />, label: t('zone'), permission: '2.5' },
    { key: 'teams', icon: <RiTeamFill />, label: t('teams'), permission: '2.9' },
    { key: 'alarm', icon: <FaBell />, label: t('alarm'), permission: '2.8' },
    { key: 'session', icon: <FaCalendarAlt  />, label: t('session'), permission: '2.8' },
    { key: 'examType', icon: <PiExamFill  />, label: t('Semester'), permission: '2.8' },
    { key: 'language', icon: <TbLanguage />, label: t('language'), permission: '2.8' },
    { key: 'subject', icon: <MdSubject />, label: t('subject'), permission: '2.8' },
    { key: 'course', icon: <SiCoursera />, label: t('course'), permission: '2.8' },
    {key: "display-panel",icon: <FaBell />,label: t("displayPanel"),permission: "2.11", },
    {key: "abcd", icon:<PiExamFill/>, label: t("abcd"), permission: "2.8" },
    {key: "DailyTask", icon:<PiExamFill/>, label: t("DailyTask"), permission: "2.12" },




    {
      key: "developerTools",
      icon: <FaScrewdriverWrench />,
      label: t("developerTools"),
      permission: "2.11",
      children: [
        {
          key: "questions",
          icon: <BsQuestionSquareFill />,
          label: t("questions"),
          permission: "2.1.4",
        },
      ],
    },
  ];

  const allowedMenuItems = menuItems.filter((menu) => {
    if (menu.children) {
      menu.children = menu.children.filter((child) =>
        hasPermission(child.permission)
      );
      return menu.children.length > 0;
    }
    return hasPermission(menu.permission);
  });

  const renderNavItems = (items, isOffcanvas = false) => {
    return items.map((menu) => (
      <React.Fragment key={menu.key}>
        <Nav.Link
          onClick={() =>
            menu.children ? toggleDropdown(menu.key) : handleMenuClick(menu.key)
          }
          className={`d-flex align-items-center ${
            customDark === "dark-dark" ? `sidebar-item-dark` : `sidebar-item`
          } ${
            selectedMenu === menu.key
              ? `active rounded-start rounded-end-5 ${customMid}`
              : `rounded-start rounded-end-5 text-dark`
          } hover:bg-my-hover-bg hover:text-my-hover-text`}
        >
          {React.cloneElement(menu.icon, {
            className: `${
              customDark === "dark-dark" ? `text-white` : customDarkText
            } menu-icon me-2`,
          })}
          <span
            className={`${
              customDark === "dark-dark" ? `text-white` : customDarkText
            } ${isOffcanvas ? "" : "d-none d-md-block d-lg-block"}`}
          >
            {menu.label}
          </span>
          {menu.children && (
            <span className="ms-auto">
              {expandedMenus[menu.key] ? (
                <FaCaretDown
                  className={
                    customDark === "dark-dark" ? `text-white` : customDarkText
                  }
                  size={25}
                />
              ) : (
                <FaCaretRight
                  className={
                    customDark === "dark-dark" ? "text-white" : customDarkText
                  }
                  size={25}
                />
              )}
            </span>
          )}
        </Nav.Link>
        {menu.children &&
          expandedMenus[menu.key] &&
          menu.children.map((child) => (
            <Nav.Link
              key={child.key}
              onClick={() => handleMenuClick(child.key)}
              className={`ms-4 d-flex align-items-center ${
                customDark === "dark-dark"
                  ? `sidebar-item-dark`
                  : `sidebar-item`
              } ${
                selectedMenu === child.key
                  ? `active rounded-start rounded-end-5 ${customMid}`
                  : "rounded-start rounded-end-5"
              } hover:bg-my-hover-bg hover:text-my-hover-text`}
            >
              {React.cloneElement(child.icon, {
                className: `${
                  customDark === "dark-dark" ? `text-white` : customDarkText
                } menu-icon me-2`,
              })}
              <span
                className={`${
                  customDark === "dark-dark" ? `text-white` : customDarkText
                }`}
              >
                {child.label}
              </span>
            </Nav.Link>
          ))}
      </React.Fragment>
    ));
  };

  return (
    <Container
      fluid
      className={`rounded-4 ${
        customDark === "dark-dark" ? `border` : `shadow-lg`
      }`}
    >
      <Row>
        <Col
          lg={3}
          className={`vh-100 overflow-auto sidebar rounded-start-4 d-none d-lg-block ${
            customDark === "dark-dark" ? customDark : ""
          }`}
        >
          <Nav className="flex-column">{renderNavItems(allowedMenuItems)}</Nav>
        </Col>
        <div className="small-sidebar d-lg-none">
          <button
            className={`mt-2 ${
              customDark === "dark-dark"
                ? `${customDark} ${customLightText} ${customLightBorder}`
                : `${customDark} ${customLightText} border-0`
            } p-1 rounded`}
            onClick={() => setShow(true)}
          >
            <RiMenuFold4Fill size={25} />
          </button>
          <Offcanvas
            show={show}
            onHide={() => setShow(false)}
            placement="start"
            className={customDark === "dark-dark" ? customDark : customLight}
            style={{ width: "80%", zIndex: "9999" }}
          >
            <Offcanvas.Header
              closeButton={false}
              className={`${customDark} ${customLightText} d-flex justify-content-between`}
            >
              <Offcanvas.Title
                className={customDark === "dark-dark" ? `text-white` : ""}
              >
                {t("menu")}
              </Offcanvas.Title>
              <AiFillCloseSquare
                size={35}
                onClick={() => setShow(false)}
                className={`${
                  customDark === "dark-dark"
                    ? "text-dark bg-white"
                    : `${customDark} custom-zoom-btn text-white ${customDarkBorder}`
                } rounded-2`}
                aria-label="Close"
                style={{ cursor: "pointer", fontSize: "1.5rem" }}
              />
            </Offcanvas.Header>
            <Offcanvas.Body>
              <Nav className="flex-column">
                {renderNavItems(allowedMenuItems, true)}
              </Nav>
            </Offcanvas.Body>
          </Offcanvas>
        </div>
        <Col lg={9} md={12} sm={12} xm={12} className={`content-area rounded-end-4 ${customMid} shadow-`}>
          {hasPermission('2.1.1') && selectedMenu === 'RolePage' && <RolesAndDepartments />}
          {hasPermission('2.1.2') && selectedMenu === 'addUser' && <AddUsers />}
          {hasPermission('2.1.3') && selectedMenu === 'allUsers' && <AllUsers />}
          {hasPermission('2.1.4') && selectedMenu === 'questions' && <SecurityQuestions />}
          {hasPermission('2.2') && selectedMenu === 'group' && <GroupManager />}
          {hasPermission('2.3') && selectedMenu === 'type' && <Type />}
          {hasPermission('2.4') && selectedMenu === 'project' && <Project />}
          {hasPermission('2.9') && selectedMenu === 'teams' && <Teams />}
          {hasPermission('2.5') && selectedMenu === 'zone' && <Zone />}
          {hasPermission('2.6') && selectedMenu === 'camera' && <CameraList />}
          {hasPermission('2.10') && selectedMenu === 'systemSettings' && <SystemSettings />}
          {hasPermission('2.7') && selectedMenu === 'machine' && <Machine />}
          {hasPermission('2.8') && selectedMenu === 'alarm' && <AlarmMaster />}
          {hasPermission('2.8') && selectedMenu === 'session' && <SessionManager />}
          {hasPermission('2.8') && selectedMenu === 'examType' && <ExamTypeManager />}
          {hasPermission('2.8') && selectedMenu === 'language' && <LanguageManager />}
          {hasPermission('2.8') && selectedMenu === 'subject' && <SubjectManager />}
          {hasPermission('2.8') && selectedMenu === 'course' && <CourseManager />}
          {hasPermission('2.8') && selectedMenu === 'abcd' && <ABCDMaster/>}
          {hasPermission("2.11") && selectedMenu === "display-panel" && (<DisplayPanel />)}
          {hasPermission("2.12") && selectedMenu === "DailyTask" && (<TaskScheduledToday />)}
        </Col>
      </Row>
    </Container>
  );
};

export default Sidebar;
