import { ApiClient } from "@notiving/shared";
import type { TokenProvider } from "@notiving/shared/types";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

const localStorageTokenProvider: TokenProvider = {
  getAccessToken() {
    return localStorage.getItem("accessToken");
  },
  setAccessToken(token: string) {
    localStorage.setItem("accessToken", token);
  },
  clearAccessToken() {
    localStorage.removeItem("accessToken");
  },
  async refresh() {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return null;
    try {
      const res = await fetch(`${API_BASE}/v1/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        localStorage.setItem("accessToken", json.data.accessToken);
        if (json.data.refreshToken) {
          localStorage.setItem("refreshToken", json.data.refreshToken);
        }
        return json.data.accessToken;
      }
    } catch {
      // refresh failed
    }
    return null;
  },
  onAuthFailure() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  },
};

export const apiClient = new ApiClient({
  baseUrl: API_BASE,
  tokenProvider: localStorageTokenProvider,
});

export function setAuthTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
}

export function clearAuthTokens() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}
