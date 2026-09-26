import { useLanguage } from "../../context/LanguageContext.jsx";

const LanguageSwitcher = () => {
  const { language, changeLanguage } = useLanguage();

  return (
    <select
      value={language}
      onChange={(e) => changeLanguage(e.target.value)}
      className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm"
    >
      <option value="en">English</option>
      <option value="hi">हिंदी</option>
    </select>
  );
};

export default LanguageSwitcher;