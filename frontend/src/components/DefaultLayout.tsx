import Navbar from "@/components/Navbar";
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
  return (
    <div className="absolute min-h-screen" style={{ minWidth: "100vw" }}>
      <Head>
        <title>{pageTitle || DEFAULT_PAGE_TITLE}</title>
        {pageDescription && (
          <meta name="description" content={pageDescription} />
        )}
      </Head>

      <Navbar />
      {children}
    </div>
  );
};

export default DefaultLayout;
