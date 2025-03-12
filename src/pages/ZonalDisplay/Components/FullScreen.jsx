import React, { useState, useEffect } from "react";
import styled from "styled-components";

// Define styled components
const FullScreenContainer = styled.div`
  font-size: 8rem;
  text-align: center;
  padding: 20px;
`;

const MessageContent = styled.div`
  margin-bottom: 20px;
`;

const TimeRemaining = styled.div`
  font-size: 1.5rem;
`;

const FullScreen = ({ notification, onClose }) => {
  const [remainingTime, setRemainingTime] = useState(notification.duration);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingTime((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [notification.duration, onClose]);

  return (
    <FullScreenContainer>
      <MessageContent>{notification.messageContent}</MessageContent>
      <TimeRemaining>
        Time remaining: {Math.floor(remainingTime / 60)}:
        {remainingTime % 60 < 10 ? `0${remainingTime % 60}` : remainingTime % 60}
      </TimeRemaining>
    </FullScreenContainer>
  );
};

export default FullScreen;
