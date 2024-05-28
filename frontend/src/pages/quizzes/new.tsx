import DefaultLayout from "@/components/layouts/DefaultLayout";
import LoadingDialog from "@/components/Dialogs/LoadingDialog";
import SearchableDropdown from "@/components/SearchableDropdown";
import { NextPage } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useGetSubjects, useHandleCreateQuiz } from "@/util/api/quizzes";
import { useState } from "react";
import useSnackbarStore from "@/util/store/snackbar";
import MessageDialog from "@/components/Dialogs/MessageDialog";
import { useRouter } from "next/router";

const CreateExam: NextPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const showSnackbar = useSnackbarStore((state) => state.showSnackbar);

  const { data: subjects, error: subjectsError } = useGetSubjects("");

  const [subject, setSubject] = useState({ id: "", title: "" });
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDuration, setQuizDuration] = useState("");
  const [quizNumberOfQuestions, setQuizNumberOfQuestions] = useState("");
  const [quizPercentage, setQuizPercentage] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);

  const [messageDialog, setMessageDialog] = useState({
    title: "",
    open: false,
    message: "",
  });

  const [handleCreateQuiz, { data, loading }] = useHandleCreateQuiz();

  const handleSubmit = async () => {
    try {
      const response = await handleCreateQuiz({
        subject,
        title: quizTitle,
        duration: parseInt(quizDuration),
        numberOfQuestions: parseInt(quizNumberOfQuestions),
        percentage: parseInt(quizPercentage),
        description: quizDescription,
        files,
      });
      if (!response.quiz_id) {
        // User material is too short for the number of questions requested
        if (response.details.response_code === "too-short") {
          setMessageDialog({
            open: true,
            title: t("common:materialTooShort"),
            message: t("common:materialTooShortSubtitle"),
          });

          return;
        }
        showSnackbar(t("common:serverError"), "error");
        return;
      }

      if (
        response.details.response_message.includes(
          "questions could not be generated"
        )
      ) {
        const ungeneratedQuestions = parseInt(
          response.details.response_message.split(" ")[0]
        );

        setMessageDialog({
          open: true,
          title: t("common:quizCreatedSuccessfully"),
          message: t("common:couldNotGenerateXQuestions", {
            count: ungeneratedQuestions,
          }),
        });
      } else {
        router.push(
          `/quizzes/${response.quiz_id}?hideQuestions=true&disableDelete=true`
        );
      }
    } catch (error) {
      showSnackbar(t("common:serverError"), "error");
    }
  };

  if (subjectsError) {
    return (
      <DefaultLayout>
        <main className="flex flex-col items-center justify-center min-h-screen p-4">
          <h1 className="text-4xl font-bold">{t("header")}</h1>
          <p className="text-xl text-gray-600 mt-4">{t("subtitle")}</p>
          <div className="mt-8 w-full max-w-md">
            <p className="text-red-500">{subjectsError}</p>
          </div>
        </main>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <main className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-4xl font-bold">{t("header")}</h1>
        <p className="text-xl text-gray-600 mt-4">{t("subtitle")}</p>
        <div className="mt-8 w-full max-w-lg">
          {/* Subject Title Field */}
          <div className="mb-4">
            <label
              htmlFor="subjectTitle"
              className="block text-sm font-medium text-gray-700"
            >
              {t("common:subjectTitle")}
            </label>
            <SearchableDropdown
              id="subjectTitle"
              placeholder={t("common:subjectTitlePlaceholder")}
              options={subjects.map((subject) => ({
                id: subject.id,
                label: subject.title,
                value: subject.id,
              }))}
              onChange={(option) => {
                setSubject({
                  id: option.value,
                  title: option.label,
                });
              }}
              onTextFieldChange={(value: string) => {
                setSubject({ id: "", title: value });
              }}
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
              onChange={(e) => setQuizTitle(e.target.value)}
            />
          </div>

          {/* Quiz Duration Field */}
          <div className="mb-4">
            <label
              htmlFor="quizDuration"
              className="block text-sm font-medium text-gray-700"
            >
              {t("common:quizDuration")}
            </label>
            <input
              type="number"
              id="quizDuration"
              name="quizDuration"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm focus:outline-none"
              placeholder={t("common:quizDurationPlaceholder")}
              onChange={(e) => setQuizDuration(e.target.value)}
            />
          </div>

          {/* Quiz Number Of Questions Field */}
          <div className="mb-4">
            <label
              htmlFor="quizNumberOfQuestions"
              className="block text-sm font-medium text-gray-700"
            >
              {t("common:quizNumberOfQuestions")}
            </label>
            <input
              type="number"
              id="quizNumberOfQuestions"
              name="quizNumberOfQuestions"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm focus:outline-none"
              placeholder={t("common:quizNumberOfQuestionsPlaceholder")}
              onChange={(e) => setQuizNumberOfQuestions(e.target.value)}
            />
          </div>

          {/* Quiz Percentage Field */}
          <div className="mb-4">
            <label
              htmlFor="quizPercentage"
              className="block text-sm font-medium text-gray-700"
            >
              {t("common:quizPercentage")}
            </label>
            <input
              type="number"
              id="quizPercentage"
              name="quizPercentage"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm focus:outline-none"
              placeholder={t("common:quizPercentagePlaceholder")}
              max={100}
              min={1}
              onChange={(e) => setQuizPercentage(e.target.value)}
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
              onChange={(e) => setQuizDescription(e.target.value)}
            ></textarea>
          </div>

          {/* File Input Field */}
          <label className="block">
            <input
              type="file"
              multiple
              accept=".pdf,.md"
              className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-primary file:text-white
              hover:file:bg-primary-dark
            "
              onChange={(e) => setFiles(e.target.files)}
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
              onClick={handleSubmit}
            >
              {t("common:submit")}
            </button>
          </div>
        </div>
      </main>
      <LoadingDialog open={loading} message={t("common:creatingQuiz")} />
      <MessageDialog
        open={messageDialog.open}
        title={messageDialog.title}
        message={messageDialog.message}
        onClose={() => {
          setMessageDialog({
            open: false,
            title: "",
            message: "",
          });
          if (data && data.quiz_id) {
            router.push(
              `/quizzes/${
                data && data.quiz_id
              }?hideQuestions=true&disableDelete=true`
            );
          }
        }}
      />
    </DefaultLayout>
  );
};

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ["common"])),
  },
});

export default CreateExam;
