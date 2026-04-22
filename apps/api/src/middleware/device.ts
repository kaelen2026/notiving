import { createMiddleware } from "hono/factory";

export const DEVICE_TYPES = [
	"web",
	"ios",
	"android",
	"harmony",
	"flutter",
] as const;

export type DeviceType = (typeof DEVICE_TYPES)[number] | "unknown";

export type DeviceEnv = {
	Variables: {
		deviceType: DeviceType;
		appVersion: string;
		platformVersion: string;
	};
};

export const deviceDetect = createMiddleware<DeviceEnv>(async (c, next) => {
	const rawType = c.req.header("X-Device-Type")?.toLowerCase();
	const deviceType: DeviceType =
		rawType && (DEVICE_TYPES as readonly string[]).includes(rawType)
			? (rawType as DeviceType)
			: "unknown";

	c.set("deviceType", deviceType);
	c.set("appVersion", c.req.header("X-App-Version") ?? "");
	c.set("platformVersion", c.req.header("X-Platform-Version") ?? "");

	await next();
});
