type Platform = "ios" | "android" | "other";

const APP_STORE_URL = "https://apps.apple.com/app/notiving/id0000000000";
const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.notiving.notiving";

const SCHEME_TIMEOUT_MS = 2000;

export function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "other";
}

export function openInApp(path = "/"): void {
  const platform = detectPlatform();
  if (platform === "other") return;

  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  const schemeUrl = `notiving://${normalizedPath}`;

  let didLeave = false;

  const onVisibilityChange = () => {
    if (document.hidden) {
      didLeave = true;
    }
  };

  document.addEventListener("visibilitychange", onVisibilityChange);

  window.location.href = schemeUrl;

  setTimeout(() => {
    document.removeEventListener("visibilitychange", onVisibilityChange);
    if (didLeave) return;

    const storeUrl = platform === "ios" ? APP_STORE_URL : PLAY_STORE_URL;
    window.location.href = storeUrl;
  }, SCHEME_TIMEOUT_MS);
}
