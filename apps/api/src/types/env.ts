import type { AuthEnv } from "../middleware/auth.js";
import type { DeviceEnv } from "../middleware/device.js";
import type { RequestIdEnv } from "../middleware/request-id.js";

export type AppEnv = {
	Variables: AuthEnv["Variables"] &
		DeviceEnv["Variables"] &
		RequestIdEnv["Variables"];
};
