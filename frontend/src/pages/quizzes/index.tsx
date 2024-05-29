import React, { useEffect, useState } from "react";
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
import ConfirmationDialog from "@/components/Dialogs/DeleteConfirmationDialog";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import {
  useDeleteQuiz,
  useGetQuizzes,
  useGetSubjects,
} from "@/util/api/quizzes";
import useSnackbarStore from "@/util/store/snackbar";
import { useDebounce } from "@uidotdev/usehooks";

const SavedQuizzes = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const showSnackbar = useSnackbarStore((state) => state.showSnackbar);

  const [searchText, setSearchText] = useState("");
  const [selectedSubject, setSelectedSubject] = useState({
    id: "",
    title: "",
  });
  const debouncedSearchText = useDebounce(searchText, 300);
  const debouncedSubjectId = useDebounce(selectedSubject.id, 300);

  const { data: subjects } = useGetSubjects();
  const [deleteQuiz] = useDeleteQuiz();

  const { data: quizzes, refetch } = useGetQuizzes({
    title: searchText,
    subjectId: selectedSubject.id,
  });

  useEffect(() => {
    refetch({
      title: debouncedSearchText,
      subjectId: debouncedSubjectId,
    });
  }, [debouncedSearchText, debouncedSubjectId]);

  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);

  const handleShowDeleteConfirmation = (quizId: string) => {
    setShowConfirmationDialog(true);
    router.push(`/quizzes/?quizId=${quizId}`, undefined, { shallow: true });
  };

  const handleHideDeleteConfirmation = () => {
    router.push("/quizzes/", undefined, { shallow: true });
    setShowConfirmationDialog(false);
  };

  // Function to handle deleting the quiz
  const handleDeleteQuiz = async (quizId: string) => {
    try {
      await deleteQuiz(quizId);
      showSnackbar(t("common:quizDeleted"), "success");
      refetch();
    } catch (error) {
      console.error("Error deleting quiz", error);
      showSnackbar(t("common:serverError"), "error");
    } finally {
      handleHideDeleteConfirmation();
    }
  };

  return (
    <DefaultLayout>
      <Box sx={{ flexGrow: 1, padding: 3, mt: 10 }}>
        <Typography variant="h4" gutterBottom>
          {t("common:savedQuizzes")}
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
              value={selectedSubject.id}
              onChange={(e) => {
                const selectedSubject = subjects.find(
                  (s) => s.id === e.target.value
                );

                setSelectedSubject(
                  selectedSubject || {
                    id: "all",
                    title: t("common:all"),
                  }
                );
              }}
              fullWidth
            >
              <MenuItem value="all">
                <em>{t("common:all")}</em>
              </MenuItem>
              {subjects.map((subject) => (
                <MenuItem key={subject.id} value={subject.id}>
                  {subject.title}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
        <Grid container spacing={3}>
          {quizzes && quizzes.length === 0 && (
            <Grid item xs={12}>
              <Typography padding={1} variant="h6">
                {t("common:noQuizzesFound")}
              </Typography>
            </Grid>
          )}
          {quizzes.map((quiz) => (
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
                    {t("common:subject")}: {quiz.subject_title}
                  </Typography>
                  <Typography variant="body2">
                    {t("common:quizNumberOfQuestions")}:{" "}
                    {quiz.number_of_questions}
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
                      handleShowDeleteConfirmation(quiz.id);
                    }}
                  >
                    {t("common:delete")}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
      <ConfirmationDialog
        open={showConfirmationDialog}
        onCancel={() => handleHideDeleteConfirmation()}
        onConfirm={async () => {
          await handleDeleteQuiz(router.query.quizId as string);
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
