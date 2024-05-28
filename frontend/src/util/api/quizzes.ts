import { PUBLIC_API_URL, customFetch } from "@/util";
import { GetQuizResponse } from "@/util/types";
import { useEffect, useState } from "react";

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
        const response = await customFetch(
          `/quizzing/subjects?search_query=${title}`
        );
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
      return getSubjectData.find(
        (subject: { id: string; title: string }) => subject.title === title
      );
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

interface ICreateQuizParams {
  subject: { id: string; title: string };
  title: string;
  duration: number;
  numberOfQuestions: number;
  percentage: number;
  description: string;
  files: FileList | null;
}

interface IHandleCreateQuizApiResult {
  details: {
    response_code: string;
    response_message: string;
  };
  message: string;
  quiz_id: string;
}

export function useHandleCreateQuiz(): [
  (params: ICreateQuizParams) => Promise<IHandleCreateQuizApiResult>,
  { data: IHandleCreateQuizApiResult | null; loading: boolean }
] {
  const [data, setData] = useState<IHandleCreateQuizApiResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  async function checkCreateQuizTask(taskId: string) {
    if (!taskId) {
      return;
    }

    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        console.info("Checking task status");
        const response = await customFetch(`/tasks/result/${taskId}`);

        if (!response.ok) {
          clearInterval(interval);
          reject("Failed to check task status");
        }

        const data = await response.json();

        if (data.successful) {
          clearInterval(interval);
          resolve(data.value);
        } else if (data.ready && !data.successful) {
          clearInterval(interval);
          reject(data.message);
        }
      }, 2000);
    });
  }

  async function handleCreateQuiz(
    params: ICreateQuizParams
  ): Promise<IHandleCreateQuizApiResult> {
    setLoading(true);
    try {
      const quizTaskId = await createQuiz(params);
      const result = (await checkCreateQuizTask(
        quizTaskId
      )) as IHandleCreateQuizApiResult;
      setData(result);
      return result;
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
