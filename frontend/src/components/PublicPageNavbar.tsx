import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

const PublicPageNavbar = () => {
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

export default PublicPageNavbar;
