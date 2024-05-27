import { useTranslation } from "next-i18next";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import SettingsPageLayout from "@/components/layouts/SettingsPageLayout";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import useSnackbarStore from "@/util/store/snackbar";
import { useState } from "react";
import { customFetch } from "@/util";
import useUserProfileStore from "@/util/store/user";

const ChangeEmail = () => {
  const { t } = useTranslation();
  const showSnackbar = useSnackbarStore((state) => state.showSnackbar);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useUserProfileStore();

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsSubmitting(true);

    const currentEmail = (event.target as HTMLFormElement).currentEmail.value;
    const newEmail = (event.target as HTMLFormElement).newEmail.value;

    if (currentEmail === newEmail) {
      showSnackbar(t("common:emailsMatch"), "error");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await customFetch(
        "/user/change-email",
        {
          method: "PUT",
          body: JSON.stringify({
            new_email: newEmail,
          }),
        },
        true
      );

      if (response.ok) {
        showSnackbar(t("common:emailChangedSuccessfully"), "success");
        user.setUser({ ...user, email: newEmail });
        (event.target as HTMLFormElement).reset();
      } else {
        const data = await response.json();
        if (
          JSON.stringify(data).toLowerCase().includes("email already taken")
        ) {
          showSnackbar(t("common:emailAlreadyTaken"), "error");
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
          {t("common:changeEmail")}
        </h2>
        <form
          className="space-y-4 flex flex-col justify-between h-full"
          onSubmit={onSubmit}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t("common:currentEmail")}
              </label>
              <input
                id="currentEmail"
                type="email"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                disabled={true}
                value={user.email}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t("common:newEmail")}
              </label>
              <input
                id="newEmail"
                type="email"
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
