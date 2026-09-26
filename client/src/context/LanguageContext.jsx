import { createContext, useContext, useState, useEffect } from "react";
import en from "../translations/en";
import hi from "../translations/hi";

const translations = { en, hi };

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(
    () => localStorage.getItem("appLanguage") || "hi"
  );

  useEffect(() => {
    localStorage.setItem("appLanguage", language);
  }, [language]);

  // "home.title" jaisi dotted-key se nested value nikaalne ke liye
  const t = (key) => {
    const keys = key.split(".");
    let value = translations[language];

    for (const k of keys) {
      value = value?.[k];
    }

    return value ?? key; // agar key na mile toh key hi dikha do (debugging ke liye helpful)
  };

  const changeLanguage = (lng) => {
    if (translations[lng]) {
      setLanguage(lng);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};