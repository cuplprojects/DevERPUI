import React, { useEffect, useState } from 'react'
import { Table, Spinner } from 'react-bootstrap'
import API from "../../CustomHooks/MasterApiHooks/api";

const ProcessDetails = ({ catchData, projectName, groupName }) => {
  const [processData, setProcessData] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectDetails, setProjectDetails] = useState(null);

  useEffect(() => {
    const fetchProcesses = async () => {
      try {
        const response = await API.get('/Processes');
        setProcesses(response.data);
      } catch (error) {
        console.error("Error fetching processes:", error);
      }
    };

    fetchProcesses();
  }, []);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const response = await API.get(`/Project/${projectName}`);
        setProjectDetails(response.data);
      } catch (error) {
        console.error("Error fetching project details:", error);
      }
    };

    if (projectName) {
      fetchProjectDetails();
    }
  }, [projectName]);

  useEffect(() => {
    const fetchProcessData = async () => {
      setLoading(true);
      try {
        const response = await API.get(`/Reports/process-wise/${catchData.catchNo}`);
        console.log(response.data)
        setProcessData(response.data);
      } catch (error) {
        console.error("Error fetching process data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (catchData?.catchNo) {
      fetchProcessData();
    }
  }, [catchData?.catchNo]);

  const getProcessName = (processId) => {
    const process = processes.find(p => p.id === processId);
    return process ? process.name : `Process ${processId}`;
  };

  if (!catchData) return null;

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center p-5">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  const isBookletType = projectDetails?.noOfSeries > 1;
  const seriesArray = isBookletType ? projectDetails?.seriesName?.split('') || [''] : [];
  const activeSeries = seriesArray.slice(0, projectDetails?.noOfSeries);

  return (
    <div>
      <Table 
        striped 
        bordered 
        hover
        responsive
        className="shadow-sm rounded overflow-hidden bg-white w-100"
      >
        <thead>
          <tr>
            {isBookletType && (
              <th className="bg-primary text-white text-center rounded-top-start" style={{ width: '15%' }}>
                SeriesName
              </th>
            )}
            {['Process', 'Zone', 'Team & Supervisor', 'Machine', 'Time'].map((header, index) => (
              <th 
                key={header} 
                className={`bg-primary text-white text-center ${!isBookletType && index === 0 ? 'rounded-top-start' : ''} ${index === 4 ? 'rounded-top-end' : ''}`} 
                style={{ width: index === 0 ? '20%' : index === 1 ? '25%' : index === 2 ? '15%' : '25%' }}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {processData.map((process) => (
            (isBookletType ? activeSeries : [null]).map((series, seriesIndex) => (
              <tr key={`${process.processId}-${series || 'no-series'}`}>
                {isBookletType && (
                  <td className="text-center fw-medium text-nowrap">
                    {catchData.catchNo} - {series}
                  </td>
                )}
                {seriesIndex === 0 && (
                  <td className="text-center fw-medium text-nowrap" rowSpan={isBookletType ? projectDetails?.noOfSeries : 1} style={{ verticalAlign: 'middle' }}>
                    {getProcessName(process.processId)}
                  </td>
                )}
                <td className="text-center fw-medium text-nowrap">
                  {process.transactions.find(t => t.series === series)?.zoneName || 
                   process.transactions[0]?.zoneName || ''}
                </td>
                <td className="text-center fw-medium text-nowrap">
                  <div className="d-flex flex-wrap gap-1 justify-content-center align-items-center">
                    <span className="badge bg-warning text-dark text-truncate">
                      👤 {process.transactions.find(t => t.series === series)?.supervisor || 
                          process.transactions[0]?.supervisor}
                    </span>
                    
                    {(process.transactions.find(t => t.series === series)?.teamMembers || 
                      process.transactions[0]?.teamMembers || []).map((member, index) => (
                      <span key={`member-${index}`} className="badge bg-light text-dark text-truncate">
                        {member.fullName}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="text-center fw-medium text-nowrap">
                  {process.transactions.find(t => t.series === series)?.machineName || 
                   process.transactions[0]?.machineName || ''}
                </td>
                <td className="text-center fw-medium text-nowrap">
                  <div className="small">
                    <div>
                      <strong>Start:</strong> {
                        process.transactions.find(t => t.series === series)?.startTime ? 
                        new Date(process.transactions.find(t => t.series === series).startTime).toLocaleString('en-GB', { hour12: true }) :
                        process.transactions[0]?.startTime ? 
                        new Date(process.transactions[0].startTime).toLocaleString('en-GB', { hour12: true }) : ''
                      }
                    </div>
                    <div>
                      <strong>End:</strong> {
                        process.transactions.find(t => t.series === series)?.endTime ?
                        new Date(process.transactions.find(t => t.series === series).endTime).toLocaleString('en-GB', { hour12: true }) :
                        process.transactions[0]?.endTime ?
                        new Date(process.transactions[0].endTime).toLocaleString('en-GB', { hour12: true }) : ''
                      }
                    </div>
                  </div>
                </td>
              </tr>
            ))
          ))}
        </tbody>
      </Table>
    </div>
  )
}

export default ProcessDetails;
