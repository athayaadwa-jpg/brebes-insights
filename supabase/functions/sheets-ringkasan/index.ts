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
      "Indikator!A1:AZ60",
      "PDRB!A1:D30",
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
    const norm = (s: unknown) => (s ?? "").toString().trim().toLowerCase().replace(/\s+/g, " ");
    // Cari kolom dengan exact match dulu, lalu prefix match (toleran terhadap
    // suffix tambahan seperti " (Triwulan II)" yang muncul di header sumber).
    const idx = (label: string) => {
      const want = norm(label);
      const exact = header.findIndex((h: string) => norm(h) === want);
      if (exact !== -1) return exact;
      return header.findIndex((h: string) => norm(h).startsWith(want));
    };

    // Ekstrak label periode (mis. "Triwulan II") dari teks header sumber.
    // Mengembalikan null jika tidak ditemukan pola triwulan.
    const extractTriwulan = (colIdx: number): string | null => {
      if (colIdx < 0) return null;
      const raw = String(header[colIdx] ?? "");
      const m = raw.match(/triwulan\s+([IVX]+|\d+)/i);
      return m ? `Triwulan ${m[1].toUpperCase()}` : null;
    };

    const COL = {
      tahun: idx("Tahun"),
      ikk: idx("Indeks Kemahalan Konstruksi"),
      persenMiskin: idx("Persentase Penduduk miskin (%)"),
      jumlahMiskin: idx("Jumlah Pendududuk Miskin (Ribu)"),
      garisKemiskinan: idx("Garis kemiskinan (Rp/kapita/bln) $ 3.250"),
      p1: idx("Indeks Kedalaman Kemiskinan (P1)"),
      p2: idx("Indeks Keparahan Kemiskinan (P2)"),
      miskinEkstrem: idx("Kemiskinan Ekstrem (%)"),
      jumlahMiskinEkstrem: idx("Jumlah Penduduk Miskin Ekstrem (000)"),
      gini: idx("Gini Rasio"),
      distribusi40Bawah: idx("40%  I"),
      distribusi40Tengah: idx("40%  II"),
      distribusi20Atas: idx("20%  III"),
      tpak: idx("TPAK"),
      tpt: idx("TPT"),
      uhh: idx("UHH"),
      uhhLF: idx("UHH (Hasil Long Form SP2020)"),
      eys: idx("EYS"),
      mys: idx("MYS"),
      ppp: idx("PPP (000 Rp)"),
      ipm: idx("IPM metode baru"),
      ipmLF: idx("IPM Metode baru (Dg UHH hasil Long Form SP2020)"),
      // Kolom baru (label tanpa singkatan) — sumber utama untuk tahun terkini
      hls: idx("Harapan Lama Sekolah"),
      rls: idx("Rata-rata Lama Sekolah"),
      pengeluaranKapita: idx("Pengeluaran per kapita disesuaikan (Rp. 000)"),
      luasPanen: idx("Luas Panen Padi (Hektare)"),
      produksiPadi: idx("Produksi Padi (Ton GKG)"),
      produksiBeras: idx("Produksi Beras (Ton Beras)"),
      pendudukLaki: idx("Proyeksi Penduduk Laki-laki (Jiwa)"),
      pendudukPerempuan: idx("Proyeksi Penduduk Perempuan (Jiwa)"),
      pendudukTotal: idx("Proyeksi Penduduk Total (Jiwa)"),
      // Catatan: header sheet kini menambah suffix " (Triwulan II)" untuk kolom
      // PDRB. Pencarian prefix di atas menanganinya secara otomatis.
      pertumbuhanLU: idx("Pertumbuhan Ekonomi Menurut Lapangan Usaha"),
      pdrbKonstan: idx("PDRB Atas Dasar Harga Konstan (miliar rupiah)"),
      lajuPdrbTahunan: idx("Laju Pertumbuhan PDRB (q to q) (persen)"),
      // Kolom partisipasi sekolah (header utama + sub-header pada baris 1).
      // Kolom utama hanya berisi label "APS"/"APM"/"APK"; nilai per kelompok
      // umur/jenjang ada di kolom-kolom berikutnya berurutan.
      apsBase: idx("APS"),
      apmBase: idx("APM"),
      apkBase: idx("APK"),
    };

    // Helper: ambil nilai pada offset relatif terhadap kolom dasar (untuk
    // kolom bertingkat seperti APS/APM/APK yang memiliki sub-header).
    const at = (r: any[], base: number, offset: number) =>
      base >= 0 ? parseId(r[base + offset]) : null;

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
      jumlahMiskinEkstrem: parseId(r[COL.jumlahMiskinEkstrem]),
      gini: parseId(r[COL.gini]),
      distribusi40Bawah: parseId(r[COL.distribusi40Bawah]),
      distribusi40Tengah: parseId(r[COL.distribusi40Tengah]),
      distribusi20Atas: parseId(r[COL.distribusi20Atas]),
      tpak: parseId(r[COL.tpak]),
      tpt: parseId(r[COL.tpt]),
      uhh: parseId(r[COL.uhh]),
      uhhLF: parseId(r[COL.uhhLF]),
      eys: parseId(r[COL.eys]),
      mys: parseId(r[COL.mys]),
      ppp: parseId(r[COL.ppp]),
      ipm: parseId(r[COL.ipm]),
      ipmLF: parseId(r[COL.ipmLF]),
      hls: parseId(r[COL.hls]),
      rls: parseId(r[COL.rls]),
      pengeluaranKapita: parseId(r[COL.pengeluaranKapita]),
      ikk: parseId(r[COL.ikk]),
      luasPanen: parseId(r[COL.luasPanen]),
      produksiPadi: parseId(r[COL.produksiPadi]),
      produksiBeras: parseId(r[COL.produksiBeras]),
      pendudukLaki: parseId(r[COL.pendudukLaki]),
      pendudukPerempuan: parseId(r[COL.pendudukPerempuan]),
      pendudukTotal: parseId(r[COL.pendudukTotal]),
      pertumbuhanLU: parseId(r[COL.pertumbuhanLU]),
      pdrbKonstan: parseId(r[COL.pdrbKonstan]),
      lajuPdrbTahunan: parseId(r[COL.lajuPdrbTahunan]),
      // Partisipasi sekolah: APS (07-12, 13-15, 16-18 th), APM/APK (SD, SMP, SMA)
      apsSd: at(r, COL.apsBase, 0),
      apsSmp: at(r, COL.apsBase, 1),
      apsSma: at(r, COL.apsBase, 2),
      apmSd: at(r, COL.apmBase, 0),
      apmSmp: at(r, COL.apmBase, 1),
      apmSma: at(r, COL.apmBase, 2),
      apkSd: at(r, COL.apkBase, 0),
      apkSmp: at(r, COL.apkBase, 1),
      apkSma: at(r, COL.apkBase, 2),
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
      jumlahMiskinEkstrem: latest("jumlahMiskinEkstrem"),
      gini: latest("gini"),
      distribusi40Bawah: latest("distribusi40Bawah"),
      distribusi40Tengah: latest("distribusi40Tengah"),
      distribusi20Atas: latest("distribusi20Atas"),
      tpak: latest("tpak"),
      tpt: latest("tpt"),
      uhh: latest("uhhLF") ?? latest("uhh"),
      // Pembangunan Manusia: utamakan kolom baru (label tanpa singkatan), fallback ke kolom lama.
      eys: latest("hls") ?? latest("eys"),
      mys: latest("rls") ?? latest("mys"),
      ppp: latest("pengeluaranKapita") ?? latest("ppp"),
      ipm: latest("ipmLF") ?? latest("ipm"),
      ikk: latest("ikk"),
      luasPanen: latest("luasPanen"),
      produksiPadi: latest("produksiPadi"),
      produksiBeras: latest("produksiBeras"),
      pendudukLaki: latest("pendudukLaki"),
      pendudukPerempuan: latest("pendudukPerempuan"),
      pendudukTotal: latest("pendudukTotal"),
      pertumbuhanLU: latest("pertumbuhanLU"),
      pdrbKonstan: latest("pdrbKonstan"),
      lajuPdrbTahunan: latest("lajuPdrbTahunan"),
    };

    // Label periode (mis. "Triwulan II") yang dideteksi dari header sumber.
    // Hanya disetel jika header memang memuat kata "Triwulan ...".
    const periods = {
      pertumbuhanLU: extractTriwulan(COL.pertumbuhanLU),
      pdrbKonstan: extractTriwulan(COL.pdrbKonstan),
      lajuPdrbTahunan: extractTriwulan(COL.lajuPdrbTahunan),
    };

    // PDRB (q-to-q) -> ambil baris terakhir
    const pdrbRows = pdrb.slice(1).filter((r: any[]) => r && r[2]);
    const lastPdrb = pdrbRows[pdrbRows.length - 1];
    const pdrbInfo = lastPdrb
      ? { periode: String(lastPdrb[2]), laju: parseId(lastPdrb[3]) }
      : null;

    return new Response(
      JSON.stringify({ ringkasan, seri, pdrb: pdrbInfo, periods, lastUpdated: new Date().toISOString() }),
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
