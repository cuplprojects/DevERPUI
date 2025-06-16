import React, { useState, useRef, useEffect } from 'react';
import { FaUserCircle, FaBars } from 'react-icons/fa';
import { Container, Row, Col, Tooltip, OverlayTrigger } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import NavigationBar from '../menus/NavigationBar';
import UserMenu from '../menus/UserMenu';
import "./../styles/navbar.css";
import themeStore from './../store/themeStore';
import { useStore } from 'zustand';
import { Link } from 'react-router-dom';
import useUserDataStore, { useUserData, useUserDataActions } from '../store/userDataStore';
import { NoticeBoard, NoticeBoardButton } from './../pages/DailyTask/TodayTaskIcon';
import API from './../CustomHooks/MasterApiHooks/api';
import SampleUser1 from "./../assets/sampleUsers/defaultUser.jpg";
import { MdViewModule, MdViewList } from "react-icons/md";
import { useTranslation } from 'react-i18next';
const apiUrl = import.meta.env.VITE_API_BASE_URL;

const Navbar = () => {
  const { t } = useTranslation();

  //Theme Change Section
  const { getCssClasses } = useStore(themeStore);
  const [
    customDark,
    customMid,
    customLight,
    customBtn,
    customDarkText,
    customLightText,
    customLightBorder,
    customDarkBorder
  ] = getCssClasses();

  const [showNav, setShowNav] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  // State for dashboard view toggle (project-wise vs lot-wise)
  const [dashboardViewMode, setDashboardViewMode] = useState('project'); // 'project' or 'lot'

  const navRef = useRef(null);
  const userMenuRef = useRef(null);
  const notificationRef = useRef(null);
  const containerRef = useRef(null);

  const userData = useUserData();
  const { fetchUserData } = useUserDataActions();
  const [showNoticeBoard, setShowNoticeBoard] = useState(false);
  const [dispatchData, setDispatchData] = useState([]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    API.get('/Dispatch/dispatch-summary-today')
      .then(response => {
        setDispatchData(response.data);
        console.log(response.data);
      })
      .catch(error => {
        console.error('Error fetching dispatch data:', error);
      });
  }, []);

  const toggleNav = () => {
    setShowNav(prev => !prev);
    setUserMenu(false);
    setShowNotification(false);
  };

  const toggleUserMenu = () => {
    setUserMenu(prev => !prev);
    setShowNav(false);
    setShowNotification(false);
  };

  const toggleNotificationMenu = () => {
    setShowNotification(prev => !prev);
    setShowNav(false);
    setUserMenu(false);
  };

  // Toggle function for dashboard view
  const toggleDashboardView = () => {
    setDashboardViewMode(prev => prev === 'project' ? 'lot' : 'project');
  };

  const handleClickOutside = (event) => {
    if (
      containerRef.current &&
      !containerRef.current.contains(event.target) &&
      navRef.current && !navRef.current.contains(event.target) &&
      userMenuRef.current && !userMenuRef.current.contains(event.target) &&
      notificationRef.current && !notificationRef.current.contains(event.target)
    ) {
      setShowNav(false);
      setUserMenu(false);
      setShowNotification(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (navRef.current) {
      navRef.current.style.maxHeight = showNav ? `${navRef.current.scrollHeight}px` : '0';
    }
  }, [showNav]);

  useEffect(() => {
    if (userMenuRef.current) {
      userMenuRef.current.style.maxHeight = userMenu ? `${userMenuRef.current.scrollHeight}px` : '0';
    }
  }, [userMenu]);

  useEffect(() => {
    if (notificationRef.current) {
      notificationRef.current.style.maxHeight = showNotification ? `${notificationRef.current.scrollHeight}px` : '0';
    }
  }, [showNotification]);

  const closeNav = () => {
    setShowNav(false);
  };

  const closeUserMenu = () => {
    setUserMenu(false);
  };

  const isValidImageUrl = (url) => {
    return url && url.match(/\.(jpeg|jpg|gif|png)$/) != null;
  };

  const getProfileImageSrc = () => {
    if (userData?.profilePicturePath && isValidImageUrl(`${apiUrl}/${userData.profilePicturePath}`)) {
      return `${apiUrl}/${userData.profilePicturePath}`;
    }
    return SampleUser1;
  };

  return (
    <div ref={containerRef} className='sticky-to'>
      <Container fluid className={`border-bottom py-2 text-white ${customDark}`}>
        <Row className="align-items-center">
          {/* Menu Button */}
          <Col xs={1} md={2} lg={1} className="d-flex align-items-center">
            <button
              onClick={toggleNav}
              className="btn p-0 border-0 bg-transparent"
              aria-label="Toggle navigation"
              style={{ cursor: 'pointer' }}
            >
              <FaBars className="fs-3 text-light custom-zoom-btn" />
            </button>
          </Col>

          {/* Title */}
          <Col xs={9} md={7} lg={9} className="d-flex align-items-center justify-content-center position-relative">
            <Link to="/" className="ms-2 fw-bold fs-4 text-light " style={{ textDecoration: "none" }}>CUPL | ApexERP</Link>


          </Col>

          {/* Innovative Dashboard View Toggle */}
          <Col xs={2} md={2} lg={1} >
            <div
              className="position-relative d-flex align-items-center justify-content-end"
              style={{
                right: '20px',
                zIndex: 1000
              }}
            >
              <OverlayTrigger
                placement="bottom"
                overlay={
                  <Tooltip id="dashboard-view-tooltip">
                    {dashboardViewMode === 'project'
                      ? t('switchToLotView') || 'Switch to Lot View'
                      : t('switchToProjectView') || 'Switch to Project View'
                    }
                  </Tooltip>
                }
              >
                <div
                  onClick={toggleDashboardView}
                  className="d-flex align-items-center justify-content-center rounded-pill shadow-sm"
                  style={{
                    width: '88px',
                    height: '40px',
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    padding: '4px 0px'
                  }}
                >
                  {/* Sliding Background Indicator */}
                  <div
                    className="position-absolute rounded-pill"
                    style={{
                      width: '38px',
                      height: '32px',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      top: '4px',
                      left: dashboardViewMode === 'project' ? '4px' : '46px',
                      transition: 'left 0.3s ease',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                    }}
                  />

                  {/* Icons */}
                  <div className="d-flex align-items-center justify-content-center w-100 position-relative">
                    <div
                      className="d-flex align-items-center justify-content-center"
                      style={{
                        width: '38px',
                        height: '32px',
                        zIndex: 1,
                        padding: '2px'
                      }}
                    >
                      <MdViewModule
                        size={18}
                        color={dashboardViewMode === 'project' ? '#333' : 'rgba(255, 255, 255, 0.8)'}
                        style={{ transition: 'color 0.3s ease' }}
                      />
                    </div>
                    <div
                      className="d-flex align-items-center justify-content-center"
                      style={{
                        width: '38px',
                        height: '32px',
                        zIndex: 1,
                        padding: '2px'
                      }}
                    >
                      <MdViewList
                        size={18}
                        color={dashboardViewMode === 'lot' ? '#333' : 'rgba(255, 255, 255, 0.8)'}
                        style={{ transition: 'color 0.3s ease' }}
                      />
                    </div>
                  </div>
                </div>
              </OverlayTrigger>
            </div>
          </Col>

          <Col xs={2} md={1} lg={1} className="d-flex align-items-center justify-content-end">
            <NoticeBoardButton
              onClick={() => setShowNoticeBoard(!showNoticeBoard)}
              showNoticeBoard={showNoticeBoard}
              customDark={customDark}
              customLightText={customLightText}
              style={{ marginLeft: 'auto', marginRight: '10px' }}
            />
            <button
              onClick={toggleUserMenu}
              className="btn p-0 border-0 bg-transparent"
              aria-label="Toggle user menu"
              style={{
                cursor: 'pointer',
                width: '40px',
                height: '40px',
                overflow: 'hidden',
                padding: 0,
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexShrink: 0
              }}
            >
              <img
                src={getProfileImageSrc()}
                alt={`${userData?.firstName} ${userData?.lastName}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </button>
          </Col>
        </Row>
      </Container>

      <div
        ref={navRef}
        className='m-1 border rounded-bottom-5'
        style={{
          position: 'absolute',
          left: 0,
          overflow: 'hidden',
          transition: '600ms ease-in-out, opacity 600ms ease-in-out',
          opacity: showNav ? 1 : 0,
          // zIndex: 1,
        }}
      >
        <NavigationBar onLinkClick={closeNav} onClose={closeNav} />
      </div>

      <div
        ref={userMenuRef}
        className='m-1'
        style={{
          width: 'auto',
          position: 'absolute',
          top: '53px',
          right: '0',
          overflow: 'hidden',
          transition: '500ms ease-in-out, opacity 500ms ease-in-out',
          opacity: userMenu ? 1 : 0,
          // zIndex: 999,
        }}
      >
        <UserMenu onClose={closeUserMenu} />
      </div>

      {/* Notice Board Component */}
      <NoticeBoard
        show={showNoticeBoard}
        onHide={() => setShowNoticeBoard(false)}
        dispatchData={dispatchData}
      />
    </div>
  );
};

export default Navbar;
