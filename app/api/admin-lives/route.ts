import { NextRequest, NextResponse } from "next/server";

const LIVES_API_URL = `${process.env.PYTHON_API_BASE_URL}/admin/set-lives`;

export async function POST(req: NextRequest) {
  try {
    const { phone, lives_lost } = await req.json();

    if (!phone || typeof phone !== "string") {
      return NextResponse.json({ error: "Teléfono inválido." }, { status: 400 });
    }
    if (typeof lives_lost !== "number" || lives_lost < 0) {
      return NextResponse.json({ error: "Valor de vidas inválido." }, { status: 400 });
    }

    const adminKey = process.env.ADMIN_LIVES_KEY;
    if (!adminKey) {
      console.error("ADMIN_LIVES_KEY no está configurado en las variables de entorno.");
      return NextResponse.json({ error: "Configuración del servidor incompleta." }, { status: 500 });
    }

    // Prepend country code if phone is 10 digits
    const fullPhone = phone.length === 10 ? `52${phone}` : phone;

    const res = await fetch(LIVES_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Admin-Key": adminKey,
      },
      body: JSON.stringify({ phone: fullPhone, lives_lost }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`Error desde API externa: ${res.status} — ${text}`);
      return NextResponse.json(
        { error: `Error del servidor externo: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json().catch(() => ({}));
    return NextResponse.json({ ok: true, ...data });
  } catch (err: any) {
    console.error("Error en /api/admin-lives:", err);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
