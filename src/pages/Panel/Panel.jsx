import React, { useState } from 'react';
import styled from 'styled-components';
import NotificationManager from './components/NotificationManager';
import DisplaySettings from './components/DisplaySettings';
import NotificationHistory from './components/NotificationHistory';
import NotificationTemplates from './components/NotificationTemplates';
import { FaBell, FaHistory, FaCog, FaBookOpen } from 'react-icons/fa';

const PanelContainer = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  background: #f8f9fa;
  min-height: 100vh;
`;

const Header = styled.div`
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #dee2e6;
`;

const TabList = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const TabButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 8px;
  background: ${props => props.$active ? '#007bff' : '#fff'};
  color: ${props => props.$active ? '#fff' : '#495057'};
  font-weight: 500;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);

  &:hover {
    background: ${props => props.$active ? '#0056b3' : '#f8f9fa'};
    transform: translateY(-1px);
  }

  svg {
    font-size: 1.1rem;
  }
`;

const ContentArea = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  overflow: hidden;
`;

const Panel = () => {
  const [activeTab, setActiveTab] = useState('notifications');

  const tabs = [
    { id: 'notifications', label: 'Notification Manager', icon: <FaBell /> },
    { id: 'history', label: 'History', icon: <FaHistory /> },
    { id: 'settings', label: 'Settings', icon: <FaCog /> },
    { id: 'templates', label: 'Templates', icon: <FaBookOpen /> }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'notifications':
        return <NotificationManager setActiveTab={setActiveTab} />;
      case 'history':
        return <NotificationHistory />;
      case 'settings':
        return <DisplaySettings />;
      case 'templates':
        return (
          <NotificationTemplates 
            onUseTemplate={(template) => {
              setActiveTab('notifications');
              // Template handling logic here
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <PanelContainer>
      <Header>
        <h2>Zonal Display Control Panel</h2>
      </Header>

      <TabList>
        {tabs.map(tab => (
          <TabButton
            key={tab.id}
            $active={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            {tab.label}
          </TabButton>
        ))}
      </TabList>

      <ContentArea>
        {renderContent()}
      </ContentArea>
    </PanelContainer>
  );
};

export default Panel;