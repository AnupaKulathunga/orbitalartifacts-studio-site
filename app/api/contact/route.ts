import { NextResponse } from "next/server";

/**
 * Contact form endpoint — proxies submissions to Web3Forms so the access
 * key never reaches the client. Swap in Resend later by changing only
 * the fetch call below; the client contract stays the same.
 */

const CONTACT_TYPES = new Set([
  "Commission",
  "Licensing",
  "Wholesale",
  "Press",
  "Other",
]);

type ContactPayload = {
  name: string;
  email: string;
  type: string;
  message: string;
};

function validate(raw: unknown): ContactPayload | { error: string } {
  if (!raw || typeof raw !== "object") return { error: "Invalid payload." };
  const body = raw as Record<string, unknown>;

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const type = typeof body.type === "string" ? body.type.trim() : "";
  const message =
    typeof body.message === "string" ? body.message.trim() : "";

  if (!name) return { error: "Name is required." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { error: "A valid email is required." };
  if (!CONTACT_TYPES.has(type)) return { error: "Invalid inquiry type." };
  if (message.length < 5) return { error: "Message is too short." };
  if (message.length > 5000) return { error: "Message is too long." };

  return { name, email, type, message };
}

export async function POST(request: Request) {
  const accessKey = process.env.WEB3FORMS_ACCESS_KEY;
  if (!accessKey) {
    return NextResponse.json(
      { error: "Contact form is not configured yet." },
      { status: 503 },
    );
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const result = validate(raw);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const { name, email, type, message } = result;

  const web3Response = await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      access_key: accessKey,
      from_name: "Orbital Artifacts — Contact form",
      subject: `[OA] ${type} inquiry from ${name}`,
      name,
      email,
      type,
      message,
      // Web3Forms honeypot — blank on real submits, filled by bots.
      botcheck: "",
    }),
  });

  const body = (await web3Response.json().catch(() => null)) as {
    success?: boolean;
    message?: string;
  } | null;

  if (!web3Response.ok || !body?.success) {
    return NextResponse.json(
      { error: body?.message ?? "Could not send your message." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
