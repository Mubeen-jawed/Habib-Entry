import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { isEffectiveAdmin } from "@/lib/admin-view";

export const runtime = "nodejs";
export const maxDuration = 60;

async function fileToBase64(file: File) {
  if (!file || file.size === 0) return null;
  const buf = Buffer.from(await file.arrayBuffer());
  return { name: file.name, type: file.type, data: buf.toString("base64") };
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  const isAdmin = await isEffectiveAdmin();

  if (!isAdmin) {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { interviewSubmittedAt: true },
    });
    if (user?.interviewSubmittedAt) {
      return NextResponse.json(
        { error: "You've already submitted a mock interview signup." },
        { status: 409 }
      );
    }
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
    let parsed: { ok?: boolean; error?: string } | null = null;
    try {
      parsed = JSON.parse(text) as { ok?: boolean; error?: string };
    } catch {
      // Apps Script returns HTML (a Google login/authorization page) when the
      // deployment isn't reachable anonymously — either the URL is a /dev URL
      // instead of /exec, or "Who has access" isn't set to "Anyone".
    }
    if (!res.ok || parsed?.ok !== true) {
      console.error("[interview] webhook rejected submission", {
        status: res.status,
        finalUrl: res.url,
        contentType: res.headers.get("content-type"),
        bodyPreview: text.slice(0, 500),
      });
      const hint =
        parsed === null
          ? " (webhook returned non-JSON — check that INTERVIEW_WEBHOOK_URL is the /exec URL and the deployment is set to \"Anyone\")"
          : "";
      return NextResponse.json(
        {
          error:
            (parsed?.error ?? "Webhook rejected the submission.") + hint,
        },
        { status: 502 }
      );
    }
    if (!isAdmin) {
      await db.user
        .update({
          where: { id: session.user.id },
          data: { interviewSubmittedAt: new Date() },
        })
        .catch((err) => {
          console.error("[interview] failed to mark user as submitted", err);
        });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[interview] webhook fetch failed", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not reach webhook." },
      { status: 502 }
    );
  }
}
