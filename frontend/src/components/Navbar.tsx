import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const router = useRouter();

  const handleLanguageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedLanguage = event.target.value;
    router.push(router.asPath, undefined, { locale: selectedLanguage });
  };

  return (
    <div className="absolute left-0 flex items-center p-4">
      {/* Home Icon */}
      <button onClick={() => router.push("/")} className="mr-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      </button>
      {/* Language Selector */}
      <select
        value={i18n.language}
        onChange={handleLanguageChange}
        className="outline-none border-none"
      >
        <option value="en">{t("languages.english")}</option>
        <option value="ar">{t("languages.arabic")}</option>
        <option value="tr">{t("languages.turkish")}</option>
      </select>
    </div>
  );
};

export default Navbar;
