import DefaultLayout from "@/components/layouts/DefaultLayout";
import { CREATE_QUIZ_ROUTE, VIEW_QUIZZES_ROUTE } from "@/constants/routes";
import { NextPage } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Link from "next/link";

const Main: NextPage = () => {
  const { t } = useTranslation();

  return (
    <DefaultLayout>
      <main className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-4xl font-bold">{t("header")}</h1>
        <div className="flex mt-10">
          <div className="m-2">
            <Link href={VIEW_QUIZZES_ROUTE} legacyBehavior>
              <a
                className="text-lg bg-green-500 hover:bg-green-700 text-white font-bold py-4 px-8 rounded focus:outline-none focus:shadow-outline text-center"
                style={{ display: "inline-block", minWidth: "250px" }}
              >
                {t("common:savedExams")}
              </a>
            </Link>
          </div>
          <div className="m-2">
            <Link href={CREATE_QUIZ_ROUTE} legacyBehavior>
              <a
                className="text-lg bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded focus:outline-none focus:shadow-outline text-center"
                style={{ display: "inline-block", minWidth: "250px" }}
              >
                {t("common:newExam")}
              </a>
            </Link>
          </div>
        </div>
      </main>
    </DefaultLayout>
  );
};

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ["common"])),
  },
});

export default Main;
