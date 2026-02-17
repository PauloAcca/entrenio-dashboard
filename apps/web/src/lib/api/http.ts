export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const isFormData = init?.body instanceof FormData;
  const headers: HeadersInit = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(init?.headers ?? {}),
  };

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    ...init,
    credentials: "include", // si usás cookies
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));

    // Prioritize the detailed 'message' field from NestJS, handling arrays if necessary
    const errorMessage = 
      (Array.isArray(body?.message) ? body.message[0] : body?.message) || 
      body?.error || 
      `Request failed: ${res.status}`;

    throw new Error(errorMessage);
  }

  return res.json() as Promise<T>;
}