import { useTranslation } from "next-i18next";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import SettingsPageLayout from "@/components/layouts/SettingsPageLayout";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import useSnackbarStore from "@/util/store/snackbar";
import { useState } from "react";
import { customFetch } from "@/util";
import useUserProfileStore from "@/util/store/user";

const ChangeUsername = () => {
  const { t } = useTranslation();

  const showSnackbar = useSnackbarStore((state) => state.showSnackbar);
  const user = useUserProfileStore();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsSubmitting(true);

    const currentUsername = (event.target as HTMLFormElement).currentUsername
      .value;
    const newUsername = (event.target as HTMLFormElement).newUsername.value;

    if (currentUsername === newUsername) {
      showSnackbar(t("common:usernamesMatch"), "error");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await customFetch(
        "/user/change-username",
        {
          method: "PUT",
          body: JSON.stringify({
            new_username: newUsername,
          }),
        },
        true
      );

      if (response.ok) {
        showSnackbar(t("common:usernameChangedSuccessfully"), "success");
        user.setUser({ ...user, username: newUsername });
        (event.target as HTMLFormElement).reset();
      } else {
        const data = await response.json();
        if (
          JSON.stringify(data).toLowerCase().includes("username already taken")
        ) {
          showSnackbar(t("common:usernameAlreadyTaken"), "error");
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
          {t("common:changeUsername")}
        </h2>
        <form
          className="space-y-4 flex flex-col justify-between h-full"
          onSubmit={onSubmit}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t("common:currentUsername")}
              </label>
              <input
                id="currentUsername"
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                disabled
                value={user.username}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t("common:newUsername")}
              </label>
              <input
                id="newUsername"
                type="text"
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
              {t("common:changeUsername")}
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

export default ChangeUsername;
