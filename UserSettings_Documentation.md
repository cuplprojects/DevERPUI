# User Settings System - Complete Documentation

## 📋 **Overview**

The User Settings System provides a comprehensive solution for managing user preferences across the application. It includes default settings, database persistence, local storage caching, and a centralized management interface.

---

## 🏗️ **System Architecture**

### **Core Components**
- **Settings Store** (Zustand): Centralized state management
- **Default Settings**: JSON-based configuration template
- **Database Layer**: Persistent storage via API
- **Local Storage**: Session-based caching
- **UI Components**: Settings management interface

### **Data Flow**
```
Login → Load Settings → Local Storage → UI Components → Save to Database
```

---

## 📁 **File Structure**

```
src/
├── store/
│   ├── defaultUserSettings.json          # Default settings template
│   └── useSettingsStore.jsx              # Zustand store for settings
├── user/UserSettings/
│   ├── UserSettings.jsx                  # Main settings page
│   └── Components/
│       ├── GeneralSettings.jsx           # Language, font, page limit
│       ├── CuDashboardSettings.jsx       # Dashboard preferences
│       └── ProcessScreenSettings.jsx     # Process screen configuration
├── CustomHooks/ApiServices/
│   ├── AuthService.jsx                   # Authentication with settings cleanup
│   └── userService.jsx                   # Settings-related API methods
└── menus/
    └── UserMenu.jsx                      # Logout with settings cleanup
```

---

## ⚙️ **Settings Structure**

### **Default Settings Schema**
```json
{
  "general": {
    "language": "english",
    "fontSize": "medium", 
    "pageLimit": 10
  },
  "dashboardSettings": {
    "showDashboardTable": true,
    "showBarChart": true,
    "numberOfProjects": 5,
    "viewType": "project"
  },
  "processScreenSettings": {
    "defaultColumns": {
      "interimQuantity": true,
      "remarks": true,
      "teamAssigned": true
    },
    "defaultFilters": {
      "hideCompleted": false,
      "previousCompleted": false
    }
  }
}
```

---

## 🔄 **User Workflow**

### **1. User Login Process**
1. User enters credentials and clicks login
2. Authentication service validates credentials
3. On success, user ID is extracted from response
4. System attempts to fetch user settings from database
5. If settings exist: Load to store and localStorage
6. If no settings: Create default settings in database
7. User is redirected to dashboard with settings loaded

### **2. Settings Management Process**
1. User navigates to Settings page (/settings)
2. Current settings are loaded from store into UI components
3. User modifies settings in various sections:
   - General Settings (language, font size, page limit)
   - Dashboard Settings (table visibility, chart preferences)
   - Process Settings (column visibility, default filters)
4. User clicks "Save All Settings" button
5. System collects data from all components
6. Combined settings are sent to database via API
7. On success: Store and localStorage are updated
8. User receives success/error feedback

### **3. User Logout Process**
1. User clicks logout from user menu
2. Confirmation modal appears
3. On confirmation:
   - Settings are cleared from Zustand store
   - Settings are removed from localStorage
   - User data is cleared
   - Authentication token is cleared
   - User is redirected to login page

---

## 🛠️ **Technical Implementation**

### **Settings Store (Zustand) - Key Methods**
- `fetchSettings(userId)` - Load settings from API
- `updateSettings(userId, settings)` - Save settings to API  
- `clearSettings()` - Clear settings on logout
- `getCurrentSettings()` - Get current settings state
- `setDefaultSettings(userId)` - Create default settings
- `updateSettingSection(userId, section, data)` - Update specific section

### **API Endpoints**
- `GET /api/Settings/byUser/{userId}` - Fetch user settings
- `POST /api/Settings` - Create or update settings

### **Database Schema**
```csharp
public class MySettings
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int SettingId { get; set; }     // Auto-generated primary key
    public string Settings { get; set; }   // JSON string of settings
    public int UserId { get; set; }        // Foreign key to User table
}
```

---

## 💾 **Data Storage Strategy**

### **1. Default Settings (JSON File)**
- **Purpose**: Template for new users
- **Location**: `src/store/defaultUserSettings.json`
- **Usage**: Loaded when no user settings exist in database
- **Format**: Structured JSON with all setting categories

### **2. Database Storage**
- **Purpose**: Persistent user preferences across sessions
- **Trigger**: Settings saved only through Settings page
- **Format**: JSON string stored in Settings column
- **Lifecycle**: Created on first save, updated on subsequent saves

### **3. Local Storage**
- **Purpose**: Session caching for improved performance
- **Key**: `userSettings`
- **Lifecycle**: Populated on login, cleared on logout
- **Benefits**: Reduces API calls, faster UI loading

### **4. Zustand Store**
- **Purpose**: Runtime state management across components
- **Scope**: Application-wide reactive state
- **Features**: Real-time updates, computed values, actions

---

## 🎯 **Key Features**

### **✅ Currently Implemented**
- ✅ Default settings for new users
- ✅ Database persistence through Settings page
- ✅ Local storage session caching
- ✅ Complete logout cleanup (all storage cleared)
- ✅ Centralized Zustand store management
- ✅ "Save All Settings" functionality
- ✅ Individual component settings management
- ✅ Comprehensive error handling and user feedback
- ✅ Loading states and form validation
- ✅ Settings reset to defaults functionality

### **🔄 Planned Future Enhancements**
- 🔄 Individual save buttons per settings section
- 🔄 Settings import/export functionality
- 🔄 Settings versioning and history
- 🔄 User settings backup and restore
- 🔄 Admin settings override capabilities
- 🔄 Settings synchronization across devices

---

## 🚀 **Usage Examples**

### **Accessing Settings in Components**
```javascript
import { useSettings, useSettingsActions } from '../store/useSettingsStore';

const MyComponent = () => {
  const settings = useSettings();
  const { getCurrentSettings, updateSettings } = useSettingsActions();
  
  const currentSettings = getCurrentSettings();
  const language = currentSettings.general?.language || 'english';
  const pageLimit = currentSettings.general?.pageLimit || 10;
  
  return (
    <div>
      <p>Current Language: {language}</p>
      <p>Page Limit: {pageLimit}</p>
    </div>
  );
};
```

### **Saving Settings Programmatically**
```javascript
const handleSaveSettings = async () => {
  const newSettings = {
    general: { language: 'hindi', fontSize: 'large', pageLimit: 20 },
    dashboardSettings: { showDashboardTable: false, viewType: 'lot' }
  };
  
  const success = await updateSettings(userId, newSettings);
  if (success) {
    console.log('Settings saved successfully');
  } else {
    console.error('Failed to save settings');
  }
};
```

---

## 🔧 **Configuration Requirements**

### **Environment Variables**
```env
VITE_API_BASE_URL=http://localhost:7212  # Backend API base URL
```

### **Required Translation Keys**
```json
{
  "saveAllSettings": "Save All Settings",
  "saveAll": "Save All", 
  "saving...": "Saving...",
  "allSettingsSavedSuccessfully": "All settings saved successfully!",
  "failedToSaveAllSettings": "Failed to save all settings",
  "userNotFound": "User not found",
  "settingsResetSuccessfully": "Settings reset successfully",
  "failedToResetSettings": "Failed to reset settings",
  "generalSettings": "General Settings",
  "dashboardSettings": "Dashboard Settings", 
  "processSettings": "Process Settings",
  "securitySettings": "Security Settings"
}
```

---

## 🐛 **Troubleshooting Guide**

### **Common Issues and Solutions**

**1. Settings not saving to database**
- ✅ Verify user is authenticated (check token)
- ✅ Check API endpoint accessibility
- ✅ Verify backend controller is running
- ✅ Check browser console for JavaScript errors
- ✅ Ensure userId is properly passed to save function

**2. Default settings not loading for new users**
- ✅ Verify `defaultUserSettings.json` file exists
- ✅ Check JSON file format validity
- ✅ Ensure file is properly imported in store
- ✅ Check API response for 404 errors

**3. Settings cleared unexpectedly**
- ✅ Check if logout was triggered accidentally
- ✅ Verify localStorage permissions in browser
- ✅ Check for token expiration issues
- ✅ Review error boundary behavior

**4. UI not reflecting saved settings**
- ✅ Check if store is properly updated after save
- ✅ Verify component is subscribed to store changes
- ✅ Check localStorage synchronization
- ✅ Ensure page refresh loads settings correctly

### **Debug Tools and Commands**
```javascript
// Check current settings in store
console.log(useSettingStore.getState().settings);

// Check localStorage contents
console.log(localStorage.getItem('userSettings'));

// Check if user is authenticated
console.log(localStorage.getItem('authToken'));

// Monitor API calls in browser Network tab
// Look for calls to /api/Settings endpoints
```

---

## 📊 **Performance Considerations**

- **Local Storage Access**: Provides fast retrieval for frequently accessed settings
- **API Call Optimization**: Minimized through intelligent caching strategy
- **Memory Usage**: Efficient Zustand store with minimal re-renders
- **Bundle Size**: Optimized component loading and code splitting
- **Database Queries**: Indexed by UserId for fast retrieval

---

## 🔒 **Security and Privacy**

- **User Isolation**: Settings are strictly user-specific with UserId validation
- **Data Sensitivity**: No sensitive information stored in settings
- **Session Security**: Local storage cleared completely on logout
- **API Security**: All operations require valid authentication token
- **Input Validation**: Settings validated on both frontend and backend

---

**Document Information**
- **Last Updated**: January 2025
- **Version**: 1.0
- **Status**: Production Ready ✅
- **Author**: Development Team
- **Review Date**: Quarterly

