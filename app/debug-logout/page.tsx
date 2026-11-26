"use client";

import { useState } from "react";

export default function DebugLogout() {
  const [result, setResult] = useState("not run yet");

  async function run() {
const res = await fetch("/session/logout", { method: "POST", credentials: "include" });
    setResult(`status ${res.status}: ${await res.text()}`);
  }

  return (
    <div className="space-y-4 p-6 text-sm">
      <button onClick={run} className="rounded bg-primary px-4 py-2 text-primary-foreground">
        Run logout
      </button>
      <pre className="whitespace-pre-wrap">{result}</pre>
      <a href="/debug-auth" className="text-primary underline">Check cookies (/debug-auth)</a>
    </div>
  );
}