// Edge function: ambil daftar Konsep & Definisi dari Google Sheets
// via Lovable Connector Gateway.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SPREADSHEET_ID = "1BGKHK-qIYPe5Vpez9b7lRS3vp7igJ7JzW_jGGsmfjaw";
const GATEWAY = "https://connector-gateway.lovable.dev/google_sheets/v4";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const GOOGLE_SHEETS_API_KEY = Deno.env.get("GOOGLE_SHEETS_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY tidak tersedia");
    if (!GOOGLE_SHEETS_API_KEY) throw new Error("GOOGLE_SHEETS_API_KEY tidak tersedia (sambungkan Google Sheets connector)");

    // Pakai batchGet dengan data-urlencoded agar nama sheet "Konsep dan Definisi"
    // (mengandung spasi) dapat diparse oleh Sheets API.
    const url = new URL(`${GATEWAY}/spreadsheets/${SPREADSHEET_ID}/values:batchGet`);
    url.searchParams.append("ranges", "'Konsep dan Definisi'!A1:E500");

    const resp = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": GOOGLE_SHEETS_API_KEY,
      },
    });
    const raw = await resp.json();
    if (!resp.ok) {
      throw new Error(`Google Sheets gateway error [${resp.status}]: ${JSON.stringify(raw)}`);
    }

    const rows: string[][] = raw.valueRanges?.[0]?.values ?? [];
    if (rows.length < 2) {
      return new Response(JSON.stringify({ konsep: [], lastUpdated: new Date().toISOString() }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Header: No, Nama Konsep, Definisi, Sumber Data
    const konsep = rows.slice(1)
      .filter((r) => (r?.[1] ?? "").toString().trim().length > 0)
      .map((r) => ({
        no: (r[0] ?? "").toString().trim(),
        nama: (r[1] ?? "").toString().trim(),
        definisi: (r[2] ?? "").toString().trim(),
        sumber: (r[3] ?? "").toString().trim(),
      }));

    return new Response(
      JSON.stringify({ konsep, lastUpdated: new Date().toISOString() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("sheets-konsep error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
