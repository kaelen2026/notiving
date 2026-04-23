import type { AuthEnv } from "../middleware/auth.js";
import type { DeviceEnv } from "../middleware/device.js";
import type { RequestIdEnv } from "../middleware/request-id.js";
import type { RequestLoggerEnv } from "../middleware/request-logger.js";

export type AppBindings = {
	DATABASE_URL: string;
	JWT_SECRET: string;
	JWT_REFRESH_SECRET: string;
	CORS_ORIGIN?: string;
	PORT?: string;
	NODE_ENV?: string;
	GOOGLE_CLIENT_ID?: string;
	GOOGLE_CLIENT_SECRET?: string;
	APPLE_CLIENT_ID?: string;
	APPLE_TEAM_ID?: string;
	APPLE_KEY_ID?: string;
	APPLE_PRIVATE_KEY?: string;
	OAUTH_REDIRECT_BASE_URL?: string;
};

export type AppEnv = {
	Bindings: AppBindings;
	Variables: AuthEnv["Variables"] &
		DeviceEnv["Variables"] &
		RequestIdEnv["Variables"] &
		RequestLoggerEnv["Variables"];
};
