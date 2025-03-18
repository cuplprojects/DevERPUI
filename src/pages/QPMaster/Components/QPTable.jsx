const QPTable = ({ filters }) => {
  return (
    <div>
      <h1>Group Name -{filters?.groupName} <br/>Group Id -{filters?.groupID}</h1>
      <h1>Course Name -{filters?.selectedCourseName} <br/>Course Id -{filters?.selectedCourse}</h1>
      <h1>SEM -{filters?.selectedSem}</h1>
    </div>
  );
};
export default QPTable;