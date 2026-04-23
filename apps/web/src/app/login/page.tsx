"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { setAccessToken } from "@/lib/auth";

type LoginMode = "otp" | "password";

interface AuthResult {
  user: {
    id: string;
    username: string | null;
    email: string | null;
    displayName: string | null;
  };
  accessToken: string;
}

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
      await api("/auth/email/send-code", {
        method: "POST",
        body: JSON.stringify({ email: email.trim() }),
      });
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
      const result = await api<AuthResult>("/auth/email/verify-code", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), code: codeStr }),
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
  }, [code, email]);

  const handlePasswordLogin = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await api<AuthResult>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password }),
      });
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
  }, [email, password]);

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
      const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
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
                <label className="text-sm font-medium text-foreground">
                  Verification Code
                </label>
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
      </div>
    </div>
  );
}
