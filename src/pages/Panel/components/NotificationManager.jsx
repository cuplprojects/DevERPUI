import React, { useState } from 'react';
import NotificationForm from './NotificationForm';
import NotificationQueue from './NotificationQueue';

const NotificationManager = ({ setActiveTab }) => {
  const [notificationType, setNotificationType] = useState('inscreen');

  return (
    <div className="row">
      <div className="col-md-8">
        <div className="card">
          <div className="card-header">
            <ul className="nav nav-pills card-header-pills">
              <li className="nav-item">
                <button
                  className={`nav-link ${notificationType === 'inscreen' ? 'active' : ''}`}
                  onClick={() => setNotificationType('inscreen')}
                >
                  In-Screen Notifications
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${notificationType === 'fullscreen' ? 'active' : ''}`}
                  onClick={() => setNotificationType('fullscreen')}
                >
                  Full-Screen Notifications
                </button>
              </li>
            </ul>
          </div>
          <div className="card-body">
            <NotificationForm type={notificationType} />
          </div>
        </div>
      </div>
      <div className="col-md-4">
        <NotificationQueue setActiveTab={setActiveTab} />
      </div>
    </div>
  );
};

export default NotificationManager;
