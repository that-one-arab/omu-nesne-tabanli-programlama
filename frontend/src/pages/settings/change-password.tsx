import { useTranslation } from "next-i18next";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import SettingsPageLayout from "@/components/layouts/SettingsPageLayout";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import useSnackbarStore from "@/util/store/snackbar";
import { customFetch } from "@/util";
import { useState } from "react";

const ChangePassword = () => {
  const { t } = useTranslation();
  const showSnackbar = useSnackbarStore((state) => state.showSnackbar);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsSubmitting(true);

    const currentPassword = (event.target as HTMLFormElement).currentPassword
      .value;
    const newPassword = (event.target as HTMLFormElement).newPassword.value;
    const confirmNewPassword = (event.target as HTMLFormElement)
      .confirmNewPassword.value;

    if (newPassword !== confirmNewPassword) {
      showSnackbar(t("common:passwordsDoNotMatch"), "error");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await customFetch(
        "/user/change-password",
        {
          method: "PUT",
          body: JSON.stringify({
            old_password: currentPassword,
            new_password: newPassword,
          }),
        },
        true
      );

      if (response.ok) {
        showSnackbar(t("common:passwordChangedSuccessfully"), "success");
      } else {
        const data = await response.json();
        if (JSON.stringify(data).includes("Invalid password")) {
          showSnackbar(t("common:invalidPassword"), "error");
        } else {
          showSnackbar(t("common:serverError"), "error");
        }
      }
    } catch (error) {
      console.error(error);
      showSnackbar(t("common:serverError"), "error");
    }

    setIsSubmitting(false);
  };

  return (
    <DefaultLayout>
      <SettingsPageLayout>
        <h2 className="text-xl font-semibold mb-4">
          {t("common:changePassword")}{" "}
        </h2>
        <form
          className="space-y-4 flex flex-col justify-between h-full"
          onSubmit={onSubmit}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t("common:currentPassword")}
              </label>
              <input
                id="currentPassword"
                type="password"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t("common:newPassword")}{" "}
              </label>
              <input
                id="newPassword"
                type="password"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t("common:confirmNewPassword")}{" "}
              </label>
              <input
                id="confirmNewPassword"
                type="password"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
          </div>
          <div style={{ marginBottom: "35px" }}>
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded-md w-full"
              disabled={isSubmitting}
            >
              {t("common:changePassword")}{" "}
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

export default ChangePassword;
