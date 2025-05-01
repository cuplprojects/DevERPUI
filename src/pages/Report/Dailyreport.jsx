import React, { useState, useEffect } from 'react';
import { Table, Container, Spinner, Form, Row, Col, Badge } from 'react-bootstrap';
import Select from 'react-select';
import API from "../../CustomHooks/MasterApiHooks/api";
import { FaUser, FaCalendarAlt } from 'react-icons/fa';

const DailyReport = ({ date }) => {
    const [reportData, setReportData] = useState({
        teamMembers: [],
        machines: [],
        supervisors: [],
        totalCatches: 0,
        firstLoggedAt: '',
        lastLoggedAt: '',
        timeDifference: '',
        userTransactionDetails: [],
        totalQuantity: 0,
        distinctLotNos: []
    });
    const [loading, setLoading] = useState(false);
    const [processId, setProcessId] = useState('');
    const [processes, setProcesses] = useState([]);
    const [users, setUsers] = useState([]);
    const [userId, setUserId] = useState('');
    const [selectedDate, setSelectedDate] = useState(date || '');
    const [sortField, setSortField] = useState('projectName');
    const [sortDirection, setSortDirection] = useState('asc');
    const [userMap, setUserMap] = useState({});
    const [zones, setZones] = useState([]);
    const [zoneMap, setZoneMap] = useState({});
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);

    const handleDateSelect = (e) => {
        // Reset report data when date changes to avoid showing stale data
        setReportData({
            teamMembers: [],
            machines: [],
            supervisors: [],
            totalCatches: 0,
            firstLoggedAt: '',
            lastLoggedAt: '',
            timeDifference: '',
            userTransactionDetails: [],
            totalQuantity: 0,
            distinctLotNos: []
        });
        setSelectedDate(e.target.value);
    };

    const handleUserSelect = (selectedOption) => {
        // Reset report data when user changes to avoid showing stale data
        setReportData({
            teamMembers: [],
            machines: [],
            supervisors: [],
            totalCatches: 0,
            firstLoggedAt: '',
            lastLoggedAt: '',
            timeDifference: '',
            userTransactionDetails: [],
            totalQuantity: 0,
            distinctLotNos: []
        });
        setUserId(selectedOption ? selectedOption.value : '');
    };

    const handleUserSearch = (e) => {
        setUserSearchTerm(e.target.value);
    };

    const fetchUsers = async () => {
        try {
            const response = await API.get('/User');
            setUsers(response.data);

            // Create a map of user IDs to user names for quick lookup
            const userMap = {};
            response.data.forEach(user => {
                userMap[user.userId] = user.username || `${user.firstName} ${user.lastName || ''}`.trim();
            });
            setUserMap(userMap);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const fetchProcesses = async () => {
        try {
            const response = await API.get('/Processes');
            setProcesses(response.data);
        } catch (error) {
            console.error("Error fetching processes:", error);
        }
    };

    const fetchZones = async () => {
        try {
            const response = await API.get('/Zones');
            setZones(response.data);

            // Create a map of zone IDs to zone names for quick lookup
            const zoneMap = {};
            response.data.forEach(zone => {
                zoneMap[zone.zoneId] = zone.zoneNo;
            });
            setZoneMap(zoneMap);
        } catch (error) {
            console.error("Error fetching zones:", error);
        }
    };

    const fetchDailyReport = async () => {
        try {
            // Clear previous data and set loading state
            setLoading(true);
            setReportData({
                teamMembers: [],
                machines: [],
                supervisors: [],
                totalCatches: 0,
                firstLoggedAt: '',
                lastLoggedAt: '',
                timeDifference: '',
                userTransactionDetails: [],
                totalQuantity: 0,
                distinctLotNos: []
            });

            const formattedDate = selectedDate ? new Date(selectedDate).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }).replace(/\//g, '-') : '';

            const response = await API.get(`/Reports/DailyReports`, {
                params: {
                    date: formattedDate,
                    processId: processId || undefined,
                    userId: userId || undefined
                }
            });
            setReportData(response.data);
        } catch (error) {
            console.error("Error fetching daily report:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProcesses();
        fetchUsers();
        fetchZones();
    }, []);

    useEffect(() => {
        // Only fetch data if we have a valid date
        if (selectedDate) {
            // Reset any previous data and fetch new data
            fetchDailyReport();
        }
    }, [selectedDate, processId, userId]);

    // Filter users based on search term
    useEffect(() => {
        if (users.length > 0) {
            if (!userSearchTerm) {
                setFilteredUsers(users);
            } else {
                const filtered = users.filter(user =>
                    `${user.firstName} ${user.lastName || ''}`.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                    (user.username && user.username.toLowerCase().includes(userSearchTerm.toLowerCase()))
                );
                setFilteredUsers(filtered);
            }
        }
    }, [users, userSearchTerm]);

    // Get process name by ID
    const getProcessName = (processId) => {
        if (!processId) return 'N/A';
        const process = processes.find(p => p.id === processId);
        return process ? process.name : `Process ${processId}`;
    };

    // Get user name by ID
    const getUserName = (userId) => {
        if (!userId) return 'N/A';
        return userMap[userId] || `User ${userId}`;
    };

    // Get zone name by ID
    const getZoneName = (zoneId) => {
        if (zoneId === 0) return 'General Zone';
        if (zoneId === undefined || zoneId === null) return 'N/A';
        return zoneMap[zoneId] || `Zone ${zoneId}`;
    };

    // Handle sorting
    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Sort transactions
    const sortedTransactions = [...reportData.userTransactionDetails].sort((a, b) => {
        let comparison = 0;

        if (sortField === 'projectName') {
            comparison = a.projectName.localeCompare(b.projectName);
        } else if (sortField === 'catchNo') {
            comparison = a.catchNo.localeCompare(b.catchNo);
        } else if (sortField === 'groupName') {
            comparison = a.groupName.localeCompare(b.groupName);
        } else if (sortField === 'processId') {
            const processNameA = getProcessName(a.processId);
            const processNameB = getProcessName(b.processId);
            comparison = processNameA.localeCompare(processNameB);
        } else if (sortField === 'zoneId') {
            const zoneNameA = getZoneName(a.zoneId);
            const zoneNameB = getZoneName(b.zoneId);
            comparison = zoneNameA.localeCompare(zoneNameB);
        } else if (sortField === 'userId') {
            const userNameA = getUserName(a.userId);
            const userNameB = getUserName(b.userId);
            comparison = userNameA.localeCompare(userNameB);
        }

        return sortDirection === 'asc' ? comparison : -comparison;
    });

    return (
        <Container fluid className="mt-4 px-2 px-sm-3 px-md-4">
            <Row className="mb-4">

                <Col xs={12} sm={6} md={4} lg={3}>
                    <Form.Group>
                        <Form.Label className="fw-bold text-primary d-flex align-items-center" style={{fontSize: "clamp(0.9rem, 2vw, 1.1rem)", letterSpacing: "0.5px"}}>
                            <FaUser className="me-2" /> User
                        </Form.Label>
                        <Select
                            value={userId ? { value: userId, label: userMap[userId] || `User ${userId}` } : null}
                            onChange={handleUserSelect}
                            options={[
                                { value: '', label: 'All Users' },
                                ...users.map(user => ({
                                    value: user.userId,
                                    label: `${user.firstName} ${user.lastName || ''}`
                                }))
                            ]}
                            placeholder="Select User"
                            isClearable
                            isSearchable
                            className="react-select-container"
                            classNamePrefix="react-select"
                            styles={{
                                control: (baseStyles) => ({
                                    ...baseStyles,
                                    border: 0,
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                                    fontSize: "clamp(0.8rem, 1.5vw, 0.9rem)",
                                    color: "#333",
                                    minHeight: "38px",
                                    borderRadius: "0.375rem"
                                }),
                                menu: (baseStyles) => ({
                                    ...baseStyles,
                                    zIndex: 9999
                                }),
                                option: (baseStyles, state) => ({
                                    ...baseStyles,
                                    backgroundColor: state.isSelected ? "#4a90e2" : state.isFocused ? "#f0f7ff" : null,
                                    color: state.isSelected ? "white" : "#333"
                                })
                            }}
                        />
                    </Form.Group>
                </Col>
                <Col xs={12} sm={6} md={4} lg={3}>
                    <Form.Group>
                        <Form.Label className="fw-bold text-primary d-flex align-items-center mb-2" style={{ fontSize: "0.9rem", letterSpacing: "0.5px", fontWeight: "700" }}>
                            <FaCalendarAlt className="me-2" /> Select Date
                        </Form.Label>
                        <Form.Control
                            type="date"
                            value={selectedDate}
                            onChange={handleDateSelect}
                            className="form-control-lg border-0 rounded"
                            style={{
                                backgroundColor: "#f8f9fa",
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                                height: "38px",
                                fontSize: "0.9rem"
                            }}
                        />
                    </Form.Group>
                </Col>
            </Row>

            {loading ? (
                <div className="text-center p-3 p-sm-4 p-md-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3 text-muted">Loading report data...</p>
                </div>
            ) : selectedDate ? (
                <>




                    {/* Transaction Details */}
                    {reportData.userTransactionDetails && reportData.userTransactionDetails.length > 0 ? (
                        <div className="mt-4">


                            <div className="table-responsive">
                                <Table
                                    striped
                                    bordered
                                    hover
                                    className="shadow-sm"
                                    style={{
                                        backgroundColor: "#fff",
                                        borderRadius: "8px",
                                        overflow: "hidden"
                                    }}
                                >
                                    <thead>
                                        <tr style={{
                                            background: "linear-gradient(45deg, #4a90e2, #357abd)",
                                            color: "#fff",
                                            fontSize: "0.85rem",
                                            textAlign: "center"
                                        }}>
                                            <th style={{ width: '50px' }}>
                                                S.N.
                                            </th>
                                            <th onClick={() => handleSort('projectName')} style={{ cursor: 'pointer' }}>
                                                Project Name {sortField === 'projectName' && (sortDirection === 'asc' ? '▲' : '▼')}
                                            </th>
                                            <th onClick={() => handleSort('catchNo')} style={{ cursor: 'pointer' }}>
                                                Catch No {sortField === 'catchNo' && (sortDirection === 'asc' ? '▲' : '▼')}
                                            </th>
                                            <th onClick={() => handleSort('groupName')} style={{ cursor: 'pointer' }}>
                                                Group {sortField === 'groupName' && (sortDirection === 'asc' ? '▲' : '▼')}
                                            </th>
                                            <th onClick={() => handleSort('processId')} style={{ cursor: 'pointer' }}>
                                                Process {sortField === 'processId' && (sortDirection === 'asc' ? '▲' : '▼')}
                                            </th>
                                            <th onClick={() => handleSort('zoneId')} style={{ cursor: 'pointer' }}>
                                                Zone {sortField === 'zoneId' && (sortDirection === 'asc' ? '▲' : '▼')}
                                            </th>
                                            <th onClick={() => handleSort('userId')} style={{ cursor: 'pointer' }}>
                                                User {sortField === 'userId' && (sortDirection === 'asc' ? '▲' : '▼')}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedTransactions.map((transaction, index) => (
                                            <tr key={index} style={{
                                                fontSize: "0.85rem",
                                                backgroundColor: index % 2 === 0 ? "#f8f9fa" : "#ffffff"
                                            }}>
                                                <td className="text-center py-2">{index + 1}</td>
                                                <td className="py-2">{transaction.projectName}</td>
                                                <td className="text-center py-2">{transaction.catchNo}</td>
                                                <td className="text-center py-2">
                                                    <Badge bg="info" pill>{transaction.groupName}</Badge>
                                                </td>
                                                <td className="text-center py-2">{getProcessName(transaction.processId)}</td>
                                                <td className="text-center py-2">
                                                    {transaction.zoneId === 0 ? '' :

                                                (
                                                        <Badge bg="primary" pill>{getZoneName(transaction.zoneId)}</Badge>
                                                    )}
                                                </td>
                                                <td className="text-center py-2">{getUserName(transaction.userId)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        </div>
                    ) : (
                        <div className="alert alert-info mt-4">
                            No transaction details found for the selected date{processId ? ' and process' : ''}{userId ? ' and user' : ''}.
                        </div>
                    )}
                </>
            ) : (
                <div className="alert alert-info mt-4">
                    Please select a date to view the report.
                </div>
            )}
        </Container>
    );
};

export default DailyReport;
