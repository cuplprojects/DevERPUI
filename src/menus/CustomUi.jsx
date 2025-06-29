import React, { useState, useRef, useEffect } from 'react';
import { Offcanvas, Form, Button, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { IoSettings } from "react-icons/io5";
import ThemeSelector from './ThemeSelector';
import UiIconRed from "./../assets/Icons/UiIconRed.png";
import UiIconBlue from "./../assets/Icons/UiIconBlue.png";
import UiIconGreen from "./../assets/Icons/UiIconGreen.png";
import UiIconPurple from "./../assets/Icons/UiIconPruple.png";
import UiIconDark from "./../assets/Icons/UiIconDark.png";
import UiIconLight from "./../assets/Icons/UiIconLight.png";
import UiIconPink from "./../assets/Icons/UiIconPink.png";
import UiIconBrown from "./../assets/Icons/UiIconBrown.png";
import UiIconDefault from "./../assets/Icons/UiIconDefault.png";
import themeStore from './../store/themeStore';
import { useStore } from 'zustand';
import LanguageSwitcher from './LanguageSwitcher';
import { AiFillCloseSquare } from "react-icons/ai";
import useShowLabelIdStore from './../store/showLabelIdStore';
import { useTranslation } from 'react-i18next';
import { hasPermission } from '../CustomHooks/Services/permissionUtils';

export const openCustomUiSidebar = () => {
  const event = new CustomEvent('openCustomUiSidebar');
  window.dispatchEvent(event);
};

const loadFontSizeFromLocalStorage = () => {
  const userSettings = localStorage.getItem('userSettings');
  if (userSettings) {
    try {
      const parsedSettings = JSON.parse(userSettings);
      const fontSize = parsedSettings?.settings?.general?.fontSize;

      if (fontSize) {
        // If it's a string number like "18", convert it to number
        const parsedSize = parseInt(fontSize, 10);
        if (!isNaN(parsedSize)) return parsedSize;

        // Handle fallback named sizes
        const sizeMap = { small: 12, medium: 16, large: 20 };
        return sizeMap[fontSize] || 16;
      }
    } catch (error) {
      console.error('Failed to parse fontSize from userSettings:', error);
    }
  }
  return 16;
};



const CustomUi = () => {
  const { t } = useTranslation();
  const { getCssClasses } = useStore(themeStore);
  const cssClasses = getCssClasses();
  const [customDark, customMid, customLight, customBtn, customDarkText, customLightText, customLightBorder, customDarkBorder] = cssClasses;

  const { showLabelId, toggleShowLabelId } = useShowLabelIdStore();

  const [show, setShow] = useState(false);

  const updateFontSizeInLocalStorage = (newFontSize) => {
    try {
      const userSettings = JSON.parse(localStorage.getItem('userSettings') || '{}');

      if (!userSettings.settings) {
        userSettings.settings = {};
      }

      if (!userSettings.settings.general) {
        userSettings.settings.general = {};
      }

      // Update the font size in general settings
      userSettings.settings.general.fontSize = `${newFontSize}px`;
      localStorage.setItem('userSettings', JSON.stringify(userSettings));
    } catch (error) {
      console.error('Failed to update font size in localStorage:', error);
    }
  };

  const handleFontSizeChange = (e) => {
    const newFontSize = parseInt(e.target.value, 10);
    setFontSize(newFontSize);
    updateFontSizeInLocalStorage(newFontSize);
  };

  const [fontSize, setFontSize] = useState(() => loadFontSizeFromLocalStorage());

  const [isFullScreen, setIsFullScreen] = useState(false);

  const dragRef = useRef(null);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  useEffect(() => {
    const handleOpenSidebar = () => setShow(true);
    window.addEventListener('openCustomUiSidebar', handleOpenSidebar);
    return () => {
      window.removeEventListener('openCustomUiSidebar', handleOpenSidebar);
    };
  }, []);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
  }, [fontSize]);

  const handleReset = () => setFontSize(16);

  const toggleFullScreen = () => {
    if (!isFullScreen) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen();
      } else if (document.documentElement.msRequestFullscreen) {
        document.documentElement.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
    setIsFullScreen(!isFullScreen);
  };

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(document.fullscreenElement != null);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, []);

  useEffect(() => {
    const handleStart = (e) => {
      e.preventDefault();
      const elem = dragRef.current;
      const rect = elem.getBoundingClientRect();
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const offsetY = clientY - rect.top;

      const handleMove = (e) => {
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const newY = Math.max(0, Math.min(window.innerHeight - rect.height, clientY - offsetY));
        elem.style.top = `${newY}px`;
      };

      const handleEnd = () => {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleEnd);
        document.removeEventListener('touchmove', handleMove);
        document.removeEventListener('touchend', handleEnd);
      };

      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleMove);
      document.addEventListener('touchend', handleEnd);
    };

    const draggableElement = dragRef.current;
    if (draggableElement) {
      draggableElement.addEventListener('mousedown', handleStart);
      draggableElement.addEventListener('touchstart', handleStart);
    }

    return () => {
      if (draggableElement) {
        draggableElement.removeEventListener('mousedown', handleStart);
        draggableElement.removeEventListener('touchstart', handleStart);
      }
    };
  }, []);


  return (
    <>
      <Offcanvas show={show} onHide={handleClose} placement="end" style={{ zIndex: "9999999" }}>
        <Offcanvas.Header closeButton={false} className={`${customDark} ${customLightText} d-flex justify-content-between`}>
          <Offcanvas.Title>{t('customUiMenu')}</Offcanvas.Title>
          <Button
            variant="link"
            className={`close-button ${customDark} ${customLightText}`}
            style={{ padding: 0, fontSize: 18 }}
            onClick={handleClose}
          >
            <AiFillCloseSquare size={40} className='rounded-5' />
          </Button>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Row className="align-items-center mb-3">
            <Col>
              <Form.Label>{t('fontSize')}</Form.Label>
            </Col>
            <Col className="text-end">
              <Button variant="outline-secondary" size="sm" onClick={handleReset}>
                {t('reset')}
              </Button>
            </Col>
          </Row>
          <Form.Group controlId="fontSizeSlider">
            <Form.Range
              min={12}
              max={24}
              step={1}
              value={fontSize}
              onChange={handleFontSizeChange}
            />
            <Form.Text className="text-muted">
              {t('currentFontSize')}: {fontSize}px
            </Form.Text>
          </Form.Group>
          <Row className="mt-4 align-items-center">
            <Col>
              <Form.Label>{t('fullScreenMode')}</Form.Label>
              <Form.Check
                type="switch"
                id="fullScreenSwitch"
                checked={isFullScreen}
                onChange={toggleFullScreen}
                label={isFullScreen ? t('on') : t('off')}
              />
            </Col>
          </Row>
          {hasPermission('3') && (
            <Row className="mt-4 align-items-center">
              <Col>
                <Form.Label>{t('showLabelId')}</Form.Label>
                <Form.Check
                  type="switch"
                  id="showLabelIdSwitch"
                  checked={showLabelId}
                  onChange={toggleShowLabelId}
                  label={showLabelId ? t('on') : t('off')}
                />
              </Col>
            </Row>
          )}
          <Row className="mt-4 align-items-center">
            <Col>
              <ThemeSelector />
            </Col>
          </Row>
          <Row className="mt-4 align-items-center">
            <Col>
              <LanguageSwitcher />
            </Col>
          </Row>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default CustomUi;
