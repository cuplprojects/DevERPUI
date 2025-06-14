/**
 * AuthService: Handles authentication-related operations
 * Created by Shivom on 2023-10-05
 * Updated to use useUserTokenStore for token management and fetch user data after login
 * 
 * This service uses the custom API instance for making requests
 */

import API from '../MasterApiHooks/api';
import useUserTokenStore from '../../store/useUserToken';
import useUserDataStore from '../../store/userDataStore';
import useSettingStore from '../../store/useSettingsStore';

const AuthService = {
  login: async (username, password) => {
    try {
      const response = await API.post('/Login/login', { userName: username, password });
      if (response.status === 200 && response.data.token) {
        const { setToken } = useUserTokenStore.getState();
        setToken(response.data.token);
        
        // Fetch user data after setting the token
        const { actions } = useUserDataStore.getState();
        await actions.fetchUserData();
      }
      return response;
    } catch (error) {
      throw error;
    }
  },

  logout: () => {
    const { clearToken } = useUserTokenStore.getState();
    const { actions } = useUserDataStore.getState();
    const { clearSettings } = useSettingStore.getState();

    // Clear all user-related data
    clearToken();
    clearSettings();
    actions.clearUserData();

    // Clear additional localStorage items
    localStorage.removeItem('isLocked');
    localStorage.removeItem('loggedOut');

    // Set logout flag for login page notification
    localStorage.setItem('loggedOut', 'true');
  },

  isLoggedIn: () => {
    const { token } = useUserTokenStore.getState();
    return !!token;
  },

  unlockScreen: async (pin) => {
    try {
      const response = await API.post('/User/UnlockScreenByPin', { pin });
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default AuthService;