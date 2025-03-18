import { decrypt, encrypt } from "./../../../Security/Security";
import { useNavigate } from "react-router-dom";
import { Row, Col, Button } from "react-bootstrap";
import { FaHome } from "react-icons/fa";

const QPTable = ({ filters, setShowTable }) => {
  const navigate = useNavigate();
  const handleHomeClick = () => {
    setShowTable(false);
  };
  return (
    <div>
      <Button variant="outline-dark" className="mb-3" onClick={handleHomeClick}>
        <FaHome style={{ marginRight: "8px" }} /> Back to Home
      </Button>
      <h4>
        Group Name -{decrypt(filters?.groupName)} <br />
        Group Id -{decrypt(filters?.groupID)}
      </h4>
      <h4>
        Course Name -{filters?.selectedCourseName} <br />
        Course Id -{filters?.selectedCourse}
      </h4>
      <h4>SEM -{filters?.selectedSem}</h4>
      <h4>Type ID-{filters?.selectedType}</h4>
      <h4>Type Name-{filters?.selectedTypeName || "N/A"}</h4>
    </div>
  );
};
export default QPTable;
