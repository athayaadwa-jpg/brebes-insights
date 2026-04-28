const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SPREADSHEET_ID = "1BGKHK-qIYPe5Vpez9b7lRS3vp7igJ7JzW_jGGsmfjaw";
const GATEWAY = "https://connector-gateway.lovable.dev/google_sheets/v4";
const TARGET_GID = 243669581;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
    const GOOGLE_SHEETS_API_KEY = Deno.env.get("GOOGLE_SHEETS_API_KEY")!;
    const headers = {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": GOOGLE_SHEETS_API_KEY,
    };
    // 1. List sheets
    const meta = await fetch(`${GATEWAY}/spreadsheets/${SPREADSHEET_ID}?fields=sheets(properties(sheetId,title))`, { headers }).then(r => r.json());
    const sheet = meta.sheets?.find((s: any) => s.properties.sheetId === TARGET_GID);
    const title = sheet?.properties?.title;
    if (!title) return new Response(JSON.stringify({ meta }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    // 2. Get first ~6 rows
    const range = `${title}!A1:BZ30`;
    const data = await fetch(`${GATEWAY}/spreadsheets/${SPREADSHEET_ID}/values/${range}`, { headers }).then(r => r.json());
    return new Response(JSON.stringify({ title, data }, null, 2), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
