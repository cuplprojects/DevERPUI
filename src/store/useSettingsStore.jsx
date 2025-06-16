import { create } from "zustand";
import defaultUserSettings from './defaultUserSettings.json';
import API from '../CustomHooks/MasterApiHooks/api';

const USER_SETTING_KEY = 'userSettings';

const useSettingStore = create((set, get) => ({
  settings: JSON.parse(localStorage.getItem(USER_SETTING_KEY)) || null,
  loading: false,
  error: null,

  // Fetch user settings from API
  fetchSettings: async (userId) => {
    set({ loading: true, error: null });
    try {
      const response = await API.get(`/Settings/byUser/${userId}`);
      console.log('UserSettings Data -', response.data);

      if (response.data) {
        // Parse settings if they're stored as JSON string
        const parsedSettings = typeof response.data.settings === 'string'
          ? JSON.parse(response.data.settings)
          : response.data.settings;

        const settingsData = {
          ...response.data,
          settings: parsedSettings
        };

        set({ settings: settingsData, loading: false, error: null });
        localStorage.setItem(USER_SETTING_KEY, JSON.stringify(settingsData));
      } else {
        // If settings are not found, set default settings
        await get().setDefaultSettings(userId);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      // If API call fails, try to set default settings
      if (error.response?.status === 404) {
        await get().setDefaultSettings(userId);
      } else {
        set({ error: error.message, loading: false });
      }
    }
  },

  // Set default settings for new user
  setDefaultSettings: async (userId) => {
    set({ loading: true, error: null });
    try {
      const defaultSettingsPayload = {
        userId: userId,
        settings: JSON.stringify(defaultUserSettings)
      };

      const response = await API.post('/Settings', defaultSettingsPayload);

      if (response.data) {
        const settingsData = {
          ...response.data,
          settings: defaultUserSettings
        };

        set({ settings: settingsData, loading: false, error: null });
        localStorage.setItem(USER_SETTING_KEY, JSON.stringify(settingsData));
      }
    } catch (error) {
      console.error('Error setting default settings:', error);
      // If API fails, at least set default settings in localStorage and state
      const fallbackSettings = {
        userId: userId,
        settings: defaultUserSettings
      };
      set({ settings: fallbackSettings, loading: false, error: null });
      localStorage.setItem(USER_SETTING_KEY, JSON.stringify(fallbackSettings));
    }
  },

  // Update user settings
  updateSettings: async (userId, newSettings) => {
    set({ loading: true, error: null });
    try {
      const updatePayload = {
        userId: userId,
        settings: JSON.stringify(newSettings)
      };

      const response = await API.put(`/Settings/${userId}`, updatePayload);

      if (response.data) {
        const settingsData = {
          ...response.data,
          settings: newSettings
        };

        set({ settings: settingsData, loading: false, error: null });
        localStorage.setItem(USER_SETTING_KEY, JSON.stringify(settingsData));

        // Dispatch custom event to notify other components about settings update
        window.dispatchEvent(new CustomEvent('userSettingsUpdated', {
          detail: { settings: newSettings }
        }));

        return true;
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      set({ error: error.message, loading: false });
      return false;
    }
  },

  // Update specific setting section
  updateSettingSection: async (userId, section, sectionData) => {
    const currentSettings = get().settings;
    if (!currentSettings) return false;

    const updatedSettings = {
      ...currentSettings.settings,
      [section]: sectionData
    };

    return await get().updateSettings(userId, updatedSettings);
  },

  // Clear settings (for logout)
  clearSettings: () => {
    set({ settings: null, error: null, loading: false });
    localStorage.removeItem(USER_SETTING_KEY);
  },

  // Get current settings
  getCurrentSettings: () => {
    return get().settings?.settings || defaultUserSettings;
  },

  // Get specific setting section
  getSettingSection: (section) => {
    const settings = get().getCurrentSettings();
    return settings[section] || defaultUserSettings[section];
  },
}));

// Export the entire store
export default useSettingStore;

// Custom hooks for accessing the store
export const useSettings = () => useSettingStore((state) => state.settings);
export const useSettingsLoading = () => useSettingStore((state) => state.loading);
export const useSettingsError = () => useSettingStore((state) => state.error);

export const useSettingsActions = () => {
  const fetchSettings = useSettingStore(state => state.fetchSettings);
  const setDefaultSettings = useSettingStore(state => state.setDefaultSettings);
  const updateSettings = useSettingStore(state => state.updateSettings);
  const updateSettingSection = useSettingStore(state => state.updateSettingSection);
  const clearSettings = useSettingStore(state => state.clearSettings);
  const getCurrentSettings = useSettingStore(state => state.getCurrentSettings);
  const getSettingSection = useSettingStore(state => state.getSettingSection);

  return {
    fetchSettings,
    setDefaultSettings,
    updateSettings,
    updateSettingSection,
    clearSettings,
    getCurrentSettings,
    getSettingSection
  };
};
