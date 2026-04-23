import { useState } from "react";
import { useLocation } from "react-router-dom";
import { isInShell } from "../lib/bridge";
import { detectPlatform, openInApp } from "../lib/openApp";

const DISMISSED_KEY = "open-in-app-dismissed";

export default function OpenInAppBanner() {
  const platform = detectPlatform();
  const location = useLocation();
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem(DISMISSED_KEY) === "1",
  );

  if (isInShell() || platform === "other" || dismissed) return null;

  const handleOpen = () => {
    openInApp(location.pathname + location.search);
  };

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISSED_KEY, "1");
    setDismissed(true);
  };

  return (
    <div className="flex items-center gap-3 border-b border-border bg-surface px-4 py-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-muted">
        <span className="text-sm font-bold text-primary">N</span>
      </div>
      <p className="min-w-0 flex-1 truncate text-sm text-foreground-secondary">
        Notiving 体验更好
      </p>
      <button
        onClick={handleOpen}
        className="shrink-0 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
      >
        打开 App
      </button>
      <button
        onClick={handleDismiss}
        className="shrink-0 p-1 text-foreground-tertiary transition-colors hover:text-foreground-secondary"
        aria-label="关闭"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M4 4l8 8M12 4l-8 8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}
