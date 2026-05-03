// Edge function: ambil data DETAIL setiap indikator (series Brebes + ranking
// se-Jawa Tengah) dari Google Sheets via Lovable Connector Gateway.
//
// Sumber utama: tab "Rangking Semua" (gid=1507957902) — satu tabel berisi
// 9 grup indikator × 5 tahun (2021-2025) untuk semua kab/kota + Jawa Tengah +
// Indonesia. Layout: kolom A = wilayah, B-AS = nilai per indikator per tahun.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SPREADSHEET_ID = "1BGKHK-qIYPe5Vpez9b7lRS3vp7igJ7JzW_jGGsmfjaw";
const GATEWAY = "https://connector-gateway.lovable.dev/google_sheets/v4";

// Parser angka format Indonesia: "15,60" -> 15.6, "1.035.743,00" -> 1035743.
const parseId = (s: unknown): number | null => {
  if (s === null || s === undefined) return null;
  const t = String(s).trim();
  if (!t || t === "#NA" || t === "-") return null;
  let cleaned: string;
  if (t.includes(",")) {
    cleaned = t.replace(/\./g, "").replace(/,/g, ".");
  } else if (/^\d{1,3}(\.\d{3})+$/.test(t)) {
    cleaned = t.replace(/\./g, "");
  } else {
    cleaned = t;
  }
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
};

const WILAYAH_FIX: Record<string, string> = { "P a t i": "Pati" };
const cleanWilayah = (s: string): string => {
  let t = s.trim().replace(/\s+/g, " ");
  if (t.startsWith("Kab. ")) t = t.slice(5);
  return WILAYAH_FIX[t] ?? t;
};

type RankRow = { wilayah: string; nilai: number };
type SeriesRow = { tahun: number; brebes: number };

// Urutan grup indikator pada tab "Rangking Semua" — harus sama dengan header
// baris pertama (A1:AS1). Setiap grup berisi 5 kolom tahun (2021-2025).
type GroupDef = { slug: string; header: string };
const GROUPS: GroupDef[] = [
  { slug: "tpak",                header: "TPAK" },
  { slug: "tpt",                 header: "TPT" },
  { slug: "ipm",                 header: "IPM" },
  { slug: "kemiskinan",          header: "Kemiskinan" },
  { slug: "luas-panen-padi",     header: "Luas Panen" },
  { slug: "produksi-padi",       header: "Produksi Padi" },
  { slug: "produksi-beras",      header: "Produksi Beras" },
  { slug: "pertumbuhan-ekonomi", header: "Laju Pertumbuhan (y-on-y) PDRB Triwulan IV" },
  { slug: "ikk",                 header: "Indeks Kemahalan Konstruksi" },
  { slug: "uhh",                 header: "Umur Harapan Hidup saat Lahir" },
  { slug: "hls",                 header: "Harapan Lama Sekolah" },
  { slug: "rls",                 header: "Rata-rata Lama Sekolah" },
  { slug: "pengeluaran-riil",    header: "Pengeluaran Riil per Kapita per Tahun yang disesuaikan" },
  { slug: "gini-rasio",          header: "Gini Rasio" },
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

    // Baca SEMUA data dari tab "Rangking Semua" — kolom A sampai AS (1+45).
    const range = "Rangking Semua!A1:BT200";
    const url = `${GATEWAY}/spreadsheets/${SPREADSHEET_ID}/values/x?range=${encodeURIComponent(range)}`;
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
    const rows: string[][] = raw.values ?? [];
    if (rows.length < 3) throw new Error("Sheet 'Rangking Semua' kosong/tidak valid");

    const headerGroup = rows[0] ?? [];
    const headerYears = rows[1] ?? [];

    // Pemetaan slug -> daftar { col, tahun }
    const slugCols = new Map<string, { col: number; tahun: number }[]>();
    let currentSlug: string | null = null;
    const maxCols = Math.max(headerGroup.length, headerYears.length);
    for (let c = 1; c < maxCols; c++) {
      const h = (headerGroup[c] ?? "").trim();
      if (h) {
        const g = GROUPS.find((g) => g.header.toLowerCase() === h.toLowerCase());
        currentSlug = g ? g.slug : null;
      }
      if (!currentSlug) continue;
      const tahun = Number((headerYears[c] ?? "").toString().trim());
      if (!Number.isFinite(tahun)) continue;
      const list = slugCols.get(currentSlug) ?? [];
      // Jika tahun duplikat (bug di sheet, mis. Luas Panen semua "2021"),
      // auto-increment dari tahun pertama
      const actualTahun = list.length > 0 && list.every((l) => l.tahun === tahun)
        ? tahun + list.length
        : tahun;
      list.push({ col: c, tahun: actualTahun });
      slugCols.set(currentSlug, list);
    }

    // Inisialisasi struktur per indikator
    type Acc = {
      slug: string;
      series: SeriesRow[];                          // Brebes
      seriesJateng: { tahun: number; nilai: number }[];
      seriesNasional: { tahun: number; nilai: number }[];
      rankingByYear: Record<number, RankRow[]>;
      jatengByYear: Record<number, number>;
      nasionalByYear: Record<number, number>;
      years: number[];
    };
    const acc: Record<string, Acc> = {};
    for (const g of GROUPS) {
      acc[g.slug] = {
        slug: g.slug,
        series: [],
        seriesJateng: [],
        seriesNasional: [],
        rankingByYear: {},
        jatengByYear: {},
        nasionalByYear: {},
        years: [],
      };
    }

    // Iterasi setiap baris wilayah (mulai baris ke-3)
    for (let i = 2; i < rows.length; i++) {
      const row = rows[i];
      const wilayahRaw = (row?.[0] ?? "").trim();
      if (!wilayahRaw) continue;
      const isJateng = /^jawa tengah$/i.test(wilayahRaw);
      const isNasional = /^(indonesia|nasional)$/i.test(wilayahRaw);
      const isBrebes = /^kab\.\s*brebes$/i.test(wilayahRaw);

      for (const g of GROUPS) {
        const cols = slugCols.get(g.slug) ?? [];
        for (const { col, tahun } of cols) {
          const nilai = parseId(row[col]);
          if (nilai === null) continue;
          const a = acc[g.slug];
          if (isJateng) {
            a.jatengByYear[tahun] = nilai;
          } else if (isNasional) {
            a.nasionalByYear[tahun] = nilai;
          } else {
            (a.rankingByYear[tahun] ??= []).push({
              wilayah: cleanWilayah(wilayahRaw),
              nilai,
            });
            if (isBrebes) a.series.push({ tahun, brebes: nilai });
          }
        }
      }
    }

    // Susun output final per indikator
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

    for (const g of GROUPS) {
      const a = acc[g.slug];
      a.series.sort((x, y) => x.tahun - y.tahun);
      a.seriesJateng = Object.entries(a.jatengByYear)
        .map(([y, v]) => ({ tahun: Number(y), nilai: v }))
        .sort((x, y) => x.tahun - y.tahun);
      a.seriesNasional = Object.entries(a.nasionalByYear)
        .map(([y, v]) => ({ tahun: Number(y), nilai: v }))
        .sort((x, y) => x.tahun - y.tahun);
      const years = Object.keys(a.rankingByYear).map(Number).sort((x, y) => x - y);
      const tahun = years.length ? years[years.length - 1] : null;
      indicators[g.slug] = {
        slug: g.slug,
        series: a.series,
        seriesJateng: a.seriesJateng,
        seriesNasional: a.seriesNasional,
        ranking: tahun !== null ? (a.rankingByYear[tahun] ?? []) : [],
        rankingTahun: tahun,
        rankingByYear: a.rankingByYear,
        rankingYears: years,
        jatengByYear: a.jatengByYear,
        nasionalByYear: a.nasionalByYear,
        jateng: tahun !== null ? (a.jatengByYear[tahun] ?? null) : null,
        nasional: tahun !== null ? (a.nasionalByYear[tahun] ?? null) : null,
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
