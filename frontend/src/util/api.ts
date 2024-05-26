import { customFetch } from "@/util";

export type TLoginApiResponse = {
  id: string | number;
  name: string;
  username: string;
  email: string;
  token: string;
};

export async function login(
  email: string,
  password: string
): Promise<TLoginApiResponse> {
  const response = await customFetch("/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error("An error occurred");
  }

  const data = await response.json();

  return {
    id: data.id,
    name: data.name,
    username: data.username,
    email: data.email,
    token: data.access_token,
  };
}

export async function validateToken(token: string): Promise<boolean> {
  const response = await customFetch(
    "/auth/validate",
    { method: "GET", headers: { Authorization: `Bearer ${token}` } },
    true
  );
  const data = await response.json();

  return response.ok;
}
