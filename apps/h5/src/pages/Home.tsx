import { useEffect, useState } from "react";
import { bridge, isInShell } from "../lib/bridge";

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [env, setEnv] = useState<string>("checking...");

  useEffect(() => {
    setEnv(isInShell() ? "Shell (Native)" : "Browser (Standalone)");
    bridge.getToken().then(setToken);
    bridge.ready();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Home</h1>
      <p className="text-gray-600">H5 Runtime</p>
      <div className="space-y-2 rounded-lg bg-gray-100 p-4 text-sm">
        <p>
          <span className="font-medium">Environment:</span> {env}
        </p>
        <p>
          <span className="font-medium">Token:</span>{" "}
          <code>{token ? `${token.slice(0, 20)}...` : "null"}</code>
        </p>
      </div>
      {isInShell() && (
        <div className="flex gap-2">
          <button
            onClick={() => bridge.navigate("/")}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800"
          >
            Go to Home
          </button>
          <button
            onClick={() => bridge.navigate("/profile")}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800"
          >
            Go to Profile
          </button>
        </div>
      )}
    </div>
  );
}
