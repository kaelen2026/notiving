import { apiClient } from "@notiving/shared";

// Configure API base URL
apiClient.setAccessToken(localStorage.getItem("accessToken") || "");

export { apiClient };

// Helper to handle auth token storage
export function setAuthTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
  apiClient.setAccessToken(accessToken);
}

export function clearAuthTokens() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  apiClient.clearAccessToken();
}

export function getRefreshToken(): string | null {
  return localStorage.getItem("refreshToken");
}
