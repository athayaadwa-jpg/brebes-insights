// Edge function: ambil data DETAIL setiap indikator (series Brebes + ranking
// se-Jawa Tengah) dari Google Sheets via Lovable Connector Gateway.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SPREADSHEET_ID = "1BGKHK-qIYPe5Vpez9b7lRS3vp7igJ7JzW_jGGsmfjaw";
const GATEWAY = "https://connector-gateway.lovable.dev/google_sheets/v4";

// Parser angka format Indonesia: "15,60" -> 15.6, "1.035.743,00" -> 1035743,
// nilai integer murni "117627" -> 117627.
const parseId = (s: unknown): number | null => {
  if (s === null || s === undefined) return null;
  const t = String(s).trim();
  if (!t || t === "#NA" || t === "-") return null;
  // Format ID jika mengandung koma desimal: titik = ribuan, koma = desimal.
  // Format murni angka tanpa pemisah (mis. "117627") atau dengan titik desimal
  // ditangani Number() langsung.
  let cleaned: string;
  if (t.includes(",")) {
    cleaned = t.replace(/\./g, "").replace(/,/g, ".");
  } else if (/^\d{1,3}(\.\d{3})+$/.test(t)) {
    // Pola seperti "1.035.743" -> hilangkan titik ribuan
    cleaned = t.replace(/\./g, "");
  } else {
    cleaned = t;
  }
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
};

// Bersihkan nama wilayah: hapus prefix "Kab. " / "Kota " agar konsisten dengan
// daftar internal (kecuali "Kota X" tetap ditandai sebagai kota di FE).
const cleanWilayah = (s: string): string => {
  const t = s.trim();
  if (t.startsWith("Kab. ")) return t.slice(5);
  return t; // "Kota X" tetap apa adanya
};

type RankRow = { wilayah: string; nilai: number };
type SeriesRow = { tahun: number; brebes: number };

// Definisi indikator yang didukung. Setiap indikator memetakan label baris
// pada tab "Indikator Perbandingan" (untuk series Brebes) dan tab ranking
// terpisah (untuk perbandingan antar Kab/Kota).
type IndicatorDef = {
  slug: string;
  rankingSheet: string | null;     // null = ambil series saja (mis. IKK pakai sumber lain)
  seriesLabel: string | null;      // label baris di "Indikator Perbandingan"
  seriesAltSheet?: string;         // sheet alternatif (mis. tab "IKK!A:C")
};

const INDICATOR_DEFS: IndicatorDef[] = [
  { slug: "tpt",                rankingSheet: "Rangking TPT",            seriesLabel: "TPT" },
  { slug: "tpak",               rankingSheet: "Rangking TPAK",           seriesLabel: "TPAK Agustus" },
  { slug: "kemiskinan",         rankingSheet: "Rangking Kemiskinan",     seriesLabel: "Persentase Penduduk miskin (%)" },
  { slug: "ipm",                rankingSheet: "Rangking IPM",            seriesLabel: "IPM Metode baru (Dg UHH hasil Long Form SP2020)" },
  { slug: "luas-panen-padi",    rankingSheet: "Rangking Luas Panen",     seriesLabel: "Luas Panen Padi (Hektare)" },
  { slug: "produksi-padi",      rankingSheet: "Rangking Produksi Padi",  seriesLabel: "Produksi Padi (ton GKG)" },
  { slug: "pertumbuhan-ekonomi", rankingSheet: "Rangking PDRB",          seriesLabel: "Pertumbuhan Ekonomi Menurut Lapangan Usaha" },
  { slug: "ikk",                rankingSheet: "Rangking IKK",            seriesLabel: null, seriesAltSheet: "IKK!A1:C30" },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const GOOGLE_SHEETS_API_KEY = Deno.env.get("GOOGLE_SHEETS_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY tidak tersedia");
    if (!GOOGLE_SHEETS_API_KEY) throw new Error("GOOGLE_SHEETS_API_KEY tidak tersedia");

    const ranges: string[] = [
      "Indikator Perbandingan!A1:N60",
      ...INDICATOR_DEFS.filter((d) => d.rankingSheet).map((d) => `${d.rankingSheet}!A1:G400`),
      "IKK!A1:C30",
    ];
    const qs = ranges.map((r) => `ranges=${encodeURIComponent(r)}`).join("&");
    const url = `${GATEWAY}/spreadsheets/${SPREADSHEET_ID}/values:batchGet?${qs}`;

    const resp = await fetch(url, {
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": GOOGLE_SHEETS_API_KEY,
      },
    });
    const raw = await resp.json();
    if (!resp.ok) {
      throw new Error(`Google Sheets gateway error [${resp.status}]: ${JSON.stringify(raw)}`);
    }

    const valueRanges: { range: string; values?: string[][] }[] = raw.valueRanges ?? [];
    const byRange = new Map<string, string[][]>();
    for (const vr of valueRanges) {
      // Normalisasi key: hilangkan tanda kutip & range setelah "!"
      const key = vr.range.replace(/^'?|'?(?=!)/g, "").split("!")[0];
      byRange.set(key, vr.values ?? []);
    }

    // ---- Series Brebes dari "Indikator Perbandingan" ----
    const ip = byRange.get("Indikator Perbandingan") ?? [];
    const headerYears = (ip[0] ?? []).slice(2).map((y) => Number(y)).filter((n) => Number.isFinite(n));
    const seriesByLabel = new Map<string, SeriesRow[]>();
    for (let i = 1; i < ip.length; i++) {
      const row = ip[i];
      const label = (row[0] ?? "").trim();
      if (!label) continue;
      const cells = row.slice(2);
      const points: SeriesRow[] = [];
      for (let j = 0; j < headerYears.length; j++) {
        const v = parseId(cells[j]);
        if (v !== null) points.push({ tahun: headerYears[j], brebes: v });
      }
      if (points.length) seriesByLabel.set(label, points);
    }

    // ---- IKK series khusus dari tab "IKK" ----
    const ikkRows = byRange.get("IKK") ?? [];
    const ikkSeries: SeriesRow[] = [];
    for (let i = 1; i < ikkRows.length; i++) {
      const r = ikkRows[i];
      const tahun = Number(r[1]);
      const nilai = parseId(r[2]);
      if (Number.isFinite(tahun) && nilai !== null) ikkSeries.push({ tahun, brebes: nilai });
    }

    // ---- Ranking per indikator: ambil tahun terbaru yang memiliki data ----
    const buildRanking = (sheetName: string): { tahun: number | null; data: RankRow[] } => {
      const rows = byRange.get(sheetName) ?? [];
      if (rows.length < 2) return { tahun: null, data: [] };
      // Cari tahun terbaru
      const years = new Set<number>();
      for (let i = 1; i < rows.length; i++) {
        const y = Number(rows[i][2]);
        if (Number.isFinite(y)) years.add(y);
      }
      if (!years.size) return { tahun: null, data: [] };
      const tahun = Math.max(...years);
      const data: RankRow[] = [];
      for (let i = 1; i < rows.length; i++) {
        const r = rows[i];
        if (Number(r[2]) !== tahun) continue;
        const wilayah = cleanWilayah(String(r[0] ?? ""));
        const nilai = parseId(r[3]);
        if (!wilayah || nilai === null) continue;
        data.push({ wilayah, nilai });
      }
      return { tahun, data };
    };

    const indicators: Record<string, {
      slug: string;
      series: SeriesRow[];
      ranking: RankRow[];
      rankingTahun: number | null;
    }> = {};

    for (const def of INDICATOR_DEFS) {
      let series: SeriesRow[] = [];
      if (def.slug === "ikk") {
        series = ikkSeries;
      } else if (def.seriesLabel) {
        series = seriesByLabel.get(def.seriesLabel) ?? [];
      }
      const rank = def.rankingSheet ? buildRanking(def.rankingSheet) : { tahun: null, data: [] };
      indicators[def.slug] = {
        slug: def.slug,
        series,
        ranking: rank.data,
        rankingTahun: rank.tahun,
      };
    }

    return new Response(
      JSON.stringify({ indicators, fetchedAt: new Date().toISOString() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("sheets-indikator error", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
