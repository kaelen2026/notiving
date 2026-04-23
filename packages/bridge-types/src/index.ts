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

export interface Session {
  token: string;
  userId: string;
}

export type PermissionType = "camera" | "location" | "notification" | "photo";

export interface PermissionResult {
  status: "granted" | "denied" | "blocked";
}

export type Unsubscribe = () => void;

export interface ShellBridge {
  // Session
  getToken(): Promise<string | null>;
  getUserId(): Promise<string | null>;
  onSessionChange(cb: (session: Session | null) => void): Unsubscribe;

  // Navigation
  navigate(url: string, opts?: NavigateOpts): void;
  back(): void;
  setTitle(title: string): void;
  setNavBarHidden(hidden: boolean): void;

  // Analytics
  track(event: string, params?: Record<string, unknown>): void;
  pageView(pageName: string): void;

  // Permission
  requestPermission(type: PermissionType): Promise<PermissionResult>;
  checkPermission(type: PermissionType): Promise<PermissionResult>;

  // Lifecycle
  onResume(cb: () => void): Unsubscribe;
  onPause(cb: () => void): Unsubscribe;
  ready(): void;

  // Device
  getDeviceInfo(): Promise<DeviceInfo>;
  getAppVersion(): Promise<string>;
}
