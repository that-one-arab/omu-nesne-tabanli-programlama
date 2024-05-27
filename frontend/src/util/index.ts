import Cookies from "universal-cookie";

export function customFetch(
  route: string,
  options: RequestInit = {},
  withToken = true
) {
  const cookies = new Cookies();

  return fetch(
    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}${route}`,
    {
      ...options,
      headers: {
        ...(withToken && {
          Authorization: `Bearer ${cookies.get("token")}`,
        }),
        "Content-Type": "application/json",
        ...options?.headers,
      },
    }
  );
}
