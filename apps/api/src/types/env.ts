import type { AuthEnv } from "../middleware/auth.js";
import type { DeviceEnv } from "../middleware/device.js";
import type { RequestIdEnv } from "../middleware/request-id.js";
import type { RequestLoggerEnv } from "../middleware/request-logger.js";

export type AppEnv = {
	Variables: AuthEnv["Variables"] &
		DeviceEnv["Variables"] &
		RequestIdEnv["Variables"] &
		RequestLoggerEnv["Variables"];
};
