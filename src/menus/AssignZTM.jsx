import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import Select from 'react-select';
import API from '../CustomHooks/MasterApiHooks/api';
import { useStore } from 'zustand';
import themeStore from '../store/themeStore';
import { useTranslation } from 'react-i18next';
import teamsService from '../CustomHooks/ApiServices/teamsService';

const AssignZTMModal = ({ show, handleClose, data, processId, handleSave, hasFeaturePermission }) => {
    const { t } = useTranslation();
    const themeState = useStore(themeStore);
    const cssClasses = useMemo(() => themeState.getCssClasses(), [themeState]);
    const [customDark, customMid, customLight, customBtn, customDarkText, customLightText] = cssClasses;

    // State variables
    const [selectedMachine, setSelectedMachine] = useState(null);
    const [machineOptions, setMachineOptions] = useState([]);
    const [machineId, setMachineId] = useState(null);
    const [zoneData, setZoneData] = useState([]);
    const [selectedZone, setSelectedZone] = useState(null);
    const [zoneId, setZoneId] = useState(null);
    const [zoneOptions, setZoneOptions] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState('');
    const [usersInTeam, setUsersInTeam] = useState([]);
    const [userOptions, setUserOptions] = useState([]); // List of users to be added to the team
    const [selectedUsersToAdd, setSelectedUsersToAdd] = useState([]); // Changed to array for multi-select
    const [teams, setTeams] = useState([]);

    const getTeamsByProcess = async () => {
        try {
            const teamsData = await teamsService.getTeamsByProcess(processId);
            setTeams(teamsData);
        }
        catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    const handleMachineChange = (selectedOption) => {
        setSelectedMachine(selectedOption);
        setMachineId(selectedOption ? selectedOption.value : null);
        console.log(setMachineId)
        // Automatically assign zone based on the selected machine's zoneId
        const selectedMachineData = machineOptions.find(machine => machine.value === selectedOption.value);
        console.log(selectedMachineData)
        if (selectedMachineData) {
            const associatedZone = zoneData.find(zone => Array.isArray(zone.machineId) && zone.machineId.includes(selectedOption.value));
            console.log(associatedZone)
            setSelectedZone(associatedZone || null); // Automatically set the zone if machine has associated zone
        } else {
            setSelectedZone(null); // If no machine is selected, reset the zone
        }
    };

    const handleZoneChange = (selectedOption) => {
        setSelectedZone(selectedOption);
        setZoneId(selectedOption ? selectedOption.value : null);
    };

    const getMachine = async () => {
        try {
            const response = await API.get('/Machines');
            const filteredMachines = response.data.filter(machine => machine.processId === processId);

            const machineWithZoneData = filteredMachines.map(machine => ({
                value: machine.machineId,
                label: machine.machineName,
                zoneId: machine.zoneId,
            }));

            setMachineOptions(machineWithZoneData);
        } catch (error) {
            console.error('Failed to fetch machine options', error);
        }
    };

    const getZoneData = async () => {
        try {
            const response = await API.get('/Zones');
            const sanitizedZoneData = response.data.map(zone => ({
                ...zone,
                machineIds: Array.isArray(zone.machineIds) ? zone.machineIds : []
            }));
            setZoneData(sanitizedZoneData);

            // Prepare zone options only for available zones
            const zoneOptionsList = sanitizedZoneData.map(zone => ({
                value: zone.zoneId,
                label: zone.zoneNo, // Assuming zoneName is the name to display
            }));
            setZoneOptions(zoneOptionsList);
        } catch (error) {
            console.error('Failed to fetch zone data', error);
        }
    };

    useEffect(() => {
        if (data?.[0]?.teamId) {
            setSelectedTeam(data[0].teamId);
            const team = teams.find((team) => team.teamId === data[0].teamId);
            if (team) {
                setUsersInTeam(team.users); // Populate team users when team is selected
            }
        }
        fetchUsers();
    }, [data, teams]);

    // Fetch all users for adding a new user to the team
    const fetchUsers = async () => {
        try {
            const response = await API.get('/User/operator');
            setUserOptions(response.data); // Assuming the response contains the list of users
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleTeamChange = (e) => {
        const teamId = parseInt(e.target.value);
        setSelectedTeam(teamId);
        const team = teams.find((team) => team.teamId === teamId);
        if (team) {
            setUsersInTeam(team.users); // Update users when team changes
        }
    };

    const handleRemoveUser = (userId) => {
        setUsersInTeam(usersInTeam.filter(user => user.userId !== userId));
    };

    // Modified to handle multi-select
    const handleUsersToAddChange = (selectedOptions) => {
        setSelectedUsersToAdd(selectedOptions || []);
    };

    // Filter out users that are already in the team
    const filteredUserOptions = userOptions.filter(user =>
        !usersInTeam.some(teamUser => teamUser.userId === user.userId)
    ).map(user => ({
        value: user.userId,
        label: user.fullName
    }));

    useEffect(() => {
        getMachine();
        getZoneData();
        getTeamsByProcess();
    }, []);

    const handleConfirm = async () => {
        try {
            // Add selected users to the team before saving
            if (selectedUsersToAdd.length > 0) {
                const usersToAdd = selectedUsersToAdd.map(selectedUser =>
                    userOptions.find(user => user.userId === selectedUser.value)
                ).filter(Boolean);

                setUsersInTeam(prevUsers => [...prevUsers, ...usersToAdd]);
            }

            // Get the final list of users (existing + newly added)
            const finalUsersInTeam = [
                ...usersInTeam,
                ...selectedUsersToAdd.map(selectedUser =>
                    userOptions.find(user => user.userId === selectedUser.value)
                ).filter(Boolean)
            ];

            const updatePromises = data.map(async (row) => {
                let existingTransactionData;
                if (row.transactionId) {
                    const response = await API.get(`/Transactions/${row.transactionId}`);
                    existingTransactionData = response.data;
                }
                const allUserIds = [
                    ...finalUsersInTeam.map(user => user.userId),
                ];

                const postData = {
                    transactionId: row.transactionId || 0,
                    interimQuantity: row.interimQuantity,
                    remarks: existingTransactionData ? existingTransactionData.remarks : '',
                    projectId: row.projectId,
                    quantitysheetId: row.srNo || 0,
                    processId: processId,
                    zoneId: selectedZone ? selectedZone.zoneId : zoneId, // Use selected zoneId
                    machineId: machineId,
                    status: existingTransactionData ? existingTransactionData.status : 0,
                    alarmId: existingTransactionData ? existingTransactionData.alarmId : "",
                    lotNo: row.lotNo,
                    teamId: allUserIds, // Collecting userId from selected teams
                    voiceRecording: existingTransactionData ? existingTransactionData.voiceRecording : ""
                };

                await API.post('/Transactions', postData);
            });

            await Promise.all(updatePromises);
            handleSave(machineId);
            setMachineId(null);
            setSelectedMachine(null);
            setSelectedZone(null); // Reset zone data
            setSelectedUsersToAdd([]); // Reset selected users to add
            handleClose();
        } catch (error) {
            console.error('Error updating machine:', error);
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton className={`${customDark} ${customDarkText}`}>
                <Modal.Title className={customLightText}>{t('selectMachine')}</Modal.Title>
            </Modal.Header>
            <Modal.Body className={`${customLight} ${customDarkText}`}>
                {Array.isArray(data) && data.length > 0 ? (
                    <>
                        <div className="mb-3">
                            <span className="fw-bold">{t('selectedCatches')}: </span>
                            {data.map(row => row.catchNumber).join(', ')}
                        </div>
                        <div className='mb-3'>
                            <span className='fw-bold'>{t('totalItems')}: </span>
                            {data.length}
                        </div>
                    </>
                ) : (
                    <div>{t('noDataAvailable')}</div>
                )}
                {hasFeaturePermission(3) &&
                    <Form.Group controlId="formMachine">
                        <Form.Label>{t('selectMachine')}</Form.Label>
                        <Select
                            value={selectedMachine}
                            onChange={handleMachineChange}
                            options={machineOptions}
                            placeholder={t('selectMachine')}
                            isClearable
                            className={`${customDarkText}`}
                        />
                    </Form.Group>
                }
                {hasFeaturePermission(1) &&
                    <Form.Group controlId="formZone">
                        <Form.Label>{t('selectZone')}</Form.Label>
                        <Select
                            value={selectedMachine
                                ? (selectedZone ? { value: selectedZone.zoneId, label: selectedZone.zoneNo } : null)
                                : selectedZone}
                            onChange={handleZoneChange}
                            options={zoneOptions}
                            placeholder={t('selectZone')}
                            isClearable
                            className={`${customDarkText}`}
                            isDisabled={selectedMachine !== null} // Disable zone selection if machine is selected
                        />
                    </Form.Group>
                }
                {hasFeaturePermission(2) &&
                    <Form.Group className="mb-3">
                        <Form.Label>Select Team</Form.Label>
                        <Form.Select value={selectedTeam} onChange={handleTeamChange}>
                            <option value="">Select a team...</option>
                            {teams.map((team) => (
                                <option key={team.teamId} value={team.teamId}>
                                    {team.teamName}
                                    {team.users && team.users.length > 0 ? ` (${team.users.map(user => user.fullName).join(', ')})` : ""}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>}
                {hasFeaturePermission(2) && selectedTeam && (
                    <>
                        <Row className="mb-3">
                            <Col md={12}>
                                <h6>Users in selected team:</h6>
                                <ul>
                                    {usersInTeam.map((user) => (
                                        <li key={user.userId}>
                                            {user.fullName}
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => handleRemoveUser(user.userId)}
                                                className="m-1"
                                            >
                                                Remove
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            </Col>
                        </Row>

                        <Row className="mb-3">
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Select Users to Add (Multiple Selection)</Form.Label>
                                    <Select
                                        value={selectedUsersToAdd}
                                        onChange={handleUsersToAddChange}
                                        options={filteredUserOptions}
                                        placeholder="Select users to add..."
                                        isClearable
                                        isMulti={true}
                                        closeMenuOnSelect={false}
                                        hideSelectedOptions={false}
                                        // menuIsOpen={true}
                                        className={`${customDarkText}`}
                                        styles={{
                                            menu: (provided) => ({
                                                ...provided,
                                                zIndex: 9999
                                            })
                                        }}
                                    />
                                </Form.Group>
                                {selectedUsersToAdd.length > 0 && (
                                    <div className="mb-2">
                                        <small className="text-muted">
                                            Selected {selectedUsersToAdd.length} user(s) to add. Click "Save Changes" to add them to the team.
                                        </small>
                                    </div>
                                )}
                            </Col>
                        </Row>
                    </>
                )}
            </Modal.Body>

            <Modal.Footer className={`${customLight} ${customDarkText}`}>
                <Button
                    variant="danger"
                    onClick={handleClose}
                    className={`${customBtn} border-0`}
                >
                    {t('close')}
                </Button>
                <Button
                    onClick={handleConfirm}
                    className={`${customBtn} border-0`}
                >
                    {t('saveChanges')}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AssignZTMModal;