const TOKEN_KEY = "tripbuddy_token";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
}

export const getAccessToken = (): string | null =>
  localStorage.getItem(TOKEN_KEY);

export const putAccessToken = (token: string): void =>
  localStorage.setItem(TOKEN_KEY, token);

export const removeAccessToken = (): void => localStorage.removeItem(TOKEN_KEY);

export async function apiFetch<T>(
  path: string,
  options: ApiOptions = {}
): Promise<T> {
  const token = getAccessToken();
  const hasBody = options.body !== undefined;
  const headers: Record<string, string> = {};
  if (hasBody) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  let json: ApiResponse<T>;
  try {
    response = await fetch(`${API_BASEURL}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: hasBody ? JSON.stringify(options.body) : undefined,
    });
    json = await response.json();
  } catch {
    throw new Error("Tidak dapat terhubung ke server");
  }

  if (!response.ok || !json.success) throw new Error(json.message);
  return json.data;
}
