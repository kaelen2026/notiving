import type { ShellBridge } from "@notiving/bridge-types";

declare global {
  interface Window {
    NotivingBridge?: ShellBridge & { isInShell?: boolean };
  }
}

function isInShell(): boolean {
  return typeof window !== "undefined" && !!window.NotivingBridge?.isInShell;
}

const fallbackBridge: ShellBridge = {
  getToken: () => Promise.resolve(localStorage.getItem("access_token")),
  getUserId: () => Promise.resolve(localStorage.getItem("user_id")),
  navigate: (url) => {
    window.location.href = url;
  },
  back: () => {
    window.history.back();
  },
  ready: () => {},
};

export const bridge: ShellBridge = isInShell()
  ? (window.NotivingBridge as ShellBridge)
  : fallbackBridge;

export { isInShell };
