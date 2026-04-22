import type { AuthEnv } from "../middleware/auth.js";
import type { DeviceEnv } from "../middleware/device.js";

export type AppEnv = {
	Variables: AuthEnv["Variables"] & DeviceEnv["Variables"];
};
