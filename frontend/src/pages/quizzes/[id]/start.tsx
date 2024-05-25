import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Box,
  Stack,
  IconButton,
  ButtonPropsColorOverrides,
} from "@mui/material";
import { OverridableStringUnion } from "@mui/types";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosNewIcon from "@mui/icons-material/ArrowForwardIos";
import MUIButton from "@/components/MUIButton";
import { Question } from "@/components/QuizQuestionPreview";
import { useTranslation } from "next-i18next";
import MessageDialog from "@/components/Dialogs/MessageDialog";
import LoadingDialog from "@/components/Dialogs/LoadingDialog";

interface QuizQuestion extends Question {
  selectedChoice: {
    id: string;
  };
}

const QUESTIONS: Question[] = [
  {
    id: "1",
    title: "What is the capital of France?",
    choices: [
      {
        id: "1",
        title: "Paris",
      },
      {
        id: "2",
        title: "London",
      },
      {
        id: "3",
        title: "Berlin",
      },
      {
        id: "4",
        title: "Madrid",
      },
    ],
    correctChoice: {
      id: "1",
      title: "Paris",
    },
  },
  {
    id: "2",
    title: "What is the capital of Germany?",
    choices: [
      {
        id: "1",
        title: "Paris",
      },
      {
        id: "2",
        title: "London",
      },
      {
        id: "3",
        title: "Berlin",
      },
      {
        id: "4",
        title: "Madrid",
      },
    ],
    correctChoice: {
      id: "3",
      title: "Berlin",
    },
  },
  {
    id: "3",
    title: "What is the capital of Turkey?",
    choices: [
      {
        id: "1",
        title: "Paris",
      },
      {
        id: "2",
        title: "London",
      },
      {
        id: "3",
        title: "Ankara",
      },
      {
        id: "4",
        title: "Madrid",
      },
    ],
    correctChoice: {
      id: "3",
      title: "Ankara",
    },
  },
];

const CARD_WIDTH = 1000;

const maxButtonsPerPage = 30;

const StartExam = () => {
  const { t } = useTranslation();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [questions, setQuestions] = useState<QuizQuestion[]>(
    QUESTIONS.map((question) => ({
      ...question,
      selectedChoice: {
        id: "",
        title: "",
      },
    }))
  );

  // State and functions as before
  const [page, setPage] = useState(0);
  const [messageDialog, setMessageDialog] = useState({
    open: false,
    message: "",
  });
  const [loadingDialog, setLoadingDialog] = useState({
    open: false,
    message: "",
  });

  const totalPages = Math.ceil(questions.length / maxButtonsPerPage);

  const nextPage = () => {
    setPage((current) => Math.min(current + 1, totalPages - 1));
  };

  const prevPage = () => {
    setPage((current) => Math.max(current - 1, 0));
  };

  const displayedQuestions = questions.slice(
    page * maxButtonsPerPage,
    (page + 1) * maxButtonsPerPage
  );

  const handleAnswerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestionIndex].selectedChoice = {
      id: event.target.value,
    };
    setQuestions(updatedQuestions);
  };

  const nextQuestion = () => {
    setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
  };

  const prevQuestion = () => {
    setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
  };

  const submitExam = () => {
    console.log("Submitted answers:", questions);
    if (!didAnswerAllQuestions) {
      setMessageDialog({
        open: true,
        message: t(
          "common:cannotSubmitPleaseAnswerAllQuestionsBeforeSubmitting"
        ),
      });

      return;
    }

    setLoadingDialog({
      open: true,
      message: t("submittingExam"),
    });

    // SUBMIT

    setLoadingDialog({
      open: false,
      message: "",
    });
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const didAnswerAllQuestions = questions.every(
    (question) => question.selectedChoice.id
  );

  return (
    <DefaultLayout>
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mb: 4,
          }}
        >
          <IconButton onClick={prevPage} disabled={page === 0}>
            <ArrowBackIosNewIcon />
          </IconButton>
          <Stack
            direction="row"
            flexWrap="wrap"
            justifyContent="flex-start"
            sx={{ maxWidth: CARD_WIDTH - 50 }}
          >
            {displayedQuestions.map((_, index) => (
              <MUIButton
                key={index + page * maxButtonsPerPage}
                variant={
                  index === currentQuestionIndex ? "contained" : "outlined"
                }
                color={
                  questions[index].selectedChoice.id ? "success" : "primary"
                }
                onClick={() => goToQuestion(index + page * maxButtonsPerPage)}
                sx={{
                  minWidth: "36px",
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  padding: "0",
                  fontSize: "0.75rem",
                  margin: "0.25rem 0.5rem",
                }}
              >
                {index + 1 + page * maxButtonsPerPage}
              </MUIButton>
            ))}
          </Stack>
          <IconButton onClick={nextPage} disabled={page >= totalPages - 1}>
            <ArrowForwardIosNewIcon />
          </IconButton>
        </Box>
        <Card sx={{ mb: 5, width: `${CARD_WIDTH}px` }}>
          <CardContent>
            <Typography variant="h5" sx={{ mb: 2 }}>
              {questions[currentQuestionIndex].title}
            </Typography>
            <FormControl>
              <FormLabel>{t("common:choices")}</FormLabel>
              <RadioGroup
                name="quiz-choices"
                value={questions[currentQuestionIndex].selectedChoice.id}
                onChange={handleAnswerChange}
              >
                {questions[currentQuestionIndex].choices.map((choice) => (
                  <FormControlLabel
                    key={choice.id}
                    value={choice.id}
                    control={<Radio />}
                    label={choice.title}
                  />
                ))}
              </RadioGroup>
            </FormControl>
            <Box
              sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}
            >
              <MUIButton
                variant="outlined"
                onClick={prevQuestion}
                disabled={currentQuestionIndex === 0}
              >
                {t("common:previous")}
              </MUIButton>
              {currentQuestionIndex === questions.length - 1 ? (
                <MUIButton
                  variant="contained"
                  color="primary"
                  onClick={submitExam}
                >
                  {t("common:submit")}
                </MUIButton>
              ) : (
                <MUIButton variant="contained" onClick={nextQuestion}>
                  {t("common:next")}
                </MUIButton>
              )}
            </Box>
          </CardContent>
        </Card>
      </div>
      <MessageDialog
        open={messageDialog.open}
        message={messageDialog.message}
        onClose={() => setMessageDialog({ open: false, message: "" })}
      />
      <LoadingDialog
        open={loadingDialog.open}
        message={loadingDialog.message}
      />
    </DefaultLayout>
  );
};

export const getServerSideProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ["common"])),
  },
});

export default StartExam;
