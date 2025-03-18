import React, { useState, useEffect } from "react";
import { FaUserTie } from "react-icons/fa";
import API from "./../../CustomHooks/MasterApiHooks/api";
import { useUserData } from "./../../store/userDataStore";
import Spinner from "react-bootstrap/Spinner";
import Marquee from "./Components/Marquee";
import FullScreen from "./Components/FullScreen";

const DisplayPage = () => {
  const [currentZoneIndex, setCurrentZoneIndex] = useState(0);
  const [currentProcessIndex, setCurrentProcessIndex] = useState(0);
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [currentLotIndex, setCurrentLotIndex] = useState(0);
  const [currentCatchIndex, setCurrentCatchIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentTableGroup, setCurrentTableGroup] = useState(0);
  const [supervisorParts, setSupervisorParts] = useState([]);
  const [currentPartIndex, setCurrentPartIndex] = useState(0);
  const [supervisorOpacity, setSupervisorOpacity] = useState(1);
  const [zoneProgress, setZoneProgress] = useState(0);
  const [catchProgress, setCatchProgress] = useState(0);
  const [zoneTimeProgress, setZoneTimeProgress] = useState(0);
  const [isTableClearing, setIsTableClearing] = useState(false);
  const [jsonData, setJsonData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [retryIntervalId, setRetryIntervalId] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [fullScreenNotifications, setFullScreenNotifications] = useState([]);
  const [currentFullScreenIndex, setCurrentFullScreenIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === 'F3') {
        setIsPaused((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setNotifications(
        notifications
          .map((notification) => ({
            ...notification,
            duration: notification.duration - 1,
          }))
          .filter((notification) => notification.duration > 0)
      );
    }, 1000);
    return () => clearInterval(timer);
  }, [notifications]);

  const userData = useUserData();


  useEffect(() => {
    let intervalId;
    let retryIntervalId;
  
    const fetchNotifications = async () => {
      try {
        const response = await API.get(`/Notifications/today`);
        // console.clear()
        if(response?.data?.length > 0) {
          // console.log(response.data)
        }
        if (response.data && response.data.length > 0) {
          const filteredNotifications = response.data;
          setNotifications((prevNotifications) => {
            const newNotifications = filteredNotifications.filter(
              (newNotif) =>
                !prevNotifications.some(
                  (notif) => notif.notificationId === newNotif.notificationId
                )
            );
  
            // Separate typeId 2 notifications
            const type2Notifications = newNotifications.filter(
              (notif) => notif.typeID === 2
            );
            if (type2Notifications.length > 0) {
              setFullScreenNotifications((prevFullScreen) => [
                ...prevFullScreen,
                ...type2Notifications,
              ]);
              setIsPaused(true); // Pause other operations
            }
  
            return [...prevNotifications, ...newNotifications];
          });
  
          const totalDuration = filteredNotifications.reduce(
            (sum, notif) => sum + notif.duration,
            0
          ) + 2;
          if (intervalId) clearInterval(intervalId);
          intervalId = setInterval(fetchNotifications, totalDuration * 1000);
          if (retryIntervalId) clearInterval(retryIntervalId);
        } else {
          // No data found, retry every 10 seconds
          if (retryIntervalId) clearInterval(retryIntervalId);
          retryIntervalId = setInterval(fetchNotifications, 10000);
        }
      } catch (error) {
        // console.error("Error fetching notifications:", error);
        if (retryIntervalId) clearInterval(retryIntervalId);
        retryIntervalId = setInterval(fetchNotifications, 10000);
      }
    };
  
    if (!isLoading) {
      fetchNotifications();
    }
  
    return () => {
      if (intervalId) clearInterval(intervalId);
      if (retryIntervalId) clearInterval(retryIntervalId);
    };
  }, [isLoading]);
  
  
  useEffect(() => {
    const fetchDisplayData = async () => {
      if (isPaused) return;
      try {
        if (userData?.displayIds?.[0]) {
          const response = await API.get(
            `/Display/ZonalDisplay?id=${userData.displayIds[0]}`
          );
          setJsonData(response.data);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching display data:", error);
      }
    };

    fetchDisplayData();

    const fetchInterval = setInterval(fetchDisplayData, 10000);

    return () => clearInterval(fetchInterval);
  }, [userData, isPaused]);

  useEffect(() => {
    if (currentProcess?.supervisor) {
      setSupervisorParts(
        currentProcess.supervisor.split(",").map((part) => part.trim())
      );
      setCurrentPartIndex(0);
    }
  }, [currentProcessIndex]);

  useEffect(() => {
    const partInterval = setInterval(() => {
      if (supervisorParts.length > 1) {
        setSupervisorOpacity(0);
        setTimeout(() => {
          setCurrentPartIndex((prev) => (prev + 1) % supervisorParts.length);
          setSupervisorOpacity(1);
        }, 500);
      }
    }, 3000);

    return () => clearInterval(partInterval);
  }, [supervisorParts]);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      const currentZone = jsonData[currentZoneIndex];
      const currentProcess = currentZone?.processes[currentProcessIndex];
      const currentProject = currentProcess?.projects[currentProjectIndex];
      const currentLot = currentProject?.lots[currentLotIndex];
      const catches = currentLot?.catches || [];

      const totalProcesses = currentZone?.processes?.length || 1;
      const newZoneProgress =
        ((currentProcessIndex + 1) / totalProcesses) * 100;
      setZoneProgress(newZoneProgress);

      const totalCatches = catches.length;
      const currentCatchAbsolute = currentTableGroup * 3 + currentCatchIndex;
      const newCatchProgress =
        ((currentCatchAbsolute + 1) / totalCatches) * 100;
      setCatchProgress(newCatchProgress);

      setZoneTimeProgress((prev) => {
        if (prev < 100) {
          return prev + 2;
        }
        return 0;
      });

      setProgress((prev) => {
        if (prev < 100) {
          return prev + 20;
        }
        return 0;
      });

      if (progress >= 90) {
        const totalGroups = Math.ceil(catches.length / 3);
        const currentGroupCatches = catches.slice(
          currentTableGroup * 3,
          (currentTableGroup + 1) * 3
        );

        if (currentCatchIndex < currentGroupCatches.length - 1) {
          setCurrentCatchIndex((prev) => prev + 1);
        } else {
          setIsTableClearing(true);

          setTimeout(() => {
            setIsTableClearing(false);
            if (currentTableGroup < totalGroups - 1) {
              setCurrentTableGroup((prev) => prev + 1);
              setCurrentCatchIndex(0);
            } else {
              setCurrentTableGroup(0);
              setCurrentCatchIndex(0);

              if (currentLotIndex < currentProject?.lots.length - 1) {
                setCurrentLotIndex((prev) => prev + 1);
              } else {
                setCurrentLotIndex(0);

                if (currentProjectIndex < currentProcess?.projects.length - 1) {
                  setCurrentProjectIndex((prev) => prev + 1);
                } else {
                  setCurrentProjectIndex(0);

                  if (currentProcessIndex < currentZone?.processes.length - 1) {
                    setCurrentProcessIndex((prev) => prev + 1);
                  } else {
                    setCurrentProcessIndex(0);

                    if (currentZoneIndex < jsonData.length - 1) {
                      setCurrentZoneIndex((prev) => prev + 1);
                      setZoneProgress(0);
                      setCatchProgress(0);
                      setZoneTimeProgress(0);
                    } else {
                      setCurrentZoneIndex(0);
                      setZoneProgress(0);
                      setCatchProgress(0);
                      setZoneTimeProgress(0);
                    }
                  }
                }
              }
            }
          }, 1000);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [
    currentZoneIndex,
    currentProcessIndex,
    currentProjectIndex,
    currentLotIndex,
    currentCatchIndex,
    progress,
    currentTableGroup,
    isPaused
  ]);

  const currentZone = jsonData[currentZoneIndex];
  const currentProcess = currentZone?.processes[currentProcessIndex];
  const currentProject = currentProcess?.projects[currentProjectIndex];
  const currentLot = currentProject?.lots[currentLotIndex];
  const catches = currentLot?.catches || [];

  const currentCatches = catches.slice(
    currentTableGroup * 3,
    (currentTableGroup + 1) * 3
  );
  const currentCatchAbsolute = currentTableGroup * 3 + currentCatchIndex;
  const currentCatch = catches[currentCatchAbsolute];

  const displayCatches = [...currentCatches];
  while (displayCatches.length < 3) {
    displayCatches.push(null);
  }

  const handleFullScreenClose = () => {
    setFullScreenNotifications((prev) => {
      const remainingNotifications = prev.slice(1);
      if (remainingNotifications.length === 0) {
        setIsPaused(false); // Resume normal operations
      }
      return remainingNotifications;
    });
  };

  return (
    <>
      {isLoading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            padding: "20px",
          }}
        >
          <Spinner
            animation="border"
            variant="primary"
            className=""
            style={{ width: "6rem", height: "6rem", borderWidth: "8px" }}
          />
        </div>
      ) : (
        <div
          style={{
            padding: "30px",
            backgroundColor: "#f8f9fa",
            minHeight: "100vh",
            display: "grid",
            gap: "20px",
          }}
        >
          {fullScreenNotifications.length > 0 ? (
            <FullScreen
              notification={fullScreenNotifications[currentFullScreenIndex]}
              onClose={handleFullScreenClose}
            />
          ) : (
            <>
              {/* Top Row */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 2fr 1.5fr",
                  gap: "20px",
                }}
              >
                {/* Zone Card with Progress */}
                <div
                  style={{
                    backgroundColor: "white",
                    borderRadius: "12px",
                    padding: "0px 30px 0px 30px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  }}
                >
                  <h1
                    style={{
                      fontSize: "72px",
                      color: "#2c3e50",
                      margin: "0",
                      fontWeight: "600",
                    }}
                  >
                    {currentZone?.zoneNo}
                  </h1>
                  <div
                    style={{
                      marginTop: "15px",
                      height: "8px",
                      backgroundColor: "#eee",
                      borderRadius: "2px",
                    }}
                  >
                    <div
                      style={{
                        width: `${zoneTimeProgress}%`,
                        height: "100%",
                        backgroundColor: "#4CAF50",
                        borderRadius: "2px",
                        transition: "width 0.2s ease-in-out",
                      }}
                    />
                  </div>
                </div>

                {/* Process Card */}
                <div
                  style={{
                    backgroundColor: "white",
                    borderRadius: "12px",
                    padding: "0px 30px 0px 30px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  <h2
                    style={{
                      fontSize: "72px",
                      color: "#2c3e50",
                      margin: "0",
                      fontWeight: "600",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {currentProcess?.processName}
                  </h2>
                </div>

                {/* Time Card */}
                <div
                  style={{
                    backgroundColor: "white",
                    borderRadius: "12px",
                    padding: "0px 0px 0px 30px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  }}
                >
                  <h2
                    style={{
                      fontSize: "72px",
                      color: "#2c3e50",
                      margin: "0",
                      fontWeight: "600",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {new Date()
                      .toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: true,
                      })
                      .replace(/(\d+:\d+:\d+)( [APM]{2})/, "$1$2")}
                    <span style={{ visibility: "hidden" }}>00</span>
                  </h2>
                </div>
              </div>

              {/* Second Row */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 2fr",
                  gap: "20px",
                }}
              >
                {/* Project Card */}
                <div
                  style={{
                    backgroundColor: "white",
                    borderRadius: "12px",
                    padding: "20px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "58px",
                      color: "#2c3e50",
                      margin: "0 0 10px 0",
                      fontWeight: "600",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {currentProject?.projectName}
                  </h3>
                </div>

                {/* Current Lot Card with Progress */}
                <div
                  style={{
                    backgroundColor: "white",
                    borderRadius: "12px",
                    padding: "30px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "68px",
                      color: "#2c3e50",
                      fontWeight: "600",
                      marginBottom: "15px",
                    }}
                  >
                    Lot -{currentLot?.lotNo}
                  </div>
                  <div
                    style={{
                      height: "8px",
                      backgroundColor: "#eee",
                      borderRadius: "2px",
                    }}
                  >
                    <div
                      style={{
                        width: `${catchProgress}%`,
                        height: "100%",
                        backgroundColor: "#4CAF50",
                        borderRadius: "2px",
                        transition: "width 0.2s ease-in-out",
                      }}
                    />
                  </div>
                </div>

                {/* Supervisor Card */}
                <div
                  style={{
                    backgroundColor: "white",
                    borderRadius: "12px",
                    padding: "0px 0px 0px 30px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: "15px",
                  }}
                >
                  <FaUserTie
                    style={{
                      fontSize: "68px",
                      color: "#5f6b7c",
                    }}
                  />
                  <div
                    style={{
                      fontSize: "68px",
                      color: "#2c3e50",
                      fontWeight: "600",
                      opacity: supervisorOpacity,
                      transition: "opacity 0.5s ease-in-out",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "calc(100% - 83px)",
                    }}
                  >
                    {supervisorParts[currentPartIndex]}
                  </div>
                </div>
              </div>

              {/* Inscreen Notification */}
              {notifications.length > 0 && (
                <Marquee notifications={notifications} />
              )}

              {/* Table Card */}
              <div
                style={{
                  backgroundColor: "white",
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  overflow: "hidden",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        backgroundColor: "#2c3e50",
                      }}
                    >
                      {["Catch No", "Quantity", "Machine", "Previous Process"].map(
                        (header) => (
                          <th
                            key={header}
                            style={{
                              padding: "25px",
                              color: "white",
                              textAlign: "left",
                              fontWeight: "800",
                              fontSize: "42px",
                              borderRight: "1px solid rgba(255,255,255,0.1)",
                            }}
                          >
                            {header}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {!isTableClearing &&
                      displayCatches.map((catch_, index) => (
                        <tr
                          key={index}
                          style={{
                            backgroundColor:
                              index === currentCatchIndex ? "#e2e8f0" : "white",
                            transition: "background-color 0.3s ease",
                          }}
                        >
                          {[
                            "catchNoWithSeries",
                            "quantity",
                            "machine",
                            "previousProcess",
                          ].map((field) => (
                            <td
                              key={field}
                              style={{
                                padding: "2px",
                                fontSize: "58px",
                                color: "#2c3e50",
                                borderBottom: "1px solid #cbd5e0",
                                borderRight: "1px solid #cbd5e0",
                                fontWeight: "600",
                              }}
                            >
                              <span className="ms-2">{catch_?.[field] || "-"}</span>
                            </td>
                          ))}
                        </tr>
                      ))}
                    {isTableClearing &&
                      Array(3)
                        .fill(null)
                        .map((_, index) => (
                          <tr key={index}>
                            {[
                              "catchNo",
                              "quantity",
                              "machine",
                              "previousProcess",
                            ].map((field) => (
                              <td
                                key={field}
                                style={{
                                  padding: "2px",
                                  fontSize: "58px",
                                  color: "#2c3e50",
                                  borderBottom: "1px solid #cbd5e0",
                                  borderRight: "1px solid #cbd5e0",
                                  fontWeight: "600",
                                }}
                              >
                                <span className="ms-2">-</span>
                              </td>
                            ))}
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>

              {/* Team Members / Marquee with Progress */}
              <div
                style={{
                  backgroundColor: "white",
                  borderRadius: "12px",
                  padding: "30px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${Math.min(
                      currentCatch?.team?.split(",").length || 1,
                      5
                    )}, 1fr)`,
                    gap: "10px",
                    marginBottom: "20px",
                  }}
                >
                  {currentCatch?.team?.split(",").map((member, index) => (
                    <div
                      key={index}
                      style={{
                        padding: "1px",
                        fontSize: "50px",
                        color: "#2c3e50",
                        borderLeft: "3px solid #4caf50",
                        fontWeight: "700",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        minWidth: 0,
                      }}
                    >
                      <span className="ms-2">{member.trim()}</span>
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    height: "8px",
                    backgroundColor: "#eee",
                    borderRadius: "2px",
                  }}
                >
                  <div
                    style={{
                      width: `${progress}%`,
                      height: "100%",
                      backgroundColor: "#4CAF50",
                      borderRadius: "2px",
                      transition: "width 0.2s ease-in-out",
                    }}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default DisplayPage;
