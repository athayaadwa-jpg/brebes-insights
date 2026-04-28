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
  const url = `${GATEWAY}/spreadsheets/${SPREADSHEET_ID}/values:batchGet?ranges=${encodeURIComponent("Indikator!A1:BZ3")}&ranges=${encodeURIComponent("PDRB!A1:F30")}`;
  const resp = await fetch(url, { headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "X-Connection-Api-Key": GOOGLE_SHEETS_API_KEY } });
  const j = await resp.json();
  return new Response(JSON.stringify(j, null, 2), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});
