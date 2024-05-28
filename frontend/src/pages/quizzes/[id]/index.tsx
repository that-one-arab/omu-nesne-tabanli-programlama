import React, { useState } from "react";
import cookie from "cookie";
import QuizQuestionPreview from "@/components/QuizQuestionPreview";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import DeleteConfirmationDialog from "@/components/Dialogs/DeleteConfirmationDialog";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { GetServerSidePropsContext } from "next";
import { GetQuizResponse } from "@/util/types";
import { transformQuiz } from "@/util/data_transformation";
import { getQuizServerSide, useDeleteQuiz } from "@/util/api/quizzes";
import useSnackbarStore from "@/util/store/snackbar";

interface Props {
  data: GetQuizResponse;
}

const QuizOverview = ({ data }: Props) => {
  const { t } = useTranslation();
  const router = useRouter();
  const showSnackbar = useSnackbarStore((state) => state.showSnackbar);

  const { id, hideQuestions, hideCorrectAnswers, disableDelete } = router.query;

  const shouldHideQuestions = hideQuestions === "true";
  const shouldDisableDelete = disableDelete === "true";
  const shouldHideCorrectAnswers = hideCorrectAnswers === "true";

  const [deleteQuiz] = useDeleteQuiz();

  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);

  const quiz = transformQuiz(data);

  // Function to handle starting the quiz
  const handleStartQuiz = () => {
    router.push(`/quizzes/${id}/start`);
  };

  // Function to handle deleting the quiz
  const handleDeleteQuiz = async () => {
    try {
      await deleteQuiz(quiz.id);
      showSnackbar(t("common:quizDeleted"), "success");
      router.push("/quizzes");
    } catch (error) {
      console.error("Failed to delete quiz", error);
      showSnackbar(t("common:serverError"), "error");
    }
  };

  return (
    <DefaultLayout>
      <div className="container mx-auto p-6">
        <div className="flex flex-wrap md:flex-nowrap justify-between items-center mb-6 mt-8">
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {quiz.subject_title}
            </h2>
            <h1 className="text-3xl font-bold text-gray-900">{quiz.title}</h1>
            <div>
              <div className="flex space-x-4 mt-8 place-content-between">
                <p className="text-md text-gray-800">
                  {t("common:percentage")}:
                </p>
                <p className="text-md text-gray-800">
                  {quiz.success_percentage} %
                </p>
              </div>
              <div className="flex space-x-4 mt-3 place-content-between">
                <p className="text-md text-gray-800">{t("common:duration")}:</p>
                <p className="text-md text-gray-800">
                  {quiz.duration / 60} minutes
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-4 md:mt-0">
            <button
              className="px-5 py-3 bg-blue-500 text-white rounded hover:bg-blue-700 transition duration-300"
              onClick={handleStartQuiz}
            >
              {t("common:startQuiz")}
            </button>
            {!shouldDisableDelete && (
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
        <div className="space-y-4">
          <h1 className="text-xl font-bold text-gray-800 mb-2 mt-20">
            {t("common:questions")} ({quiz.questions.length})
          </h1>
          {!shouldHideQuestions &&
            quiz.questions.map((item, index) => (
              <QuizQuestionPreview
                key={index}
                question={item}
                hideCorrectAnswer={shouldHideCorrectAnswers}
              />
            ))}
        </div>
      </div>
      <DeleteConfirmationDialog
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

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const locale = context.locale as string;
  const quizId = context.params?.id as string;

  const { req } = context;

  // Parse the cookies from the request
  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies.token;

  const quiz = await getQuizServerSide(quizId, token);

  if ("notFound" in quiz && quiz.notFound) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
      data: quiz,
    },
  };
};

export default QuizOverview;
