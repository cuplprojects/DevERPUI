import React from 'react';

const NotificationQueue = ({ setActiveTab }) => {
  // This would typically come from your state management system
  const queuedNotifications = [
    {
      id: 1,
      message: "Happy Birthday John Doe!",
      type: "birthday",
      expiryTime: "2024-03-20 15:30:00",
      priority: "normal",
      status: "active"
    },
    {
      id: 2,
      message: "Team meeting in Conference Room A",
      type: "inscreen",
      expiryTime: "2024-03-20 16:00:00",
      priority: "normal",
      status: "queued"
    },
    {
      id: 3,
      message: "Emergency: Fire Drill at 3 PM",
      type: "emergency",
      expiryTime: "2024-03-20 15:45:00",
      priority: "urgent",
      status: "queued"
    }
  ];

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-danger';
      case 'high':
        return 'bg-warning';
      case 'normal':
        return 'bg-primary';
      default:
        return 'bg-secondary';
    }
  };

  const getTypeBadgeClass = (type) => {
    switch (type) {
      case 'birthday':
        return 'bg-success';
      case 'emergency':
        return 'bg-danger';
      case 'inscreen':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  };

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="card-title mb-0">Notification Queue</h5>
        <span className="badge bg-primary">{queuedNotifications.length}</span>
      </div>
      <div className="card-body p-0">
        <div className="list-group list-group-flush">
          {queuedNotifications.map((notification) => (
            <div key={notification.id} className="list-group-item">
              <div className="d-flex justify-content-between align-items-start mb-1">
                <div className="d-flex gap-2">
                  <span className={`badge ${getTypeBadgeClass(notification.type)}`}>
                    {notification.type}
                  </span>
                  <span className={`badge ${getPriorityBadgeClass(notification.priority)}`}>
                    {notification.priority}
                  </span>
                </div>
                <span className={`badge ${notification.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                  {notification.status}
                </span>
              </div>
              <p className="mb-1">{notification.message}</p>
              <small className="text-muted">
                Expires: {new Date(notification.expiryTime).toLocaleString()}
              </small>
              <div className="mt-2 d-flex gap-2">
                <button className="btn btn-sm btn-outline-danger">
                  <i className="bi bi-trash"></i> Remove
                </button>
                {notification.status === 'queued' && (
                  <button className="btn btn-sm btn-outline-primary">
                    <i className="bi bi-play-fill"></i> Show Now
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="card-footer text-center">
        <button 
          className="btn btn-sm btn-outline-secondary"
          onClick={() => setActiveTab('history')}
        >
          View All Notifications
        </button>
      </div>
    </div>
  );
};

export default NotificationQueue;