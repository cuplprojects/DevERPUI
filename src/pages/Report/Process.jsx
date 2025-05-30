import { useEffect, useState, useMemo } from 'react'
import { Table, Spinner } from 'react-bootstrap'
import API from "../../CustomHooks/MasterApiHooks/api";
import { useStore } from 'zustand';
import themeStore from '../../store/themeStore';

const ProcessDetails = ({ catchData, projectName }) => {
  const [processData, setProcessData] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectDetails, setProjectDetails] = useState(null);

  // Get theme classes from theme store
  const themeState = useStore(themeStore);
  const cssClasses = useMemo(() => themeState.getCssClasses(), [themeState]);
  const [customDark] = cssClasses;

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
        // console.log(response.data)
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
    <div style={{ maxWidth: '100%', overflowX: 'auto' }}>
      <Table
        striped
        bordered
        hover
        responsive
        className={`shadow-sm rounded overflow-hidden bg-white w-100 ${customDark === "default-dark" ? "thead-default" : ""}
        ${customDark === "red-dark" ? "thead-red" : ""}
        ${customDark === "green-dark" ? "thead-green" : ""}
        ${customDark === "blue-dark" ? "thead-blue" : ""}
        ${customDark === "dark-dark" ? "thead-dark" : ""}
        ${customDark === "pink-dark" ? "thead-pink" : ""}
        ${customDark === "purple-dark" ? "thead-purple" : ""}
        ${customDark === "light-dark" ? "thead-light" : ""}
        ${customDark === "brown-dark" ? "thead-brown" : ""}`}
      >
        <thead>
          <tr className="text-center">
            {isBookletType && (
              <th className={`${customDark} text-white text-center rounded-top-start`} style={{ width: '15%' }}>
                SeriesName
              </th>
            )}
            {['Process', 'Zone', 'Team & Supervisor', 'Machine', 'Time'].map((header, index) => (
              <th
                key={header}
                className={`${customDark} text-white text-center ${!isBookletType && index === 0 ? 'rounded-top-start' : ''} ${index === 4 && !isBookletType ? 'rounded-top-end' : ''} ${index === 4 && isBookletType ? 'rounded-top-end' : ''}`}
                style={{ width: index === 0 ? '15%' : index === 1 ? '12%' : index === 2 ? '25%' : index === 3 ? '15%' : '18%' }}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {processData.map((process) => {
            // For each process, create rows for each series (or just one row if not booklet type)
            return (isBookletType ? activeSeries : [null]).map((series, seriesIndex) => {
              // Find the transaction for this series, or use the first transaction as fallback
              const transaction = process.transactions.find(t => t.series === series) || process.transactions[0] || {};

              return (
                <tr key={`${process.processId}-${series || 'no-series'}-${seriesIndex}`}>
                  {/* Series Name column - only for booklet type */}
                  {isBookletType && (
                    <td className="text-center text-nowrap align-middle">
                      <span className="text-primary">{catchData.catchNo} - {series}</span>
                    </td>
                  )}

                  {/* Process Name column - use rowSpan for booklet type */}
                  {seriesIndex === 0 && (
                    <td
                      className="text-center text-nowrap align-middle"
                      rowSpan={isBookletType ? activeSeries.length : 1}
                    >
                      <span className="text-secondary">{getProcessName(process.processId)}</span>
                    </td>
                  )}

                  {/* Zone column */}
                  <td className="text-center text-nowrap align-middle text-muted">
                    {transaction.zoneName || ''}
                  </td>

                  {/* Team & Supervisor column */}
                  <td className="text-center align-middle">
                    <div className="d-flex flex-wrap gap-1 justify-content-center align-items-center">
                      {transaction.supervisor && (
                        <span className="badge bg-warning text-dark text-truncate">
                          👤 {transaction.supervisor}
                        </span>
                      )}

                      {(transaction.teamMembers || []).map((member, idx) => (
                        <span key={`member-${idx}`} className="badge bg-light text-dark text-truncate">
                          {member.fullName}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Machine column */}
                  <td className="text-center text-nowrap align-middle text-muted">
                    {transaction.machineName || ''}
                  </td>

                  {/* Time column */}
                  <td className="text-center align-middle">
                    <div className="small">
                      {transaction.startTime && (
                        <div>
                          <strong>Start:</strong> {new Date(transaction.startTime).toLocaleString('en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </div>
                      )}
                      {transaction.endTime && (
                        <div>
                          <strong>End:</strong> {new Date(transaction.endTime).toLocaleString('en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            });
          })}
        </tbody>
      </Table>
    </div>
  )
}

export default ProcessDetails;
