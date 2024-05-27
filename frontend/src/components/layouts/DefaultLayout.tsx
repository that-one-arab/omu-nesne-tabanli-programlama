import Navbar from "@/components/Navbar";
import { useMediaQuery } from "@mui/material";
import Head from "next/head";

const DEFAULT_PAGE_TITLE = "Quiz Buddy";

const DefaultLayout = ({
  children,
  pageTitle,
  pageDescription,
}: {
  children: React.ReactNode;
  pageTitle?: string;
  pageDescription?: string;
}) => {
  const isMobile = useMediaQuery("(max-width: 600px)");

  return (
    <div
      className="absolute min-h-screen bg-gray-100"
      style={{ minWidth: "100vw" }}
    >
      <Head>
        <title>{pageTitle || DEFAULT_PAGE_TITLE}</title>
        {pageDescription && (
          <meta name="description" content={pageDescription} />
        )}
      </Head>

      <Navbar />
      <div className={isMobile ? "mt-9" : ""}>{children}</div>
    </div>
  );
};

export default DefaultLayout;
