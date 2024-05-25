import React from "react";
import { Box, Typography, Container } from "@mui/material";
import FinishedQuizQuestionPreview from "@/components/FinishedQuizQuestionPreview";
import MUIButton from "@/components/MUIButton";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

const questions = [
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
    selectedChoice: { id: "1", title: "Paris" },
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
    selectedChoice: { id: "3", title: "Berlin" },
  },

  // Add more questions as needed
];

const ResultsPage = () => {
  const router = useRouter();
  const { t } = useTranslation();

  const calculateScore = () => {
    let score = 0;
    questions.forEach((question, index) => {
      if (question.correctChoice.id === question.selectedChoice.id) {
        score += 1;
      }
    });
    return score;
  };

  const score = calculateScore();
  const passThreshold = 0.6; // 60%
  const passed = score / questions.length >= passThreshold;

  return (
    <Container maxWidth="md">
      <Box mt={5} mb={5} textAlign="center">
        <Typography variant="h3" gutterBottom sx={{ fontWeight: "bold" }}>
          {passed
            ? `${t("common:congratulationsYou")} `
            : `${t("common:sorryYou")} `}
          <b style={{ color: passed ? "green" : "red" }}>
            {passed ? `${t("common:passed")}!` : `${t("common:failed")}`}
          </b>
        </Typography>
        <Box display="flex" justifyContent="space-around">
          <Typography variant="h6">
            Score:{" "}
            <b style={{ color: passed ? "green" : "red" }}>
              {score} / {questions.length}
            </b>
          </Typography>
          <Typography variant="h6">
            {t("common:percentage")}:{" "}
            <b style={{ color: passed ? "green" : "red" }}>40%</b>{" "}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          height: "60vh", // Set a fixed height
          overflowY: "scroll", // Enable vertical scrolling
          "&::-webkit-scrollbar": {
            width: "10px",
          },
          "&::-webkit-scrollbar-track": {
            boxShadow: "inset 0 0 5px grey",
            borderRadius: "10px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "linear-gradient(45deg, #bebebe 30%, #878585 90%);", // Fancy scrollbar color
            borderRadius: "10px",
          },
          padding: "30px",
          borderRadius: "10px", // Rounded corners for the container
          border: "1px solid #ccc", // Subtle border for the container
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)", // Soft shadow for depth
          mb: 2, // Margin bottom for spacing
        }}
      >
        {questions.map((question, index) => (
          <FinishedQuizQuestionPreview question={question} key={question.id} />
        ))}
      </Box>

      <Box display="flex" justifyContent="flex-end">
        <MUIButton
          variant="contained"
          color="primary"
          sx={{
            mt: 3,
            bgcolor: "secondary.main",
            "&:hover": {
              bgcolor: "secondary.dark",
            },
            padding: "10px 30px",
            borderRadius: "20px",
            boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
            textTransform: "none",
            fontSize: "1rem",
          }}
          onClick={() => {
            // Navigate to home page or perform another action
            router.push("/");
          }}
        >
          {t("common:backToHome")}
        </MUIButton>
      </Box>
    </Container>
  );
};

export const getServerSideProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ["common"])),
  },
});

export default ResultsPage;
