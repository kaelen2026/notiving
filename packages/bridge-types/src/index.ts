export interface NavigateOpts {
  animated?: boolean;
  present?: boolean;
}

export interface DeviceInfo {
  platform: "ios" | "android";
  osVersion: string;
  appVersion: string;
  deviceId: string;
}

export interface ShellBridge {
  // Session
  getToken(): Promise<string | null>;
  getUserId(): Promise<string | null>;

  // Navigation
  navigate(url: string, opts?: NavigateOpts): void;
  back(): void;

  // Lifecycle
  ready(): void;
}

export type Unsubscribe = () => void;
