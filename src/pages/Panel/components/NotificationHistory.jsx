import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaSearch, FaCalendarAlt, FaFilter, FaDownload, FaRedo } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const HistoryContainer = styled.div`
  padding: 1.5rem;
`;

const FilterSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: end;
`;

const StyledTable = styled.div`
  overflow-x: auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);

  table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;

    th, td {
      padding: 1rem;
      border-bottom: 1px solid #eee;
      text-align: left;
    }

    th {
      background: #f8f9fa;
      font-weight: 600;
      color: #495057;
    }

    tr:hover td {
      background: #f8f9fa;
    }

    tr:last-child td {
      border-bottom: none;
    }
  }
`;

const Badge = styled.span`
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  
  &.type-birthday { background: #e8f4ff; color: #0066cc; }
  &.type-emergency { background: #ffe8e8; color: #cc0000; }
  &.type-announcement { background: #fff3e8; color: #cc6600; }
  
  &.status-active { background: #e8ffe8; color: #006600; }
  &.status-expired { background: #f0f0f0; color: #666666; }
`;

const DateRangePicker = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  color: #666;
  transition: all 0.2s;

  &:hover {
    background: #007bff;
    color: white;
    border-color: #007bff;
  }
`;

const NotificationHistory = ({ setActiveTab }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, expired
  const navigate = useNavigate();

  // Sample data - replace with actual API call
  useEffect(() => {
    // Simulated API call
    setTimeout(() => {
      setNotifications([
        {
          id: 1,
          message: "Happy Birthday John Doe!",
          type: "birthday",
          status: "active",
          createdAt: "2024-03-20 10:00:00",
          expiryTime: "2024-03-20 11:00:00"
        },
        {
          id: 2,
          message: "Emergency: Fire Drill at 3 PM",
          type: "emergency",
          status: "expired",
          createdAt: "2024-03-19 15:00:00",
          expiryTime: "2024-03-19 16:00:00"
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge bg="success">Active</Badge>;
      case 'expired':
        return <Badge bg="secondary">Expired</Badge>;
      default:
        return <Badge bg="primary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'birthday':
        return <Badge bg="info">Birthday</Badge>;
      case 'emergency':
        return <Badge bg="danger">Emergency</Badge>;
      case 'announcement':
        return <Badge bg="warning">Announcement</Badge>;
      default:
        return <Badge bg="primary">{type}</Badge>;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || notification.status === filter;
    return matchesSearch && matchesFilter;
  });

  const exportHistory = () => {
    // Export logic here
    const csvContent = filteredNotifications.map(n => 
      [n.type, n.message, n.status, n.createdAt, n.expiryTime].join(',')
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notification-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleRepush = (notification) => {
    // Store notification data in localStorage or state management
    localStorage.setItem('repushNotification', JSON.stringify(notification));
    // Switch to notifications tab
    setActiveTab('notifications');
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <HistoryContainer>
      <FilterSection>
        <div className="search-box">
          <label className="form-label">Search</label>
          <div className="input-group">
            <span className="input-group-text">
              <FaSearch />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="form-label">Status</label>
          <select 
            className="form-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        <DateRangePicker>
          <div>
            <label className="form-label">Date Range</label>
            <div className="input-group">
              <span className="input-group-text">
                <FaCalendarAlt />
              </span>
              <input type="date" className="form-control" />
            </div>
          </div>
          <div className="mt-auto">to</div>
          <div className="mt-auto">
            <input type="date" className="form-control" />
          </div>
        </DateRangePicker>

        <div className="d-flex justify-content-end align-items-end">
          <ActionButton onClick={exportHistory}>
            <FaDownload />
            Export
          </ActionButton>
        </div>
      </FilterSection>

      <StyledTable>
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Message</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Expires At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredNotifications.map(notification => (
              <tr key={notification.id}>
                <td>
                  <Badge className={`type-${notification.type}`}>
                    {notification.type}
                  </Badge>
                </td>
                <td>{notification.message}</td>
                <td>
                  <Badge className={`status-${notification.status}`}>
                    {notification.status}
                  </Badge>
                </td>
                <td>{new Date(notification.createdAt).toLocaleString()}</td>
                <td>{new Date(notification.expiryTime).toLocaleString()}</td>
                <td>
                  <ActionButton
                    onClick={() => handleRepush(notification)}
                    title="Repush Notification"
                  >
                    <FaRedo />
                  </ActionButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </StyledTable>

      {filteredNotifications.length === 0 && (
        <div className="text-center p-5">
          <img 
            src="/assets/empty-state.svg" 
            alt="No notifications" 
            style={{ width: '200px', marginBottom: '1rem' }}
          />
          <h4>No Notifications Found</h4>
          <p className="text-muted">
            {searchTerm || filter !== 'all' 
              ? "Try adjusting your search criteria"
              : "No notification history available"}
          </p>
        </div>
      )}
    </HistoryContainer>
  );
};

export default NotificationHistory;