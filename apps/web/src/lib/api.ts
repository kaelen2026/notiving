import { ApiClient } from "@notiving/shared";
import type { TokenProvider } from "@notiving/shared/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

let accessToken: string | null = null;

const memoryTokenProvider: TokenProvider = {
  getAccessToken() {
    return accessToken;
  },
  setAccessToken(token: string) {
    accessToken = token;
  },
  clearAccessToken() {
    accessToken = null;
  },
  async refresh() {
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
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
  },
  onAuthFailure() {
    accessToken = null;
  },
};

export const apiClient = new ApiClient({
  baseUrl: API_BASE,
  tokenProvider: memoryTokenProvider,
  deviceType: "web",
  credentials: "include",
});

export function setAccessToken(token: string) {
  accessToken = token;
}

export function clearAccessToken() {
  accessToken = null;
}
