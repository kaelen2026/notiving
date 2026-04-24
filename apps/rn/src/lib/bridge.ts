import type {
  DeviceInfo,
  PermissionResult,
  PermissionType,
  Session,
  ShellBridge,
} from "@notiving/bridge-types";
import { NativeEventEmitter, NativeModules } from "react-native";

const { ShellBridge: NativeBridge } = NativeModules;

const emitter = NativeBridge ? new NativeEventEmitter(NativeBridge) : null;

export const bridge: ShellBridge = {
  // Session
  getToken: () => NativeBridge?.getToken() ?? Promise.resolve(null),
  getUserId: () => NativeBridge?.getUserId() ?? Promise.resolve(null),
  onSessionChange: (cb: (session: Session | null) => void) => {
    const subscription = emitter?.addListener("onSessionChange", cb);
    return () => subscription?.remove();
  },

  // Navigation
  navigate: (url, opts) => NativeBridge?.navigate(url, opts ?? {}),
  back: () => NativeBridge?.back(),
  setTitle: (title) => NativeBridge?.setTitle(title),
  setNavBarHidden: (hidden) => NativeBridge?.setNavBarHidden(hidden),

  // Analytics
  track: (event, params) => NativeBridge?.track(event, params ?? {}),
  pageView: (pageName) => NativeBridge?.pageView(pageName),

  // Permission
  requestPermission: (type: PermissionType): Promise<PermissionResult> =>
    NativeBridge?.requestPermission(type) ??
    Promise.resolve({ status: "denied" }),
  checkPermission: (type: PermissionType): Promise<PermissionResult> =>
    NativeBridge?.checkPermission(type) ??
    Promise.resolve({ status: "denied" }),

  // Lifecycle
  onResume: (cb: () => void) => {
    const subscription = emitter?.addListener("onResume", cb);
    return () => subscription?.remove();
  },
  onPause: (cb: () => void) => {
    const subscription = emitter?.addListener("onPause", cb);
    return () => subscription?.remove();
  },
  ready: () => NativeBridge?.ready(),

  // Device
  getDeviceInfo: (): Promise<DeviceInfo> =>
    NativeBridge?.getDeviceInfo() ??
    Promise.resolve({
      platform: "ios" as const,
      osVersion: "",
      appVersion: "",
      deviceId: "",
    }),
  getAppVersion: () => NativeBridge?.getAppVersion() ?? Promise.resolve(""),
};
