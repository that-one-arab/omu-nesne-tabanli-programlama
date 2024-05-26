import PublicPageLayout from "@/components/layouts/PublicPageLayout";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { customFetch } from "@/util";
import { useRouter } from "next/router";
import useSnackbarStore from "@/util/store/snackbar";
import { useState } from "react";
import { login } from "@/util/api";
import { useUser } from "@/util/hooks";

function Signup() {
  const { t } = useTranslation();
  const router = useRouter();

  const showSnackbar = useSnackbarStore((state) => state.showSnackbar);
  const { setUser } = useUser();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsSubmitting(true);

    const name = (event.target as HTMLFormElement).fullName.value;
    const email = (event.target as HTMLFormElement).email.value;
    const password = (event.target as HTMLFormElement).password.value;
    const confirmPassword = (event.target as HTMLFormElement).confirmpassword
      .value;

    if (password !== confirmPassword) {
      showSnackbar(t("common:passwordsDoNotMatch"), "error");
      return;
    }

    const response = await customFetch("/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, username: email, email, password }),
    });

    if (!response.ok) {
      const data = await response.json();
      if (data.message.toLowerCase().includes("user already exists")) {
        showSnackbar(t("common:userAlreadyExists"), "error");
      } else {
        showSnackbar(t("common:anErrorOccurred"), "error");
      }
    }

    const loginData = await login(email, password);
    setUser(loginData);
    router.push("/?isFirstLogin=true");

    setIsSubmitting(false);
  };

  return (
    <PublicPageLayout pageTitle={t("common:signup")}>
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-4">
            {t("common:signup")}
          </h1>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700"
              >
                {t("common:fullName")}
              </label>
              <input
                type="text"
                id="fullName"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                {t("common:email")}
              </label>
              <input
                type="email"
                id="email"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                {t("common:password")}
              </label>
              <input
                type="password"
                id="password"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label
                htmlFor="confirmpassword"
                className="block text-sm font-medium text-gray-700"
              >
                {t("common:confirmPassword")}
              </label>
              <input
                type="password"
                id="confirmpassword"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={isSubmitting}
            >
              {t("common:signup")}
            </button>
            <div className="text-sm text-center">
              {t("common:alreadyHaveAnAccount")}{" "}
              <Link
                href="/login"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                {t("common:login")}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </PublicPageLayout>
  );
}

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ["common"])),
  },
});

export default Signup;
