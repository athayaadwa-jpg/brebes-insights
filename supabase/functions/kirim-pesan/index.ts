// Edge function: kirim-pesan
// Menyimpan pesan dari form "Hubungi Kami" ke tab "Pesan Masuk" di Google Sheet INTERES.
// Auto-create tab jika belum ada, lalu append baris baru.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GATEWAY = "https://connector-gateway.lovable.dev/google_sheets/v4";
const SPREADSHEET_ID = "1BGKHK-qIYPe5Vpez9b7lRS3vp7igJ7JzW_jGGsmfjaw";
const SHEET_TITLE = "Pesan Masuk";
const HEADER = ["Waktu", "Nama", "Email", "Subjek", "Pesan", "User Agent"];

interface Body {
  nama: string;
  email: string;
  subjek: string;
  pesan: string;
}

const sanitize = (s: string, max: number) =>
  String(s ?? "").replace(/[\u0000-\u001F\u007F]/g, " ").trim().slice(0, max);

const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

async function gw(path: string, init: RequestInit, lovableKey: string, gsKey: string) {
  const res = await fetch(`${GATEWAY}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": gsKey,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  let json: unknown = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* ignore */ }
  if (!res.ok) {
    throw new Error(`Sheets API ${path} [${res.status}]: ${text.slice(0, 300)}`);
  }
  return json as Record<string, unknown>;
}

async function ensureSheet(lovableKey: string, gsKey: string) {
  // 1) Cek apakah sheet sudah ada
  const meta = await gw(
    `/spreadsheets/${SPREADSHEET_ID}?fields=sheets(properties(title))`,
    { method: "GET" },
    lovableKey,
    gsKey,
  );
  const sheets = (meta.sheets as Array<{ properties: { title: string } }>) ?? [];
  const exists = sheets.some((s) => s.properties?.title === SHEET_TITLE);
  if (exists) return;

  // 2) Buat sheet baru
  await gw(
    `/spreadsheets/${SPREADSHEET_ID}:batchUpdate`,
    {
      method: "POST",
      body: JSON.stringify({
        requests: [{ addSheet: { properties: { title: SHEET_TITLE } } }],
      }),
    },
    lovableKey,
    gsKey,
  );

  // 3) Tulis header
  await gw(
    `/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_TITLE}!A1:F1?valueInputOption=USER_ENTERED`,
    {
      method: "PUT",
      body: JSON.stringify({ values: [HEADER] }),
    },
    lovableKey,
    gsKey,
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const GOOGLE_SHEETS_API_KEY = Deno.env.get("GOOGLE_SHEETS_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY belum dikonfigurasi");
    if (!GOOGLE_SHEETS_API_KEY) throw new Error("GOOGLE_SHEETS_API_KEY belum dikonfigurasi");

    const body = (await req.json()) as Body;
    const nama = sanitize(body.nama, 100);
    const email = sanitize(body.email, 255);
    const subjek = sanitize(body.subjek, 200);
    const pesan = sanitize(body.pesan, 2000);

    const errors: Record<string, string> = {};
    if (!nama) errors.nama = "Nama wajib diisi";
    if (!email || !isEmail(email)) errors.email = "Email tidak valid";
    if (!subjek) errors.subjek = "Subjek wajib diisi";
    if (!pesan || pesan.length < 5) errors.pesan = "Pesan terlalu pendek (min 5 karakter)";
    if (Object.keys(errors).length > 0) {
      return new Response(JSON.stringify({ error: "Validasi gagal", details: errors }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await ensureSheet(LOVABLE_API_KEY, GOOGLE_SHEETS_API_KEY);

    const waktu = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta", hour12: false });
    const ua = sanitize(req.headers.get("user-agent") ?? "", 200);

    await gw(
      `/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_TITLE}!A:F:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      {
        method: "POST",
        body: JSON.stringify({ values: [[waktu, nama, email, subjek, pesan, ua]] }),
      },
      LOVABLE_API_KEY,
      GOOGLE_SHEETS_API_KEY,
    );

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("kirim-pesan error", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
