import {create} from 'zustand';
import i18n from '../i18n';

const useLanguageStore = create((set, get) => ({
  language: 'en', // Default language
  setLanguage: (newLanguage) => {
    i18n.changeLanguage(newLanguage); // Update i18n language

    // Update userSettings localStorage
    const userSettings = JSON.parse(localStorage.getItem('userSettings') || '{}');
    if (userSettings.settings) {
      userSettings.settings.general = userSettings.settings.general || {};
      userSettings.settings.general.language = newLanguage;
      localStorage.setItem('userSettings', JSON.stringify(userSettings));
    }

    set({ language: newLanguage }); // Update Zustand state
  },
  initializeLanguage: () => {
    // Try to get language from userSettings first, fallback to old language key, then default to 'en'
    let storedLanguage = 'en';

    try {
      const userSettings = JSON.parse(localStorage.getItem('userSettings') || '{}');
      if (userSettings.settings?.general?.language) {
        storedLanguage = userSettings.settings.general.language;
      } else {
        // Fallback to old language key for backward compatibility
        storedLanguage = localStorage.getItem('language') || 'en';
      }
    } catch (error) {
      console.error('Error parsing userSettings from localStorage:', error);
      storedLanguage = localStorage.getItem('language') || 'en';
    }

    set({ language: storedLanguage }); // Initialize Zustand state with stored language
    i18n.changeLanguage(storedLanguage); // Set i18n language
  },
}));

export default useLanguageStore;

