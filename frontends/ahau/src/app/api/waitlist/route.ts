import { NextResponse } from "next/server";

// Proxi para usar el backend existente. Configura NEXT_PUBLIC_WAITLIST_ENDPOINT en .env.local
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const endpoint = process.env.NEXT_PUBLIC_WAITLIST_ENDPOINT;
    if (!endpoint) {
      return NextResponse.json({ ok: false, message: "Config missing: NEXT_PUBLIC_WAITLIST_ENDPOINT" }, { status: 400 });
    }
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json({ ok: false, message: "Server error" }, { status: 500 });
  }
}


