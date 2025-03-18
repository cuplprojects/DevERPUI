import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

// Full screen notification container styles
const NotificationContainer = styled.div`
  flex: ${props => props.$isModal ? '0 0 75vw' : '1'};  
  height: ${props => props.$isModal ? '100%' : ''};  
  background: #ffffff;
  border-radius: 15px;
  padding: 2vh 1.5vw;
  box-shadow: 0 12px 7px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
`;

const NotificationTitle = styled.h2`
  font-size: ${'2.5rem'};
  color: #333;
  margin-bottom: 1vh;
`;

// Full screen notification list styles
const NotificationList = styled.div`
  display: flex;
  position: relative;
  height: ${props => props.$hasNotifications ? (props.$isModal ? '80vh' : '300px') : '0'};
  width: 100%;
  overflow: hidden;
  transition: height 0.3s ease;
`;

// Full screen notification item styles
const NotificationItem = styled.div`
  flex: 0 0 auto;
  width: 100%;
  height: ${props => props.$isModal ? '100%' : '65%'};
  background: #f8f9fa;
  padding: ${props => props.$isModal ? '2vh 2.5vw' : '1vh 1.5vw'};
  border-radius: 10px;
  border-left: 4px solid ${props => props.$type === 'alert' ? '#dc3545' : '#28a745'};
  position: absolute;
  left: 0;
  top: 0;
  transform: translateX(${props => props.$active ? '0' : '100%'});
  transition: transform 0.5s ease-in-out;
  
  h3 {
    font-size: ${props => props.$isModal ? 'calc(2rem + 0.3vw)' : 'calc(1.6rem + 0.3vw)'};
    margin-bottom: ${props => props.$isModal ? '1vh' : '0.5vh'};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  p {
    font-size: ${props => props.$isModal ? '3.2rem' : '2.8rem'};
  }

  .timestamp {
    font-size: ${props => props.$isModal ? '2.4rem' : '2rem'};
    color: #999;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .expiry {
    color: ${props => props.$expiryTime <= 10 ? '#dc3545' : '#28a745'};
    font-weight: bold;
  }
`;

const DisplayProgressBar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: #28a745;
  width: ${props => (props.$displayTime / 10) * 100}%;
  transition: width 1s linear;
  z-index: 3;
`;

// Modal countdown specific to full screen
const ModalCountdown = styled.div`
  position: absolute;
  top: 1vh;
  right: 1vw;
  width: calc(2.5rem + 0.3vw);
  height: calc(2.5rem + 0.3vw);
  border-radius: 50%;
  background: ${props => props.$timeLeft <= 2 ? '#dc3545' : '#28a745'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: calc(1.4rem + 0.2vw);
  font-weight: bold;
`;

// Full screen notification message styles
const NotificationMessage = styled.div`
  p {
    font-size: ${props => props.$isModal ? '3.2rem' : '2.8rem'};
  }

  div {
    margin: 10px 0;
  }
`;

const Notifications = ({ 
  notification, 
  notifications, 
  isModal, 
  styles, 
  isFullScreen, 
  modalTimeLeft, // This will be 30 for full-screen and 5 for in-screen
  progress,
  totalNotifications 
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [displayTime, setDisplayTime] = useState(10);
  const [notificationQueue, setNotificationQueue] = useState([]);

  // Instantly add new notifications to queue
  useEffect(() => {
    if (notifications?.length > 0) {
      setNotificationQueue(prev => {
        const newQueue = [...prev];
        notifications.forEach(notification => {
          if (!newQueue.find(n => n.id === notification.id)) {
            newQueue.push({
              ...notification,
              expiryTime: Math.floor(Math.random() * (60 - 30 + 1)) + 30, // Random 30-60s
              startTime: Date.now()
            });
          }
        });
        return newQueue;
      });
    }
  }, [notifications]);

  // Modified queue rotation
  useEffect(() => {
    if (!isModal && notificationQueue.length > 1) {
      const interval = setInterval(() => {
        setDisplayTime(prev => {
          if (prev <= 1) {
            setActiveIndex(current => {
              const nextIndex = (current + 1) % notificationQueue.length;
              // Ensure next notification is immediately visible
              return nextIndex;
            });
            return 10;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    } else {
      // Reset when only one notification
      setActiveIndex(0);
      setDisplayTime(10);
    }
  }, [notificationQueue.length, isModal]);

  // Handle notification expiry
  useEffect(() => {
    const interval = setInterval(() => {
      setNotificationQueue(prev => 
        prev.filter(notif => {
          const elapsed = (Date.now() - notif.startTime) / 1000;
          return elapsed < notif.expiryTime;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Reset display time when active index changes
  useEffect(() => {
    if (notificationQueue.length > 1) {
      setDisplayTime(10);
    }
  }, [activeIndex]);

  const renderNotification = (notif, index) => {
    const timeLeft = notif.startTime 
      ? Math.max(0, Math.ceil(notif.expiryTime - ((Date.now() - notif.startTime) / 1000)))
      : 0;

    return (
      <NotificationItem 
        key={notif.id} 
        $type={notif.type}
        $active={isModal ? true : index === activeIndex}
        $isModal={isModal}
        styles={styles}
        style={{ zIndex: index === activeIndex ? 2 : 1 }}
      >
        <h3>{notif.title}</h3>
        <NotificationMessage 
          $isModal={isModal}
          dangerouslySetInnerHTML={{ __html: notif.message }}
        />
        <div className="timestamp">
          <span>{notif.timestamp}</span>
          {!isModal && <span className="expiry">{timeLeft}s</span>}
        </div>
        {!isModal && notificationQueue.length > 1 && (
          <DisplayProgressBar $displayTime={displayTime} />
        )}
      </NotificationItem>
    );
  };

  if (isModal && notification) {
    return (
      <NotificationContainer className='border' $isModal={true}>
        <NotificationTitle styles={styles}>New Alert</NotificationTitle>
        <NotificationList $hasNotifications={true} $isModal={true}>
          {renderNotification(notification, 0)}
        </NotificationList>
        <ModalCountdown $timeLeft={modalTimeLeft}>
          {modalTimeLeft}
        </ModalCountdown>
        {isFullScreen && totalNotifications > 1 && (
          <DisplayProgressBar $displayTime={progress} />
        )}
      </NotificationContainer>
    );
  }

  // Only render if there are notifications in the queue
  if (!isModal && notificationQueue.length > 0) {
    return (
      <NotificationContainer className='border'>
        {/* <NotificationTitle styles={styles}>Recent Updates</NotificationTitle> */}
        <NotificationList $hasNotifications={true}>
          {notificationQueue.map((notif, index) => 
            renderNotification(notif, index)
          )}
        </NotificationList>
      </NotificationContainer>
    );
  }

  
  // Return null when no notifications (completely hide the component)
  return null;
};

export default Notifications;
