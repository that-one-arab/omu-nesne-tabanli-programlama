import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import PublicPageLayout from "@/components/layouts/PublicPageLayout";
import Link from "next/link";
import { useRouter } from "next/router";
import useSnackbarStore from "@/util/store/snackbar";
import { login } from "@/util/api";
import { useUser } from "@/util/hooks";

function Login() {
  const { t } = useTranslation();
  const router = useRouter();
  const user = useUser();
  const showSnackbar = useSnackbarStore((state) => state.showSnackbar);
  const { sessionExpired } = router.query;

  useEffect(() => {
    if (sessionExpired === "true") {
      showSnackbar(t("common:yourSessionHasExpiredPleaseLoginAgain"), "error");
    }
  }, [sessionExpired, showSnackbar, t]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    if (window !== undefined) {
      const rememberMe = localStorage.getItem("rememberMe");
      if (rememberMe === "true") {
        setRememberMe(true);
        setEmail(localStorage.getItem("email") || "");
        setPassword(localStorage.getItem("password") || "");
      }
    }
  }, []);

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleRememberMeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    localStorage.setItem("rememberMe", event.target.checked.toString());
    setRememberMe(event.target.checked);

    if (!event.target.checked) {
      localStorage.removeItem("email");
      localStorage.removeItem("password");
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = (event.target as HTMLFormElement).email.value;
    const password = (event.target as HTMLFormElement).password.value as string;

    const rememberMe = localStorage.getItem("rememberMe");
    if (rememberMe) {
      localStorage.setItem("email", email);
      localStorage.setItem("password", password);
    }

    try {
      const data = await login(email, password);
      user.setUser(data);

      const redirectTo = router.query?.redirectTo as string;

      redirectTo ? router.push(redirectTo) : router.push("/");
    } catch (error: any) {
      if (error.message.toLowerCase().includes("invalid credentials")) {
        showSnackbar(t("common:invalidCredentials"), "error");
      } else {
        showSnackbar(t("common:serverError"), "error");
      }
    }
  };

  return (
    <PublicPageLayout pageTitle={t("common:login")}>
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-4">
            {t("common:login")}
          </h1>
          <form className="space-y-4" onSubmit={handleSubmit}>
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
                value={email}
                onChange={handleEmailChange}
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
                value={password}
                onChange={handlePasswordChange}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  checked={rememberMe}
                  onChange={handleRememberMeChange}
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-900"
                >
                  {t("common:rememberMe")}
                </label>
              </div>
            </div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {t("common:signIn")}
            </button>
            <div className="text-sm text-center">
              {t("common:dontHaveAnAccount")}{" "}
              <Link
                href="/signup"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                {t("common:signup")}
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

export default Login;
