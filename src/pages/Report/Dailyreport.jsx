import React, { useState, useEffect } from 'react';
import { Table, Container, Spinner, Form, Row, Col, Pagination, OverlayTrigger, Tooltip, Breadcrumb } from 'react-bootstrap';
import Select from 'react-select';
import API from "../../CustomHooks/MasterApiHooks/api";
import DailyReportExport from './DailyReportExport';

import {
    FaUser, FaCalendarAlt, FaUsers, FaUserTie, FaBoxes,
    FaObjectGroup, FaFilter, FaSearch, FaTable,
    FaSortAmountDown, FaSortAmountUp, FaListOl, FaClock,
    FaChartBar, FaCogs, FaChartPie, FaIndustry, FaHashtag
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

    // Add CSS for striped columns
    React.useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            .striped-columns-table th:nth-child(odd),
            .striped-columns-table td:nth-child(odd) {
                background-color: rgba(248, 249, 250, 0.5) !important;
                border-right: 1px solid #dee2e6;
            }

            .striped-columns-table th:nth-child(even),
            .striped-columns-table td:nth-child(even) {
                background-color: rgba(255, 255, 255, 0.8) !important;
                border-right: 1px solid #dee2e6;
            }

            .striped-columns-table th:last-child,
            .striped-columns-table td:last-child {
                border-right: none;
            }

            .striped-columns-table tbody tr:hover th,
            .striped-columns-table tbody tr:hover td {
                background-color: rgba(0, 123, 255, 0.1) !important;
            }

            .striped-columns-table thead th {
                background-color: #f8f9fa !important;
                border-right: 1px solid #dee2e6;
                border-bottom: 2px solid #dee2e6;
            }

            .striped-columns-table thead th:last-child {
                border-right: none;
            }
        `;
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style);
        };
    }, []);

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

    // Add state for DailySummary data
    const [summaryData, setSummaryData] = useState({
        supervisors: [],
        totalCatches: 0,
        totalQuantity: 0,
        distinctLotNos: [],
        completedQuantityByProcess: [],
        groupWiseCounts: [],
        numberOfGroups: 0,
        projectWiseCounts: [],
        numberOfProjects: 0
    });

    // Add state for DailyProductionReport data
    const [productionReportData, setProductionReportData] = useState([]);

    // Add state for DailyProductionSummaryReport data
    const [productionSummaryData, setProductionSummaryData] = useState({
        totalGroups: 0,
        totalLots: 0,
        totalCountOfCatches: 0,
        totalProjects: 0,
        totalQuantity: 0
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
    const [sortField, setSortField] = useState('groupName');
    const [sortDirection, setSortDirection] = useState('asc');
    const [userMap, setUserMap] = useState({});
    const [zoneMap, setZoneMap] = useState({});
    const [zones, setZones] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10; // Fixed page size
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState('');
    const [projects, setProjects] = useState([]);
    const [types, setTypes] = useState([]);

    const [projectName, setProjectName] = useState('');

    // Add state for tooltip visibility
    const [showTooltip, setShowTooltip] = useState({
        groups: false,
        projects: false,
        supervisors: false,
        lots: false
    });

    // Add state for active tab
    const [activeTab, setActiveTab] = useState('summary');

    // Add state to control when to show report data
    const [showReport, setShowReport] = useState(false);

    // Add state for transaction table pagination
    const [transactionCurrentPage, setTransactionCurrentPage] = useState(1);
    const transactionPageSize = 10; // Items per page for transaction table

    // Add state for Quick Task data
    const [quickTaskData, setQuickTaskData] = useState([]);
    const [quickTaskActiveTab, setQuickTaskActiveTab] = useState('summary');
    const [quickTaskCurrentPage, setQuickTaskCurrentPage] = useState(1);
    const quickTaskPageSize = 10; // Items per page for quick task table

    // Add state for Quick Task name filter
    const [quickTaskNameFilter, setQuickTaskNameFilter] = useState('');

    // Filter Quick Task data based on name filter
    const filteredQuickTaskData = quickTaskData.filter(task => {
        if (!quickTaskNameFilter.trim()) return true;

        const userName = userMap[task.triggeredBy_A] || `User ${task.triggeredBy_A}`;
        return userName.toLowerCase().includes(quickTaskNameFilter.toLowerCase());
    });

    // Handle Quick Task name filter change
    const handleQuickTaskNameFilterChange = (e) => {
        setQuickTaskNameFilter(e.target.value);
        setQuickTaskCurrentPage(1); // Reset to first page when filtering
    };

    // Handle Quick Task name filter clear
    const handleQuickTaskNameFilterClear = () => {
        setQuickTaskNameFilter('');
        setQuickTaskCurrentPage(1);
    };

    // Add tooltip handlers
    const handleTooltipToggle = (tooltipName) => {
        setShowTooltip(prev => ({
            ...prev,
            [tooltipName]: !prev[tooltipName]
        }));
    };

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

        // Reset summary and production data
        setSummaryData({
            supervisors: [],
            totalCatches: 0,
            totalQuantity: 0,
            distinctLotNos: [],
            completedQuantityByProcess: [],
            groupWiseCounts: [],
            numberOfGroups: 0,
            projectWiseCounts: [],
            numberOfProjects: 0
        });
        setProductionReportData([]);
        setProductionSummaryData({
            totalGroups: 0,
            totalLots: 0,
            totalCountOfCatches: 0,
            totalProjects: 0,
            totalQuantity: 0
        });

        // Reset Quick Task data
        setQuickTaskData([]);
        setQuickTaskCurrentPage(1);

        // Hide report until View Report button is clicked
        setShowReport(false);

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
        setTransactionCurrentPage(1); // Reset transaction pagination
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

        // Reset summary and production data
        setSummaryData({
            supervisors: [],
            totalCatches: 0,
            totalQuantity: 0,
            distinctLotNos: [],
            completedQuantityByProcess: [],
            groupWiseCounts: [],
            numberOfGroups: 0,
            projectWiseCounts: [],
            numberOfProjects: 0
        });
        setProductionReportData([]);
        setProductionSummaryData({
            totalGroups: 0,
            totalLots: 0,
            totalCountOfCatches: 0,
            totalProjects: 0,
            totalQuantity: 0
        });

        // Reset Quick Task data
        setQuickTaskData([]);
        setQuickTaskCurrentPage(1);

        // Hide report until View Report button is clicked
        setShowReport(false);

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
        setTransactionCurrentPage(1); // Reset transaction pagination
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

    // Handle transaction table page change
    const handleTransactionPageChange = (pageNumber) => {
        setTransactionCurrentPage(pageNumber);
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
        setTransactionCurrentPage(1); // Reset transaction pagination

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

    // Handle View Report button click
    const handleViewReport = async () => {
        if (!startDate) {
            alert('Please select a start date');
            return;
        }

        try {
            setLoading(true);
            setShowReport(false); // Hide any previous report data

            // Fetch all report data
            await fetchDailyReport();
            await fetchDailySummary();
            await fetchDailyProductionReport();
            await fetchDailyProductionSummaryReport();
            await fetchQuickTaskData();

            // Show the report after data is loaded
            setShowReport(true);
        } catch (error) {
            console.error("Error fetching report data:", error);
            alert('Error loading report data. Please try again.');
            setShowReport(false); // Ensure report is hidden on error
        } finally {
            setLoading(false);
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

    const fetchProjects = async (projectIds = []) => {
        try {
            if (projectIds.length === 0) {
                setProjects([]);
                return;
            }

            console.log('Fetching projects for IDs:', projectIds);
            const projectPromises = projectIds.map(async (projectId) => {
                try {
                    const response = await API.get(`/Project/${projectId}`);
                    return {
                        id: response.data.projectId,
                        name: response.data.name,
                        typeId: response.data.typeId,
                        status: response.data.status,
                        groupId: response.data.groupId,
                        description: response.data.description,
                        noOfSeries: response.data.noOfSeries,
                        seriesName: response.data.seriesName
                    };
                } catch (error) {
                    console.error(`Error fetching project ${projectId}:`, error);
                    return {
                        id: projectId,
                        name: `Project ${projectId}`,
                        typeId: null,
                        status: false,
                        groupId: null,
                        description: '',
                        noOfSeries: 0,
                        seriesName: null
                    };
                }
            });

            const projectsData = await Promise.all(projectPromises);
            console.log('Projects API Response:', projectsData);
            setProjects(projectsData);
        } catch (error) {
            console.error("Error fetching projects:", error);
            setProjects([]);
        }
    };

    const fetchTypes = async (typeIds = []) => {
        try {
            if (typeIds.length === 0) {
                setTypes([]);
                return;
            }

            console.log('Fetching types for IDs:', typeIds);
            const typePromises = typeIds.map(async (typeId) => {
                try {
                    const response = await API.get(`/PaperTypes/${typeId}`);
                    return {
                        id: response.data.typeId,
                        name: response.data.types
                    };
                } catch (error) {
                    console.error(`Error fetching type ${typeId}:`, error);
                    return {
                        id: typeId,
                        name: `Type ${typeId}`
                    };
                }
            });

            const typesData = await Promise.all(typePromises);
            console.log('Types API Response:', typesData);
            setTypes(typesData);
        } catch (error) {
            console.error("Error fetching types:", error);
            setTypes([]);
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

    // Function to fetch DailySummary data
    const fetchDailySummary = async () => {
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

            // Prepare API parameters
            const params = {};

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

            const response = await API.get(`/Reports/DailySummary`, { params });
            console.log('DailySummary API Response:', response.data);

            setSummaryData(response.data);
        } catch (error) {
            console.error("Error fetching daily summary:", error);
        }
    };

    // Function to fetch DailyProductionReport data
    const fetchDailyProductionReport = async () => {
        try {
            console.log('Fetching DailyProductionReport with startDate:', startDate, 'endDate:', endDate);

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
            const params = {};

            // Use date range if both start and end dates are provided
            if (startDate && endDate) {
                params.startDate = formatDateForApi(startDate);
                params.endDate = formatDateForApi(endDate);
                console.log('Using date range:', params.startDate, 'to', params.endDate);
            } else if (startDate) {
                // Use start date as a single date if end date is not provided
                params.date = formatDateForApi(startDate);
                console.log('Using single date:', params.date);
            }

            console.log('API params for DailyProductionReport:', params);
            const response = await API.get(`/Reports/DailyProductionReport`, { params });
            console.log('DailyProductionReport API Response:', response);
            console.log('DailyProductionReport API Response data:', response.data);
            console.log('DailyProductionReport API Response length:', response.data?.length);

            if (Array.isArray(response.data)) {
                setProductionReportData(response.data);
                console.log('Set productionReportData with', response.data.length, 'items');
            } else {
                console.log('Response data is not an array:', typeof response.data);
                setProductionReportData([]);
            }

        } catch (error) {
            console.error("Error fetching daily production report:", error);
            setProductionReportData([]);
        }
    };

    // Function to fetch DailyProductionSummaryReport data
    const fetchDailyProductionSummaryReport = async () => {
        try {
            console.log('Fetching DailyProductionSummaryReport with startDate:', startDate, 'endDate:', endDate);

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
            const params = {};

            // Use date range if both start and end dates are provided
            if (startDate && endDate) {
                params.startDate = formatDateForApi(startDate);
                params.endDate = formatDateForApi(endDate);
                console.log('Using date range for summary:', params.startDate, 'to', params.endDate);
            } else if (startDate) {
                // Use start date as a single date if end date is not provided
                params.date = formatDateForApi(startDate);
                console.log('Using single date for summary:', params.date);
            }

            console.log('API params for DailyProductionSummaryReport:', params);
            const response = await API.get(`/Reports/DailyProductionSummaryReport`, { params });
            console.log('DailyProductionSummaryReport API Response:', response);
            console.log('DailyProductionSummaryReport API Response data:', response.data);

            if (response.data) {
                setProductionSummaryData({
                    totalGroups: response.data.totalGroups || 0,
                    totalLots: response.data.totalLots || 0,
                    totalCountOfCatches: response.data.totalCountOfCatches || 0,
                    totalProjects: response.data.totalProjects || 0,
                    totalQuantity: response.data.totalQuantity || 0
                });
                console.log('Set productionSummaryData:', response.data);
            } else {
                console.log('No data received from DailyProductionSummaryReport');
                setProductionSummaryData({
                    totalGroups: 0,
                    totalLots: 0,
                    totalCountOfCatches: 0,
                    totalProjects: 0,
                    totalQuantity: 0
                });
            }

        } catch (error) {
            console.error("Error fetching daily production summary report:", error);
            setProductionSummaryData({
                totalGroups: 0,
                totalLots: 0,
                totalCountOfCatches: 0,
                totalProjects: 0,
                totalQuantity: 0
            });
        }
    };

    // Function to fetch Quick Task data
    const fetchQuickTaskData = async () => {
        try {
            console.log('Fetching QuickCompletion data with startDate:', startDate);

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
            const params = {};

            // Use start date for quick completion data
            if (startDate) {
                params.date = formatDateForApi(startDate);
                console.log('Using date for quick completion:', params.date);
            }

            console.log('API params for QuickCompletion:', params);
            const response = await API.get(`/Reports/quickCompletion`, { params });
            console.log('QuickCompletion API Response:', response);
            console.log('QuickCompletion API Response data:', response.data);

            if (Array.isArray(response.data)) {
                setQuickTaskData(response.data);
                console.log('Set quickTaskData with', response.data.length, 'items');
            } else {
                console.log('Response data is not an array:', typeof response.data);
                setQuickTaskData([]);
            }

        } catch (error) {
            console.error("Error fetching quick task data:", error);
            setQuickTaskData([]);
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

    // Fetch projects and types when production report data changes
    useEffect(() => {
        if (productionReportData.length > 0) {
            // Extract unique project IDs from production report data
            const uniqueProjectIds = [...new Set(productionReportData.map(item => item.projectId).filter(id => id))];

            // Extract unique type IDs from production report data
            const uniqueTypeIds = [...new Set(productionReportData.map(item => item.typeId).filter(id => id))];

            console.log('Fetching projects for unique IDs:', uniqueProjectIds);
            console.log('Fetching types for unique IDs:', uniqueTypeIds);

            // Fetch projects and types data
            if (uniqueProjectIds.length > 0) {
                fetchProjects(uniqueProjectIds);
            }

            if (uniqueTypeIds.length > 0) {
                fetchTypes(uniqueTypeIds);
            }
        } else {
            // Clear projects and types when no production data
            setProjects([]);
            setTypes([]);
        }
    }, [productionReportData]);

    // Don't initialize with any date - let user select manually



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

    // Get project name by ID
    const getProjectName = (projectId) => {
        if (!projectId) return 'N/A';
        const project = projects.find(p => p.id === projectId);
        return project ? project.name : `Project ${projectId}`;
    };

    // Get type name by ID
    const getTypeName = (typeId) => {
        if (!typeId) return 'N/A';
        const type = types.find(t => t.id === typeId);
        return type ? type.name : `Type ${typeId}`;
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



    // Use production report data for transaction details
    const filteredTransactions = [...productionReportData];
    console.log('filteredTransactions:', filteredTransactions);
    console.log('productionReportData length:', productionReportData.length);

    // Sort transactions
    const sortedTransactions = filteredTransactions.sort((a, b) => {
        let comparison = 0;

        if (sortField === 'groupName') {
            comparison = a.groupName.localeCompare(b.groupName);
        } else if (sortField === 'projectId') {
            const projectNameA = getProjectName(a.projectId);
            const projectNameB = getProjectName(b.projectId);
            comparison = projectNameA.localeCompare(projectNameB);
        } else if (sortField === 'typeId') {
            const typeNameA = getTypeName(a.typeId);
            const typeNameB = getTypeName(b.typeId);
            comparison = typeNameA.localeCompare(typeNameB);
        } else if (sortField === 'lotNo') {
            comparison = (a.lotNo || 0) - (b.lotNo || 0);
        } else if (sortField === 'countOfCatches') {
            comparison = (a.countOfCatches || 0) - (b.countOfCatches || 0);
        } else if (sortField === 'totalQuantity') {
            comparison = (a.totalQuantity || 0) - (b.totalQuantity || 0);
        }

        return sortDirection === 'asc' ? comparison : -comparison;
    });

    // Calculate pagination for transaction table
    const totalTransactionRecords = sortedTransactions.length;
    const totalTransactionPages = Math.ceil(totalTransactionRecords / transactionPageSize);
    const transactionStartIndex = (transactionCurrentPage - 1) * transactionPageSize;
    const transactionEndIndex = transactionStartIndex + transactionPageSize;
    const paginatedTransactions = sortedTransactions.slice(transactionStartIndex, transactionEndIndex);




    // Define CSS animations and custom styles
    const keyframes = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
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
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
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
        <Container  style={styles.pageContainer}>
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
                <div>

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
                                    Start Date
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






                        {/* View Report Button */}
                        {startDate && (
                            <Col xs={12} sm={6} md={4} lg={2}>
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
                                        <FaChartBar style={{
                                            marginRight: '8px',
                                            color: '#28a745'
                                        }} />
                                        Generate Report
                                    </div>
                                    <button
                                        onClick={handleViewReport}
                                        disabled={loading}
                                        className="btn"
                                        style={{
                                            backgroundColor: loading ? '#6c757d' : '#28a745',
                                            color: 'white',
                                            border: '1px solid ' + (loading ? '#6c757d' : '#28a745'),
                                            borderRadius: '8px',
                                            fontSize: '0.9rem',
                                            fontWeight: '600',
                                            cursor: loading ? 'not-allowed' : 'pointer',
                                            transition: 'all 0.2s ease',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            width: '100%',
                                            height: '42px',
                                            padding: '10px 12px',
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!loading) {
                                                e.target.style.backgroundColor = '#218838';
                                                e.target.style.borderColor = '#218838';
                                                e.target.style.boxShadow = '0 4px 8px rgba(40, 167, 69, 0.25)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!loading) {
                                                e.target.style.backgroundColor = '#28a745';
                                                e.target.style.borderColor = '#28a745';
                                                e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.03)';
                                            }
                                        }}
                                        onFocus={(e) => {
                                            if (!loading) {
                                                e.target.style.outline = 'none';
                                                e.target.style.boxShadow = '0 0 0 3px rgba(40, 167, 69, 0.25)';
                                            }
                                        }}
                                        onBlur={(e) => {
                                            if (!loading) {
                                                e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.03)';
                                            }
                                        }}
                                    >
                                        {loading ? (
                                            <>
                                                <div style={{
                                                    width: '16px',
                                                    height: '16px',
                                                    border: '2px solid transparent',
                                                    borderTop: '2px solid white',
                                                    borderRadius: '50%',
                                                    animation: 'spin 1s linear infinite'
                                                }}></div>
                                                Loading...
                                            </>
                                        ) : (
                                            <>

                                                View
                                            </>
                                        )}
                                    </button>
                                </div>
                            </Col>
                        )}

                    </Row>
                </div>

            {loading ? (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '60px 20px',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.06)',
                    border: '1px solid rgba(0,0,0,0.05)',
                    textAlign: 'center',
                    animation: 'slideInUp 0.5s ease-in-out',
                    marginBottom: '25px',
                    minHeight: '300px',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Background animation */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(45deg, rgba(74, 144, 226, 0.02) 0%, rgba(94, 114, 228, 0.02) 100%)',
                        animation: 'pulse 2s ease-in-out infinite'
                    }}></div>

                    <div style={{
                        width: '80px',
                        height: '80px',
                        position: 'relative',
                        marginBottom: '25px',
                        zIndex: 1
                    }}>
                        <Spinner
                            animation="border"
                            variant="primary"
                            style={{
                                width: '80px',
                                height: '80px',
                                color: '#4a90e2',
                                borderWidth: '5px'
                            }}
                        />
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            fontSize: '2rem',
                            color: '#4a90e2',
                            opacity: 0.6,
                            animation: 'pulse 1.5s ease-in-out infinite'
                        }}>
                            <FaChartBar />
                        </div>
                    </div>

                    <h4 style={{
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        marginBottom: '12px',
                        color: '#2c3e50',
                        zIndex: 1,
                        position: 'relative'
                    }}>Generating Daily Report</h4>

                    <p style={{
                        color: '#6c757d',
                        fontSize: '1rem',
                        maxWidth: '450px',
                        margin: '0 auto 20px',
                        lineHeight: '1.5',
                        zIndex: 1,
                        position: 'relative'
                    }}>
                        Fetching transaction details, summary data, and production reports...
                    </p>

                    {/* Loading steps indicator */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '15px',
                        marginTop: '20px',
                        zIndex: 1,
                        position: 'relative'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            backgroundColor: 'rgba(74, 144, 226, 0.1)',
                            color: '#4a90e2',
                            fontSize: '0.85rem',
                            fontWeight: '500',
                            animation: 'fadeIn 0.5s ease-in-out'
                        }}>
                            <div style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: '#4a90e2',
                                marginRight: '8px',
                                animation: 'pulse 1s ease-in-out infinite'
                            }}></div>
                            Loading Data
                        </div>
                    </div>
                </div>
            ) : (showReport && startDate) ? (
                <>
                    {/* Tab Navigation */}
                    <div style={{
                        marginBottom: '25px',
                        animation: 'slideInUp 0.5s ease-in-out 0.2s both'
                    }}>
                        <div style={{
                            display: 'flex',
                            borderBottom: '2px solid #e9ecef',
                            marginBottom: '20px'
                        }}>
                            <button
                                onClick={() => setActiveTab('summary')}
                                style={{
                                    padding: '12px 24px',
                                    border: 'none',
                                    backgroundColor: 'transparent',
                                    color: activeTab === 'summary' ? '#4a90e2' : '#6c757d',
                                    fontWeight: activeTab === 'summary' ? '600' : '500',
                                    fontSize: '1rem',
                                    cursor: 'pointer',
                                    borderBottom: activeTab === 'summary' ? '3px solid #4a90e2' : '3px solid transparent',
                                    transition: 'all 0.3s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                                onMouseEnter={(e) => {
                                    if (activeTab !== 'summary') {
                                        e.target.style.color = '#4a90e2';
                                        e.target.style.borderBottomColor = '#e3f2fd';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (activeTab !== 'summary') {
                                        e.target.style.color = '#6c757d';
                                        e.target.style.borderBottomColor = 'transparent';
                                    }
                                }}
                            >
                                <FaChartBar />
                                Summary Overview
                            </button>
                            <button
                                onClick={() => setActiveTab('details')}
                                style={{
                                    padding: '12px 24px',
                                    border: 'none',
                                    backgroundColor: 'transparent',
                                    color: activeTab === 'details' ? '#4a90e2' : '#6c757d',
                                    fontWeight: activeTab === 'details' ? '600' : '500',
                                    fontSize: '1rem',
                                    cursor: 'pointer',
                                    borderBottom: activeTab === 'details' ? '3px solid #4a90e2' : '3px solid transparent',
                                    transition: 'all 0.3s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                                onMouseEnter={(e) => {
                                    if (activeTab !== 'details') {
                                        e.target.style.color = '#4a90e2';
                                        e.target.style.borderBottomColor = '#e3f2fd';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (activeTab !== 'details') {
                                        e.target.style.color = '#6c757d';
                                        e.target.style.borderBottomColor = 'transparent';
                                    }
                                }}
                            >
                                <FaTable />
                                Transaction Details
                            </button>
                            <button
                                onClick={() => setActiveTab('quicktask')}
                                style={{
                                    padding: '12px 24px',
                                    border: 'none',
                                    backgroundColor: 'transparent',
                                    color: activeTab === 'quicktask' ? '#4a90e2' : '#6c757d',
                                    fontWeight: activeTab === 'quicktask' ? '600' : '500',
                                    fontSize: '1rem',
                                    cursor: 'pointer',
                                    borderBottom: activeTab === 'quicktask' ? '3px solid #4a90e2' : '3px solid transparent',
                                    transition: 'all 0.3s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                                onMouseEnter={(e) => {
                                    if (activeTab !== 'quicktask') {
                                        e.target.style.color = '#4a90e2';
                                        e.target.style.borderBottomColor = '#e3f2fd';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (activeTab !== 'quicktask') {
                                        e.target.style.color = '#6c757d';
                                        e.target.style.borderBottomColor = 'transparent';
                                    }
                                }}
                            >
                                <FaClock />
                                Quick Task
                            </button>
                        </div>

                        {/* Tab Content */}
                        {activeTab === 'summary' && (
                            <div style={{
                                animation: 'fadeIn 0.3s ease-in-out'
                            }}>
                                <h5 style={{
                                    fontSize: '1.1rem',
                                    fontWeight: '600',
                                    marginBottom: '15px',
                                    color: '#2c3e50',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}>


                                </h5>
                        {/* Summary Overview Table */}
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                            border: '1px solid rgba(0,0,0,0.08)',
                            marginBottom: '20px',
                            maxWidth: '500px'
                        }}>
                            <Table striped hover style={{
                                margin: 0,
                                width: '100%',
                                borderCollapse: 'separate',
                                borderSpacing: 0,
                                tableLayout: 'fixed',
                                fontSize: '0.85rem'
                            }}
                            className="striped-columns-table">
                                <thead>
                                    <tr style={{
                                        backgroundColor: '#f8f9fa',
                                        borderBottom: '1px solid #e9ecef'
                                    }}>
                                        <th style={{
                                            padding: '10px 15px',
                                            fontSize: '0.8rem',
                                            fontWeight: '600',
                                            color: '#2c3e50',
                                            textAlign: 'left',
                                            borderTop: 'none',
                                            width: '60%',
                                            verticalAlign: 'middle'
                                        }}>
                                            <span style={{
                                                display: 'flex',
                                                alignItems: 'center'
                                            }}>
                                                <FaChartBar style={{
                                                    marginRight: '6px',
                                                    color: '#4a90e2',
                                                    fontSize: '12px'
                                                }} />
                                                Metric
                                            </span>
                                        </th>
                                        <th style={{
                                            padding: '10px 15px',
                                            fontSize: '0.8rem',
                                            fontWeight: '600',
                                            color: '#2c3e50',
                                            textAlign: 'center',
                                            borderTop: 'none',
                                            width: '40%',
                                            verticalAlign: 'middle'
                                        }}>
                                            <span style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <FaHashtag style={{
                                                    marginRight: '4px',
                                                    color: '#28a745',
                                                    fontSize: '10px'
                                                }} />
                                                Count
                                            </span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Groups Row */}
                                    <tr style={{
                                        backgroundColor: 'white',
                                        transition: 'background-color 0.2s ease'
                                    }} onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                                    }} onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'white';
                                    }}>
                                        <td style={{
                                            padding: '8px 15px',
                                            fontSize: '0.8rem',
                                            color: '#495057',
                                            textAlign: 'left',
                                            borderTop: '1px solid #e9ecef',
                                            verticalAlign: 'middle'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center'
                                            }}>
                                                <div style={{
                                                    width: '24px',
                                                    height: '24px',
                                                    borderRadius: '4px',
                                                    backgroundColor: '#4a90e2',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    marginRight: '8px',
                                                    boxShadow: '0 1px 2px rgba(74, 144, 226, 0.25)'
                                                }}>
                                                    <FaUsers size={10} color="white" />
                                                </div>
                                                <span style={{
                                                    fontWeight: '500',
                                                    fontSize: '0.8rem',
                                                    color: '#2c3e50'
                                                }}>Groups</span>
                                            </div>
                                        </td>
                                        <td style={{
                                            padding: '8px 15px',
                                            fontSize: '0.9rem',
                                            fontWeight: '600',
                                            color: '#2c3e50',
                                            textAlign: 'center',
                                            borderTop: '1px solid #e9ecef',
                                            verticalAlign: 'middle'
                                        }}>
                                            <span style={{
                                                display: 'inline-block',
                                                padding: '3px 8px',
                                                backgroundColor: '#e3f2fd',
                                                color: '#4a90e2',
                                                borderRadius: '4px',
                                                fontWeight: '600',
                                                minWidth: '30px',
                                                fontSize: '0.85rem'
                                            }}>
                                                {productionSummaryData.totalGroups || 0}
                                            </span>
                                        </td>
                                    </tr>

                                    {/* Projects Row */}
                                    <tr style={{
                                        backgroundColor: '#f8f9fa',
                                        transition: 'background-color 0.2s ease'
                                    }} onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#e9ecef';
                                    }} onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                                    }}>
                                        <td style={{
                                            padding: '8px 15px',
                                            fontSize: '0.8rem',
                                            color: '#495057',
                                            textAlign: 'left',
                                            borderTop: '1px solid #e9ecef',
                                            verticalAlign: 'middle'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center'
                                            }}>
                                                <div style={{
                                                    width: '24px',
                                                    height: '24px',
                                                    borderRadius: '4px',
                                                    backgroundColor: '#2dce89',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    marginRight: '8px',
                                                    boxShadow: '0 1px 2px rgba(45, 206, 137, 0.25)'
                                                }}>
                                                    <FaObjectGroup size={10} color="white" />
                                                </div>
                                                <span style={{
                                                    fontWeight: '500',
                                                    fontSize: '0.8rem',
                                                    color: '#2c3e50'
                                                }}>Projects</span>
                                            </div>
                                        </td>
                                        <td style={{
                                            padding: '8px 15px',
                                            fontSize: '0.9rem',
                                            fontWeight: '600',
                                            color: '#2c3e50',
                                            textAlign: 'center',
                                            borderTop: '1px solid #e9ecef',
                                            verticalAlign: 'middle'
                                        }}>
                                            <span style={{
                                                display: 'inline-block',
                                                padding: '3px 8px',
                                                backgroundColor: '#e8f5e8',
                                                color: '#2dce89',
                                                borderRadius: '4px',
                                                fontWeight: '600',
                                                minWidth: '30px',
                                                fontSize: '0.85rem'
                                            }}>
                                                {productionSummaryData.totalProjects || 0}
                                            </span>
                                        </td>
                                    </tr>
                                    {/* Total Lots Row */}
                                    <tr style={{
                                        backgroundColor: 'white',
                                        transition: 'background-color 0.2s ease'
                                    }} onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                                    }} onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'white';
                                    }}>
                                        <td style={{
                                            padding: '8px 15px',
                                            fontSize: '0.8rem',
                                            color: '#495057',
                                            textAlign: 'left',
                                            borderTop: '1px solid #e9ecef',
                                            verticalAlign: 'middle'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center'
                                            }}>
                                                <div style={{
                                                    width: '24px',
                                                    height: '24px',
                                                    borderRadius: '4px',
                                                    backgroundColor: '#8e44ad',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    marginRight: '8px',
                                                    boxShadow: '0 1px 2px rgba(142, 68, 173, 0.25)'
                                                }}>
                                                    <FaListOl size={10} color="white" />
                                                </div>
                                                <span style={{
                                                    fontWeight: '500',
                                                    fontSize: '0.8rem',
                                                    color: '#2c3e50'
                                                }}>Total Lots</span>
                                            </div>
                                        </td>
                                        <td style={{
                                            padding: '8px 15px',
                                            fontSize: '0.9rem',
                                            fontWeight: '600',
                                            color: '#2c3e50',
                                            textAlign: 'center',
                                            borderTop: '1px solid #e9ecef',
                                            verticalAlign: 'middle'
                                        }}>
                                            <span style={{
                                                display: 'inline-block',
                                                padding: '3px 8px',
                                                backgroundColor: '#f3e5f5',
                                                color: '#8e44ad',
                                                borderRadius: '4px',
                                                fontWeight: '600',
                                                minWidth: '30px',
                                                fontSize: '0.85rem'
                                            }}>
                                                {productionSummaryData.totalLots || 0}
                                            </span>
                                        </td>
                                    </tr>

                                    {/* Total Catches Row */}
                                    <tr style={{
                                        backgroundColor: '#f8f9fa',
                                        transition: 'background-color 0.2s ease'
                                    }} onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#e9ecef';
                                    }} onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                                    }}>
                                        <td style={{
                                            padding: '8px 15px',
                                            fontSize: '0.8rem',
                                            color: '#495057',
                                            textAlign: 'left',
                                            borderTop: '1px solid #e9ecef',
                                            verticalAlign: 'middle'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center'
                                            }}>
                                                <div style={{
                                                    width: '24px',
                                                    height: '24px',
                                                    borderRadius: '4px',
                                                    backgroundColor: '#11cdef',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    marginRight: '8px',
                                                    boxShadow: '0 1px 2px rgba(17, 205, 239, 0.25)'
                                                }}>
                                                    <FaBoxes size={10} color="white" />
                                                </div>
                                                <span style={{
                                                    fontWeight: '500',
                                                    fontSize: '0.8rem',
                                                    color: '#2c3e50'
                                                }}>Total Catches</span>
                                            </div>
                                        </td>
                                        <td style={{
                                            padding: '8px 15px',
                                            fontSize: '0.9rem',
                                            fontWeight: '600',
                                            color: '#2c3e50',
                                            textAlign: 'center',
                                            borderTop: '1px solid #e9ecef',
                                            verticalAlign: 'middle'
                                        }}>
                                            <span style={{
                                                display: 'inline-block',
                                                padding: '3px 8px',
                                                backgroundColor: '#e0f7fa',
                                                color: '#11cdef',
                                                borderRadius: '4px',
                                                fontWeight: '600',
                                                minWidth: '30px',
                                                fontSize: '0.85rem'
                                            }}>
                                                {productionSummaryData.totalCountOfCatches?.toLocaleString() || 0}
                                            </span>
                                        </td>
                                    </tr>

                                    {/* Total Quantity Row */}
                                    <tr style={{
                                        backgroundColor: 'white',
                                        transition: 'background-color 0.2s ease'
                                    }} onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                                    }} onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'white';
                                    }}>
                                        <td style={{
                                            padding: '8px 15px',
                                            fontSize: '0.8rem',
                                            color: '#495057',
                                            textAlign: 'left',
                                            borderTop: '1px solid #e9ecef',
                                            verticalAlign: 'middle'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center'
                                            }}>
                                                <div style={{
                                                    width: '24px',
                                                    height: '24px',
                                                    borderRadius: '4px',
                                                    backgroundColor: '#28a745',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    marginRight: '8px',
                                                    boxShadow: '0 1px 2px rgba(40, 167, 69, 0.25)'
                                                }}>
                                                    <FaChartPie size={10} color="white" />
                                                </div>
                                                <span style={{
                                                    fontWeight: '500',
                                                    fontSize: '0.8rem',
                                                    color: '#2c3e50'
                                                }}>Total Quantity</span>
                                            </div>
                                        </td>
                                        <td style={{
                                            padding: '8px 15px',
                                            fontSize: '0.9rem',
                                            fontWeight: '600',
                                            color: '#2c3e50',
                                            textAlign: 'center',
                                            borderTop: '1px solid #e9ecef',
                                            verticalAlign: 'middle'
                                        }}>
                                            <span style={{
                                                display: 'inline-block',
                                                padding: '3px 8px',
                                                backgroundColor: '#d4edda',
                                                color: '#28a745',
                                                borderRadius: '4px',
                                                fontWeight: '600',
                                                minWidth: '30px',
                                                fontSize: '0.85rem'
                                            }}>
                                                {productionSummaryData.totalQuantity?.toLocaleString() || 0}
                                            </span>
                                        </td>
                                    </tr>


                                </tbody>
                            </Table>
                        </div>
                            </div>
                        )}

                        {/* Transaction Details Tab */}
                        {activeTab === 'details' && (
                            <div style={{
                                animation: 'fadeIn 0.3s ease-in-out'
                            }}>
                                {/* Transaction Details */}
                    {productionReportData && productionReportData.length > 0 ? (
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
                                        // New props for summary and transaction data
                                        productionSummaryData={productionSummaryData}
                                        productionReportData={productionReportData}
                                        projects={projects}
                                        types={types}
                                        // Quick Task data
                                        quickTaskData={quickTaskData}
                                        userMap={userMap}
                                    />


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
                                    <Table striped hover style={{
                                        margin: 0,
                                        width: '100%',
                                        borderCollapse: 'separate',
                                        borderSpacing: 0
                                    }}
                                    className="striped-columns-table">
                                        <thead>
                                            <tr style={{
                                                backgroundColor: '#f8f9fa',
                                                borderBottom: '2px solid #e9ecef'
                                            }}>
                                                <th style={{
                                                    padding: '8px 10px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '700',
                                                    color: '#2c3e50',
                                                    textAlign: 'center',
                                                    width: '80px',
                                                    borderTop: 'none',
                                                    verticalAlign: 'middle'
                                                }}>
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        flexDirection: 'column',
                                                        gap: '1px'
                                                    }}>
                                                        <FaHashtag style={{ fontSize: '12px', color: '#4a90e2' }} />
                                                        <span>S.N.</span>
                                                    </div>
                                                </th>

                                                <th style={{
                                                    padding: '8px 10px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '700',
                                                    color: '#2c3e50',
                                                    textAlign: 'center',
                                                    borderTop: 'none',
                                                    cursor: 'pointer',
                                                    verticalAlign: 'middle',
                                                    minWidth: '120px'
                                                }} onClick={() => handleSort('groupName')}>
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        flexDirection: 'column',
                                                        gap: '2px'
                                                    }}>
                                                        <FaUsers style={{ fontSize: '12px', color: '#4a90e2' }} />
                                                        <span>Group Name</span>
                                                        {sortField === 'groupName' && (
                                                            <span style={{ color: '#4a90e2', fontSize: '10px' }}>
                                                                {sortDirection === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
                                                            </span>
                                                        )}
                                                    </div>
                                                </th>

                                                <th style={{
                                                    padding: '8px 10px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '700',
                                                    color: '#2c3e50',
                                                    textAlign: 'center',
                                                    borderTop: 'none',
                                                    cursor: 'pointer',
                                                    verticalAlign: 'middle',
                                                    minWidth: '130px'
                                                }} onClick={() => handleSort('projectId')}>
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        flexDirection: 'column',
                                                        gap: '2px'
                                                    }}>
                                                        <FaIndustry style={{ fontSize: '12px', color: '#4a90e2' }} />
                                                        <span>Project Name</span>
                                                        {sortField === 'projectId' && (
                                                            <span style={{ color: '#4a90e2', fontSize: '10px' }}>
                                                                {sortDirection === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
                                                            </span>
                                                        )}
                                                    </div>
                                                </th>

                                                <th style={{
                                                    padding: '8px 10px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '700',
                                                    color: '#2c3e50',
                                                    textAlign: 'center',
                                                    borderTop: 'none',
                                                    cursor: 'pointer',
                                                    verticalAlign: 'middle',
                                                    minWidth: '110px'
                                                }} onClick={() => handleSort('typeId')}>
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        flexDirection: 'column',
                                                        gap: '2px'
                                                    }}>
                                                        <FaCogs style={{ fontSize: '12px', color: '#4a90e2' }} />
                                                        <span>Type Name</span>
                                                        {sortField === 'typeId' && (
                                                            <span style={{ color: '#4a90e2', fontSize: '10px' }}>
                                                                {sortDirection === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
                                                            </span>
                                                        )}
                                                    </div>
                                                </th>

                                                <th style={{
                                                    padding: '8px 10px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '700',
                                                    color: '#2c3e50',
                                                    textAlign: 'center',
                                                    borderTop: 'none',
                                                    cursor: 'pointer',
                                                    verticalAlign: 'middle',
                                                    minWidth: '100px'
                                                }} onClick={() => handleSort('lotNo')}>
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        flexDirection: 'column',
                                                        gap: '2px'
                                                    }}>
                                                        <FaListOl style={{ fontSize: '12px', color: '#4a90e2' }} />
                                                        <span>Lot No</span>
                                                        {sortField === 'lotNo' && (
                                                            <span style={{ color: '#4a90e2', fontSize: '10px' }}>
                                                                {sortDirection === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
                                                            </span>
                                                        )}
                                                    </div>
                                                </th>

                                                <th style={{
                                                    padding: '8px 10px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '700',
                                                    color: '#2c3e50',
                                                    textAlign: 'center',
                                                    borderTop: 'none',
                                                    verticalAlign: 'middle',
                                                    minWidth: '120px'
                                                }}>
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        flexDirection: 'column',
                                                        gap: '2px'
                                                    }}>
                                                        <FaCalendarAlt style={{ fontSize: '12px', color: '#4a90e2' }} />
                                                        <span>Date Range</span>
                                                    </div>
                                                </th>

                                                <th style={{
                                                    padding: '8px 10px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '700',
                                                    color: '#2c3e50',
                                                    textAlign: 'center',
                                                    borderTop: 'none',
                                                    cursor: 'pointer',
                                                    verticalAlign: 'middle',
                                                    minWidth: '130px'
                                                }} onClick={() => handleSort('countOfCatches')}>
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        flexDirection: 'column',
                                                        gap: '2px'
                                                    }}>
                                                        <FaBoxes style={{ fontSize: '12px', color: '#4a90e2' }} />
                                                        <span>Count of Catches</span>
                                                        {sortField === 'countOfCatches' && (
                                                            <span style={{ color: '#4a90e2', fontSize: '10px' }}>
                                                                {sortDirection === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
                                                            </span>
                                                        )}
                                                    </div>
                                                </th>

                                                <th style={{
                                                    padding: '8px 10px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '700',
                                                    color: '#2c3e50',
                                                    textAlign: 'center',
                                                    borderTop: 'none',
                                                    cursor: 'pointer',
                                                    verticalAlign: 'middle',
                                                    minWidth: '110px'
                                                }} onClick={() => handleSort('totalQuantity')}>
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        flexDirection: 'column',
                                                        gap: '2px'
                                                    }}>
                                                        <FaChartPie style={{ fontSize: '12px', color: '#4a90e2' }} />
                                                        <span>Total Quantity</span>
                                                        {sortField === 'totalQuantity' && (
                                                            <span style={{ color: '#4a90e2', fontSize: '10px' }}>
                                                                {sortDirection === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
                                                            </span>
                                                        )}
                                                    </div>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedTransactions.length === 0 ? (
                                                <tr>
                                                    <td colSpan="8" style={{
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
                                                            <span>No production data found for the selected filters.</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                paginatedTransactions.map((item, index) => (
                                                <tr key={index} style={{
                                                    backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa',
                                                    transition: 'background-color 0.2s ease'
                                                }}>
                                                    <td style={{
                                                        padding: '12px 10px',
                                                        fontSize: '0.9rem',
                                                        color: '#495057',
                                                        textAlign: 'center',
                                                        borderTop: '1px solid #e9ecef',
                                                        verticalAlign: 'middle'
                                                    }}>
                                                        {transactionStartIndex + index + 1}
                                                    </td>

                                                    <td style={{
                                                        padding: '12px 10px',
                                                        fontSize: '0.9rem',
                                                        color: '#495057',
                                                        textAlign: 'center',
                                                        borderTop: '1px solid #e9ecef',
                                                        verticalAlign: 'middle'
                                                    }}>
                                                        {item.groupName || 'N/A'}
                                                    </td>

                                                    <td style={{
                                                        padding: '12px 10px',
                                                        fontSize: '0.9rem',
                                                        color: '#495057',
                                                        textAlign: 'center',
                                                        borderTop: '1px solid #e9ecef',
                                                        verticalAlign: 'middle'
                                                    }}>
                                                        {getProjectName(item.projectId)}
                                                    </td>

                                                    <td style={{
                                                        padding: '12px 10px',
                                                        fontSize: '0.9rem',
                                                        color: '#495057',
                                                        textAlign: 'center',
                                                        borderTop: '1px solid #e9ecef',
                                                        verticalAlign: 'middle'
                                                    }}>
                                                        {getTypeName(item.typeId)}
                                                    </td>

                                                    <td style={{
                                                        padding: '12px 10px',
                                                        fontSize: '0.9rem',
                                                        color: '#495057',
                                                        textAlign: 'center',
                                                        borderTop: '1px solid #e9ecef',
                                                        verticalAlign: 'middle'
                                                    }}>
                                                        {item.lotNo || 'N/A'}
                                                    </td>

                                                    <td style={{
                                                        padding: '12px 10px',
                                                        fontSize: '0.85rem',
                                                        color: '#495057',
                                                        textAlign: 'center',
                                                        borderTop: '1px solid #e9ecef',
                                                        verticalAlign: 'middle'
                                                    }}>
                                                        {item.from && item.to ? (
                                                            <div>
                                                                <div>From: {item.from}</div>
                                                                <div>To: {item.to}</div>
                                                            </div>
                                                        ) : (
                                                            'N/A'
                                                        )}
                                                    </td>

                                                    <td style={{
                                                        padding: '12px 10px',
                                                        fontSize: '0.9rem',
                                                        color: '#495057',
                                                        textAlign: 'center',
                                                        borderTop: '1px solid #e9ecef',
                                                        verticalAlign: 'middle'
                                                    }}>
                                                        {item.countOfCatches || 0}
                                                    </td>

                                                    <td style={{
                                                        padding: '12px 10px',
                                                        fontSize: '0.9rem',
                                                        color: '#495057',
                                                        textAlign: 'center',
                                                        borderTop: '1px solid #e9ecef',
                                                        verticalAlign: 'middle'
                                                    }}>
                                                        {item.totalQuantity ? item.totalQuantity.toLocaleString() : 0}
                                                    </td>
                                                </tr>
                                            ))
                                            )}
                                        </tbody>
                                    </Table>
                                </div>
                            </div>

                            {/* Transaction Table Pagination and Summary */}
                            {productionReportData.length > 0 && (
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginTop: '20px',
                                    padding: '15px 0',
                                    flexWrap: 'wrap',
                                    gap: '15px'
                                }}>
                                    {/* Left side - Record count */}
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
                                        Showing {paginatedTransactions.length} of {totalTransactionRecords} production records
                                    </div>

                                    {/* Right side - Pagination */}
                                    {totalTransactionRecords > transactionPageSize && (
                                        <Pagination style={{ margin: 0 }}>
                                            <Pagination.First
                                                onClick={() => handleTransactionPageChange(1)}
                                                disabled={transactionCurrentPage === 1}
                                            />
                                            <Pagination.Prev
                                                onClick={() => handleTransactionPageChange(transactionCurrentPage - 1)}
                                                disabled={transactionCurrentPage === 1}
                                            />

                                            {/* Show page numbers */}
                                            {Array.from({ length: Math.min(5, totalTransactionPages) }, (_, i) => {
                                                let pageNumber;
                                                if (totalTransactionPages <= 5) {
                                                    pageNumber = i + 1;
                                                } else if (transactionCurrentPage <= 3) {
                                                    pageNumber = i + 1;
                                                } else if (transactionCurrentPage >= totalTransactionPages - 2) {
                                                    pageNumber = totalTransactionPages - 4 + i;
                                                } else {
                                                    pageNumber = transactionCurrentPage - 2 + i;
                                                }

                                                return (
                                                    <Pagination.Item
                                                        key={pageNumber}
                                                        active={pageNumber === transactionCurrentPage}
                                                        onClick={() => handleTransactionPageChange(pageNumber)}
                                                    >
                                                        {pageNumber}
                                                    </Pagination.Item>
                                                );
                                            })}

                                            <Pagination.Next
                                                onClick={() => handleTransactionPageChange(transactionCurrentPage + 1)}
                                                disabled={transactionCurrentPage === totalTransactionPages}
                                            />
                                            <Pagination.Last
                                                onClick={() => handleTransactionPageChange(totalTransactionPages)}
                                                disabled={transactionCurrentPage === totalTransactionPages}
                                            />
                                        </Pagination>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : productionReportData.length === 0 && selectedGroup ? (
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
                                <FaTable style={{
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
                                marginBottom: '0',
                                maxWidth: '500px'
                            }}>
                                No transaction details are available for the selected date and filters.
                            </p>
                        </div>
                    )}
                            </div>
                        )}

                        {/* Quick Task Tab */}
                        {activeTab === 'quicktask' && (
                            <div style={{
                                animation: 'fadeIn 0.3s ease-in-out'
                            }}>
                                {/* Quick Task Sub-tabs */}
                                <div style={{
                                    display: 'flex',
                                    borderBottom: '1px solid #e9ecef',
                                    marginBottom: '20px'
                                }}>
                                    <button
                                        onClick={() => setQuickTaskActiveTab('summary')}
                                        style={{
                                            padding: '8px 16px',
                                            border: 'none',
                                            backgroundColor: 'transparent',
                                            color: quickTaskActiveTab === 'summary' ? '#28a745' : '#6c757d',
                                            fontWeight: quickTaskActiveTab === 'summary' ? '600' : '500',
                                            fontSize: '0.9rem',
                                            cursor: 'pointer',
                                            borderBottom: quickTaskActiveTab === 'summary' ? '2px solid #28a745' : '2px solid transparent',
                                            transition: 'all 0.3s ease',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        <FaChartPie />
                                        Summary
                                    </button>
                                    <button
                                        onClick={() => setQuickTaskActiveTab('transactions')}
                                        style={{
                                            padding: '8px 16px',
                                            border: 'none',
                                            backgroundColor: 'transparent',
                                            color: quickTaskActiveTab === 'transactions' ? '#28a745' : '#6c757d',
                                            fontWeight: quickTaskActiveTab === 'transactions' ? '600' : '500',
                                            fontSize: '0.9rem',
                                            cursor: 'pointer',
                                            borderBottom: quickTaskActiveTab === 'transactions' ? '2px solid #28a745' : '2px solid transparent',
                                            transition: 'all 0.3s ease',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        <FaTable />
                                        Transactions
                                    </button>
                                </div>

                                {/* Quick Task Summary */}
                                {quickTaskActiveTab === 'summary' && (
                                    <div style={{
                                        backgroundColor: 'white',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                                        border: '1px solid rgba(0,0,0,0.08)',
                                        marginBottom: '20px',
                                        maxWidth: '500px'
                                    }}>
                                        <Table striped hover style={{
                                            margin: 0,
                                            width: '100%',
                                            borderCollapse: 'separate',
                                            borderSpacing: 0,
                                            tableLayout: 'fixed',
                                            fontSize: '0.85rem'
                                        }}
                                        className="striped-columns-table">
                                            <thead>
                                                <tr style={{
                                                    backgroundColor: '#f8f9fa',
                                                    borderBottom: '1px solid #e9ecef'
                                                }}>
                                                    <th style={{
                                                        padding: '10px 15px',
                                                        fontSize: '0.8rem',
                                                        fontWeight: '600',
                                                        color: '#2c3e50',
                                                        textAlign: 'left',
                                                        borderTop: 'none',
                                                        width: '60%',
                                                        verticalAlign: 'middle'
                                                    }}>
                                                        <span style={{
                                                            display: 'flex',
                                                            alignItems: 'center'
                                                        }}>
                                                            <FaClock style={{
                                                                marginRight: '6px',
                                                                color: '#28a745',
                                                                fontSize: '12px'
                                                            }} />
                                                            Metric
                                                        </span>
                                                    </th>
                                                    <th style={{
                                                        padding: '10px 15px',
                                                        fontSize: '0.8rem',
                                                        fontWeight: '600',
                                                        color: '#2c3e50',
                                                        textAlign: 'center',
                                                        borderTop: 'none',
                                                        width: '40%',
                                                        verticalAlign: 'middle'
                                                    }}>
                                                        <span style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}>
                                                            <FaHashtag style={{
                                                                marginRight: '4px',
                                                                color: '#28a745',
                                                                fontSize: '10px'
                                                            }} />
                                                            Count
                                                        </span>
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr style={{
                                                    backgroundColor: 'white',
                                                    transition: 'background-color 0.2s ease'
                                                }}>
                                                    <td style={{
                                                        padding: '8px 15px',
                                                        fontSize: '0.8rem',
                                                        color: '#495057',
                                                        textAlign: 'left',
                                                        borderTop: '1px solid #e9ecef',
                                                        verticalAlign: 'middle'
                                                    }}>
                                                        <div style={{
                                                            display: 'flex',
                                                            alignItems: 'center'
                                                        }}>
                                                            <div style={{
                                                                width: '24px',
                                                                height: '24px',
                                                                borderRadius: '4px',
                                                                backgroundColor: '#28a745',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                marginRight: '8px',
                                                                boxShadow: '0 1px 2px rgba(40, 167, 69, 0.25)'
                                                            }}>
                                                                <FaClock size={10} color="white" />
                                                            </div>
                                                            <span style={{
                                                                fontWeight: '500',
                                                                fontSize: '0.8rem',
                                                                color: '#2c3e50'
                                                            }}>Total Quick Tasks</span>
                                                        </div>
                                                    </td>
                                                    <td style={{
                                                        padding: '8px 15px',
                                                        fontSize: '0.9rem',
                                                        fontWeight: '600',
                                                        color: '#2c3e50',
                                                        textAlign: 'center',
                                                        borderTop: '1px solid #e9ecef',
                                                        verticalAlign: 'middle'
                                                    }}>
                                                        <span style={{
                                                            display: 'inline-block',
                                                            padding: '3px 8px',
                                                            backgroundColor: '#d4edda',
                                                            color: '#28a745',
                                                            borderRadius: '4px',
                                                            fontWeight: '600',
                                                            minWidth: '30px',
                                                            fontSize: '0.85rem'
                                                        }}>
                                                            {quickTaskData.length || 0}
                                                        </span>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </Table>
                                    </div>
                                )}

                                {/* Quick Task Transactions */}
                                {quickTaskActiveTab === 'transactions' && (
                                    <div>
                                        {quickTaskData && quickTaskData.length > 0 ? (
                                            <div>
                                                {/* Name Filter */}
                                                <div style={{
                                                    marginBottom: '20px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '10px',
                                                    padding: '15px',
                                              
                                                    borderRadius: '8px',
                                                   
                                                }}>
                                                    <FaSearch style={{
                                                        color: '#6c757d',
                                                        fontSize: '20px',
                                                        
                                                    }} />
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Filter by name..."
                                                        value={quickTaskNameFilter}
                                                        onChange={handleQuickTaskNameFilterChange}
                                                        style={{
                                                            fontSize: '0.85rem',
                                                         
                                                            borderRadius: '6px',
                                                            padding: '8px 12px',
                                                            maxWidth: '300px'
                                                        }}
                                                    />
                                                    {quickTaskNameFilter && (
                                                        <button
                                                            onClick={handleQuickTaskNameFilterClear}
                                                            style={{
                                                                background: 'none',
                                                                border: 'none',
                                                               
                                                                cursor: 'pointer',
                                                                padding: '4px',
                                                                borderRadius: '4px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                fontSize: '12px'
                                                            }}
                                                            title="Clear filter"
                                                        >
                                                            ✕
                                                        </button>
                                                    )}
                                                   
                                                </div>
                                                <div style={{
                                                    backgroundColor: 'white',
                                                    borderRadius: '8px',
                                                    overflow: 'hidden',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                                                    border: '1px solid rgba(0,0,0,0.08)',
                                                    marginBottom: '20px'
                                                }}>
                                                <Table striped hover style={{
                                                    margin: 0,
                                                    fontSize: '0.85rem'
                                                }}
                                                className="striped-columns-table">
                                                    <thead>
                                                        <tr style={{
                                                            backgroundColor: '#f8f9fa',
                                                            borderBottom: '1px solid #e9ecef'
                                                        }}>
                                                            <th style={{
                                                                padding: '10px 12px',
                                                                fontSize: '0.8rem',
                                                                fontWeight: '600',
                                                                color: '#2c3e50',
                                                                textAlign: 'center',
                                                                borderTop: 'none'
                                                            }}>S.No</th>
                                                            <th style={{
                                                                padding: '10px 12px',
                                                                fontSize: '0.8rem',
                                                                fontWeight: '600',
                                                                color: '#2c3e50',
                                                                textAlign: 'center',
                                                                borderTop: 'none'
                                                            }}>Name</th>
                                                            
                                                            <th style={{
                                                                padding: '10px 12px',
                                                                fontSize: '0.8rem',
                                                                fontWeight: '600',
                                                                color: '#2c3e50',
                                                                textAlign: 'center',
                                                                borderTop: 'none'
                                                            }}>Time Difference (Min)</th>
                                                            <th style={{
                                                                padding: '10px 12px',
                                                                fontSize: '0.8rem',
                                                                fontWeight: '600',
                                                                color: '#2c3e50',
                                                                textAlign: 'center',
                                                                borderTop: 'none'
                                                            }}>Date Range</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {filteredQuickTaskData.slice(
                                                            (quickTaskCurrentPage - 1) * quickTaskPageSize,
                                                            quickTaskCurrentPage * quickTaskPageSize
                                                        ).map((task, index) => (
                                                            <tr key={index} style={{
                                                                backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa'
                                                            }}>
                                                                <td style={{
                                                                    padding: '8px 12px',
                                                                    fontSize: '0.8rem',
                                                                    textAlign: 'center',
                                                                    borderTop: '1px solid #e9ecef'
                                                                }}>
                                                                    {((quickTaskCurrentPage - 1) * quickTaskPageSize) + index + 1}
                                                                </td>
                                                                <td style={{
                                                                    padding: '8px 12px',
                                                                    fontSize: '0.8rem',
                                                                    textAlign: 'center',
                                                                    borderTop: '1px solid #e9ecef'
                                                                }}>
                                                                    {userMap[task.triggeredBy_A] || `User ${task.triggeredBy_A}`}
                                                                </td>
                                                               
                                                                <td style={{
                                                                    padding: '8px 12px',
                                                                    fontSize: '0.8rem',
                                                                    textAlign: 'center',
                                                                    borderTop: '1px solid #e9ecef'
                                                                }}>
                                                                    {task.timeDifferenceMinutes}
                                                                </td>
                                                                <td style={{
                                                                    padding: '8px 12px',
                                                                    fontSize: '0.8rem',
                                                                    textAlign: 'center',
                                                                    borderTop: '1px solid #e9ecef'
                                                                }}>
                                                                    {task.loggedAT_A && task.loggedAT_B ? (
                                                                        <span>
                                                                            {new Date(task.loggedAT_A).toLocaleDateString('en-GB')} - {new Date(task.loggedAT_B).toLocaleDateString('en-GB')}
                                                                        </span>
                                                                    ) : 'N/A'}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>

                                                {/* Pagination for Quick Task */}
                                                {filteredQuickTaskData.length > quickTaskPageSize && (
                                                    <div style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        padding: '15px 20px',
                                                        backgroundColor: '#f8f9fa',
                                                        borderTop: '1px solid #e9ecef'
                                                    }}>
                                                        <div style={{
                                                            fontSize: '0.85rem',
                                                            color: '#6c757d'
                                                        }}>
                                                            Showing {((quickTaskCurrentPage - 1) * quickTaskPageSize) + 1} to {Math.min(quickTaskCurrentPage * quickTaskPageSize, filteredQuickTaskData.length)} of {filteredQuickTaskData.length} records
                                                        </div>
                                                        <Pagination size="sm" style={{ margin: 0 }}>
                                                            <Pagination.First
                                                                disabled={quickTaskCurrentPage === 1}
                                                                onClick={() => setQuickTaskCurrentPage(1)}
                                                            />
                                                            <Pagination.Prev
                                                                disabled={quickTaskCurrentPage === 1}
                                                                onClick={() => setQuickTaskCurrentPage(quickTaskCurrentPage - 1)}
                                                            />

                                                            {(() => {
                                                                const totalPages = Math.ceil(filteredQuickTaskData.length / quickTaskPageSize);
                                                                const currentPage = quickTaskCurrentPage;
                                                                const maxVisiblePages = 5;
                                                                let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                                                                let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

                                                                // Adjust start page if we're near the end
                                                                if (endPage - startPage + 1 < maxVisiblePages) {
                                                                    startPage = Math.max(1, endPage - maxVisiblePages + 1);
                                                                }

                                                                const pages = [];

                                                                // Add first page and ellipsis if needed
                                                                if (startPage > 1) {
                                                                    pages.push(
                                                                        <Pagination.Item
                                                                            key={1}
                                                                            active={1 === currentPage}
                                                                            onClick={() => setQuickTaskCurrentPage(1)}
                                                                        >
                                                                            1
                                                                        </Pagination.Item>
                                                                    );
                                                                    if (startPage > 2) {
                                                                        pages.push(<Pagination.Ellipsis key="start-ellipsis" disabled />);
                                                                    }
                                                                }

                                                                // Add visible page numbers
                                                                for (let i = startPage; i <= endPage; i++) {
                                                                    pages.push(
                                                                        <Pagination.Item
                                                                            key={i}
                                                                            active={i === currentPage}
                                                                            onClick={() => setQuickTaskCurrentPage(i)}
                                                                        >
                                                                            {i}
                                                                        </Pagination.Item>
                                                                    );
                                                                }

                                                                // Add ellipsis and last page if needed
                                                                if (endPage < totalPages) {
                                                                    if (endPage < totalPages - 1) {
                                                                        pages.push(<Pagination.Ellipsis key="end-ellipsis" disabled />);
                                                                    }
                                                                    pages.push(
                                                                        <Pagination.Item
                                                                            key={totalPages}
                                                                            active={totalPages === currentPage}
                                                                            onClick={() => setQuickTaskCurrentPage(totalPages)}
                                                                        >
                                                                            {totalPages}
                                                                        </Pagination.Item>
                                                                    );
                                                                }

                                                                return pages;
                                                            })()}

                                                            <Pagination.Next
                                                                disabled={quickTaskCurrentPage === Math.ceil(filteredQuickTaskData.length / quickTaskPageSize)}
                                                                onClick={() => setQuickTaskCurrentPage(quickTaskCurrentPage + 1)}
                                                            />
                                                            <Pagination.Last
                                                                disabled={quickTaskCurrentPage === Math.ceil(filteredQuickTaskData.length / quickTaskPageSize)}
                                                                onClick={() => setQuickTaskCurrentPage(Math.ceil(filteredQuickTaskData.length / quickTaskPageSize))}
                                                            />
                                                        </Pagination>
                                                    </div>
                                                )}
                                                </div>
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
                                                    <FaClock style={{
                                                        fontSize: '28px',
                                                        color: '#6c757d'
                                                    }} />
                                                </div>
                                                <h4 style={{
                                                    fontSize: '1.4rem',
                                                    fontWeight: '600',
                                                    marginBottom: '15px',
                                                    color: '#2c3e50'
                                                }}>No Quick Task Data</h4>
                                                <p style={{
                                                    fontSize: '1rem',
                                                    color: '#6c757d',
                                                    marginBottom: '0',
                                                    maxWidth: '500px'
                                                }}>
                                                    No quick task completion data is available for the selected date.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </>
            ) : null}
            </div>
        </Container>
    );
};

export default DailyReport;
