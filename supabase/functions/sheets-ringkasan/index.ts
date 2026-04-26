// Edge function: ambil data Ringkasan Eksekutif dari Google Sheets
// via Lovable Connector Gateway (kunci API tidak pernah keluar ke browser).
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

    const ranges = [
      "Indikator!A1:Z60",
      "PDRB!A1:D20",
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

    const indikator = raw.valueRanges?.[0]?.values ?? [];
    const pdrb = raw.valueRanges?.[1]?.values ?? [];

    // Parser angka format Indonesia ("15,60" -> 15.6, "542.495" -> 542495, "11.853,00" -> 11853)
    const parseId = (s: unknown): number | null => {
      if (s === null || s === undefined) return null;
      const t = String(s).trim();
      if (!t || t === "#NA" || t === "-") return null;
      // Hapus pemisah ribuan (titik) lalu ganti koma desimal jadi titik
      const cleaned = t.replace(/\./g, "").replace(/,/g, ".");
      const n = Number(cleaned);
      return Number.isFinite(n) ? n : null;
    };

    // Header di baris 0, baris 1 sub-header. Data mulai baris 2.
    const header = indikator[0] ?? [];
    const idx = (label: string) => header.findIndex((h: string) => (h ?? "").toString().trim().toLowerCase() === label.toLowerCase());

    const COL = {
      tahun: idx("Tahun"),
      ikk: idx("Indeks Kemahalan Konstruksi"),
      persenMiskin: idx("Persentase Penduduk miskin (%)"),
      jumlahMiskin: idx("Jumlah Pendududuk Miskin (Ribu)"),
      garisKemiskinan: idx("Garis kemiskinan (Rp/kapita/bln) $ 3.250"),
      p1: idx("Indeks Kedalaman Kemiskinan (P1)"),
      p2: idx("Indeks Keparahan Kemiskinan (P2)"),
      miskinEkstrem: idx("Kemiskinan Ekstrem (%)"),
      gini: idx("Gini Rasio"),
      tpak: idx("TPAK"),
      tpt: idx("TPT"),
      uhh: idx("UHH"),
      uhhLF: idx("UHH (Hasil Long Form SP2020)"),
      eys: idx("EYS"),
      mys: idx("MYS"),
      ppp: idx("PPP (000 Rp)"),
      ipm: idx("IPM metode baru"),
      ipmLF: idx("IPM Metode baru (Dg UHH hasil Long Form SP2020)"),
      luasPanen: idx("Luas Panen Padi (Hektare)"),
      produksiPadi: idx("Produksi Padi (Ton GKG)"),
      produksiBeras: idx("Produksi Beras (Ton Beras)"),
      pendudukLaki: idx("Proyeksi Penduduk Laki-laki (Jiwa)"),
      pendudukPerempuan: idx("Proyeksi Penduduk Perempuan (Jiwa)"),
      pendudukTotal: idx("Proyeksi Penduduk Total (Jiwa)"),
      pertumbuhanLU: idx("Pertumbuhan Ekonomi Menurut Lapangan Usaha"),
      pdrbKonstan: idx("PDRB Atas Dasar Harga Konstan (miliar rupiah)"),
      lajuPdrbTahunan: idx("Laju Pertumbuhan PDRB (q to q) (persen)"),
    };

    // Bangun seri tahunan
    const dataRows = indikator.slice(2).filter((r: any[]) => parseId(r[COL.tahun]));
    const seri = dataRows.map((r: any[]) => ({
      tahun: parseId(r[COL.tahun])!,
      persenMiskin: parseId(r[COL.persenMiskin]),
      jumlahMiskin: parseId(r[COL.jumlahMiskin]),
      garisKemiskinan: parseId(r[COL.garisKemiskinan]),
      p1: parseId(r[COL.p1]),
      p2: parseId(r[COL.p2]),
      miskinEkstrem: parseId(r[COL.miskinEkstrem]),
      gini: parseId(r[COL.gini]),
      tpak: parseId(r[COL.tpak]),
      tpt: parseId(r[COL.tpt]),
      uhh: parseId(r[COL.uhh]),
      uhhLF: parseId(r[COL.uhhLF]),
      eys: parseId(r[COL.eys]),
      mys: parseId(r[COL.mys]),
      ppp: parseId(r[COL.ppp]),
      ipm: parseId(r[COL.ipm]),
      ipmLF: parseId(r[COL.ipmLF]),
      ikk: parseId(r[COL.ikk]),
    }));

    // Ambil tahun terakhir yang punya nilai untuk setiap indikator
    const latest = <K extends keyof typeof seri[number]>(key: K) => {
      for (let i = seri.length - 1; i >= 0; i--) {
        const v = seri[i][key];
        if (v !== null && v !== undefined) return { tahun: seri[i].tahun, value: v as number };
      }
      return null;
    };

    const ringkasan = {
      persenMiskin: latest("persenMiskin"),
      jumlahMiskin: latest("jumlahMiskin"),
      garisKemiskinan: latest("garisKemiskinan"),
      p1: latest("p1"),
      p2: latest("p2"),
      miskinEkstrem: latest("miskinEkstrem"),
      gini: latest("gini"),
      tpak: latest("tpak"),
      tpt: latest("tpt"),
      uhh: latest("uhhLF") ?? latest("uhh"),
      eys: latest("eys"),
      mys: latest("mys"),
      ppp: latest("ppp"),
      ipm: latest("ipmLF") ?? latest("ipm"),
      ikk: latest("ikk"),
    };

    // PDRB (q-to-q) -> ambil baris terakhir
    const pdrbRows = pdrb.slice(1).filter((r: any[]) => r && r[2]);
    const lastPdrb = pdrbRows[pdrbRows.length - 1];
    const pdrbInfo = lastPdrb
      ? { periode: String(lastPdrb[2]), laju: parseId(lastPdrb[3]) }
      : null;

    return new Response(
      JSON.stringify({ ringkasan, seri, pdrb: pdrbInfo, lastUpdated: new Date().toISOString() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("sheets-ringkasan error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
