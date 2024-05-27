import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { appWithTranslation } from "next-i18next";
import { ThemeProvider } from "@emotion/react";
import theme from "@/util/theme";
import Snackbar from "@/components/Snackbar";
import useUserProfileStore from "@/util/store/user";
import { useEffect } from "react";
import { getUserData } from "@/util/auth";

function App({ Component, pageProps }: AppProps) {
  const userId = useUserProfileStore((user) => user.id);
  const setUserInStore = useUserProfileStore((user) => user.setUser);

  // If we don't have user data stored (occurs when EG: user reloads page), fetch it from the server
  // Not a very elegant solution, but will do for now.
  useEffect(() => {
    if (!userId) {
      getUserData().then((data) => {
        if (data) {
          setUserInStore(data);
        }
      });
    }
  }, [userId, setUserInStore]);

  return (
    <ThemeProvider theme={theme}>
      <Component {...pageProps} />
      <Snackbar />
    </ThemeProvider>
  );
}

export default appWithTranslation(App);
