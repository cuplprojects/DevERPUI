import React from 'react';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import { IoIosToday } from 'react-icons/io';
import { useTranslation } from 'react-i18next';

const TodayTaskIcon = ({ dispatchDate, projectId, lotNumber, onClick }) => {
  const { t } = useTranslation();

  // Check if the dispatch date matches today's date
  const isToday = new Date(dispatchDate).toLocaleDateString() === new Date().toLocaleDateString();

  if (!isToday) return null; // Return null if the dispatch date is not today

  return (
    <OverlayTrigger
      placement="top"
      overlay={<Tooltip id="today-task-tooltip">{t('dispatchForToday')}</Tooltip>}
    >
      <div
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          cursor: 'pointer',
          zIndex: 10,
        }}
        onClick={() => onClick(projectId, lotNumber)} // Handle the click event
      >
        <IoIosToday size={30} color="red" /> {/* Icon indicating task for today */}
      </div>
    </OverlayTrigger>
  );
};

export default TodayTaskIcon;
