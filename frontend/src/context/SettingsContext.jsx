import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { API_ENDPOINTS } from "../config/api";

const DEFAULT_SETTINGS = {
  storeName: "CozyLoops Studio",
  email: "cozyloops.crochet@gmail.com",
  phone: "+91 98765 43210",
  whatsapp: "+91 98765 43210",
  address: "Mumbai, Maharashtra, India",
  businessHours: "Mon - Sat: 10:00 AM - 7:00 PM",
  socialLinks: {
    instagram: "https://instagram.com/",
    facebook: "https://facebook.com/",
    pinterest: "https://pinterest.com/",
    youtube: "https://youtube.com/",
    twitter: "https://x.com/"
  },
  freeShippingLimit: 999,
  currency: "INR (₹)",
  maintenanceMode: false
};

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
      const res = await fetch(API_ENDPOINTS.SETTINGS);
      if (res.ok) {
        const data = await res.json();
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
      const res = await fetch(API_ENDPOINTS.SETTINGS, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettingsData)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to update settings");
      }

      const updated = await res.json();
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
          detail: { message: "Store contact info & social links updated globally! 🌐✨" }
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
