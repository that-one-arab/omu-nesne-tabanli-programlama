import { PUBLIC_API_URL, customFetch } from "@/util";
import { useCallback, useEffect, useState } from "react";
import { GetQuizResponse } from "@/util/types";
import { QuizQuestion } from "@/pages/quizzes/[id]/start";

interface ISubjectsApiResponse {
  data: {
    id: string;
    title: string;
  }[];
  error?: string;
}

export function useGetSubjects(title?: string): ISubjectsApiResponse {
  const [subjects, setSubjects] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        let query = "/quizzing/subjects";
        if (title) {
          query += `?search_query=${title}`;
        }
        const response = await customFetch(query);
        if (!response.ok) {
          return null;
        }
        const data = await response.json();

        if (!data) {
          setError("An error occurred while fetching subjects");
        }

        setSubjects(
          data.map((subject: { id: number; title: string }) => ({
            id: subject.id,
            title: subject.title,
          }))
        );
      } catch (error: any) {
        setError(error.message);
      }
    })();
  }, [title]);

  return { data: subjects, error };
}

export function useCreateOrGetSubject() {
  async function handleCreateOrGetSubject(
    title: string
  ): Promise<{ id: string; title: string }> {
    const getSubjectResponse = await customFetch(
      `/quizzing/subjects?search_query=${title}`,
      {},
      true
    );

    if (!getSubjectResponse.ok) {
      throw new Error("Failed to fetch subjects");
    }

    const getSubjectData = await getSubjectResponse.json();

    if (getSubjectData.length) {
      const subject = getSubjectData.find(
        (subject: { id: string; title: string }) => subject.title === title
      );
      if (subject)
        return {
          id: subject.id,
          title: subject.title,
        };
    }

    // Else we create a new subject

    const response = await customFetch(
      "/quizzing/subjects",
      {
        method: "POST",
        body: JSON.stringify({ title }),
      },
      true
    );

    if (!response.ok) {
      throw new Error("Failed to create subject");
    }

    const data = await response.json();

    return {
      id: data.subject_id,
      title,
    };
  }

  return [handleCreateOrGetSubject];
}

export function useGetQuizzes(initialVariables?: {
  title?: string;
  subjectId?: string;
}): {
  data: {
    id: string;
    title: string;
    subject_id: string;
    subject_title: string;
    number_of_questions: number;
    description: string;
  }[];
  error: null | string;
  loading: boolean;
  refetch: (variables?: { title?: string; subjectId?: string }) => void;
} {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [variables, setVariables] = useState(initialVariables);

  const fetchQuizzes = useCallback(
    async (fetchVariables?: { title?: string; subjectId?: string }) => {
      setLoading(true);
      try {
        let query = "/quizzing/quizzes";
        const vars = fetchVariables || variables;

        if (vars?.subjectId === "all") vars.subjectId = "";

        if (vars?.title) {
          query += `?search_query=${vars.title}`;
        } else if (vars?.subjectId) {
          query += `?subject_id=${vars.subjectId}`;
        } else if (vars?.title && vars?.subjectId) {
          query += `?search_query=${vars.title}&subject_id=${vars.subjectId}`;
        }

        const response = await customFetch(query);

        if (!response.ok) {
          throw new Error("Failed to fetch quizzes");
        }

        const data = await response.json();
        setData(data);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  const refetch = (newVariables?: { title?: string; subjectId?: string }) => {
    setVariables(newVariables);
    fetchQuizzes(newVariables);
  };

  return { data, error, loading, refetch };
}

interface ICreateQuizParams {
  subject: { id: string; title: string };
  title: string;
  duration: number;
  numberOfQuestions: number;
  percentage: number;
  description: string;
  files: FileList | null;
}

export function useHandleCreateQuiz(): [
  (params: ICreateQuizParams) => Promise<{ taskId: string | null }>,
  { data: { taskId: string | null } | null; loading: boolean }
] {
  const [data, setData] = useState<{ taskId: string | null }>({ taskId: null });
  const [loading, setLoading] = useState(false);

  const [createOrGetSubject] = useCreateOrGetSubject();

  async function createQuiz(params: ICreateQuizParams): Promise<string> {
    const {
      subject,
      title,
      duration,
      numberOfQuestions,
      percentage,
      description,
      files,
    } = params;

    if (!subject.id) {
      const fetchedSubject = await createOrGetSubject(subject.title);
      subject.id = fetchedSubject.id;
    }

    const formData = new FormData();

    formData.append("subject_id", subject.id);
    formData.append("title", title);
    formData.append("duration", (duration * 60).toString());
    formData.append("number_of_questions", numberOfQuestions.toString());
    formData.append("success_percentage", percentage.toString());
    formData.append("description", description);

    if (files) {
      for (let i = 0; i < files.length; i++) {
        formData.append("file", files[i]);
      }
    }
    try {
      const response = await customFetch(
        "/quizzing/quizzes",
        {
          method: "POST",
          body: formData,
        },
        true,
        true
      );

      if (!response.ok) {
        throw new Error("Failed to create quiz");
      }

      const data = await response.json();

      return data.task_id;
    } catch (error: any) {
      throw new Error(error);
    }
  }

  async function handleCreateQuiz(
    params: ICreateQuizParams
  ): Promise<{ taskId: string | null }> {
    setLoading(true);
    try {
      const quizTaskId = await createQuiz(params);
      setData({ taskId: quizTaskId });
      return { taskId: quizTaskId };
    } catch (error: any) {
      throw new Error(error);
    } finally {
      setLoading(false);
    }
  }

  return [handleCreateQuiz, { data, loading }];
}

export function useDeleteQuiz() {
  async function handleDeleteQuiz(quizId: string) {
    const response = await customFetch(`/quizzing/quizzes/${quizId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete quiz");
    }

    return response;
  }

  return [handleDeleteQuiz];
}

export function useCreateQuizAttempt() {
  async function createQuizAttempt(quizId: string, questions: QuizQuestion[]) {
    const response = await customFetch(`/quizzing/quizzes/${quizId}/attempt`, {
      method: "POST",
      body: JSON.stringify({
        answered_questions: questions.map((q) => ({
          question_id: q.id,
          choice_id: q?.selectedChoice?.id,
        })),
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create quiz attempt");
    }

    const data = await response.json();

    return {
      message: data.message as string,
      id: data.attempt_id as string,
    };
  }

  return [createQuizAttempt];
}

export async function getQuizServerSide(
  quizId: string,
  token: string
): Promise<GetQuizResponse | { notFound: boolean }> {
  const response = await fetch(`${PUBLIC_API_URL}/quizzing/quizzes/${quizId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Check if the response is ok
  if (!response.ok) {
    const statusCode = response.status;
    if (statusCode === 404) {
      return {
        notFound: true,
      };
    }

    throw new Error("Failed to fetch quiz");
  }

  const data = await response.json();

  // Fetch quiz data
  const subjectResponse = await fetch(
    `${PUBLIC_API_URL}/quizzing/subjects/${data.subject_id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const subjectData = await subjectResponse.json();

  // Check if the response is ok
  if (!subjectResponse.ok) {
    return {
      notFound: true,
    };
  }

  data.subject_title = subjectData.title;

  return data;
}

export interface QuizResult {
  id: number;
  quizId: number;
  result: number;
  didPass: boolean;
  successPercentage: number;
  questions: QuizQuestion[];
}

export async function getQuizAttemptServerSide(
  quizId: string,
  attemptId: string,
  token: string
): Promise<QuizResult | { notFound: boolean }> {
  const response = await fetch(
    `${PUBLIC_API_URL}/quizzing/quizzes/${quizId}/attempts/${attemptId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      return {
        notFound: true,
      };
    }

    throw new Error("Failed to fetch quiz attempt");
  }

  const data = await response.json();

  return {
    id: data.id,
    quizId: data.quiz_id,
    result: data.result, // number
    didPass: data.did_pass, // boolean,
    successPercentage: data.success_percentage, // number
    questions: data.questions.map((q: any) => ({
      id: q.id,
      title: q.title,
      choices: q.answers.map((a: any) => ({
        id: a.id,
        title: a.title,
        isCorrect: a.is_correct,
      })),
      selectedChoice: q.choice,
      correctChoice: q.correct_choice,
    })),
  };
}
