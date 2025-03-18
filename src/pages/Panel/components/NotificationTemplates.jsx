import React, { useState } from "react";
import styled from "styled-components";
import {
  FaSearch,
  FaCopy,
  FaEdit,
  FaPlus,
  FaTrash,
  FaEye,
} from "react-icons/fa";
import Modal from "react-bootstrap/Modal";
import Notifications from "./../../ZonalDisplay/Components/Notifications";
//import CustomDesign from "./CustomDesign";

const TemplatesContainer = styled.div`
  padding: 1.5rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;

  h4 {
    margin: 0;
  }
`;

const CreateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    background: #0056b3;
    transform: translateY(-1px);
  }
`;

const FilterBar = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
`;

const TemplateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
`;

const TemplateCard = styled.div`
  position: relative;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border: 1px solid #eee;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }

  .card-body {
    padding: 1.5rem;
  }

  .template-preview {
    background: #f8f9fa;
    padding: 1rem;
    border-radius: 8px;
    margin: 1rem 0;
    max-height: 120px;
    overflow: hidden;
    position: relative;

    &::after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 40px;
      background: linear-gradient(transparent, #f8f9fa);
    }
  }
`;

const ActionButtons = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s;

  ${TemplateCard}:hover & {
    opacity: 1;
  }
`;

const ActionButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: white;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;

  &:hover {
    background: ${(props) => (props.$danger ? "#dc3545" : "#007bff")};
    color: white;
    transform: scale(1.1);
  }
`;

const Badge = styled.span`
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;

  &.type-birthday {
    background: #e8f4ff;
    color: #0066cc;
  }
  &.type-emergency {
    background: #ffe8e8;
    color: #cc0000;
  }
  &.type-announcement {
    background: #fff3e8;
    color: #cc6600;
  }
`;

const PreviewModal = styled(Modal)`
  .modal-dialog {
    max-width: 80vw;
    margin: 1.75rem auto;
  }

  .modal-content {
    background: #f8f9fa;
    border: none;
    border-radius: 12px;
    overflow: hidden;
  }

  .modal-header {
    border-bottom: 1px solid #dee2e6;
    padding: 1rem 1.5rem;
    background: white;
  }

  .modal-body {
    padding: 0;
    min-height: 60vh;
    display: flex;
    flex-direction: column;
  }

  .preview-controls {
    padding: 1rem;
    background: white;
    border-top: 1px solid #dee2e6;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
`;

const NotificationTemplates = ({ onUseTemplate }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [showPreview, setShowPreview] = useState(null);
  const [previewType, setPreviewType] = useState("inscreen");
  const [showCustomDesign, setShowCustomDesign] = useState(false);
  // Sample template data - replace with actual data from your backend
  const templates = [
    {
      id: 1,
      title: "Birthday Celebration Template",
      message: `
        <div style="text-align: center; padding: 4vw;">
          <div style="font-size: 5rem; color: #FF1493;">
            🎈 Happy Birthday {{name}}! 🎈
          </div>
          <div style="font-size: 3rem; color: #666;">
            Wishing you a fantastic day filled with joy and celebration!
          </div>
        </div>
      `,
      type: "birthday",
      category: "celebration",
      usageCount: 15,
      lastUsed: "2024-03-15",
      created: "2024-01-01",
    },
    {
      id: 2,
      title: "Emergency Drill Alert",
      message:
        "ATTENTION: Emergency fire drill scheduled for {{time}}. Please follow evacuation procedures.",
      type: "emergency",
      category: "alert",
      usageCount: 8,
      lastUsed: "2024-03-10",
      created: "2024-01-15",
    },
    // Add more templates...
  ];

  const handleUseTemplate = (template) => {
    onUseTemplate(template);
  };

  const handlePreview = (template) => {
    // Convert template to notification format
    const previewNotification = {
      id: template.id,
      title: template.title,
      message: template.message,
      type: template.type,
      timestamp: new Date().toLocaleString(),
      startTime: Date.now(),
      expiryTime: 30,
    };
    setShowPreview(previewNotification);
  };

  const handleClosePreview = () => {
    setShowPreview(null);
  };

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || template.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    switch (sortBy) {
      case "usage":
        return b.usageCount - a.usageCount;
      case "name":
        return a.title.localeCompare(b.title);
      case "date":
      default:
        return new Date(b.lastUsed) - new Date(a.lastUsed);
    }
  });

  return (
    <TemplatesContainer>
      <Header>
        <h4>Notification Templates</h4>
        <FaPlus />
        <CreateButton onClick={() => setShowCustomDesign(true)}>
          Create Template
        </CreateButton>
      </Header>
      {/* {showCustomDesign && <CustomDesign onClose={() => setShowCustomDesign(false)} />} */}
      <FilterBar>
        <div>
          <label className="form-label">Search</label>
          <div className="input-group">
            <span className="input-group-text">
              <FaSearch />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="form-label">Category</label>
          <select
            className="form-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="celebration">Celebrations</option>
            <option value="alert">Alerts</option>
            <option value="announcement">Announcements</option>
          </select>
        </div>

        <div>
          <label className="form-label">Sort By</label>
          <select
            className="form-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date">Last Used</option>
            <option value="usage">Most Used</option>
            <option value="name">Name</option>
          </select>
        </div>
      </FilterBar>

      <TemplateGrid>
        {sortedTemplates.map((template) => (
          <TemplateCard key={template.id}>
            <div className="card-body">
              <ActionButtons>
                <ActionButton
                  onClick={() => handlePreview(template)}
                  title="Preview"
                >
                  <FaEye />
                </ActionButton>
                <ActionButton
                  onClick={() => handleUseTemplate(template)}
                  title="Use Template"
                >
                  <FaCopy />
                </ActionButton>
                <ActionButton
                  onClick={() => {
                    /* Handle edit */
                  }}
                  title="Edit Template"
                >
                  <FaEdit />
                </ActionButton>
                <ActionButton
                  $danger
                  onClick={() => {
                    /* Handle delete */
                  }}
                  title="Delete Template"
                >
                  <FaTrash />
                </ActionButton>
              </ActionButtons>

              <h6>{template.title}</h6>
              <div className="mb-3">
                <Badge className={`type-${template.type}`}>
                  {template.type}
                </Badge>
              </div>

              <div className="template-preview">
                <div dangerouslySetInnerHTML={{ __html: template.message }} />
              </div>

              <div className="d-flex justify-content-between text-muted small mt-3">
                <span>Used {template.usageCount} times</span>
                <span>
                  Last used: {new Date(template.lastUsed).toLocaleDateString()}
                </span>
              </div>
            </div>
          </TemplateCard>
        ))}
      </TemplateGrid>

      {sortedTemplates.length === 0 && (
        <div className="text-center p-5">
          <img
            src="/assets/empty-templates.svg"
            alt="No templates"
            style={{ width: "200px", marginBottom: "1rem" }}
          />
          <h4>No Templates Found</h4>
          <p className="text-muted">
            {searchTerm || categoryFilter !== "all"
              ? "Try adjusting your search criteria"
              : "Create your first template to get started"}
          </p>
        </div>
      )}

      <PreviewModal
        show={!!showPreview}
        onHide={handleClosePreview}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Template Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {showPreview && (
            <Notifications
              notification={showPreview}
              isModal={true}
              isFullScreen={previewType === "fullscreen"}
              modalTimeLeft={30}
              progress={100}
              totalNotifications={1}
            />
          )}
        </Modal.Body>
        <div className="preview-controls">
          <button
            className="btn btn-outline-secondary"
            onClick={handleClosePreview}
          >
            Close
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              onUseTemplate(showPreview);
              handleClosePreview();
            }}
          >
            Use This Template
          </button>
        </div>
      </PreviewModal>
    </TemplatesContainer>
  );
};

export default NotificationTemplates;
