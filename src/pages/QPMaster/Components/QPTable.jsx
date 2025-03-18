import { decrypt, encrypt } from "./../../../Security/Security";
import { useNavigate } from "react-router-dom";

const QPTable = ({ filters }) => {
  const navigate = useNavigate();     
  return (
    <div>
      <h1>Group Name -{decrypt(filters?.groupName)} <br/>Group Id -{decrypt(filters?.groupID)}</h1>
      <h1>Course Name -{filters?.selectedCourseName} <br/>Course Id -{filters?.selectedCourse}</h1>
      <h1>SEM -{filters?.selectedSem}</h1>

    </div>
  );
};
export default QPTable;