"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiClient, clearAccessToken } from "@/lib/api";

interface User {
  id: string;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await apiClient.tryRestoreSession();
      if (token) {
        try {
          const me = await apiClient.getMe();
          setUser(me);
        } catch {
          // session invalid
        }
      }
      setLoading(false);
    })();
  }, []);

  const handleLogout = async () => {
    try {
      await apiClient.logout();
    } catch {
      // best effort
    }
    clearAccessToken();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-foreground-secondary">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <span className="text-lg font-semibold text-foreground">
            Notiving
          </span>
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-foreground-secondary">
                {user.displayName ?? user.username ?? "User"}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md px-3 py-1.5 text-sm text-foreground-secondary transition-colors hover:bg-background-secondary hover:text-foreground"
              >
                Log out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              Log in
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 py-16">
        {user ? (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">
              Welcome back{user.displayName ? `, ${user.displayName}` : ""}
            </h1>
            <p className="mt-2 text-foreground-secondary">You are logged in.</p>
          </div>
        ) : (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Notiving</h1>
            <p className="mt-2 text-foreground-secondary">
              Log in to get started.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-block rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              Log in
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
