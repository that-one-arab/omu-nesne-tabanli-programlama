import DefaultLayout from "@/components/DefaultLayout";
import LoadingDialog from "@/components/Dialogs/LoadingDialog";
import SearchableDropdown from "@/components/SearchableDropdown";
import { Alert, Snackbar } from "@mui/material";
import { NextPage } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useState } from "react";

const CreateExam: NextPage = () => {
  const { t } = useTranslation();
  const [snackbar, setSnackbar] = useState({
    open: true,
    message: "",
  });

  const handleSubmit = () => {};

  return (
    <DefaultLayout>
      <main className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-4xl font-bold">{t("header")}</h1>
        <p className="text-xl text-gray-600 mt-4">{t("subtitle")}</p>
        <div className="mt-8 w-full max-w-md">
          {/* Subject Title Field */}
          <div className="mb-4">
            <label
              htmlFor="subjectTitle"
              className="block text-sm font-medium text-gray-700"
            >
              {t("common:subjectTitle")}
            </label>
            <SearchableDropdown
              placeholder={t("common:subjectTitlePlaceholder")}
              options={[
                {
                  id: "math",
                  label: "Math",
                  value: "Math",
                },
                {
                  id: "science",
                  label: "Science",
                  value: "Science",
                },
                {
                  id: "english",
                  label: "English",
                  value: "English",
                },
              ]}
              onChange={(option) => console.info("option: ", option)}
            />
          </div>

          {/* Quiz Title Field */}
          <div className="mb-4">
            <label
              htmlFor="quizTitle"
              className="block text-sm font-medium text-gray-700"
            >
              {t("common:quizTitle")}
            </label>
            <input
              type="text"
              id="quizTitle"
              name="quizTitle"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm focus:outline-none"
              placeholder={t("common:quizTitlePlaceholder")}
            />
          </div>

          {/* Quiz Percentage Field */}
          <div className="mb-4">
            <label
              htmlFor="quizTitle"
              className="block text-sm font-medium text-gray-700"
            >
              {t("common:quizPercentage")}
            </label>
            <input
              type="number"
              id="quizTitle"
              name="quizTitle"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm focus:outline-none"
              placeholder={t("common:quizPercentagePlaceholder")}
              max={100}
              min={1}
            />
          </div>

          {/* Quiz Description Field */}
          <div className="mb-4">
            <label
              htmlFor="quizDescription"
              className="block text-sm font-medium text-gray-700"
            >
              {t("common:quizDescription")}
            </label>
            <textarea
              id="quizDescription"
              name="quizDescription"
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm focus:outline-none"
              placeholder={t("common:quizDescriptionPlaceholder")}
            ></textarea>
          </div>

          {/* File Input Field */}
          <label className="block">
            <input
              type="file"
              multiple
              className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-primary file:text-white
              hover:file:bg-primary-dark
            "
            />
          </label>
          <div className="flex justify-end w-full mt-4">
            <button
              type="button"
              className="mt-4 block text-sm font-semibold py-2 px-4
             rounded-full border-0
             text-white bg-accent
             hover:bg-primary-dark
             focus:outline-none focus:ring-2 focus:ring-primary-dark focus:ring-opacity-50"
            >
              {t("common:submit")}
            </button>
          </div>
        </div>
      </main>
      <LoadingDialog open={false} message={t("common:creatingQuiz")} />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity="error"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DefaultLayout>
  );
};

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ["common"])),
  },
});

export default CreateExam;
