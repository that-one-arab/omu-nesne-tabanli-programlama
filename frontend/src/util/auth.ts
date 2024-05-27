import { customFetch } from "@/util";

export async function getUserData() {
  const response = await customFetch("/auth/validate", {}, true);

  if (!response.ok) {
    return null;
  }

  const data = await response.json();

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    username: data.username,
  };
}
