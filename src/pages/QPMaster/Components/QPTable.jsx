import { decrypt, encrypt } from "./../../../Security/Security";
import { useNavigate } from "react-router-dom";
import { Row, Col, Button, Table } from "react-bootstrap";
import { FaHome } from "react-icons/fa";
import { useEffect, useState } from "react";
import API from "../../../CustomHooks/MasterApiHooks/api";

const QPTable = ({ filters, setShowTable }) => {
  const navigate = useNavigate();
  const [qpData, setQpData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleHomeClick = () => {
    setShowTable(false);
  };

  useEffect(() => {
    const fetchQPData = async () => {
      try {
        setLoading(true);

        // Prepare the URL with query parameters
        let url = "/QPMasters/Filter?";

        // Add groupId (required)
        if (filters?.groupID) {
          url += `groupId=${decrypt(filters.groupID)}`;
        }

        // Add courseId if available
        if (filters?.selectedCourse) {
          url += `&courseId=${filters.selectedCourse}`;
        }

        // Add typeId if available
        if (filters?.selectedType) {
          url += `&typeId=${filters.selectedType}`;
        }

        // Add examTypeIds if available
        if (
          Array.isArray(filters?.selectedExamTypeId) &&
          filters.selectedExamTypeId.length > 0
        ) {
          filters.selectedExamTypeId.forEach((id) => {
            url += `&examTypeId=${id}`;
          });
        }

        // Make the API call
        const response = await API.get(url);

        if (response.status === 200) {
          setQpData(response.data);
        } else {
          throw new Error("Failed to fetch data");
        }
      } catch (err) {
        console.error("Error fetching QP data:", err);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    // Call the function if filters are available
    if (filters) {
      fetchQPData();
    }
  }, [filters]);

  return (
    <div>
      {loading && <p>Loading data...</p>}
      {error && <p className="text-danger">{error}</p>}

      {!loading && !error && qpData.length === 0 && (
        <p>No data found for the selected filters.</p>
      )}

      {!loading && !error && qpData.length > 0 && (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>QP Master ID</th>
              <th>Group Name</th>
              <th>Type</th>
              <th>NEP Code</th>
              <th>Private Code</th>
              <th>Subject Name</th>
              <th>Paper Number</th>
              <th>Paper Title</th>
              <th>Max Marks</th>
              <th>Duration</th>
              <th>Course Name</th>
              <th>Exam Type Name</th>
            </tr>
          </thead>
          <tbody>
            {qpData.map((item, index) => (
              <tr key={index}>
                <td>{item.qpMasterId}</td>
                <td>{item.groupName}</td>
                <td>{item.type}</td>
                <td>{item.nepCode}</td>
                <td>{item.privateCode}</td>
                <td>{item.subjectName}</td>
                <td>{item.paperNumber}</td>
                <td>{item.paperTitle}</td>
                <td>{item.maxMarks}</td>
                <td>{item.duration}</td>
                <td>{item.courseName}</td>
                <td>{item.examTypeName}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default QPTable;
