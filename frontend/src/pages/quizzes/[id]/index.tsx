import React from "react";
import QuizQuestionPreview, {
  Question,
} from "@/components/QuizQuestionPreview";
import DefaultLayout from "@/components/DefaultLayout";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import ConfirmationDialog from "@/components/Dialogs/ConfirmationDialog";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";

const questions: Question[] = [
  {
    id: "1",
    title: "What is the capital of France?",
    choices: [
      { id: "1", title: "Paris" },
      { id: "2", title: "London" },
      { id: "3", title: "Berlin" },
      { id: "4", title: "Madrid" },
    ],
    correctChoice: { id: "1", title: "Paris" },
  },
  {
    id: "2",
    title: "What is the capital of Germany?",
    choices: [
      { id: "1", title: "Paris" },
      { id: "2", title: "London" },
      { id: "3", title: "Berlin" },
      { id: "4", title: "Madrid" },
    ],
    correctChoice: { id: "3", title: "Berlin" },
  },
];

const QuizOverview = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { id, hideQuestions } = router.query;

  // Typically means the user just created the quiz
  const shouldHideQuestions = hideQuestions === "true";

  const [showConfirmationDialog, setShowConfirmationDialog] =
    React.useState(false);

  // Function to handle starting the quiz
  const handleStartQuiz = () => {
    router.push(`/quizzes/${id}/start`);
  };

  // Function to handle deleting the quiz
  const handleDeleteQuiz = () => {
    console.log("Quiz deleted!");
  };

  return (
    <DefaultLayout>
      <div className="container mx-auto p-6">
        <div className="flex flex-wrap md:flex-nowrap justify-between items-center mb-6 mt-8">
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Subject Title
            </h2>
            <h1 className="text-3xl font-bold text-gray-900">Quiz Title</h1>
            <p className="text-md text-gray-800 mb-2 mt-8">
              {t("common:percentage")}: 50%
            </p>
          </div>
          <div className="flex justify-end space-x-2 mt-4 md:mt-0">
            <button
              className="px-5 py-3 bg-blue-500 text-white rounded hover:bg-blue-700 transition duration-300"
              onClick={handleStartQuiz}
            >
              {t("common:startQuiz")}
            </button>
            {!shouldHideQuestions && (
              // We do not want the user to delete a quiz they just created
              <button
                className="px-5 py-3 bg-red-500 text-white rounded hover:bg-red-700 transition duration-300"
                onClick={() => setShowConfirmationDialog(true)}
              >
                {t("common:deleteQuiz")}
              </button>
            )}
          </div>
        </div>
        <div className="mb-8 mt-20">
          <p className="text-gray-600">
            Quiz description goes here. This is a detailed explanation of the
            quiz. It can span multiple lines and gives the user an idea of what
            to expect from the quiz.
          </p>
        </div>
        {!shouldHideQuestions && (
          <div className="space-y-4">
            <h1 className="text-xl font-bold text-gray-800 mb-2 mt-20">
              {t("common:questions")} ({questions.length})
            </h1>
            {questions.map((item, index) => (
              <QuizQuestionPreview key={index} question={item} />
            ))}
          </div>
        )}
      </div>
      <ConfirmationDialog
        open={showConfirmationDialog}
        onCancel={() => setShowConfirmationDialog(false)}
        onConfirm={() => {
          setShowConfirmationDialog(false);
          handleDeleteQuiz();
        }}
      />
    </DefaultLayout>
  );
};

export const getServerSideProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ["common"])),
  },
});

export default QuizOverview;
