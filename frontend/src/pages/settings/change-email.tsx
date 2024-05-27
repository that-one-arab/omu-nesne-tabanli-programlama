import { useTranslation } from "next-i18next";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import SettingsPageLayout from "@/components/layouts/SettingsPageLayout";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

const ChangeEmail = () => {
  const { t } = useTranslation();
  return (
    <DefaultLayout>
      <SettingsPageLayout>
        <h2 className="text-xl font-semibold mb-4">
          {t("common:changeEmail")}
        </h2>
        <form className="space-y-4 flex flex-col justify-between h-full">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t("common:currentEmail")}
              </label>
              <input
                type="email"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
          </div>
          <div style={{ marginBottom: "35px" }}>
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded-md w-full"
            >
              {t("common:changeEmail")}
            </button>
          </div>
        </form>
      </SettingsPageLayout>
    </DefaultLayout>
  );
};

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ["common"])),
  },
});

export default ChangeEmail;