import React, { useState } from 'react';
import styled from 'styled-components';
import { FaPalette, FaClock, FaBell, FaFont } from 'react-icons/fa';

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 1rem;
`;

const SettingCard = styled.div`
  background: #fff;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);

  .setting-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
    
    svg {
      font-size: 1.25rem;
      color: #007bff;
    }
  }
`;

const ColorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
`;

const ColorSetting = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  .color-preview {
    width: 100%;
    height: 40px;
    border-radius: 4px;
    margin-top: 0.25rem;
  }
`;

const DisplaySettings = () => {
  const [settings, setSettings] = useState({
    // Display Settings
    messageInterval: 10,
    defaultFontSize: 16,
    defaultFontFamily: 'Arial',
    
    // Notification Colors
    emergencyColor: '#ff0000',
    birthdayColor: '#ffd700',
    announcementColor: '#0000ff',
    catchNumberColor: '#ff8c00',
    defaultTextColor: '#000000',
    
    // Alert Settings
    soundEnabled: true,
    autoHideTimeout: 30,
    showProgressBar: true,
  });

  const handleChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Save settings to backend
    // console.log('Saving settings:', settings);
  };

  return (
    <form onSubmit={handleSubmit}>
      <SettingsGrid>
        {/* Display Settings */}
        <SettingCard>
          <div className="setting-header">
            <FaClock />
            <h5 className="m-0">Display Settings</h5>
          </div>
          <div className="mb-3">
            <label className="form-label">Message Rotation Interval (seconds)</label>
            <input
              type="number"
              className="form-control"
              value={settings.messageInterval}
              onChange={(e) => handleChange('messageInterval', parseInt(e.target.value))}
              min="5"
              max="60"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Default Font Size (px)</label>
            <input
              type="number"
              className="form-control"
              value={settings.defaultFontSize}
              onChange={(e) => handleChange('defaultFontSize', parseInt(e.target.value))}
              min="12"
              max="32"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Default Font Family</label>
            <select
              className="form-select"
              value={settings.defaultFontFamily}
              onChange={(e) => handleChange('defaultFontFamily', e.target.value)}
            >
              <option value="Arial">Arial</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Courier New">Courier New</option>
            </select>
          </div>
        </SettingCard>

        {/* Color Settings */}
        <SettingCard>
          <div className="setting-header">
            <FaPalette />
            <h5 className="m-0">Color Settings</h5>
          </div>
          <ColorGrid>
            <ColorSetting>
              <label className="form-label">Emergency</label>
              <input
                type="color"
                className="form-control form-control-color w-100"
                value={settings.emergencyColor}
                onChange={(e) => handleChange('emergencyColor', e.target.value)}
              />
              <div 
                className="color-preview" 
                style={{ background: settings.emergencyColor }}
              />
            </ColorSetting>
            <ColorSetting>
              <label className="form-label">Birthday</label>
              <input
                type="color"
                className="form-control form-control-color w-100"
                value={settings.birthdayColor}
                onChange={(e) => handleChange('birthdayColor', e.target.value)}
              />
              <div 
                className="color-preview" 
                style={{ background: settings.birthdayColor }}
              />
            </ColorSetting>
            <ColorSetting>
              <label className="form-label">Announcement</label>
              <input
                type="color"
                className="form-control form-control-color w-100"
                value={settings.announcementColor}
                onChange={(e) => handleChange('announcementColor', e.target.value)}
              />
              <div 
                className="color-preview" 
                style={{ background: settings.announcementColor }}
              />
            </ColorSetting>
            <ColorSetting>
              <label className="form-label">Catch Number</label>
              <input
                type="color"
                className="form-control form-control-color w-100"
                value={settings.catchNumberColor}
                onChange={(e) => handleChange('catchNumberColor', e.target.value)}
              />
              <div 
                className="color-preview" 
                style={{ background: settings.catchNumberColor }}
              />
            </ColorSetting>
            <ColorSetting>
              <label className="form-label">Default Text</label>
              <input
                type="color"
                className="form-control form-control-color w-100"
                value={settings.defaultTextColor}
                onChange={(e) => handleChange('defaultTextColor', e.target.value)}
              />
              <div 
                className="color-preview" 
                style={{ background: settings.defaultTextColor }}
              />
            </ColorSetting>
          </ColorGrid>
        </SettingCard>

        {/* Alert Settings */}
        <SettingCard>
          <div className="setting-header">
            <FaBell />
            <h5 className="m-0">Alert Settings</h5>
          </div>
          <div className="mb-3 form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="soundEnabled"
              checked={settings.soundEnabled}
              onChange={(e) => handleChange('soundEnabled', e.target.checked)}
            />
            <label className="form-check-label" htmlFor="soundEnabled">
              Enable Sound Notifications
            </label>
          </div>
          <div className="mb-3">
            <label className="form-label">Auto-hide Timeout (seconds)</label>
            <input
              type="number"
              className="form-control"
              value={settings.autoHideTimeout}
              onChange={(e) => handleChange('autoHideTimeout', parseInt(e.target.value))}
              min="5"
              max="300"
            />
          </div>
          <div className="mb-3 form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="showProgressBar"
              checked={settings.showProgressBar}
              onChange={(e) => handleChange('showProgressBar', e.target.checked)}
            />
            <label className="form-check-label" htmlFor="showProgressBar">
              Show Progress Bar
            </label>
          </div>
        </SettingCard>
      </SettingsGrid>

      <div className="d-flex justify-content-end p-3">
        <button type="submit" className="btn btn-primary">
          Save Settings
        </button>
      </div>
    </form>
  );
};

export default DisplaySettings;