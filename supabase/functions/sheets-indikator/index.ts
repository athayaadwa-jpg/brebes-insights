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

// Bersihkan nama wilayah:
// - hilangkan prefix "Kab. "
// - rapikan spasi ganda (mis. "P a t i" -> "Pati" dijaga manual via map khusus)
// - "Kota X" tetap apa adanya
const WILAYAH_FIX: Record<string, string> = {
  "P a t i": "Pati",
};
const cleanWilayah = (s: string): string => {
  let t = s.trim().replace(/\s+/g, " ");
  if (t.startsWith("Kab. ")) t = t.slice(5);
  return WILAYAH_FIX[t] ?? t;
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

    // ---- Ranking per indikator: kelompokkan per tahun ----
    // Mengembalikan ranking untuk SEMUA tahun yang tersedia, plus jateng &
    // nasional series (per tahun). Frontend dapat memilih tahun untuk grafik
    // batang dan menggambar garis Jateng/Nasional pada chart tren.
    type RankByYear = Record<number, RankRow[]>;
    type CompareByYear = Record<number, number>;
    const buildRanking = (sheetName: string): {
      tahun: number | null;
      data: RankRow[];
      jateng: number | null;
      nasional: number | null;
      rankingByYear: RankByYear;
      jatengByYear: CompareByYear;
      nasionalByYear: CompareByYear;
      years: number[];
    } => {
      const rows = byRange.get(sheetName) ?? [];
      const empty = {
        tahun: null, data: [], jateng: null, nasional: null,
        rankingByYear: {}, jatengByYear: {}, nasionalByYear: {}, years: [],
      };
      if (rows.length < 2) return empty;
      const rankingByYear: RankByYear = {};
      const jatengByYear: CompareByYear = {};
      const nasionalByYear: CompareByYear = {};
      for (let i = 1; i < rows.length; i++) {
        const r = rows[i];
        const y = Number(r[2]);
        if (!Number.isFinite(y)) continue;
        const wilayahRaw = String(r[0] ?? "").trim();
        const nilai = parseId(r[3]);
        if (!wilayahRaw || nilai === null) continue;
        if (/^jawa tengah$/i.test(wilayahRaw)) { jatengByYear[y] = nilai; continue; }
        if (/^(indonesia|nasional)$/i.test(wilayahRaw)) { nasionalByYear[y] = nilai; continue; }
        (rankingByYear[y] ??= []).push({ wilayah: cleanWilayah(wilayahRaw), nilai });
      }
      const years = Object.keys(rankingByYear).map(Number).sort((a, b) => a - b);
      if (!years.length) return empty;
      const tahun = years[years.length - 1];
      return {
        tahun,
        data: rankingByYear[tahun] ?? [],
        jateng: jatengByYear[tahun] ?? null,
        nasional: nasionalByYear[tahun] ?? null,
        rankingByYear,
        jatengByYear,
        nasionalByYear,
        years,
      };
    };

    const indicators: Record<string, {
      slug: string;
      series: SeriesRow[];
      seriesJateng: { tahun: number; nilai: number }[];
      seriesNasional: { tahun: number; nilai: number }[];
      ranking: RankRow[];
      rankingTahun: number | null;
      rankingByYear: Record<number, RankRow[]>;
      rankingYears: number[];
      jatengByYear: Record<number, number>;
      nasionalByYear: Record<number, number>;
      jateng: number | null;
      nasional: number | null;
    }> = {};

    for (const def of INDICATOR_DEFS) {
      let series: SeriesRow[] = [];
      if (def.slug === "ikk") {
        series = ikkSeries;
      } else if (def.seriesLabel) {
        series = seriesByLabel.get(def.seriesLabel) ?? [];
      }
      const rank = def.rankingSheet
        ? buildRanking(def.rankingSheet)
        : {
            tahun: null, data: [], jateng: null, nasional: null,
            rankingByYear: {}, jatengByYear: {}, nasionalByYear: {}, years: [],
          };

      // Bangun series Jateng/Nasional dari ranking per tahun (untuk grafik tren).
      const seriesJateng = Object.entries(rank.jatengByYear)
        .map(([y, v]) => ({ tahun: Number(y), nilai: v as number }))
        .sort((a, b) => a.tahun - b.tahun);
      const seriesNasional = Object.entries(rank.nasionalByYear)
        .map(([y, v]) => ({ tahun: Number(y), nilai: v as number }))
        .sort((a, b) => a.tahun - b.tahun);

      indicators[def.slug] = {
        slug: def.slug,
        series,
        seriesJateng,
        seriesNasional,
        ranking: rank.data,
        rankingTahun: rank.tahun,
        rankingByYear: rank.rankingByYear,
        rankingYears: rank.years,
        jatengByYear: rank.jatengByYear,
        nasionalByYear: rank.nasionalByYear,
        jateng: rank.jateng,
        nasional: rank.nasional,
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
