"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const CONTACT_TYPES = [
  "Commission",
  "Licensing",
  "Wholesale",
  "Press",
  "Other",
] as const;

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success" }
  | { kind: "error"; message: string };

type ContactFormProps = {
  accessKey: string;
};

/**
 * Posts directly to Web3Forms. Their free tier rejects server-side
 * submissions, so the access key has to live in the browser. That's by
 * design on Web3Forms' end — the key is an account identifier, not a
 * secret — and rate limiting / spam filtering happens on their side.
 */
export function ContactForm({ accessKey }: ContactFormProps) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const type = String(data.get("type") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();

    setStatus({ kind: "submitting" });

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: accessKey,
          from_name: "Orbital Artifacts contact form",
          subject: `[OA] ${type} inquiry from ${name}`,
          name,
          email,
          type,
          message,
          botcheck: "",
        }),
      });

      const body = (await response.json().catch(() => null)) as {
        success?: boolean;
        message?: string;
      } | null;

      if (!response.ok || !body?.success) {
        setStatus({
          kind: "error",
          message: body?.message ?? "Could not send your message.",
        });
        return;
      }

      setStatus({ kind: "success" });
      form.reset();
    } catch {
      setStatus({
        kind: "error",
        message: "Network error. Check your connection and retry.",
      });
    }
  }

  if (status.kind === "success") {
    return (
      <div className="mt-12 border border-rust/40 bg-paper-2/60 p-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-rust">
          ◉ Received
        </p>
        <p className="mt-4 font-serif text-xl italic leading-[1.4] text-ink sm:text-2xl">
          Thanks — your message is on its way. I&rsquo;ll get back to you
          within a few days.
        </p>
        <button
          type="button"
          onClick={() => setStatus({ kind: "idle" })}
          className="mt-8 font-mono text-[11px] uppercase tracking-[0.22em] text-rust transition-opacity hover:opacity-75"
        >
          Send another →
        </button>
      </div>
    );
  }

  const busy = status.kind === "submitting";

  return (
    <form onSubmit={onSubmit} className="mt-12 flex flex-col gap-6">
      <Field label="Name" htmlFor="name">
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          disabled={busy}
          className={inputClass}
        />
      </Field>

      <Field label="Email" htmlFor="email">
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          disabled={busy}
          className={inputClass}
        />
      </Field>

      <Field label="Inquiry type" htmlFor="type">
        <div className="relative">
          <select
            id="type"
            name="type"
            required
            disabled={busy}
            defaultValue=""
            className={cn(inputClass, "appearance-none pr-10")}
          >
            <option value="" disabled>
              Select one…
            </option>
            {CONTACT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <span
            aria-hidden
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-rust"
          >
            ▾
          </span>
        </div>
      </Field>

      <Field label="Message" htmlFor="message">
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          minLength={5}
          maxLength={5000}
          disabled={busy}
          className={cn(inputClass, "resize-y leading-[1.6]")}
        />
      </Field>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={busy}
          className={cn(
            "border border-ink bg-ink px-6 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-paper",
            "transition-colors hover:bg-rust hover:border-rust",
            "disabled:cursor-not-allowed disabled:opacity-60",
          )}
        >
          {busy ? "Sending…" : "Send message →"}
        </button>

        {status.kind === "error" ? (
          <p
            role="alert"
            className="font-mono text-[11px] uppercase tracking-[0.22em] text-rust"
          >
            {status.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}

const inputClass = cn(
  "w-full border border-sand/60 bg-paper px-4 py-3 font-sans text-base text-ink",
  "transition-colors focus:border-rust focus:outline-none",
  "disabled:opacity-60",
);

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={htmlFor}
        className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted"
      >
        {label}
      </label>
      {children}
    </div>
  );
}
