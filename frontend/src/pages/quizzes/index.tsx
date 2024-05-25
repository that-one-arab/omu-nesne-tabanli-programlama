import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Grid,
  TextField,
  MenuItem,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import { useRouter } from "next/router";
import ConfirmationDialog from "@/components/Dialogs/ConfirmationDialog";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";

const savedQuizzes = [
  {
    id: 1,
    title: "Capitals of the World",
    subject: "Geography",
    numQuestions: 10,
  },
  { id: 2, title: "Math Basics", subject: "Mathematics", numQuestions: 5 },
  // Add more quizzes as needed
];

const SavedQuizzes = () => {
  const router = useRouter();
  const { t } = useTranslation();

  const [searchText, setSearchText] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);

  // Mock subjects for the dropdown filter
  const subjects = ["All", "Geography", "Mathematics"];

  // Function to handle deleting the quiz
  const handleDeleteQuiz = () => {
    console.log("Quiz deleted!");
  };

  return (
    <DefaultLayout>
      <Box sx={{ flexGrow: 1, padding: 3, mt: 10 }}>
        <Typography variant="h4" gutterBottom>
          Saved Quizzes
        </Typography>
        <Grid container sx={{ marginBottom: 3 }} spacing={1}>
          <Grid item xs={9}>
            <TextField
              label={t("common:searchQuiz")}
              variant="outlined"
              fullWidth
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              label={t("common:subject")}
              select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              fullWidth
            >
              {subjects.map((subject) => (
                <MenuItem key={subject} value={subject}>
                  {subject}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
        <Grid container spacing={3}>
          {savedQuizzes.map((quiz) => (
            <Grid item xs={12} sm={6} md={3} key={quiz.id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  cursor: "pointer",
                }}
                onClick={() => router.push(`/quizzes/${quiz.id}`)}
              >
                <CardContent>
                  <Typography variant="h5" component="div">
                    {quiz.title}
                  </Typography>
                  <Typography sx={{ mb: 1.5 }} color="text.secondary">
                    Subject: {quiz.subject}
                  </Typography>
                  <Typography variant="body2">
                    Number of Questions: {quiz.numQuestions}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    sx={{
                      zIndex: 1,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowConfirmationDialog(true);
                    }}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
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

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ["common"])),
  },
});

export default SavedQuizzes;
