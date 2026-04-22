import { NativeModules } from "react-native";
import type { ShellBridge } from "@notiving/bridge-types";

const { ShellBridge: NativeBridge } = NativeModules;

export const bridge: ShellBridge = {
  getToken: () => NativeBridge?.getToken() ?? Promise.resolve(null),
  getUserId: () => NativeBridge?.getUserId() ?? Promise.resolve(null),
  navigate: (url, opts) => NativeBridge?.navigate(url),
  back: () => NativeBridge?.back(),
  ready: () => NativeBridge?.ready(),
};
