import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export const runtime = "nodejs";
export const maxDuration = 60;

async function fileToBase64(file: File) {
  if (!file || file.size === 0) return null;
  const buf = Buffer.from(await file.arrayBuffer());
  return { name: file.name, type: file.type, data: buf.toString("base64") };
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const webhook = process.env.INTERVIEW_WEBHOOK_URL;
  if (!webhook) {
    return NextResponse.json(
      { error: "INTERVIEW_WEBHOOK_URL is not set." },
      { status: 500 }
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form payload." }, { status: 400 });
  }

  const fields: Record<string, string | string[]> = {};
  const files: Record<string, Awaited<ReturnType<typeof fileToBase64>>> = {};

  for (const [key, value] of form.entries()) {
    if (value instanceof File) {
      files[key] = await fileToBase64(value);
    } else {
      const existing = fields[key];
      if (existing === undefined) fields[key] = value;
      else if (Array.isArray(existing)) existing.push(value);
      else fields[key] = [existing, value];
    }
  }

  const payload = {
    submittedAt: new Date().toISOString(),
    fields,
    files,
  };

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      redirect: "follow",
    });
    const text = await res.text();
    let parsed: { ok?: boolean; error?: string } = {};
    try {
      parsed = JSON.parse(text);
    } catch {
      // Apps Script sometimes returns HTML on auth errors, surface as-is.
    }
    if (!res.ok || parsed.ok === false) {
      return NextResponse.json(
        { error: parsed.error || "Webhook rejected the submission." },
        { status: 502 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not reach webhook." },
      { status: 502 }
    );
  }
}
