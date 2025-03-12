import React from "react";
import "./Marquee.css"; // Create a CSS file for styling

const Marquee = ({ notifications }) => {
  return (
    <div className="marquee-container rounded-3" style={{ zIndex: 50 }}>
      <div className="marquee-content" style={{ fontSize: "5rem" }}>
        {notifications.map((item, index) => (
          item?.duration > 0 && (
            <h1 key={index} className="marquee-item " style={{ fontSize: "5rem" }}>
              {item.messageContent}
            </h1>
          )
        ))}
      </div>
    </div>
  );
};

export default Marquee;
