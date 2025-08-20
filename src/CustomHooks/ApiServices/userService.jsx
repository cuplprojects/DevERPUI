import API from "../MasterApiHooks/api";

export const fetchUsers = async () => {
    try {
        const response = await API.get("/User");
        return response.data;
    } catch (error) {
        console.error("Error fetching users:", error);
        throw error;
    }
};

export const getLoggedUser = async () => {
    try {
        const response = await API.get(`User/LoggedUser`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching logged user:`, error);
        throw error;
    }
};

// Settings-related API methods
export const getUserSettings = async (userId) => {
    try {
        const response = await API.get(`/Settings/byUser/${userId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching settings for user ${userId}:`, error);
        throw error;
    }
};

export const createUserSettings = async (settingsData) => {
    try {
        const response = await API.post('/Settings', settingsData);
        return response.data;
    } catch (error) {
        console.error("Error creating user settings:", error);
        throw error;
    }
};

export const updateUserSettings = async (userId, settingsData) => {
    try {
        const response = await API.put(`/Settings/${userId}`, settingsData);
        return response.data;
    } catch (error) {
        console.error(`Error updating settings for user ${userId}:`, error);
        throw error;
    }
};

export const deleteUserSettings = async (userId) => {
    try {
        const response = await API.delete(`/Settings/${userId}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting settings for user ${userId}:`, error);
        throw error;
    }
};
