const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string) {
  accessToken = token;
}

export function clearAccessToken() {
  accessToken = null;
}

async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Device-Type": "web",
      },
      credentials: "include",
    });
    const json = await res.json();
    if (res.ok && json.success && json.data?.accessToken) {
      accessToken = json.data.accessToken;
      return accessToken;
    }
  } catch {
    // refresh failed
  }
  accessToken = null;
  return null;
}

export async function tryRestoreSession(): Promise<string | null> {
  if (accessToken) return accessToken;
  return refreshAccessToken();
}

export async function fetchWithAuth(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const doFetch = (token: string | null) =>
    fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "X-Device-Type": "web",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      credentials: "include",
    });

  let res = await doFetch(accessToken);

  if (res.status === 401 && accessToken) {
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken();
    }
    const newToken = await refreshPromise;
    refreshPromise = null;

    if (newToken) {
      res = await doFetch(newToken);
    }
  }

  return res;
}
