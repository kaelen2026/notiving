"use client";

import { ApiError } from "@notiving/shared";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { apiClient, setAccessToken } from "@/lib/api";

type LoginMode = "otp" | "password";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<LoginMode>("otp");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [step, setStep] = useState<"email" | "code">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);

  const codeRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const resetForm = useCallback(() => {
    setPassword("");
    setCode(["", "", "", "", "", ""]);
    setStep("email");
    setError("");
    setCountdown(0);
  }, []);

  const handleModeSwitch = useCallback(
    (newMode: LoginMode) => {
      setMode(newMode);
      resetForm();
    },
    [resetForm],
  );

  const handleSendCode = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      await apiClient.sendEmailCode({ email: email.trim() });
      setStep("code");
      setCountdown(60);
      setTimeout(() => codeRefs.current[0]?.focus(), 100);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to send code");
      }
    } finally {
      setLoading(false);
    }
  }, [email]);

  const handleVerifyCode = useCallback(async () => {
    const codeStr = code.join("");
    if (codeStr.length !== 6) return;

    setLoading(true);
    setError("");
    try {
      const result = await apiClient.verifyEmailCode({
        email: email.trim(),
        code: codeStr,
      });
      setAccessToken(result.accessToken);
      router.replace("/");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Verification failed");
      }
    } finally {
      setLoading(false);
    }
  }, [code, email, router]);

  const handlePasswordLogin = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await apiClient.login({ email: email.trim(), password });
      setAccessToken(result.accessToken);
      router.replace("/");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Login failed");
      }
    } finally {
      setLoading(false);
    }
  }, [email, password, router]);

  const handleCodeChange = useCallback(
    (index: number, value: string) => {
      if (!/^\d*$/.test(value)) return;
      const next = [...code];
      next[index] = value.slice(-1);
      setCode(next);
      if (value && index < 5) {
        codeRefs.current[index + 1]?.focus();
      }
    },
    [code],
  );

  const handleCodeKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && !code[index] && index > 0) {
        codeRefs.current[index - 1]?.focus();
      }
    },
    [code],
  );

  const handleCodePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pasted = e.clipboardData
        .getData("text")
        .replace(/\D/g, "")
        .slice(0, 6);
      if (!pasted) return;
      const next = [...code];
      for (let i = 0; i < pasted.length; i++) {
        next[i] = pasted[i];
      }
      setCode(next);
      const focusIdx = Math.min(pasted.length, 5);
      codeRefs.current[focusIdx]?.focus();
    },
    [code],
  );

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isCodeComplete = code.every((d) => d !== "");

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-foreground">Welcome</h1>
          <p className="mt-2 text-sm text-foreground-secondary">
            Log in to your account
          </p>
        </div>

        {/* Mode Tabs */}
        <div className="mb-6 flex rounded-lg bg-background-secondary p-1">
          <button
            type="button"
            onClick={() => handleModeSwitch("otp")}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              mode === "otp"
                ? "bg-surface text-foreground shadow-sm"
                : "text-foreground-secondary hover:text-foreground"
            }`}
          >
            OTP
          </button>
          <button
            type="button"
            onClick={() => handleModeSwitch("password")}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              mode === "password"
                ? "bg-surface text-foreground shadow-sm"
                : "text-foreground-secondary hover:text-foreground"
            }`}
          >
            Password
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (mode === "password") {
              handlePasswordLogin();
            } else if (step === "email") {
              handleSendCode();
            } else {
              handleVerifyCode();
            }
          }}
        >
          {/* Email field — always visible */}
          <div className="mb-4">
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={mode === "otp" && step === "code"}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-foreground-tertiary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
              autoComplete="email"
            />
          </div>

          {/* Password mode */}
          {mode === "password" && (
            <div className="mb-4">
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-foreground-tertiary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                autoComplete="current-password"
              />
            </div>
          )}

          {/* OTP mode — code input */}
          {mode === "otp" && step === "code" && (
            <div className="mb-4">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  Verification Code
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setCode(["", "", "", "", "", ""]);
                    setError("");
                  }}
                  className="text-xs text-primary hover:text-primary-hover"
                >
                  Change email
                </button>
              </div>
              <p className="mb-3 text-xs text-foreground-secondary">
                Sent to {email.trim()}
              </p>
              <div className="flex gap-2" onPaste={handleCodePaste}>
                {code.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      codeRefs.current[i] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(i, e.target.value)}
                    onKeyDown={(e) => handleCodeKeyDown(i, e)}
                    className="h-12 w-full rounded-lg border border-border bg-surface text-center text-lg font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    autoComplete="one-time-code"
                  />
                ))}
              </div>
              <div className="mt-3 text-center">
                {countdown > 0 ? (
                  <span className="text-xs text-foreground-tertiary">
                    Resend in {countdown}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={loading}
                    className="text-xs text-primary hover:text-primary-hover"
                  >
                    Resend code
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="mb-4 text-center text-sm text-destructive">{error}</p>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={
              loading ||
              !isEmailValid ||
              (mode === "password" && !password) ||
              (mode === "otp" && step === "code" && !isCodeComplete)
            }
            className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover active:bg-primary-active disabled:opacity-50"
          >
            {loading
              ? "Loading..."
              : mode === "otp" && step === "email"
                ? "Send Code"
                : "Log In"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-foreground-tertiary">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <a
          href={`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/v1/auth/oauth/google?redirect_uri=${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-background-secondary"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </a>
      </div>
    </div>
  );
}
