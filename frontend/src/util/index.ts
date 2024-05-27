import Cookies from "universal-cookie";

export function customFetch(
  route: string,
  options: RequestInit = {},
  withToken = true,
  ignoreContentType = false
) {
  const cookies = new Cookies();

  const headers = {
    ...(withToken && {
      Authorization: `Bearer ${cookies.get("token")}`,
    }),

    ...(!ignoreContentType && {
      "Content-Type": "application/json",
    }),
    ...options?.headers,
  };

  return fetch(
    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}${route}`,
    {
      ...options,
      headers,
    }
  );
}
