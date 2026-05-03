const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const SPREADSHEET_ID = "1BGKHK-qIYPe5Vpez9b7lRS3vp7igJ7JzW_jGGsmfjaw";
const GATEWAY = "https://connector-gateway.lovable.dev/google_sheets/v4";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
  const GOOGLE_SHEETS_API_KEY = Deno.env.get("GOOGLE_SHEETS_API_KEY")!;
  
  const range = "Rangking Semua!A1:BZ3";
  const url = `${GATEWAY}/spreadsheets/${SPREADSHEET_ID}/values/x?range=${encodeURIComponent(range)}`;
  const resp = await fetch(url, {
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": GOOGLE_SHEETS_API_KEY,
    },
  });
  const raw = await resp.json();
  const rows = raw.values ?? [];
  const result: any[] = [];
  const maxLen = Math.max(...rows.map((r: any[]) => r.length));
  for (let i = 0; i < maxLen; i++) {
    result.push({ col: i, r0: rows[0]?.[i] ?? "", r1: rows[1]?.[i] ?? "", r2: rows[2]?.[i] ?? "" });
  }
  return new Response(JSON.stringify(result, null, 2), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
