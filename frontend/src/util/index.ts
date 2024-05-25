export function customFetch(route: string, options: RequestInit = {}) {
  return fetch(
    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}${route}`,
    {
      ...options,
      headers: {
        ...options?.headers,
      },
    }
  );
}
