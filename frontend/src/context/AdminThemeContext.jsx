import { createContext, useContext, useState, useEffect } from "react";

const AdminThemeContext = createContext();

export const AdminThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("adminTheme") || "light";
  });

  useEffect(() => {
    localStorage.setItem("adminTheme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const isDark = theme === "dark";

  return (
    <AdminThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark }}>
      <div className={theme === "dark" ? "dark-theme" : "light-theme"}>
        {children}
      </div>
    </AdminThemeContext.Provider>
  );
};

export const useAdminTheme = () => {
  const context = useContext(AdminThemeContext);
  if (!context) {
    return {
      theme: "light",
      setTheme: () => {},
      toggleTheme: () => {},
      isDark: false,
    };
  }
  return context;
};

export default AdminThemeContext;
