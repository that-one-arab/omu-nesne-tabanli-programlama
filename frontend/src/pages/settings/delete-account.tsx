import { useTranslation } from "next-i18next";
import { useState } from "react";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import SettingsPageLayout from "@/components/layouts/SettingsPageLayout";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

const DeleteAccount = () => {
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [password, setPassword] = useState("");

  const handleDeleteClick = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setPassword("");
  };

  const handleConfirmDelete = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Add your delete account logic here
    console.log("Password:", password);
    handleCloseDialog();
  };

  return (
    <DefaultLayout>
      <SettingsPageLayout>
        <h2 className="text-xl font-semibold mb-4">
          {t("common:deleteAccount")}{" "}
        </h2>
        <div className="space-y-4">
          <p className="text-red-600">{t("common:deleteAccountWarning1")}</p>
          <p className="text-red-600">{t("common:deleteAccountWarning2")}</p>

          <button
            onClick={handleDeleteClick}
            className="px-4 py-2 bg-red-500 text-white rounded-md"
          >
            {t("common:deleteYourAccount")}
          </button>
        </div>

        {isDialogOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
            <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
              <h3 className="text-lg font-semibold mb-4">
                {t("common:confirmDeletion")}{" "}
              </h3>
              <form onSubmit={handleConfirmDelete}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    {t("common:enterYourPasswordToConfirm")}
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={handleCloseDialog}
                    className="px-4 py-2 bg-gray-300 text-black rounded-md"
                  >
                    {t("common:cancel")}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-500 text-white rounded-md"
                  >
                    {t("common:deleteAccount")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </SettingsPageLayout>
    </DefaultLayout>
  );
};

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ["common"])),
  },
});

export default DeleteAccount;
