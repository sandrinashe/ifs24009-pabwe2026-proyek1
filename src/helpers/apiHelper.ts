const TOKEN_KEY = "tripbuddy_token";
const TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  /** Objek biasa dikirim sebagai JSON, FormData dikirim sebagai multipart. */
  body?: unknown;
}

/**
 * Token disimpan di cookie (SameSite=Strict, Secure di HTTPS), bukan localStorage,
 * sehingga tidak ikut terkirim lintas situs dan punya masa berlaku.
 */
export const getAccessToken = (): string | null => {
  const entry = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${TOKEN_KEY}=`));
  return entry ? decodeURIComponent(entry.slice(TOKEN_KEY.length + 1)) : null;
};

const cookieFlags = (): string =>
  `; path=/; SameSite=Strict${location.protocol === "https:" ? "; Secure" : ""}`;

export const putAccessToken = (token: string): void => {
  document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)}${cookieFlags()}; max-age=${TOKEN_MAX_AGE_SECONDS}`;
};

export const removeAccessToken = (): void => {
  document.cookie = `${TOKEN_KEY}=${cookieFlags()}; max-age=0`;
};

export async function apiFetch<T>(
  path: string,
  options: ApiOptions = {}
): Promise<T> {
  const token = getAccessToken();
  const hasBody = options.body !== undefined;
  const isForm = options.body instanceof FormData;
  const headers: Record<string, string> = {};
  // Untuk FormData, browser mengisi Content-Type (beserta boundary) sendiri.
  if (hasBody && !isForm) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  let json: ApiResponse<T>;
  try {
    response = await fetch(`${API_BASEURL}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: !hasBody
        ? undefined
        : isForm
          ? (options.body as FormData)
          : JSON.stringify(options.body),
    });
    json = await response.json();
  } catch {
    throw new Error("Tidak dapat terhubung ke server");
  }

  if (!response.ok || !json.success) throw new Error(json.message);
  return json.data;
}
