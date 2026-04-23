"use client";

import { useState } from "react";

export function CurateLogin({ configured }: { configured: boolean }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/curate/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: code }),
      });
      if (res.ok) {
        // Reload so the server-side page re-renders with the auth cookie
        // and drops us into the real /curate UI.
        window.location.reload();
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? `HTTP ${res.status}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
          Orbital Artifacts · Curate
        </p>
        <h1 className="mt-4 font-serif text-3xl leading-tight text-ink">
          Access code
        </h1>
        <p className="mt-3 font-sans text-sm leading-relaxed text-ink-2">
          This page is a back-office tool for picking which Earth-as-Art
          scenes go into the catalogue. If you don&rsquo;t have the code,
          ping Anupa.
        </p>

        {configured ? (
          <form onSubmit={submit} className="mt-8 flex flex-col gap-3">
            <input
              type="password"
              autoFocus
              autoComplete="off"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Access code"
              className="w-full rounded border border-sand bg-white px-3 py-2 font-sans text-sm"
              aria-label="Access code"
            />
            <button
              type="submit"
              disabled={submitting || !code}
              className="w-full rounded border border-ink/20 bg-ink px-4 py-2 font-sans text-sm text-paper transition disabled:opacity-50"
            >
              {submitting ? "Checking…" : "Enter"}
            </button>
            {error ? (
              <p
                className="font-mono text-[11px] uppercase tracking-wider text-rust-deep"
                role="alert"
              >
                {error}
              </p>
            ) : null}
          </form>
        ) : (
          <p className="mt-8 rounded border border-sand/60 bg-paper-2 p-4 font-mono text-xs leading-relaxed text-ink-2">
            <strong className="font-semibold">CURATE_PASSWORD</strong> is not
            set on this deployment. Add it in the Vercel project&rsquo;s
            Preview environment variables, redeploy, and try again.
          </p>
        )}
      </div>
    </div>
  );
}
