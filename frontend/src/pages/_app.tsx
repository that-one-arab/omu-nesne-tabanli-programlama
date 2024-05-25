import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { appWithTranslation } from "next-i18next";
import { ThemeProvider } from "@emotion/react";
import theme from "@/util/theme";
import Snackbar from "@/components/Snackbar";

function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <Component {...pageProps} />
      <Snackbar />
    </ThemeProvider>
  );
}

export default appWithTranslation(App);
