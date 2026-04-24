export const REFRESH_TOKEN_COOKIE = "refresh_token";
export const REFRESH_COOKIE_OPTIONS = {
	path: "/v1/auth",
	httpOnly: true,
	secure: true,
	sameSite: "Strict" as const,
	maxAge: 7 * 24 * 60 * 60,
};

export function isWeb(c: { get: (key: "deviceType") => string }) {
	return c.get("deviceType") === "web";
}
