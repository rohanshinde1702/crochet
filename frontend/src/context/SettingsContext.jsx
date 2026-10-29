 
import { createContext, useContext, useState, useEffect, useCallback } from "react";
// import { API_ENDPOINTS } from "../config/api";
import { getSettings as fetchLocalSettings, saveSettings as saveLocalSettings } from "../services/dataService";
import DEFAULT_SETTINGS from "../data/Settings/settings.json";

const SettingsContext = createContext({
  settings: DEFAULT_SETTINGS,
  loading: true,
  updateSettings: async () => {},
  fetchSettings: async () => {}
});

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchLocalSettings();
      if (data) {
        setSettings((prev) => ({
          ...prev,
          ...data,
          socialLinks: {
            ...prev.socialLinks,
            ...(data.socialLinks || {})
          }
        }));
      }
    } catch (err) {
      console.error("Failed to load store settings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = async (newSettingsData) => {
    try {
      let updated;
      if (!updated) {
        updated = await saveLocalSettings(newSettingsData);
      }

      setSettings((prev) => ({
        ...prev,
        ...updated,
        socialLinks: {
          ...prev.socialLinks,
          ...(updated.socialLinks || {})
        }
      }));

      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: { message: "Store contact info & social links updated successfully!" }
        })
      );

      return updated;
    } catch (err) {
      alert(err.message);
      throw err;
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, updateSettings, fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);

export default SettingsContext;
