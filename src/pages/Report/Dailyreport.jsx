import React, { useState, useEffect } from 'react';
import { Table, Container, Spinner, Form, Row, Col, Card, Pagination, OverlayTrigger, Tooltip, Breadcrumb } from 'react-bootstrap';
import Select from 'react-select';
import API from "../../CustomHooks/MasterApiHooks/api";
import DailyReportExport from './DailyReportExport';

import {
    FaUser, FaCalendarAlt, FaUsers, FaUserTie, FaBoxes,
    FaObjectGroup, FaFilter, FaSearch, FaTable,
    FaSortAmountDown, FaSortAmountUp, FaListOl, FaClock,
    FaChartBar, FaCogs, FaChartPie, FaIndustry,FaChevronDown, FaChevronRight
} from 'react-icons/fa';

// Utility function to generate consistent colors based on username
const generateAvatarColor = (name) => {
    if (!name) return '#6c757d'; // Default gray for empty names

    // Pre-defined colors that look good as avatar backgrounds
    const colors = [
        '#4a90e2', // Blue
        '#50c878', // Green
        '#f44336', // Red
        '#9c27b0', // Purple
        '#ff9800', // Orange
        '#009688', // Teal
        '#e91e63', // Pink
        '#3f51b5', // Indigo
        '#795548', // Brown
        '#607d8b', // Blue Gray
        '#ff5722', // Deep Orange
        '#8bc34a', // Light Green
        '#673ab7', // Deep Purple
        '#ffeb3b', // Yellow
        '#03a9f4', // Light Blue
    ];

    // Simple hash function to get consistent color for the same name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Use the hash to pick a color from our palette
    const index = Math.abs(hash) % colors.length;
    return colors[index];
};

// User Avatar component
// CatchNumbersTooltip component to handle the tooltip for catch numbers
const CatchNumbersTooltip = ({ process, uniqueCatches, getProcessName }) => {
    const [showTooltip, setShowTooltip] = useState(false);

    const toggleTooltip = () => {
        setShowTooltip(!showTooltip);
    };

    const catchCount = uniqueCatches.length;

    return (
        <OverlayTrigger
            placement="auto"
            trigger="click"
            show={showTooltip}
            onToggle={setShowTooltip}
            rootClose={true}
            popperConfig={{
                modifiers: [
                    {
                        name: 'preventOverflow',
                        options: {
                            boundary: 'viewport',
                            padding: 10
                        }
                    },
                    {
                        name: 'offset',
                        options: {
                            offset: [0, 10]
                        }
                    },
                    {
                        name: 'flip',
                        options: {
                            fallbackPlacements: ['top', 'bottom', 'right', 'left'],
                            padding: 10
                        }
                    }
                ]
            }}
            overlay={
                <Tooltip id={`tooltip-catch-${process.processId}`} className="custom-tooltip">
                    <div style={{
                        textAlign: 'left',
                        padding: '12px',
                        width: uniqueCatches.length > 15 ? '320px' : '300px',
                        background: 'linear-gradient(135deg, #2c3e50, #34495e)',
                        borderRadius: '10px',
                        boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        position: 'relative',
                        overflow: 'hidden',
                        transform: 'translateZ(0)'
                    }}>
                        {/* Add decorative elements */}
                        <div style={{
                            position: 'absolute',
                            top: '-20px',
                            right: '-20px',
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
                            pointerEvents: 'none'
                        }}></div>
                        <div style={{
                            position: 'absolute',
                            bottom: '-30px',
                            left: '-30px',
                            width: '100px',
                            height: '100px',
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 70%)',
                            pointerEvents: 'none'
                        }}></div>
                        <div style={{
                            borderBottom: '1px solid rgba(255,255,255,0.15)',
                            paddingBottom: '10px',
                            marginBottom: '10px',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            position: 'relative',
                            zIndex: 1
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                <div style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #3498db, #2980b9)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '8px',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="#ffffff" viewBox="0 0 16 16">
                                        <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                                        <path d="M10.97 4.97a.75.75 0 0 1 1.071 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.235.235 0 0 1 .02-.022z"/>
                                    </svg>
                                </div>
                                <span style={{
                                    fontSize: '0.95rem',
                                    color: '#ecf0f1',
                                    textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                                }}>
                                    Catch Numbers <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '22px',
                                        height: '22px',
                                        borderRadius: '50%',
                                        backgroundColor: 'rgba(255,255,255,0.15)',
                                        marginLeft: '6px',
                                        fontSize: '0.8rem'
                                    }}>{uniqueCatches.length}</span>
                                </span>
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <div style={{
                                    fontSize: '0.75rem',
                                    background: 'linear-gradient(135deg, rgba(52, 152, 219, 0.8), rgba(41, 128, 185, 0.8))',
                                    padding: '4px 10px',
                                    borderRadius: '12px',
                                    color: 'white',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '4px' }}>
                                        <path d="M8 4a.5.5 0 0 1 .5.5V6H10a.5.5 0 0 1 0 1H8.5v1.5a.5.5 0 0 1-1 0V7H6a.5.5 0 0 1 0-1h1.5V4.5A.5.5 0 0 1 8 4z"/>
                                        <path d="M4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H4zm0 1h8a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z"/>
                                    </svg>
                                    {getProcessName(process.processId)}
                                </div>

                                {/* Close button */}
                                <div
                                    onClick={toggleTooltip}
                                    style={{
                                        width: '22px',
                                        height: '22px',
                                        borderRadius: '50%',
                                        background: 'rgba(255,255,255,0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                                    }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="#ffffff" viewBox="0 0 16 16">
                                        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                                    </svg>
                                </div>
                            </div>
                        </div>
                        {uniqueCatches.length > 10 && (
                            <div style={{
                                fontSize: '0.7rem',
                                color: 'rgba(255,255,255,0.5)',
                                textAlign: 'center',
                                marginBottom: '5px',
                                fontStyle: 'italic'
                            }}>
                                Scroll to view all {uniqueCatches.length} catch numbers
                            </div>
                        )}
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '6px',
                            width: '100%',
                            maxHeight: uniqueCatches.length > 30 ? '200px' :
                                      uniqueCatches.length > 20 ? '180px' :
                                      uniqueCatches.length > 10 ? '150px' : 'auto',
                            overflowY: uniqueCatches.length > 10 ? 'auto' : 'visible',
                            padding: '10px',
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            borderRadius: '8px',
                            scrollbarWidth: 'thin',
                            scrollbarColor: 'rgba(255,255,255,0.3) transparent',
                            msOverflowStyle: 'none', /* IE and Edge */
                            border: '1px solid rgba(255,255,255,0.08)',
                            boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.1)',
                            position: 'relative',
                            zIndex: 1,
                            marginTop: '5px'
                        }}
                        className="custom-scrollbar"
                        >
                            {uniqueCatches.map((catchNo, idx) => {
                                // Generate different colors for catch numbers
                                const colors = [
                                    'rgba(52, 152, 219, 0.9)',  // Blue
                                    'rgba(46, 204, 113, 0.9)',  // Green
                                    'rgba(155, 89, 182, 0.9)',  // Purple
                                    'rgba(241, 196, 15, 0.9)',  // Yellow
                                    'rgba(231, 76, 60, 0.9)',   // Red
                                    'rgba(26, 188, 156, 0.9)',   // Teal
                                    'rgba(230, 126, 34, 0.9)'    // Orange
                                ];

                                // Use hash of catchNo to get consistent color
                                const hash = catchNo.split('').reduce((acc, char) => {
                                    return char.charCodeAt(0) + ((acc << 5) - acc);
                                }, 0);

                                const colorIndex = Math.abs(hash) % colors.length;

                                return (
                                    <span key={idx} style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        padding: '5px 10px',
                                        borderRadius: '6px',
                                        backgroundColor: colors[colorIndex],
                                        color: '#ffffff',
                                        margin: '3px',
                                        fontSize: '0.85rem',
                                        fontWeight: '500',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                                        border: '1px solid rgba(255,255,255,0.15)',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}>
                                        <span style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            background: 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0))',
                                            pointerEvents: 'none'
                                        }}></span>
                                        {catchNo}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                </Tooltip>
            }
        >
            <div
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: showTooltip
                        ? 'linear-gradient(135deg, #c0defa, #b0d6fa)'
                        : 'linear-gradient(135deg, #e8f4fd, #d0e6fb)',
                    color: '#4a90e2',
                    fontWeight: '600',
                    fontSize: '0.85rem',
                    boxShadow: showTooltip
                        ? '0 4px 8px rgba(74, 144, 226, 0.3)'
                        : '0 2px 4px rgba(74, 144, 226, 0.15)',
                    border: '1px solid rgba(74, 144, 226, 0.25)',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                    transform: showTooltip ? 'translateY(-2px)' : 'translateY(0)'
                }}
                onClick={toggleTooltip}
                onMouseEnter={(e) => {
                    if (!showTooltip) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(74, 144, 226, 0.25)';
                        e.currentTarget.style.background = 'linear-gradient(135deg, #d0e6fb, #c0defa)';
                    }
                }}
                onMouseLeave={(e) => {
                    if (!showTooltip) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(74, 144, 226, 0.15)';
                        e.currentTarget.style.background = 'linear-gradient(135deg, #e8f4fd, #d0e6fb)';
                    }
                }}
            >
                <span>{catchCount}</span>
                <span style={{
                    marginLeft: '6px',
                    fontSize: '10px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #ffffff, #f0f7ff)',
                    color: '#4a90e2',
                    fontWeight: 'bold',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    border: '1px solid rgba(74, 144, 226, 0.3)',
                    transition: 'all 0.2s ease'
                }}>
                    {showTooltip ? (
                        // Show close icon when tooltip is open
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                        </svg>
                    ) : (
                        // Show click icon when tooltip is closed
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                        </svg>
                    )}
                </span>
            </div>
        </OverlayTrigger>
    );
};

const UserAvatar = ({ name, size = 30 }) => {
    const color = generateAvatarColor(name);
    const initials = name
        ? name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .substring(0, 2)
        : '?';

    return (
        <OverlayTrigger
            placement="top"
            overlay={<Tooltip>{name}</Tooltip>}
        >
            <div
                className="team-avatar"
                style={{
                    width: size,
                    height: size,
                    borderRadius: '50%',
                    backgroundColor: color,
                    color: '#fff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '600',
                    fontSize: size * 0.4,
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                    border: '2px solid white',
                    textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}
            >
                {initials}
            </div>
        </OverlayTrigger>
    );
};

const DailyReport = ({ date }) => {

    const [reportData, setReportData] = useState({
        userTransactionDetails: [],
        totalRecords: 0,
        currentPage: 1,
        pageSize: 10,
        machines: [],
        supervisors: [],
        totalCatches: 0,
        totalQuantity: 0,
        distinctLotNos: []
    });

    // Store all transaction data (not just paginated data) for accurate catch number counting
    const [allTransactionData, setAllTransactionData] = useState([]);
    const [machineMap, setMachineMap] = useState({});
    const [loading, setLoading] = useState(false);
    const [processes, setProcesses] = useState([]);
    const [users, setUsers] = useState([]);
    const [userId, setUserId] = useState('');
    const [selectedDate, setSelectedDate] = useState(date || '');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [sortField, setSortField] = useState('projectName');
    const [sortDirection, setSortDirection] = useState('asc');
    const [userMap, setUserMap] = useState({});
    const [zoneMap, setZoneMap] = useState({});
    const [zones, setZones] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10; // Fixed page size
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState('');
    const [isProcessSummaryExpanded, setIsProcessSummaryExpanded] = useState(true);
    const [projectName, setProjectName] = useState('');

    const handleStartDateSelect = (e) => {
        // Reset report data when date changes to avoid showing stale data
        setReportData({
            userTransactionDetails: [],
            totalRecords: 0,
            currentPage: 1,
            pageSize: 10,
            machines: [],
            supervisors: [],
            totalCatches: 0,
            totalQuantity: 0,
            distinctLotNos: []
        });

        // Reset all transaction data
        setAllTransactionData([]);

        // Set the start date
        setStartDate(e.target.value);

        // If end date is not set, use this as a single date
        if (!endDate) {
            setSelectedDate(e.target.value);
        } else {
            // If end date is set, clear the single date as we're using a range
            setSelectedDate('');
        }

        setCurrentPage(1); // Reset to first page
    };

    const handleEndDateSelect = (e) => {
        // Reset report data when date changes to avoid showing stale data
        setReportData({
            userTransactionDetails: [],
            totalRecords: 0,
            currentPage: 1,
            pageSize: 10,
            machines: [],
            supervisors: [],
            totalCatches: 0,
            totalQuantity: 0,
            distinctLotNos: []
        });

        // Reset all transaction data
        setAllTransactionData([]);

        // If end date is cleared
        if (!e.target.value) {
            setEndDate('');
            // If start date exists, treat it as a single date
            if (startDate) {
                setSelectedDate(startDate);
            }
        } else {
            // End date is set, we're using a date range
            setEndDate(e.target.value);
            setSelectedDate(''); // Clear single date when using range
        }

        setCurrentPage(1); // Reset to first page
    };

    const handleUserSelect = (selectedOption) => {
        // Reset report data when user changes to avoid showing stale data
        setReportData({
            userTransactionDetails: [],
            totalRecords: 0,
            currentPage: 1,
            pageSize: 10,
            machines: [],
            supervisors: [],
            totalCatches: 0,
            totalQuantity: 0,
            distinctLotNos: []
        });

        // Reset all transaction data
        setAllTransactionData([]);

        setUserId(selectedOption ? selectedOption.value : '');
        setCurrentPage(1); // Reset to first page
    };

    // Handle page change
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleGroupSelect = (selectedOption, fromTableHeader = false) => {
        // Reset report data when group changes to avoid showing stale data
        setReportData({
            userTransactionDetails: [],
            totalRecords: 0,
            currentPage: 1,
            pageSize: 10,
            machines: [],
            supervisors: [],
            totalCatches: 0,
            totalQuantity: 0,
            distinctLotNos: []
        });

        // Reset all transaction data
        setAllTransactionData([]);

        const newGroupValue = selectedOption ? selectedOption.value : '';
        setSelectedGroup(newGroupValue);
        setCurrentPage(1); // Reset to first page

        // Log the selected group for debugging
        if (newGroupValue) {
            const groupName = groups.find(g => g.id === parseInt(newGroupValue))?.name || `Group ${newGroupValue}`;
            console.log(`Selected group: ${groupName} (ID: ${newGroupValue})`);
        } else {
            console.log('Cleared group selection');
        }

        // If this was triggered from the table header, scroll to the table
        if (fromTableHeader) {
            setTimeout(() => {
                const tableElement = document.querySelector('.table-responsive');
                if (tableElement) {
                    tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 500);
        }
    };

    const fetchGroups = async () => {
        try {
            const response = await API.get('/Reports/GetAllGroups');
            const activeGroups = response.data.filter(group => group.status);
            setGroups(activeGroups);
        } catch (error) {
            console.error("Error fetching groups:", error);
        }
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

            // Create a map of zone IDs to zone names for quick lookup
            const zoneMap = {};
            response.data.forEach(zone => {
                zoneMap[zone.zoneId] = zone.zoneNo;
            });
            setZoneMap(zoneMap);
            setZones(response.data);
        } catch (error) {
            console.error("Error fetching zones:", error);
        }
    };

    const fetchMachines = async () => {
        try {
            const response = await API.get('/Machines');

            // Create a map of machine IDs to machine names for quick lookup
            const machineMap = {};
            response.data.forEach(machine => {
                machineMap[machine.machineId] = machine.machineName;
            });
            setMachineMap(machineMap);
        } catch (error) {
            console.error("Error fetching machines:", error);
        }
    };

    // Function to fetch all transaction data (not just paginated)
    const fetchAllTransactionData = async () => {
        try {
            // Format dates for API
            const formatDateForApi = (dateStr) => {
                if (!dateStr) return '';
                return new Date(dateStr).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                }).replace(/\//g, '-');
            };

            // Prepare API parameters - use a large pageSize to get all records
            const params = {
                page: 1,
                pageSize: 10000 // Use a very large page size to get all records
            };

            // Use date range if both start and end dates are provided
            if (startDate && endDate) {
                params.startDate = formatDateForApi(startDate);
                params.endDate = formatDateForApi(endDate);
            } else if (startDate) {
                // Use start date as a single date if end date is not provided
                params.date = formatDateForApi(startDate);
            }

            // Only add userId if it's selected
            if (userId) {
                params.userId = userId;
            }

            // Only add groupId if it's selected
            if (selectedGroup) {
                params.groupId = parseInt(selectedGroup);
            }

            const response = await API.get(`/Reports/DailyReports`, { params });

            // If the API returns paginated data, use userTransactionDetails
            if (response.data && response.data.userTransactionDetails) {
                return response.data.userTransactionDetails || [];
            }

            // If the API returns an array directly
            if (Array.isArray(response.data)) {
                return response.data;
            }

            return [];
        } catch (error) {
            console.error("Error fetching all transaction data:", error);
            return [];
        }
    };

    const fetchDailyReport = async () => {
        try {
            // Clear previous data and set loading state
            setLoading(true);
            setReportData({
                userTransactionDetails: [],
                totalRecords: 0,
                currentPage: 1,
                pageSize: 10,
                machines: [],
                supervisors: [],
                totalCatches: 0,
                totalQuantity: 0,
                distinctLotNos: []
            });

            // Reset all transaction data
            setAllTransactionData([]);

            // Format dates for API
            const formatDateForApi = (dateStr) => {
                if (!dateStr) return '';
                return new Date(dateStr).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                }).replace(/\//g, '-');
            };

            // Prepare API parameters
            const params = {
                page: currentPage,
                pageSize: pageSize
            };

            // Use date range if both start and end dates are provided
            if (startDate && endDate) {
                params.startDate = formatDateForApi(startDate);
                params.endDate = formatDateForApi(endDate);
                console.log(`Using date range: ${params.startDate} to ${params.endDate}`);
            } else if (startDate) {
                // Use start date as a single date if end date is not provided
                params.date = formatDateForApi(startDate);
                console.log(`Using single date: ${params.date}`);
            }

            // Only add userId if it's selected
            if (userId) {
                params.userId = userId;
            }

            // Only add groupId if it's selected
            if (selectedGroup) {
                params.groupId = parseInt(selectedGroup);
                console.log(`Filtering by group ID: ${selectedGroup}`);
            }

            const response = await API.get(`/Reports/DailyReports`, { params });
            console.log('API Response:', response.data);

            // Extract project name from the first transaction if available
            if (response.data &&
                response.data.userTransactionDetails &&
                response.data.userTransactionDetails.length > 0 &&
                response.data.userTransactionDetails[0].projectName) {
                setProjectName(response.data.userTransactionDetails[0].projectName);
            } else {
                setProjectName('');
            }

            setReportData(response.data);

            // Fetch all transaction data for accurate catch number counting
            const allTransactions = await fetchAllTransactionData();
            setAllTransactionData(allTransactions);
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
        fetchMachines();
        fetchGroups();
    }, []);

    useEffect(() => {
        // Fetch data if we have either a valid start date or a date range
        if (startDate) {
            // Reset any previous data and fetch new data
            fetchDailyReport();
        }
    }, [startDate, endDate, userId, selectedGroup, currentPage, pageSize]);

    // Initialize with today's date if no date is selected
    useEffect(() => {
        if (!startDate && !endDate) {
            const today = new Date().toISOString().split('T')[0];
            setStartDate(today);
            setSelectedDate(today); // Also set selectedDate for API compatibility
        }
    }, []);



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

    // Get machine name by ID
    const getMachineName = (machineId) => {
        if (machineId === 0) return 'N/A';
        if (machineId === undefined || machineId === null) return 'N/A';
        return machineMap[machineId] || `Machine ${machineId}`;
    };

    // Format date/time range
    const formatTimeRange = (startTime, endTime) => {
        if (!startTime || !endTime) return 'N/A';
        try {
            const startDate = new Date(startTime);
            const endDate = new Date(endTime);

            const startFormatted = startDate.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });

            const endFormatted = endDate.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });

            return `${startFormatted} to ${endFormatted}`;
        } catch (error) {
            console.error("Error formatting date range:", error);
            return 'Invalid time';
        }
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

    // Toggle process summary section expansion
    const toggleProcessSummaryExpansion = () => {
        setIsProcessSummaryExpanded(prev => !prev);
    };

    // We don't need client-side filtering since the backend already filters by groupId
    // Just use the data returned from the API
    const filteredTransactions = [...reportData.userTransactionDetails];

    // Sort transactions
    const sortedTransactions = filteredTransactions.sort((a, b) => {
        let comparison = 0;

        if (sortField === 'transactionId') {
            comparison = a.transactionId - b.transactionId;
        } else if (sortField === 'projectName') {
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
        } else if (sortField === 'machineId') {
            const machineNameA = getMachineName(a.machineId);
            const machineNameB = getMachineName(b.machineId);
            comparison = machineNameA.localeCompare(machineNameB);
        } else if (sortField === 'quantity') {
            comparison = (a.quantity || 0) - (b.quantity || 0);
        } else if (sortField === 'timeRange') {
            // Sort by start time when sorting the combined time range column
            const dateA = a.startTime ? new Date(a.startTime) : new Date(0);
            const dateB = b.startTime ? new Date(b.startTime) : new Date(0);
            comparison = dateA - dateB;
        }

        return sortDirection === 'asc' ? comparison : -comparison;
    });




    // Define CSS animations and custom styles
    const keyframes = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideInUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        @keyframes shimmer {
            0% { background-position: -1000px 0; }
            100% { background-position: 1000px 0; }
        }

        /* Custom scrollbar styling */
        .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.3);
            border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.5);
        }

        /* Custom tooltip styling */
        .tooltip.show {
            opacity: 1 !important;
            z-index: 9999 !important;
        }

        /* Process card tooltips - transparent background */
        .custom-tooltip .tooltip-inner {
            background-color: transparent !important;
            padding: 0 !important;
            border-radius: 8px !important;
            max-width: 320px !important;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2) !important;
        }

        /* Table tooltips - styled background */
        .tooltip-inner {
            background-color: #2c3e50 !important;
            color: white !important;
            padding: 10px 15px !important;
            border-radius: 8px !important;
            max-width: 350px !important;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2) !important;
            border: 1px solid rgba(255,255,255,0.1) !important;
            font-size: 0.9rem !important;
            line-height: 1.5 !important;
            text-align: left !important;
            overflow: visible !important;
        }

        /* Fix for tooltip positioning */
        .tooltip {
            pointer-events: none !important;
        }

        /* Make sure tooltip content is visible */
        .tooltip-inner * {
            pointer-events: auto !important;
        }

        /* Tooltip arrows */
        .tooltip.bs-tooltip-auto[x-placement^=top] .arrow::before,
        .tooltip.bs-tooltip-top .arrow::before {
            border-top-color: #2c3e50 !important;
        }

        .tooltip.bs-tooltip-auto[x-placement^=bottom] .arrow::before,
        .tooltip.bs-tooltip-bottom .arrow::before {
            border-bottom-color: #2c3e50 !important;
        }

        .tooltip.bs-tooltip-auto[x-placement^=left] .arrow::before,
        .tooltip.bs-tooltip-left .arrow::before {
            border-left-color: #2c3e50 !important;
        }

        .tooltip.bs-tooltip-auto[x-placement^=right] .arrow::before,
        .tooltip.bs-tooltip-right .arrow::before {
            border-right-color: #2c3e50 !important;
        }

        /* Custom tooltip arrows for process cards */
        .custom-tooltip.tooltip.bs-tooltip-auto[x-placement^=top] .arrow::before,
        .custom-tooltip.tooltip.bs-tooltip-top .arrow::before,
        .custom-tooltip.tooltip.bs-tooltip-auto[x-placement^=bottom] .arrow::before,
        .custom-tooltip.tooltip.bs-tooltip-bottom .arrow::before,
        .custom-tooltip.tooltip.bs-tooltip-auto[x-placement^=left] .arrow::before,
        .custom-tooltip.tooltip.bs-tooltip-left .arrow::before,
        .custom-tooltip.tooltip.bs-tooltip-auto[x-placement^=right] .arrow::before,
        .custom-tooltip.tooltip.bs-tooltip-right .arrow::before {
            border-color: transparent !important;
        }
    `;

    // Add the keyframes to the document and card hover effects
    React.useEffect(() => {
        // Add keyframes
        const styleElement = document.createElement('style');
        styleElement.innerHTML = keyframes;
        document.head.appendChild(styleElement);

        // Add hover effects to cards
        const addCardHoverEffects = () => {
            const cards = document.querySelectorAll('.card');
            cards.forEach(card => {
                card.addEventListener('mouseenter', () => {
                    card.style.transform = 'translateY(-5px)';
                    card.style.boxShadow = '0 10px 20px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.06)';
                });

                card.addEventListener('mouseleave', () => {
                    card.style.transform = 'translateY(0)';
                    card.style.boxShadow = '0 4px 6px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.03)';
                });
            });
        };

        // Add the hover effects after a short delay to ensure the DOM is ready
        const timer = setTimeout(() => {
            addCardHoverEffects();
        }, 500);

        return () => {
            document.head.removeChild(styleElement);
            clearTimeout(timer);
        };
    }, [keyframes, selectedDate]);

    // Define global styles for the component
    const styles = {
        pageContainer: {
            background: 'linear-gradient(to bottom, #f8f9fa, #ffffff)',
            minHeight: '100vh',
            padding: '25px 20px',
            transition: 'all 0.3s ease',
            position: 'relative'
        },
        reportContainer: {
            animation: 'slideInUp 0.5s ease-in-out',
            borderRadius: '8px',
            overflow: 'hidden'
        },
        pageHeader: {
            marginBottom: '25px',
            borderBottom: '1px solid rgba(0,0,0,0.05)',
            paddingBottom: '15px'
        },
        pageTitle: {
            display: 'flex',
            alignItems: 'center',
            fontSize: '1.75rem',
            fontWeight: '600',
            color: '#2c3e50',
            margin: '0'
        },
        pageTitleIcon: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #4a90e2, #5e72e4)',
            color: 'white',
            marginRight: '12px',
            boxShadow: '0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)'
        },
        sectionTitle: {
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '15px',
            color: '#2c3e50',
            display: 'flex',
            alignItems: 'center'
        },
        sectionIcon: {
            marginRight: '8px',
            color: '#4a90e2'
        }
    };

    return (
        <Container fluid style={styles.pageContainer}>
            <div style={styles.reportContainer}>
                {/* Page Title and Breadcrumb */}
                <div style={styles.pageHeader}>
                    <h2 style={styles.pageTitle}>
                        <span style={styles.pageTitleIcon}>
                            <FaChartBar />
                        </span>
                        Daily Activity Report
                    </h2>
                </div>

                {/* Filters Section */}
                <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '25px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.03)',
                    border: '1px solid rgba(0,0,0,0.05)',
                    animation: 'slideInUp 0.5s ease-in-out 0.1s both'
                }}>

                    <Row className="g-3">
                        <Col xs={12} sm={6} md={4} lg={3}>
                            <div style={{
                                marginBottom: '15px'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    marginBottom: '8px',
                                    fontWeight: '600',
                                    fontSize: '0.9rem',
                                    color: '#495057'
                                }}>
                                    <FaCalendarAlt style={{
                                        marginRight: '8px',
                                        color: '#4a90e2'
                                    }} />
                                    Select Date
                                </div>
                                <Form.Control
                                    type="date"
                                    value={startDate}
                                    onChange={handleStartDateSelect}
                                    style={{
                                        backgroundColor: "#ffffff",
                                        border: '1px solid #e0e0e0',
                                        borderRadius: '8px',
                                        cursor: "pointer",
                                        transition: "all 0.2s ease",
                                        boxShadow: "0 2px 4px rgba(0,0,0,0.03)",
                                        height: "42px",
                                        fontSize: "0.9rem",
                                        position: "relative",
                                        zIndex: 10,
                                        padding: '10px 12px',
                                        width: '100%'
                                    }}
                                />
                            </div>
                        </Col>

                        <Col xs={12} sm={6} md={4} lg={3}>
                            <div style={{
                                marginBottom: '15px'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    marginBottom: '8px',
                                    fontWeight: '600',
                                    fontSize: '0.9rem',
                                    color: '#495057'
                                }}>
                                    <FaCalendarAlt style={{
                                        marginRight: '8px',
                                        color: '#4a90e2'
                                    }} />
                                    End Date
                                </div>
                                <Form.Control
                                    type="date"
                                    value={endDate}
                                    onChange={handleEndDateSelect}
                                    style={{
                                        backgroundColor: "#ffffff",
                                        border: '1px solid #e0e0e0',
                                        borderRadius: '8px',
                                        cursor: "pointer",
                                        transition: "all 0.2s ease",
                                        boxShadow: "0 2px 4px rgba(0,0,0,0.03)",
                                        height: "42px",
                                        fontSize: "0.9rem",
                                        position: "relative",
                                        zIndex: 10,
                                        padding: '10px 12px',
                                        width: '100%'
                                    }}
                                />
                            </div>
                        </Col>

                        <Col xs={12} sm={6} md={4} lg={3}>
                            <div style={{
                                marginBottom: '15px'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    marginBottom: '8px',
                                    fontWeight: '500',
                                    fontSize: '0.9rem',
                                    color: '#495057'
                                }}>
                                    <FaObjectGroup style={{
                                        marginRight: '8px',
                                        color: '#4a90e2'
                                    }} />
                                    Select Group
                                </div>
                                <Select
                                    value={selectedGroup ? { value: selectedGroup, label: groups.find(g => g.id === parseInt(selectedGroup))?.name || `Group ${selectedGroup}` } : null}
                                    onChange={handleGroupSelect}
                                    options={[
                                        { value: '', label: 'All Groups' },
                                        ...groups.map(group => ({
                                            value: group.id,
                                            label: group.name
                                        }))
                                    ]}
                                    placeholder="Select Group"
                                    isClearable
                                    isSearchable
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                    styles={{
                                        control: (baseStyles) => ({
                                            ...baseStyles,
                                            border: '1px solid #e0e0e0',
                                            boxShadow: "0 2px 4px rgba(0,0,0,0.03)",
                                            fontSize: "0.9rem",
                                            color: "#333",
                                            minHeight: "42px",
                                            borderRadius: "8px",
                                            backgroundColor: "#ffffff",
                                            transition: "all 0.2s ease",
                                            '&:hover': {
                                                borderColor: '#4a90e2'
                                            }
                                        }),
                                        menu: (baseStyles) => ({
                                            ...baseStyles,
                                            zIndex: 9999,
                                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                            borderRadius: "8px",
                                            overflow: "hidden"
                                        }),
                                        menuPortal: (base) => ({
                                            ...base,
                                            zIndex: 9999
                                        }),
                                        option: (baseStyles, state) => ({
                                            ...baseStyles,
                                            backgroundColor: state.isSelected ? "#4a90e2" : state.isFocused ? "#f0f7ff" : null,
                                            color: state.isSelected ? "white" : "#333",
                                            padding: "10px 12px",
                                            cursor: "pointer",
                                            transition: "background-color 0.2s ease"
                                        }),
                                        placeholder: (baseStyles) => ({
                                            ...baseStyles,
                                            color: "#adb5bd"
                                        }),
                                        singleValue: (baseStyles) => ({
                                            ...baseStyles,
                                            color: "#495057"
                                        })
                                    }}
                                    menuPortalTarget={document.body}
                                    menuPosition="fixed"
                                />
                            </div>
                        </Col>

                        <Col xs={12} sm={6} md={4} lg={3}>
                            <div style={{
                                marginBottom: '15px'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    marginBottom: '8px',
                                    fontWeight: '500',
                                    fontSize: '0.9rem',
                                    color: '#495057'
                                }}>
                                    <FaUser style={{
                                        marginRight: '8px',
                                        color: '#4a90e2'
                                    }} />
                                    Select User
                                </div>
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
                                            border: '1px solid #e0e0e0',
                                            boxShadow: "0 2px 4px rgba(0,0,0,0.03)",
                                            fontSize: "0.9rem",
                                            color: "#333",
                                            minHeight: "42px",
                                            borderRadius: "8px",
                                            backgroundColor: "#ffffff",
                                            transition: "all 0.2s ease",
                                            '&:hover': {
                                                borderColor: '#4a90e2'
                                            }
                                        }),
                                        menu: (baseStyles) => ({
                                            ...baseStyles,
                                            zIndex: 9999,
                                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                            borderRadius: "8px",
                                            overflow: "hidden"
                                        }),
                                        menuPortal: (base) => ({
                                            ...base,
                                            zIndex: 9999
                                        }),
                                        option: (baseStyles, state) => ({
                                            ...baseStyles,
                                            backgroundColor: state.isSelected ? "#4a90e2" : state.isFocused ? "#f0f7ff" : null,
                                            color: state.isSelected ? "white" : "#333",
                                            padding: "10px 12px",
                                            cursor: "pointer",
                                            transition: "background-color 0.2s ease"
                                        }),
                                        placeholder: (baseStyles) => ({
                                            ...baseStyles,
                                            color: "#adb5bd"
                                        }),
                                        singleValue: (baseStyles) => ({
                                            ...baseStyles,
                                            color: "#495057"
                                        })
                                    }}
                                    menuPortalTarget={document.body}
                                    menuPosition="fixed"
                                />
                            </div>
                        </Col>

                        <Col xs={12} sm={6} md={4} lg={3} className="d-flex align-items-end">
                            {startDate && (
                                <div style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    backgroundColor: '#e8f4fd',
                                    color: '#2c7be5',
                                    fontWeight: '500',
                                    fontSize: '0.9rem',
                                    marginBottom: '15px',
                                    boxShadow: '0 2px 4px rgba(44, 123, 229, 0.1)',
                                    border: '1px solid rgba(44, 123, 229, 0.2)',
                                    animation: 'fadeIn 0.3s ease-in-out'
                                }}>
                                    <FaCalendarAlt style={{ marginRight: '8px' }} />
                                    {endDate ? (
                                        // Show date range if both dates are selected
                                        <>
                                            {new Date(startDate).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })} to {new Date(endDate).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </>
                                    ) : (
                                        // Show single date if only start date is selected
                                        <>
                                            {new Date(startDate).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </>
                                    )}
                                </div>
                            )}
                        </Col>
                    </Row>
                </div>

            {loading ? (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '40px 20px',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.03)',
                    border: '1px solid rgba(0,0,0,0.05)',
                    textAlign: 'center',
                    animation: 'slideInUp 0.5s ease-in-out',
                    marginBottom: '25px'
                }}>
                    <div style={{
                        width: '60px',
                        height: '60px',
                        position: 'relative',
                        marginBottom: '20px'
                    }}>
                        <Spinner
                            animation="border"
                            variant="primary"
                            style={{
                                width: '60px',
                                height: '60px',
                                color: '#4a90e2',
                                borderWidth: '4px'
                            }}
                        />
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            fontSize: '1.5rem',
                            color: '#4a90e2',
                            opacity: 0.5
                        }}>
                            <FaChartBar />
                        </div>
                    </div>
                    <h5 style={{
                        fontSize: '1.2rem',
                        fontWeight: '600',
                        marginBottom: '8px',
                        color: '#2c3e50'
                    }}>Loading Report Data</h5>
                    <p style={{
                        color: '#6c757d',
                        fontSize: '0.95rem',
                        maxWidth: '400px',
                        margin: '0 auto'
                    }}>Please wait while we fetch the latest information...</p>
                </div>
            ) : (startDate) ? (
                <>
                    {/* Summary Cards */}
                    <div style={{
                        marginBottom: '25px',
                        animation: 'slideInUp 0.5s ease-in-out 0.2s both'
                    }}>
                        <h5 style={{
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            marginBottom: '15px',
                            color: '#2c3e50',
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <FaChartBar style={{ marginRight: '8px', color: '#4a90e2' }} />
                            Summary Overview
                        </h5>
                        <Row className="g-4">
                            <Col md={6} lg={3} xl={3} className="mb-3">
                                <Card style={{
                                    borderRadius: '12px',
                                         border: '  1px solid silver',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.03)',
                                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                    overflow: 'hidden',
                                    height: '100%',
                                    backgroundColor: 'white',
                                    cursor: 'pointer'
                                }}>
                                    <Card.Body style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '20px'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '50px',
                                            height: '50px',
                                            borderRadius: '12px',
                                            background: 'linear-gradient(135deg, #4a90e2, #5e72e4)',
                                            color: 'white',
                                            marginRight: '15px',
                                            boxShadow: '0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)'
                                        }}>
                                            <FaBoxes size={20} />
                                        </div>
                                        <div>
                                            <div style={{
                                                fontSize: '0.85rem',
                                                fontWeight: '500',
                                                color: '#6c757d',
                                                marginBottom: '5px'
                                            }}>Total Catches</div>
                                            <div style={{
                                                fontSize: '1.75rem',
                                                fontWeight: '700',
                                                color: '#2c3e50',
                                                lineHeight: '1'
                                            }}>{reportData.totalCatches || 0}</div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col md={6} lg={3} xl={3} className="mb-3">
                                <Card style={{
                                    borderRadius: '12px',
                                        border: '  1px solid silver',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.03)',
                                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                    overflow: 'hidden',
                                    height: '100%',
                                    backgroundColor: 'white',
                                    cursor: 'pointer'
                                }}>
                                    <Card.Body style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '20px'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '50px',
                                            height: '50px',
                                            borderRadius: '12px',
                                            background: 'linear-gradient(135deg, #2dce89, #2dcca7)',
                                            color: 'white',
                                            marginRight: '15px',
                                            boxShadow: '0 4px 6px rgba(45, 206, 137, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)'
                                        }}>
                                            <FaChartPie size={20} />
                                        </div>
                                        <div>
                                            <div style={{
                                                fontSize: '0.85rem',
                                                fontWeight: '500',
                                                color: '#6c757d',
                                                marginBottom: '5px'
                                            }}>Total Quantity</div>
                                            <div style={{
                                                fontSize: '1.75rem',
                                                fontWeight: '700',
                                                color: '#2c3e50',
                                                lineHeight: '1'
                                            }}>{reportData.totalQuantity?.toLocaleString() || 0}</div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col md={6} lg={3} xl={3} className="mb-3">
                                <Card style={{
                                    borderRadius: '12px',
                                    border: '  1px solid silver',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.03)',
                                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                    overflow: 'hidden',
                                    height: '100%',
                                    backgroundColor: 'white',
                                    cursor: 'pointer'
                                }}>
                                    <Card.Body style={{
                                        padding: '20px'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            marginBottom: '15px'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: '50px',
                                                height: '50px',
                                                borderRadius: '12px',
                                                background: 'linear-gradient(135deg, #11cdef, #1171ef)',
                                                color: 'white',
                                                marginRight: '15px',
                                                boxShadow: '0 4px 6px rgba(17, 205, 239, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)'
                                            }}>
                                                <FaListOl size={20} />
                                            </div>
                                            <div style={{
                                                fontSize: '0.85rem',
                                                fontWeight: '500',
                                                color: '#6c757d'
                                            }}>Lot Numbers</div>
                                        </div>
                                        <div style={{
                                            maxHeight: '80px',
                                            overflowY: 'auto',
                                            padding: '5px 0'
                                        }}>
                                            {reportData.userTransactionDetails && reportData.userTransactionDetails.length > 0 ? (
                                                <div style={{
                                                    display: 'flex',
                                                    flexWrap: 'wrap',
                                                    gap: '5px'
                                                }}>
                                                    {Array.from(new Set(reportData.userTransactionDetails.map(t => t.lot))).filter(Boolean).map((lot, index) => (
                                                        <span key={index} style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            padding: '4px 8px',
                                                            borderRadius: '6px',
                                                            backgroundColor: '#e8f4fd',
                                                            color: '#2c7be5',
                                                            fontWeight: '500',
                                                            fontSize: '0.8rem',
                                                            marginRight: '5px',
                                                            marginBottom: '5px',
                                                            boxShadow: '0 1px 2px rgba(44, 123, 229, 0.1)',
                                                            border: '1px solid rgba(44, 123, 229, 0.2)'
                                                        }}>
                                                            Lot {lot}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span style={{
                                                    color: '#6c757d',
                                                    fontSize: '0.85rem'
                                                }}>No lot data available</span>
                                            )}
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col md={6} lg={3} xl={3} className="mb-3">
                                <Card style={{
                                    borderRadius: '12px',
                                       border: '  1px solid silver',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.03)',
                                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                    overflow: 'hidden',
                                    height: '100%',
                                    backgroundColor: 'white',
                                    cursor: 'pointer'
                                }}>
                                    <Card.Body style={{
                                        padding: '20px'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            marginBottom: '15px'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: '50px',
                                                height: '50px',
                                                borderRadius: '12px',
                                                background: 'linear-gradient(135deg, #fb6340, #fbb140)',
                                                color: 'white',
                                                marginRight: '15px',
                                                boxShadow: '0 4px 6px rgba(251, 99, 64, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)'
                                            }}>
                                                <FaUserTie size={20} />
                                            </div>
                                            <div style={{
                                                fontSize: '0.85rem',
                                                fontWeight: '500',
                                                color: '#6c757d'
                                            }}>Supervisors</div>
                                        </div>

                                        <div style={{
                                            maxHeight: '80px',
                                            overflowY: 'auto',
                                            padding: '5px 0'
                                        }}>
                                            {reportData.supervisors && reportData.supervisors.length > 0 ? (
                                                <div>
                                                    {reportData.supervisors.map((supervisor, index) => (
                                                        <div key={index} style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            padding: '5px 0',
                                                            borderBottom: index < reportData.supervisors.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none'
                                                        }}>
                                                            <UserAvatar name={supervisor.name} size={24} />
                                                            <span style={{
                                                                marginLeft: '8px',
                                                                fontWeight: '500',
                                                                fontSize: '0.85rem',
                                                                color: '#495057'
                                                            }}>{supervisor.name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p style={{
                                                    color: '#6c757d',
                                                    fontSize: '0.85rem',
                                                    margin: 0
                                                }}>No supervisors data available</p>
                                            )}
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>


                        </Row>
                    </div>

                    {/* Process Quantity Section */}
                    {reportData.completedQuantityByProcess && reportData.completedQuantityByProcess.length > 0 && (
                        <div style={{
                            marginBottom: '20px',
                            animation: 'slideInUp 0.5s ease-in-out 0.3s both',
                                border: '  1px solid silver',
                            borderRadius: '12px',
                            backgroundColor: 'white',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.03)',
                            overflow: 'hidden'
                        }}>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '15px 20px',
                                    borderBottom: isProcessSummaryExpanded ? '1px solid rgba(0,0,0,0.05)' : 'none',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s ease'
                                }}
                                onClick={toggleProcessSummaryExpansion}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'white';
                                }}
                            >
                                 <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '28px',
                                            height: '28px',
                                            borderRadius: '6px',
                                            backgroundColor: '#f8f9fa',
                                            color: '#6c757d',
                                            border: '1px solid #e9ecef',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        {isProcessSummaryExpanded ?
                                            <FaChevronDown size={14} /> :
                                            <FaChevronRight size={14} />
                                        }
                                    </div>
                                <h5 style={{
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    margin: 0,
                                    color: '#2c3e50',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}>
                                    <FaCogs style={{ marginRight: '8px', color: '#4a90e2' }} />
                                    Process Completion
                                </h5>

                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center'
                                }}>
                                    <div style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        padding: '4px 10px',
                                        borderRadius: '6px',
                                        backgroundColor: '#e8f4fd',
                                        color: '#2c7be5',
                                        fontWeight: '500',
                                        fontSize: '0.8rem',
                                        boxShadow: '0 1px 3px rgba(44, 123, 229, 0.1)',
                                             border: '  1px solid silver',
                                        marginRight: '10px'
                                    }}>
                                        <FaChartPie style={{ marginRight: '6px', fontSize: '10px' }} />
                                        {reportData.completedQuantityByProcess.length} Processes
                                    </div>

                                </div>
                            </div>

                            {/* Collapsible content */}
                            {isProcessSummaryExpanded && (
                                <div style={{
                                    padding: '15px 20px',
                                    animation: 'fadeIn 0.3s ease-in-out'
                                }}>
                                    {/* Grid layout for process cards */}
                                    <Row className="g-2">
                                        {[...reportData.completedQuantityByProcess]
                                            .sort((a, b) => b.totalQuantity - a.totalQuantity) // Sort by quantity in descending order
                                            .map((process, index) => {
                                                // Calculate percentage of total quantity
                                                const percentage = reportData.totalQuantity > 0
                                                    ? ((process.totalQuantity / reportData.totalQuantity) * 100).toFixed(1)
                                                    : 0;

                                                return (
                                                    <Col key={index} xs={12} sm={6} md={4} lg={3}>
                                                        <Card style={{
                                                            borderRadius: '8px',
                                                                  border: '  1px solid silver',
                                                            boxShadow: '0 2px 4px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)',
                                                            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                                            overflow: 'hidden',
                                                            height: '100%',
                                                            backgroundColor: 'white'
                                                        }}>
                                                            <Card.Body style={{
                                                                padding: '12px',
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                minHeight: '180px' // Add minimum height to make cards more uniform
                                                            }}>
                                                                <div style={{
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    marginBottom: '12px'
                                                                }}>
                                                                    <div style={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        marginBottom: '4px'
                                                                    }}>
                                                                        <div style={{
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            width: '28px',
                                                                            height: '28px',
                                                                            borderRadius: '6px',
                                                                            background: 'linear-gradient(135deg, #4a90e2, #5e72e4)',
                                                                            color: 'white',
                                                                            marginRight: '8px',
                                                                            fontSize: '12px',
                                                                            boxShadow: '0 2px 4px rgba(50, 50, 93, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)'
                                                                        }}>
                                                                            <FaIndustry />
                                                                        </div>
                                                                        <div style={{
                                                                            fontSize: '0.85rem',
                                                                            fontWeight: '600',
                                                                            color: '#2c3e50',
                                                                            whiteSpace: 'nowrap',
                                                                            overflow: 'hidden',
                                                                            textOverflow: 'ellipsis',
                                                                            maxWidth: 'calc(100% - 36px)'
                                                                        }}>
                                                                            {getProcessName(process.processId)}
                                                                        </div>
                                                                    </div>

                                                                    {/* Supervisor inline section */}
                                                                    {(() => {
                                                                        // Get all transactions for this process
                                                                        const processTransactions = reportData.userTransactionDetails.filter(
                                                                            t => t.processId === process.processId
                                                                        );

                                                                        // Get unique supervisors
                                                                        const supervisors = [...new Set(processTransactions.map(t => t.supervisor))].filter(Boolean);

                                                                        if (supervisors.length > 0) {
                                                                            return (
                                                                                <div style={{
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    marginLeft: '36px',
                                                                                    gap: '6px',

                                                                                    padding: '4px 8px',
                                                                                    borderRadius: '4px',

                                                                                }}>
                                                                                    <FaUserTie size={30} style={{ color: '#2c7be5' }} />
                                                                                    <div style={{
                                                                                        display: 'flex',
                                                                                        alignItems: 'center',
                                                                                        gap: '4px',
                                                                                        flexWrap: 'wrap'
                                                                                    }}>
                                                                                        {supervisors.map((supervisor, idx) => (
                                                                                            <div key={idx} style={{
                                                                                                display: 'flex',
                                                                                                alignItems: 'center',
                                                                                                marginRight: '4px'
                                                                                            }}>
                                                                                                <UserAvatar name={supervisor} size={40} />
                                                                                                <span style={{
                                                                                                    fontSize: '0.75rem',
                                                                                                    fontWeight: '700',
                                                                                                    color: '#2c3e50',
                                                                                                    marginLeft: '4px',
                                                                                                    textShadow: '0 0.5px 0 rgba(0,0,0,0.05)'
                                                                                                }}>
                                                                                                    {supervisor}
                                                                                                </span>
                                                                                                {idx < supervisors.length - 1 &&
                                                                                                    <span style={{ marginLeft: '4px', color: '#adb5bd' }}>•</span>
                                                                                                }
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        } else {
                                                                            return null;
                                                                        }
                                                                    })()}
                                                                </div>

                                                                {/* Quantity and Catch Count Row */}
                                                                <div style={{
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    alignItems: 'center',
                                                                    marginTop: 'auto',
                                                                    gap: '8px'
                                                                }}>
                                                                    {/* Quantity */}
                                                                    <div style={{
                                                                        display: 'flex',
                                                                        flexDirection: 'column',
                                                                        flex: '1'
                                                                    }}>
                                                                        <div style={{
                                                                            fontSize: '0.75rem',
                                                                            color: '#6c757d',
                                                                            fontWeight: '500',
                                                                            marginBottom: '4px'
                                                                        }}>
                                                                            Quantity:
                                                                        </div>
                                                                        <div style={{
                                                                            display: 'inline-flex',
                                                                            alignItems: 'center',
                                                                            padding: '3px 8px',
                                                                            borderRadius: '4px',
                                                                            backgroundColor: '#e6f9f1',
                                                                            color: '#2dce89',
                                                                            fontWeight: '600',
                                                                            fontSize: '0.8rem',
                                                                            boxShadow: '0 1px 2px rgba(45, 206, 137, 0.1)',
                                                                            border: '1px solid rgba(45, 206, 137, 0.2)'
                                                                        }}>
                                                                            {process.totalQuantity.toLocaleString()}
                                                                        </div>
                                                                    </div>

                                                                    {/* Catch Count */}
                                                                    <div style={{
                                                                        display: 'flex',
                                                                        flexDirection: 'column',
                                                                        flex: '1'
                                                                    }}>
                                                                        <div style={{
                                                                            fontSize: '0.75rem',
                                                                            color: '#6c757d',
                                                                            fontWeight: '500',
                                                                            marginBottom: '4px'
                                                                        }}>
                                                                            Catches :
                                                                        </div>
                                                                        {(() => {
                                                                            // Get all transactions for this process from allTransactionData (not just paginated data)
                                                                            const processTransactions = allTransactionData.filter(
                                                                                t => t.processId === process.processId
                                                                            );

                                                                            // Get unique catch numbers
                                                                            const uniqueCatches = [...new Set(processTransactions.map(t => t.catchNo))];

                                                                            // Use the CatchNumbersTooltip component
                                                                            return (
                                                                                <CatchNumbersTooltip
                                                                                    process={process}
                                                                                    uniqueCatches={uniqueCatches}
                                                                                    getProcessName={getProcessName}
                                                                                />
                                                                            );
                                                                        })()}
                                                                    </div>
                                                                </div>

                                                                {/* Progress bar showing percentage of total */}
                                                                <div style={{
                                                                    marginTop: '8px',
                                                                    width: '100%',
                                                                    height: '4px',
                                                                    backgroundColor: '#f0f0f0',
                                                                    borderRadius: '2px',
                                                                    overflow: 'hidden'
                                                                }}>
                                                                    <div style={{
                                                                        height: '100%',
                                                                        width: `${percentage}%`,
                                                                        backgroundColor: '#4a90e2',
                                                                        borderRadius: '2px'
                                                                    }} />
                                                                </div>
                                                                <div style={{
                                                                    fontSize: '0.7rem',
                                                                    color: '#6c757d',
                                                                    textAlign: 'right',
                                                                    marginTop: '2px'
                                                                }}>
                                                                    {percentage}% of total
                                                                </div>
                                                            </Card.Body>
                                                        </Card>
                                                    </Col>
                                                );
                                            })}
                                    </Row>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Transaction Details */}
                    {reportData.userTransactionDetails && reportData.userTransactionDetails.length > 0 ? (
                        <div style={{
                            animation: 'slideInUp 0.5s ease-in-out 0.4s both',
                            marginBottom: '25px'
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '15px'
                            }}>
                                <div>
                                    <h5 style={{
                                        fontSize: '1.1rem',
                                        fontWeight: '600',
                                        margin: 0,
                                        marginBottom: '5px',
                                        color: '#2c3e50',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}>
                                        <FaTable style={{ marginRight: '8px', color: '#4a90e2' }} />
                                        Transaction Details
                                    </h5>
                                    {projectName && (
                                        <div style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            padding: '4px 10px',
                                            borderRadius: '6px',
                                            backgroundColor: '#f0f7ff',
                                            color: '#4a90e2',
                                            fontWeight: '500',
                                            fontSize: '0.85rem',
                                            marginTop: '5px',
                                            boxShadow: '0 1px 2px rgba(44, 123, 229, 0.1)',
                                            border: '1px solid rgba(44, 123, 229, 0.2)'
                                        }}>
                                            Project: {projectName}
                                        </div>
                                    )}
                                </div>

                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                }}>
                                    {/* Export Component */}
                                    <DailyReportExport
                                        selectedDate={selectedDate}
                                        startDate={startDate}
                                        endDate={endDate}
                                        selectedGroup={selectedGroup}
                                        userId={userId}
                                        groupName={selectedGroup ? groups.find(g => g.id === parseInt(selectedGroup))?.name : ''}
                                        processes={processes}
                                        machines={reportData.machines || []}
                                        zones={zones || []}
                                        users={users || []}
                                        projectName={projectName}
                                    />

                                    {selectedGroup && (
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}>
                                            <div style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                padding: '6px 12px',
                                                borderRadius: '8px',
                                                backgroundColor: '#e8f4fd',
                                                color: '#2c7be5',
                                                fontWeight: '500',
                                                fontSize: '0.85rem',
                                                marginRight: '8px',
                                                boxShadow: '0 2px 4px rgba(44, 123, 229, 0.1)',
                                                border: '1px solid rgba(44, 123, 229, 0.2)'
                                            }}>
                                                <FaObjectGroup style={{ marginRight: '8px' }} />
                                                <span>Group: {groups.find(g => g.id === parseInt(selectedGroup))?.name || `Group ${selectedGroup}`}</span>
                                            </div>
                                            <button
                                                onClick={() => handleGroupSelect(null)}
                                                title="Clear group filter"
                                                style={{
                                                    width: '28px',
                                                    height: '28px',
                                                    padding: '0',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    borderRadius: '50%',
                                                    border: '1px solid #dee2e6',
                                                    backgroundColor: 'white',
                                                    color: '#6c757d',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease',
                                                    fontSize: '16px',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{
                                backgroundColor: 'white',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.03)',
                                border: '1px solid rgba(0,0,0,0.05)'
                            }}>
                                <div style={{
                                    overflowX: 'auto'
                                }}>
                                    <Table hover style={{
                                        margin: 0,
                                        width: '100%',
                                        borderCollapse: 'separate',
                                        borderSpacing: 0
                                    }}>
                                        <thead>
                                            <tr style={{
                                                backgroundColor: '#f8f9fa',
                                                borderBottom: '2px solid #e9ecef'
                                            }}>
                                                <th style={{
                                                    padding: '15px 20px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600',
                                                    color: '#495057',
                                                    textAlign: 'center',
                                                    width: '60px',
                                                    borderTop: 'none'
                                                }}>
                                                    <span style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>S.N.</span>
                                                </th>

                                                <th style={{
                                                    padding: '15px 20px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600',
                                                    color: '#495057',
                                                    textAlign: 'center',
                                                    borderTop: 'none',
                                                    cursor: 'pointer'
                                                }} onClick={() => handleSort('catchNo')}>
                                                    <span style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        Catch No
                                                        {sortField === 'catchNo' && (
                                                            <span style={{ marginLeft: '5px', color: '#4a90e2' }}>
                                                                {sortDirection === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
                                                            </span>
                                                        )}
                                                    </span>
                                                </th>

                                                <th style={{
                                                    padding: '15px 20px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600',
                                                    color: '#495057',
                                                    textAlign: 'center',
                                                    borderTop: 'none',
                                                    cursor: 'pointer'
                                                }} onClick={() => handleSort('processId')}>
                                                    <span style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <FaIndustry style={{ marginRight: '6px', fontSize: '12px' }} />
                                                        Process
                                                        {sortField === 'processId' && (
                                                            <span style={{ marginLeft: '5px', color: '#4a90e2' }}>
                                                                {sortDirection === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
                                                            </span>
                                                        )}
                                                    </span>
                                                </th>

                                                <th style={{
                                                    padding: '15px 20px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600',
                                                    color: '#495057',
                                                    textAlign: 'center',
                                                    borderTop: 'none',
                                                    cursor: 'pointer'
                                                }} onClick={() => handleSort('zoneId')}>
                                                    <span style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        Zone
                                                        {sortField === 'zoneId' && (
                                                            <span style={{ marginLeft: '5px', color: '#4a90e2' }}>
                                                                {sortDirection === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
                                                            </span>
                                                        )}
                                                    </span>
                                                </th>

                                                <th style={{
                                                    padding: '15px 20px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600',
                                                    color: '#495057',
                                                    textAlign: 'center',
                                                    borderTop: 'none',
                                                    cursor: 'pointer'
                                                }} onClick={() => handleSort('machineId')}>
                                                    <span style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        Machine
                                                        {sortField === 'machineId' && (
                                                            <span style={{ marginLeft: '5px', color: '#4a90e2' }}>
                                                                {sortDirection === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
                                                            </span>
                                                        )}
                                                    </span>
                                                </th>

                                                <th style={{
                                                    padding: '15px 20px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600',
                                                    color: '#495057',
                                                    textAlign: 'center',
                                                    borderTop: 'none',
                                                    cursor: 'pointer'
                                                }} onClick={() => handleSort('quantity')}>
                                                    <span style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        Quantity
                                                        {sortField === 'quantity' && (
                                                            <span style={{ marginLeft: '5px', color: '#4a90e2' }}>
                                                                {sortDirection === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
                                                            </span>
                                                        )}
                                                    </span>
                                                </th>

                                                <th style={{
                                                    padding: '15px 20px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600',
                                                    color: '#495057',
                                                    textAlign: 'center',
                                                    borderTop: 'none',
                                                    cursor: 'pointer'
                                                }} onClick={() => handleSort('timeRange')}>
                                                    <span style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <FaClock style={{ marginRight: '6px', fontSize: '12px' }} />
                                                        Time Range
                                                        {sortField === 'timeRange' && (
                                                            <span style={{ marginLeft: '5px', color: '#4a90e2' }}>
                                                                {sortDirection === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
                                                            </span>
                                                        )}
                                                    </span>
                                                </th>

                                                <th style={{
                                                    padding: '15px 20px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600',
                                                    color: '#495057',
                                                    textAlign: 'center',
                                                    borderTop: 'none'
                                                }}>
                                                    <span style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <FaUsers style={{ marginRight: '6px', fontSize: '12px' }} />
                                                        Team Members
                                                    </span>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sortedTransactions.length === 0 ? (
                                                <tr>
                                                    <td colSpan="11" style={{
                                                        padding: '30px 20px',
                                                        textAlign: 'center',
                                                        color: '#6c757d'
                                                    }}>
                                                        <div style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '0.95rem'
                                                        }}>
                                                            <FaSearch style={{ marginRight: '10px', opacity: 0.7 }} />
                                                            <span>No matching transactions found for the selected filters.</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                sortedTransactions.map((transaction, index) => (
                                                <tr key={index} style={{
                                                    backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa',
                                                    transition: 'background-color 0.2s ease'
                                                }}>
                                                    <td style={{
                                                        padding: '12px 20px',
                                                        fontSize: '0.9rem',
                                                        color: '#495057',
                                                        textAlign: 'center',
                                                        borderTop: '1px solid #e9ecef'
                                                    }}>{index + 1}</td>

                                                    <td style={{
                                                        padding: '12px 20px',
                                                        fontSize: '0.9rem',
                                                        fontWeight: '500',
                                                        color: '#495057',
                                                        textAlign: 'center',
                                                        borderTop: '1px solid #e9ecef'
                                                    }}>{transaction.catchNo}</td>

                                                    <td style={{
                                                        padding: '12px 20px',
                                                        fontSize: '0.9rem',
                                                        color: '#495057',
                                                        textAlign: 'center',
                                                        borderTop: '1px solid #e9ecef'
                                                    }}>{getProcessName(transaction.processId)}</td>

                                                    <td style={{
                                                        padding: '12px 20px',
                                                        fontSize: '0.9rem',
                                                        color: '#495057',
                                                        textAlign: 'center',
                                                        borderTop: '1px solid #e9ecef'
                                                    }}>
                                                        {transaction.zoneId === 0 ? '' : (
                                                            <span style={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                padding: '5px 10px',
                                                                borderRadius: '6px',
                                                                backgroundColor: '#e8f4fd',
                                                                color: '#2c7be5',
                                                                fontWeight: '500',
                                                                fontSize: '0.85rem',
                                                                boxShadow: '0 1px 2px rgba(44, 123, 229, 0.1)',
                                                                border: '1px solid rgba(44, 123, 229, 0.2)'
                                                            }}>
                                                                {getZoneName(transaction.zoneId)}
                                                            </span>
                                                        )}
                                                    </td>

                                                    <td style={{
                                                        padding: '12px 20px',
                                                        fontSize: '0.9rem',
                                                        color: '#495057',
                                                        textAlign: 'center',
                                                        borderTop: '1px solid #e9ecef'
                                                    }}>
                                                        {transaction.machineId === 0 ? '' : (
                                                            <span style={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                padding: '5px 10px',
                                                                borderRadius: '6px',
                                                                backgroundColor: '#e3f8ff',
                                                                color: '#11cdef',
                                                                fontWeight: '500',
                                                                fontSize: '0.85rem',
                                                                boxShadow: '0 1px 2px rgba(17, 205, 239, 0.1)',
                                                                border: '1px solid rgba(17, 205, 239, 0.2)'
                                                            }}>
                                                                {getMachineName(transaction.machineId)}
                                                            </span>
                                                        )}
                                                    </td>

                                                    <td style={{
                                                        padding: '12px 20px',
                                                        fontSize: '0.9rem',
                                                        color: '#495057',
                                                        textAlign: 'center',
                                                        borderTop: '1px solid #e9ecef'
                                                    }}>
                                                        <span style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            padding: '5px 10px',
                                                            borderRadius: '6px',
                                                            backgroundColor: '#e6f9f1',
                                                            color: '#2dce89',
                                                            fontWeight: '500',
                                                            fontSize: '0.85rem',
                                                            boxShadow: '0 1px 2px rgba(45, 206, 137, 0.1)',
                                                            border: '1px solid rgba(45, 206, 137, 0.2)'
                                                        }}>
                                                            {transaction.quantity || 0}
                                                        </span>
                                                    </td>

                                                    <td style={{
                                                        padding: '12px 20px',
                                                        fontSize: '0.9rem',
                                                        color: '#495057',
                                                        textAlign: 'center',
                                                        borderTop: '1px solid #e9ecef'
                                                    }}>
                                                        <OverlayTrigger
                                                            placement="auto"
                                                            delay={{ show: 200, hide: 100 }}
                                                            popperConfig={{
                                                                modifiers: [
                                                                    {
                                                                        name: 'preventOverflow',
                                                                        options: {
                                                                            boundary: 'viewport',
                                                                            padding: 10
                                                                        }
                                                                    },
                                                                    {
                                                                        name: 'offset',
                                                                        options: {
                                                                            offset: [0, 8]
                                                                        }
                                                                    },
                                                                    {
                                                                        name: 'flip',
                                                                        options: {
                                                                            fallbackPlacements: ['bottom', 'top', 'right', 'left'],
                                                                            padding: 10
                                                                        }
                                                                    }
                                                                ]
                                                            }}
                                                            overlay={
                                                                <Tooltip>
                                                                    <div style={{
                                                                        padding: '8px',
                                                                        borderRadius: '6px',
                                                                        background: 'rgba(255,255,255,0.05)',
                                                                        width: '100%'
                                                                    }}>
                                                                        <div style={{
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            marginBottom: '10px',
                                                                            borderBottom: '1px solid rgba(255,255,255,0.1)',
                                                                            paddingBottom: '8px'
                                                                        }}>
                                                                            <div style={{
                                                                                width: '24px',
                                                                                height: '24px',
                                                                                borderRadius: '50%',
                                                                                background: 'linear-gradient(135deg, #fb6340, #f5365c)',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center',
                                                                                marginRight: '8px',
                                                                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                                                            }}>
                                                                                <FaClock style={{ color: 'white', fontSize: '12px' }} />
                                                                            </div>
                                                                            <span style={{ fontWeight: 'bold' }}>Time Details</span>
                                                                        </div>

                                                                        <div style={{
                                                                            display: 'flex',
                                                                            flexDirection: 'column',
                                                                            gap: '10px'
                                                                        }}>
                                                                            <div style={{
                                                                                display: 'flex',
                                                                                alignItems: 'flex-start',
                                                                                padding: '6px 8px',
                                                                                borderRadius: '4px',
                                                                                backgroundColor: 'rgba(17, 205, 239, 0.1)',
                                                                                border: '1px solid rgba(17, 205, 239, 0.2)'
                                                                            }}>
                                                                                <div style={{
                                                                                    display: 'flex',
                                                                                    flexDirection: 'column',
                                                                                    width: '100%'
                                                                                }}>
                                                                                    <div style={{
                                                                                        display: 'flex',
                                                                                        alignItems: 'center',
                                                                                        marginBottom: '4px'
                                                                                    }}>
                                                                                        <strong style={{ color: '#11cdef', marginRight: '5px' }}>Start:</strong>
                                                                                        <span style={{ fontSize: '0.9rem' }}>
                                                                                            {new Date(transaction.startTime).toLocaleDateString()}
                                                                                        </span>
                                                                                    </div>
                                                                                    <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
                                                                                        {new Date(transaction.startTime).toLocaleTimeString()}
                                                                                    </div>
                                                                                </div>
                                                                            </div>

                                                                            <div style={{
                                                                                display: 'flex',
                                                                                alignItems: 'flex-start',
                                                                                padding: '6px 8px',
                                                                                borderRadius: '4px',
                                                                                backgroundColor: 'rgba(251, 99, 64, 0.1)',
                                                                                border: '1px solid rgba(251, 99, 64, 0.2)'
                                                                            }}>
                                                                                <div style={{
                                                                                    display: 'flex',
                                                                                    flexDirection: 'column',
                                                                                    width: '100%'
                                                                                }}>
                                                                                    <div style={{
                                                                                        display: 'flex',
                                                                                        alignItems: 'center',
                                                                                        marginBottom: '4px'
                                                                                    }}>
                                                                                        <strong style={{ color: '#fb6340', marginRight: '5px' }}>End:</strong>
                                                                                        <span style={{ fontSize: '0.9rem' }}>
                                                                                            {new Date(transaction.endTime).toLocaleDateString()}
                                                                                        </span>
                                                                                    </div>
                                                                                    <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
                                                                                        {new Date(transaction.endTime).toLocaleTimeString()}
                                                                                    </div>
                                                                                </div>
                                                                            </div>

                                                                            <div style={{
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                padding: '6px 8px',
                                                                                borderRadius: '4px',
                                                                                backgroundColor: 'rgba(45, 206, 137, 0.1)',
                                                                                border: '1px solid rgba(45, 206, 137, 0.2)',
                                                                                marginTop: '2px'
                                                                            }}>
                                                                                <div style={{
                                                                                    width: '16px',
                                                                                    height: '16px',
                                                                                    borderRadius: '50%',
                                                                                    background: 'linear-gradient(135deg, #2dce89, #2bce89)',
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    justifyContent: 'center',
                                                                                    marginRight: '8px',
                                                                                    boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                                                                                }}>
                                                                                    <FaClock style={{ color: 'white', fontSize: '8px' }} />
                                                                                </div>
                                                                                <div>
                                                                                    <strong style={{ color: '#2dce89', marginRight: '5px', fontSize: '0.85rem' }}>Duration:</strong>
                                                                                    <span style={{ fontSize: '0.85rem' }}>
                                                                                        {(() => {
                                                                                            const start = new Date(transaction.startTime);
                                                                                            const end = new Date(transaction.endTime);
                                                                                            const diff = Math.abs(end - start);
                                                                                            const hours = Math.floor(diff / (1000 * 60 * 60));
                                                                                            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                                                                                            return `${hours}h ${minutes}m`;
                                                                                        })()}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </Tooltip>
                                                            }
                                                        >
                                                            <span style={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                padding: '5px 10px',
                                                                borderRadius: '6px',
                                                                backgroundColor: '#fff8e1',
                                                                color: '#fb6340',
                                                                fontWeight: '500',
                                                                fontSize: '0.85rem',
                                                                boxShadow: '0 1px 2px rgba(251, 99, 64, 0.1)',
                                                                border: '1px solid rgba(251, 99, 64, 0.2)',
                                                                cursor: 'pointer'
                                                            }}>
                                                                <FaClock style={{ marginRight: '5px', fontSize: '10px' }} />
                                                                {formatTimeRange(transaction.startTime, transaction.endTime)}
                                                            </span>
                                                        </OverlayTrigger>
                                                    </td>

                                                    <td style={{
                                                        padding: '12px 20px',
                                                        fontSize: '0.9rem',
                                                        color: '#495057',
                                                        textAlign: 'center',
                                                        borderTop: '1px solid #e9ecef'
                                                    }}>
                                                        {transaction.teamMembersNames && transaction.teamMembersNames.length > 0 ? (
                                                            <div style={{
                                                                display: 'flex',
                                                                flexWrap: 'wrap',
                                                                justifyContent: 'center',
                                                                alignItems: 'center'
                                                            }}>
                                                                {transaction.teamMembersNames.slice(0, 5).map((member, idx) => (
                                                                    <UserAvatar key={idx} name={member} size={30} />
                                                                ))}
                                                                {transaction.teamMembersNames.length > 5 && (
                                                                    <OverlayTrigger
                                                                        placement="auto"
                                                                        delay={{ show: 200, hide: 100 }}
                                                                        popperConfig={{
                                                                            modifiers: [
                                                                                {
                                                                                    name: 'preventOverflow',
                                                                                    options: {
                                                                                        boundary: 'viewport',
                                                                                        padding: 10
                                                                                    }
                                                                                },
                                                                                {
                                                                                    name: 'offset',
                                                                                    options: {
                                                                                        offset: [0, 8]
                                                                                    }
                                                                                },
                                                                                {
                                                                                    name: 'flip',
                                                                                    options: {
                                                                                        fallbackPlacements: ['bottom', 'top', 'right', 'left'],
                                                                                        padding: 10
                                                                                    }
                                                                                }
                                                                            ]
                                                                        }}
                                                                        overlay={
                                                                            <Tooltip>
                                                                                <div style={{
                                                                                    padding: '5px',
                                                                                    borderRadius: '6px',
                                                                                    background: 'rgba(255,255,255,0.05)'
                                                                                }}>
                                                                                    <div style={{
                                                                                        display: 'flex',
                                                                                        alignItems: 'center',
                                                                                        marginBottom: '8px',
                                                                                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                                                                                        paddingBottom: '5px'
                                                                                    }}>
                                                                                        <FaUsers style={{ marginRight: '8px', color: '#5e72e4' }} />
                                                                                        <span style={{ fontWeight: 'bold' }}>Team Members</span>
                                                                                    </div>
                                                                                    <div>
                                                                                        <strong style={{ color: '#5e72e4', marginBottom: '5px', display: 'block' }}>
                                                                                            All Members ({transaction.teamMembersNames.length}):
                                                                                        </strong>
                                                                                        <div style={{
                                                                                            display: 'flex',
                                                                                            flexDirection: 'column',
                                                                                            gap: '5px',
                                                                                            maxHeight: transaction.teamMembersNames.length > 15 ? '200px' :
                                                                                                      transaction.teamMembersNames.length > 8 ? '180px' : '150px',
                                                                                            overflowY: transaction.teamMembersNames.length > 6 ? 'auto' : 'visible',
                                                                                            paddingRight: '5px',
                                                                                            width: '100%'
                                                                                        }} className="custom-scrollbar">
                                                                                            {transaction.teamMembersNames.map((member, idx) => (
                                                                                                <div key={idx} style={{
                                                                                                    display: 'flex',
                                                                                                    alignItems: 'center',
                                                                                                    padding: '3px 6px',
                                                                                                    borderRadius: '4px',
                                                                                                    backgroundColor: idx % 2 === 0 ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
                                                                                                    fontSize: '0.85rem',
                                                                                                    whiteSpace: 'nowrap',
                                                                                                    overflow: 'hidden',
                                                                                                    textOverflow: 'ellipsis'
                                                                                                }}>
                                                                                                    <div style={{
                                                                                                        width: '18px',
                                                                                                        height: '18px',
                                                                                                        borderRadius: '50%',
                                                                                                        background: `linear-gradient(135deg, hsl(${(idx * 40) % 360}, 70%, 60%), hsl(${(idx * 40 + 20) % 360}, 70%, 50%))`,
                                                                                                        marginRight: '6px',
                                                                                                        display: 'flex',
                                                                                                        alignItems: 'center',
                                                                                                        justifyContent: 'center',
                                                                                                        fontSize: '9px',
                                                                                                        fontWeight: 'bold',
                                                                                                        color: 'white',
                                                                                                        flexShrink: 0,
                                                                                                        boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                                                                                                    }}>
                                                                                                        {member.charAt(0).toUpperCase()}
                                                                                                    </div>
                                                                                                    <span style={{
                                                                                                        overflow: 'hidden',
                                                                                                        textOverflow: 'ellipsis',
                                                                                                        maxWidth: '250px'
                                                                                                    }}>
                                                                                                        {member}
                                                                                                    </span>
                                                                                                </div>
                                                                                            ))}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </Tooltip>
                                                                        }
                                                                    >
                                                                        <div
                                                                            style={{
                                                                                width: 30,
                                                                                height: 30,
                                                                                borderRadius: '50%',
                                                                                background: 'linear-gradient(45deg, #6c757d, #495057)',
                                                                                color: '#fff',
                                                                                display: 'inline-flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center',
                                                                                fontWeight: '600',
                                                                                fontSize: 11,
                                                                                margin: '0 2px',
                                                                                cursor: 'pointer',
                                                                                boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                                                                                border: '2px solid white',
                                                                                textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                                                            }}
                                                                        >
                                                                            +{transaction.teamMembersNames.length - 5}
                                                                        </div>
                                                                    </OverlayTrigger>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span style={{
                                                                color: '#adb5bd',
                                                                fontSize: '0.85rem'
                                                            }}></span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                            )}
                                        </tbody>
                                    </Table>
                                </div>
                            </div>

                            {/* Pagination */}
                            {reportData.totalRecords > 0 && (
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginTop: '20px',
                                    padding: '15px 0'
                                }}>
                                    <div style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        padding: '8px 15px',
                                        borderRadius: '8px',
                                        backgroundColor: '#e3f8ff',
                                        color: '#11cdef',
                                        fontWeight: '500',
                                        fontSize: '0.85rem',
                                        boxShadow: '0 2px 4px rgba(17, 205, 239, 0.1)',
                                        border: '1px solid rgba(17, 205, 239, 0.2)'
                                    }}>
                                        <FaTable style={{ marginRight: '8px' }} />
                                        {selectedGroup ? (
                                            <>
                                                Showing {filteredTransactions.length} of {reportData.totalRecords} records
                                                {filteredTransactions.length !== reportData.userTransactionDetails.length && (
                                                    <span style={{ marginLeft: '5px' }}>
                                                        (filtered from {reportData.userTransactionDetails.length} records)
                                                    </span>
                                                )}
                                            </>
                                        ) : (
                                            <>Showing {reportData.userTransactionDetails.length} of {reportData.totalRecords} records</>
                                        )}
                                    </div>

                                    <Pagination style={{
                                        display: 'flex',
                                        padding: 0,
                                        margin: 0,
                                        listStyle: 'none',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                                    }}>
                                        <Pagination.First
                                            onClick={() => handlePageChange(1)}
                                            disabled={reportData.currentPage === 1}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                padding: '8px 12px',
                                                backgroundColor: 'white',
                                                border: '1px solid #e9ecef',
                                                color: reportData.currentPage === 1 ? '#adb5bd' : '#495057',
                                                cursor: reportData.currentPage === 1 ? 'not-allowed' : 'pointer',
                                                transition: 'all 0.2s ease'
                                            }}
                                        />
                                        <Pagination.Prev
                                            onClick={() => handlePageChange(reportData.currentPage - 1)}
                                            disabled={reportData.currentPage === 1}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                padding: '8px 12px',
                                                backgroundColor: 'white',
                                                border: '1px solid #e9ecef',
                                                color: reportData.currentPage === 1 ? '#adb5bd' : '#495057',
                                                cursor: reportData.currentPage === 1 ? 'not-allowed' : 'pointer',
                                                transition: 'all 0.2s ease'
                                            }}
                                        />

                                        {/* Generate page numbers */}
                                        {[...Array(Math.ceil(reportData.totalRecords / reportData.pageSize)).keys()].map(number => {
                                            // Show only a few pages around the current page
                                            if (
                                                number + 1 === 1 ||
                                                number + 1 === Math.ceil(reportData.totalRecords / reportData.pageSize) ||
                                                (number + 1 >= reportData.currentPage - 2 && number + 1 <= reportData.currentPage + 2)
                                            ) {
                                                const isActive = number + 1 === reportData.currentPage;
                                                return (
                                                    <Pagination.Item
                                                        key={number + 1}
                                                        active={isActive}
                                                        onClick={() => handlePageChange(number + 1)}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            padding: '8px 12px',
                                                            minWidth: '40px',
                                                            backgroundColor: isActive ? '#4a90e2' : 'white',
                                                            border: '1px solid #e9ecef',
                                                            color: isActive ? 'white' : '#495057',
                                                            fontWeight: isActive ? '600' : '400',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                    >
                                                        {number + 1}
                                                    </Pagination.Item>
                                                );
                                            } else if (
                                                number + 1 === reportData.currentPage - 3 ||
                                                number + 1 === reportData.currentPage + 3
                                            ) {
                                                return <Pagination.Ellipsis
                                                    key={`ellipsis-${number}`}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        padding: '8px 12px',
                                                        backgroundColor: 'white',
                                                        border: '1px solid #e9ecef',
                                                        color: '#495057'
                                                    }}
                                                />;
                                            }
                                            return null;
                                        })}

                                        <Pagination.Next
                                            onClick={() => handlePageChange(reportData.currentPage + 1)}
                                            disabled={reportData.currentPage === Math.ceil(reportData.totalRecords / reportData.pageSize)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                padding: '8px 12px',
                                                backgroundColor: 'white',
                                                border: '1px solid #e9ecef',
                                                color: reportData.currentPage === Math.ceil(reportData.totalRecords / reportData.pageSize) ? '#adb5bd' : '#495057',
                                                cursor: reportData.currentPage === Math.ceil(reportData.totalRecords / reportData.pageSize) ? 'not-allowed' : 'pointer',
                                                transition: 'all 0.2s ease'
                                            }}
                                        />
                                        <Pagination.Last
                                            onClick={() => handlePageChange(Math.ceil(reportData.totalRecords / reportData.pageSize))}
                                            disabled={reportData.currentPage === Math.ceil(reportData.totalRecords / reportData.pageSize)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                padding: '8px 12px',
                                                backgroundColor: 'white',
                                                border: '1px solid #e9ecef',
                                                color: reportData.currentPage === Math.ceil(reportData.totalRecords / reportData.pageSize) ? '#adb5bd' : '#495057',
                                                cursor: reportData.currentPage === Math.ceil(reportData.totalRecords / reportData.pageSize) ? 'not-allowed' : 'pointer',
                                                transition: 'all 0.2s ease'
                                            }}
                                        />
                                    </Pagination>
                                </div>
                            )}
                        </div>
                    ) : filteredTransactions.length === 0 && selectedGroup ? (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '60px 20px',
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.03)',
                            border: '1px solid rgba(0,0,0,0.05)',
                            textAlign: 'center',
                            animation: 'slideInUp 0.5s ease-in-out 0.2s both',
                            marginBottom: '25px'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '70px',
                                height: '70px',
                                borderRadius: '50%',
                                backgroundColor: '#f8f9fa',
                                marginBottom: '20px',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.03)',
                                border: '1px solid rgba(0,0,0,0.05)'
                            }}>
                                <FaFilter style={{
                                    fontSize: '28px',
                                    color: '#6c757d'
                                }} />
                            </div>
                            <h4 style={{
                                fontSize: '1.4rem',
                                fontWeight: '600',
                                marginBottom: '15px',
                                color: '#2c3e50'
                            }}>No Matching Transactions</h4>
                            <p style={{
                                fontSize: '1rem',
                                color: '#6c757d',
                                marginBottom: '25px',
                                maxWidth: '500px'
                            }}>
                                There are no transactions for the selected group
                                "{groups.find(g => g.id === parseInt(selectedGroup))?.name || `Group ${selectedGroup}`}".
                            </p>
                            <button
                                className="btn btn-primary"
                                onClick={() => handleGroupSelect(null)}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    backgroundColor: '#4a90e2',
                                    border: 'none',
                                    boxShadow: '0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)',
                                    transition: 'all 0.2s ease',
                                    fontWeight: '500',
                                    display: 'inline-flex',
                                    alignItems: 'center'
                                }}
                            >
                                <FaFilter style={{ marginRight: '8px' }} /> Clear Group Filter
                            </button>
                        </div>
                    ) : (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '60px 20px',
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.03)',
                            border: '1px solid rgba(0,0,0,0.05)',
                            textAlign: 'center',
                            animation: 'slideInUp 0.5s ease-in-out 0.2s both',
                            marginBottom: '25px'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '70px',
                                height: '70px',
                                borderRadius: '50%',
                                backgroundColor: '#f8f9fa',
                                marginBottom: '20px',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.03)',
                                border: '1px solid rgba(0,0,0,0.05)'
                            }}>
                                <FaSearch style={{
                                    fontSize: '28px',
                                    color: '#6c757d'
                                }} />
                            </div>
                            <h4 style={{
                                fontSize: '1.4rem',
                                fontWeight: '600',
                                marginBottom: '15px',
                                color: '#2c3e50'
                            }}>No Transaction Data</h4>
                            <p style={{
                                fontSize: '1rem',
                                color: '#6c757d',
                                marginBottom: '10px',
                                maxWidth: '500px'
                            }}>
                                No transaction details found for the selected {startDate && endDate ? 'date range' : 'date'}
                                {userId ? ' and user' : ''}
                                {selectedGroup ? ' and group' : ''}.
                            </p>
                            <p style={{
                                fontSize: '0.9rem',
                                color: '#adb5bd',
                                marginBottom: '0',
                                maxWidth: '500px'
                            }}>
                                Try selecting a different date or clearing your filters.
                            </p>
                        </div>
                    )}
                </>
            ) : (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '80px 20px',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.03)',
                    border: '1px solid rgba(0,0,0,0.05)',
                    textAlign: 'center',
                    animation: 'slideInUp 0.5s ease-in-out 0.1s both',
                    marginBottom: '25px'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #4a90e2, #5e72e4)',
                        marginBottom: '25px',
                        boxShadow: '0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)'
                    }}>
                        <FaCalendarAlt style={{
                            fontSize: '32px',
                            color: 'white'
                        }} />
                    </div>
                    <h4 style={{
                        fontSize: '1.5rem',
                        fontWeight: '600',
                        marginBottom: '15px',
                        color: '#2c3e50'
                    }}>Select Date</h4>
                    <p style={{
                        fontSize: '1rem',
                        color: '#6c757d',
                        marginBottom: '0',
                        maxWidth: '500px'
                    }}>
                        Please select either a single date or a date range (start date and end date) to view the daily report.
                    </p>
                </div>
            )}
            </div>
        </Container>
    );
};

export default DailyReport;
