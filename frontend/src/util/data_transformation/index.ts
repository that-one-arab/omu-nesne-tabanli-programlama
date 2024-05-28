import { Question } from "@/components/QuizQuestionPreview";
import { GetQuizResponse } from "@/util/types";

export function transformQuiz(quiz: GetQuizResponse) {
  const questions: Question[] = quiz.questions.map((q) => {
    const correctChoice = q.answers.find((a) => a.is_correct);
    if (!correctChoice) {
      throw new Error("No correct answer found");
    }

    return {
      id: q.id.toString(),
      title: q.title,
      choices: q.answers.map((a) => {
        return {
          id: a.id.toString(),
          title: a.title,
        };
      }),
      correctChoice: {
        id: correctChoice.id.toString(),
        title: correctChoice.title,
      },
    };
  });

  return {
    id: quiz.id.toString(),
    title: quiz.title,
    subject_id: quiz.subject_id.toString(),
    subject_title: quiz.subject_title,
    description: quiz.description,
    duration: quiz.duration,
    success_percentage: quiz.success_percentage,
    questions,
  };
}
