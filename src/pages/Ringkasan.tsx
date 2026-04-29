import { Link } from "react-router-dom";
import {
  ArrowRight, Banknote, BarChart3, Briefcase, GraduationCap, Scale, TrendingUp,
  Users, UserMinus, LineChart, Percent, AlertCircle, Building2, BookOpen, HeartPulse, Wallet, RefreshCw,
  Wheat, Sprout, Package, User, UserRound, UsersRound, Factory
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { useRingkasanSheets, type LatestValue } from "@/hooks/useRingkasanSheets";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatDecimal, formatInt, formatRupiah, normalizeGarisKemiskinan } from "@/lib/format";
import type { StatCardTrend } from "@/components/dashboard/StatCard";

const fmt = formatDecimal;
const fmtInt = formatInt;
const fmtRp = (n: number) => formatRupiah(n);

const indicatorLinks = [
  { to: "/indikator/tpt", label: "Tingkat Pengangguran Terbuka" },
  { to: "/indikator/tpak", label: "Tingkat Partisipasi Angkatan Kerja" },
  { to: "/indikator/kemiskinan", label: "Kemiskinan" },
  { to: "/indikator/ipm", label: "IPM" },
  { to: "/indikator/luas-panen-padi", label: "Luas Panen Padi" },
  { to: "/indikator/produksi-padi", label: "Produksi Padi" },
  { to: "/indikator/pertumbuhan-ekonomi", label: "Pertumbuhan Ekonomi" },
  { to: "/indikator/ikk", label: "Indeks Kemahalan Konstruksi" },
];

// Hitung tren (delta + persen) berdasar dua entri terakhir yang punya nilai pada `key`.
type TrenOpts = {
  /** Apakah nilai naik berarti baik (hijau)? Default true. */
  higherIsBetter?: boolean;
  /** Formatter angka delta (default desimal 2 digit). */
  formatDelta?: (n: number) => string;
  /** Satuan delta (mis. "%", "jiwa"). */
  unit?: string;
  /** Tampilkan persentase perubahan? Default true untuk indikator kuantitas, false untuk indikator yang sudah dalam %. */
  showPercent?: boolean;
};

const tren = (
  seri: Array<Record<string, number | null>>,
  key: string,
  opts: TrenOpts = {},
): StatCardTrend | undefined => {
  const { higherIsBetter = true, formatDelta, unit, showPercent = true } = opts;
  const valid = seri.filter((r) => r[key] !== null && r[key] !== undefined);
  if (valid.length < 2) return undefined;
  const lastRow = valid[valid.length - 1];
  const prevRow = valid[valid.length - 2];
  const last = lastRow[key] as number;
  const prev = prevRow[key] as number;
  const delta = +(last - prev).toFixed(4);
  const percent = showPercent && prev !== 0 ? +(((last - prev) / Math.abs(prev)) * 100).toFixed(2) : undefined;
  const naik = delta > 0;
  return {
    delta,
    percent,
    positive: delta === 0 ? true : higherIsBetter ? naik : !naik,
    comparedTo: `vs ${prevRow.tahun}`,
    formatDelta,
    unit,
  };
};

// Garis Kemiskinan kadang ditulis "563,762" di sheet (dimaksud 563.762 Rp).
// Jika nilai hasil parser < 10.000, anggap satuan "ribu" dan kalikan 1000.
// Hint period builder for cards
const periodHint = (year: number | null, prefix = "Tahun") =>
  year ? `${prefix} ${year}` : "";

// Hint period dengan dukungan label triwulan (mis. "Tahun 2025 · Triwulan II").
const periodHintQ = (year: number | null, suffix?: string | null, prefix = "Tahun") => {
  const base = periodHint(year, prefix);
  if (!base) return suffix ?? "";
  return suffix ? `${base} · ${suffix}` : base;
};

// Garis Kemiskinan kadang ditulis "563,762" di sheet (dimaksud 563.762 Rp).
// Jika nilai hasil parser < 10.000, anggap satuan "ribu" dan kalikan 1000.
const fixGarisKemiskinan = normalizeGarisKemiskinan;

const LoadingCard = () => (
  <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
    <Skeleton className="h-4 w-24" />
    <Skeleton className="mt-3 h-8 w-32" />
    <Skeleton className="mt-2 h-3 w-20" />
  </div>
);

const Ringkasan = () => {
  const { data, isLoading, isError, error, refetch, isFetching } = useRingkasanSheets();

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <PageHeader eyebrow="Memuat data…" title="Ringkasan Eksekutif" description="Mengambil angka terbaru dari Google Sheets." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => <LoadingCard key={i} />)}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="animate-fade-in">
        <PageHeader eyebrow="Gagal memuat" title="Ringkasan Eksekutif" description="Terjadi kesalahan saat mengambil data." />
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 text-destructive" />
            <div className="flex-1">
              <p className="font-semibold text-destructive">Tidak dapat memuat data dari Google Sheets</p>
              <p className="mt-1 text-sm text-muted-foreground">{(error as Error)?.message ?? "Unknown error"}</p>
              <Button onClick={() => refetch()} size="sm" className="mt-4">
                <RefreshCw className="mr-2 h-4 w-4" /> Coba lagi
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const r = data.ringkasan;
  const v = (lv: LatestValue) => (lv ? lv.value : null);
  const yr = (lv: LatestValue) => (lv ? lv.tahun : null);
  // Tahun referensi = tahun terbesar dari indikator-indikator utama
  const tahunRef = Math.max(
    ...[r.persenMiskin, r.tpt, r.tpak, r.ipm, r.gini, r.jumlahMiskin]
      .map((x) => x?.tahun ?? 0),
  );

  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow={`Data terkini · hingga tahun ${tahunRef}`}
        title="Ringkasan Eksekutif"
        description="Sajian angka-angka kunci yang menggambarkan kondisi terkini Kabupaten Brebes. Sumber data: Google Sheets BPS Kab. Brebes — diperbarui otomatis."
      />

      <div className="mb-6 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Pembaruan terakhir: {new Date(data.lastUpdated).toLocaleString("id-ID")}
        </p>
        <Button onClick={() => refetch()} size="sm" variant="outline" disabled={isFetching}>
          <RefreshCw className={`mr-2 h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} /> Muat ulang
        </Button>
      </div>

      {/* Demografi */}
      <section className="mb-10">
        <h2 className="mb-4 font-display text-lg font-bold tracking-tight">Demografi</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {v(r.pendudukTotal) !== null && (
            <StatCard
              label="Jumlah Penduduk"
              value={fmtInt(v(r.pendudukTotal)!)}
              unit="jiwa"
              icon={UsersRound}
              variant="primary"
              trend={tren(data.seri, "pendudukTotal", { formatDelta: fmtInt, unit: "jiwa" })}
              hint={`Proyeksi · ${periodHint(yr(r.pendudukTotal))}`}
            />
          )}
          {v(r.pendudukLaki) !== null && (
            <StatCard
              label="Penduduk Laki-laki"
              value={fmtInt(v(r.pendudukLaki)!)}
              unit="jiwa"
              icon={User}
              trend={tren(data.seri, "pendudukLaki", { formatDelta: fmtInt, unit: "jiwa" })}
              hint={periodHint(yr(r.pendudukLaki))}
            />
          )}
          {v(r.pendudukPerempuan) !== null && (
            <StatCard
              label="Penduduk Perempuan"
              value={fmtInt(v(r.pendudukPerempuan)!)}
              unit="jiwa"
              icon={UserRound}
              trend={tren(data.seri, "pendudukPerempuan", { formatDelta: fmtInt, unit: "jiwa" })}
              hint={periodHint(yr(r.pendudukPerempuan))}
            />
          )}
        </div>
      </section>

      {/* Kemiskinan & Pemerataan */}
      <section className="mb-10">
        <h2 className="mb-4 font-display text-lg font-bold tracking-tight">Kemiskinan & Pemerataan</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {v(r.persenMiskin) !== null && (
            <StatCard
              label="Persentase Penduduk Miskin"
              value={fmt(v(r.persenMiskin)!)}
              unit="%"
              icon={Percent}
              variant="accent"
              trend={tren(data.seri, "persenMiskin", { higherIsBetter: false, formatDelta: (n) => fmt(n), unit: "poin %", showPercent: false })}
              hint={periodHint(yr(r.persenMiskin))}
            />
          )}
          {v(r.jumlahMiskin) !== null && (
            <StatCard
              label="Jumlah Penduduk Miskin"
              value={fmt(v(r.jumlahMiskin)!, 2)}
              unit="ribu jiwa"
              icon={UserMinus}
              variant="accent"
              trend={tren(data.seri, "jumlahMiskin", { higherIsBetter: false, formatDelta: (n) => fmt(n), unit: "ribu jiwa" })}
              hint={periodHint(yr(r.jumlahMiskin))}
            />
          )}
          {v(r.miskinEkstrem) !== null && (
            <StatCard
              label="Kemiskinan Ekstrem"
              value={fmt(v(r.miskinEkstrem)!)}
              unit="%"
              icon={UserMinus}
              trend={tren(data.seri, "miskinEkstrem", { higherIsBetter: false, formatDelta: (n) => fmt(n), unit: "poin %", showPercent: false })}
              hint={periodHint(yr(r.miskinEkstrem))}
            />
          )}
          {v(r.garisKemiskinan) !== null && (
            <StatCard
              label="Garis Kemiskinan"
              value={fmtRp(fixGarisKemiskinan(v(r.garisKemiskinan)!))}
              unit="/kapita/bln"
              icon={Banknote}
              trend={tren(data.seri, "garisKemiskinan", { formatDelta: (n) => fmtInt(fixGarisKemiskinan(n)), unit: "Rp" })}
              hint={periodHint(yr(r.garisKemiskinan))}
            />
          )}
          {v(r.p1) !== null && (
            <StatCard
              label="Indeks Kedalaman (P1)"
              value={fmt(v(r.p1)!)}
              icon={LineChart}
              trend={tren(data.seri, "p1", { higherIsBetter: false, formatDelta: (n) => fmt(n) })}
              hint={periodHint(yr(r.p1))}
            />
          )}
          {v(r.p2) !== null && (
            <StatCard
              label="Indeks Keparahan (P2)"
              value={fmt(v(r.p2)!)}
              icon={LineChart}
              trend={tren(data.seri, "p2", { higherIsBetter: false, formatDelta: (n) => fmt(n) })}
              hint={periodHint(yr(r.p2))}
            />
          )}
          {v(r.gini) !== null && (
            <StatCard
              label="Gini Ratio"
              value={fmt(v(r.gini)!, 3)}
              icon={Scale}
              trend={tren(data.seri, "gini", { higherIsBetter: false, formatDelta: (n) => fmt(n, 3) })}
              hint={`${periodHint(yr(r.gini))} · 0 = merata, 1 = timpang`}
            />
          )}
        </div>
      </section>

      {/* Ketenagakerjaan */}
      <section className="mb-10">
        <h2 className="mb-4 font-display text-lg font-bold tracking-tight">Ketenagakerjaan</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {v(r.tpak) !== null && (
            <StatCard
              label="TPAK"
              value={fmt(v(r.tpak)!)}
              unit="%"
              icon={Users}
              variant="primary"
              trend={tren(data.seri, "tpak", { higherIsBetter: true, formatDelta: (n) => fmt(n), unit: "poin %", showPercent: false })}
              hint={`Partisipasi angkatan kerja · ${yr(r.tpak)}`}
            />
          )}
          {v(r.tpt) !== null && (
            <StatCard
              label="TPT"
              value={fmt(v(r.tpt)!)}
              unit="%"
              icon={Briefcase}
              variant="accent"
              trend={tren(data.seri, "tpt", { higherIsBetter: false, formatDelta: (n) => fmt(n), unit: "poin %", showPercent: false })}
              hint={`Pengangguran terbuka · ${yr(r.tpt)}`}
            />
          )}
        </div>
      </section>

      {/* Pembangunan Manusia */}
      <section className="mb-10">
        <h2 className="mb-4 font-display text-lg font-bold tracking-tight">Pembangunan Manusia</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {v(r.ipm) !== null && (
            <StatCard
              label="IPM"
              value={fmt(v(r.ipm)!)}
              icon={GraduationCap}
              variant="primary"
              trend={
                tren(data.seri, "ipmLF", { higherIsBetter: true, formatDelta: (n) => fmt(n) }) ??
                tren(data.seri, "ipm", { higherIsBetter: true, formatDelta: (n) => fmt(n) })
              }
              hint={periodHint(yr(r.ipm))}
            />
          )}
          {v(r.uhh) !== null && (
            <StatCard
              label="Umur Harapan Hidup"
              value={fmt(v(r.uhh)!)}
              unit="tahun"
              icon={HeartPulse}
              trend={
                tren(data.seri, "uhhLF", { higherIsBetter: true, formatDelta: (n) => fmt(n), unit: "th" }) ??
                tren(data.seri, "uhh", { higherIsBetter: true, formatDelta: (n) => fmt(n), unit: "th" })
              }
              hint={periodHint(yr(r.uhh))}
            />
          )}
          {v(r.eys) !== null && (
            <StatCard
              label="Harapan Lama Sekolah"
              value={fmt(v(r.eys)!)}
              unit="tahun"
              icon={BookOpen}
              trend={
                tren(data.seri, "hls", { higherIsBetter: true, formatDelta: (n) => fmt(n), unit: "th" }) ??
                tren(data.seri, "eys", { higherIsBetter: true, formatDelta: (n) => fmt(n), unit: "th" })
              }
              hint={periodHint(yr(r.eys))}
            />
          )}
          {v(r.mys) !== null && (
            <StatCard
              label="Rata-rata Lama Sekolah"
              value={fmt(v(r.mys)!)}
              unit="tahun"
              icon={BookOpen}
              trend={
                tren(data.seri, "rls", { higherIsBetter: true, formatDelta: (n) => fmt(n), unit: "th" }) ??
                tren(data.seri, "mys", { higherIsBetter: true, formatDelta: (n) => fmt(n), unit: "th" })
              }
              hint={periodHint(yr(r.mys))}
            />
          )}
          {v(r.ppp) !== null && (
            <StatCard
              label="Pengeluaran per Kapita"
              value={fmtInt(v(r.ppp)!)}
              unit="ribu Rp/tahun"
              icon={Wallet}
              trend={
                tren(data.seri, "pengeluaranKapita", { higherIsBetter: true, formatDelta: fmtInt, unit: "ribu Rp" }) ??
                tren(data.seri, "ppp", { higherIsBetter: true, formatDelta: fmtInt, unit: "ribu Rp" })
              }
              hint={`Disesuaikan · dalam ribuan rupiah · ${yr(r.ppp)}`}
            />
          )}
        </div>
      </section>

      {/* Pertanian */}
      <section className="mb-10">
        <h2 className="mb-4 font-display text-lg font-bold tracking-tight">Pertanian Padi</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {v(r.luasPanen) !== null && (
            <StatCard
              label="Luas Panen Padi"
              value={fmtInt(v(r.luasPanen)!)}
              unit="hektare"
              icon={Sprout}
              variant="primary"
              trend={tren(data.seri, "luasPanen", { higherIsBetter: true, formatDelta: fmtInt, unit: "ha" })}
              hint={periodHint(yr(r.luasPanen))}
            />
          )}
          {v(r.produksiPadi) !== null && (
            <StatCard
              label="Produksi Padi"
              value={fmtInt(v(r.produksiPadi)!)}
              unit="ton GKG"
              icon={Wheat}
              trend={tren(data.seri, "produksiPadi", { higherIsBetter: true, formatDelta: fmtInt, unit: "ton" })}
              hint={periodHint(yr(r.produksiPadi))}
            />
          )}
          {v(r.produksiBeras) !== null && (
            <StatCard
              label="Produksi Beras"
              value={fmtInt(v(r.produksiBeras)!)}
              unit="ton beras"
              icon={Package}
              trend={tren(data.seri, "produksiBeras", { higherIsBetter: true, formatDelta: fmtInt, unit: "ton" })}
              hint={periodHint(yr(r.produksiBeras))}
            />
          )}
        </div>
      </section>

      {/* Ekonomi */}
      <section className="mb-10">
        <h2 className="mb-4 font-display text-lg font-bold tracking-tight">Ekonomi</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.pdrb && data.pdrb.laju !== null && (
            <StatCard
              label="Laju Pertumbuhan PDRB (q-to-q)"
              value={fmt(data.pdrb.laju)}
              unit="%"
              icon={TrendingUp}
              variant="primary"
              hint={data.pdrb.periode}
            />
          )}
          {v(r.pdrbKonstan) !== null && (
            <StatCard
              label="PDRB Atas Dasar Harga Konstan"
              value={fmt(v(r.pdrbKonstan)!)}
              unit="miliar Rp"
              icon={Factory}
              variant="accent"
              trend={tren(data.seri, "pdrbKonstan", { higherIsBetter: true, formatDelta: (n) => fmt(n), unit: "miliar" })}
              hint={periodHintQ(yr(r.pdrbKonstan), data.periods?.pdrbKonstan)}
            />
          )}
          {v(r.pertumbuhanLU) !== null && (
            <StatCard
              label="Pertumbuhan Ekonomi Menurut Lapangan Usaha"
              value={fmt(v(r.pertumbuhanLU)!)}
              unit="%"
              icon={BarChart3}
              trend={tren(data.seri, "pertumbuhanLU", { higherIsBetter: true, formatDelta: (n) => fmt(n), unit: "poin %", showPercent: false })}
              hint={periodHintQ(yr(r.pertumbuhanLU), data.periods?.pertumbuhanLU)}
            />
          )}
          {v(r.lajuPdrbTahunan) !== null && (
            <StatCard
              label="Laju Pertumbuhan PDRB (tahunan)"
              value={fmt(v(r.lajuPdrbTahunan)!)}
              unit="%"
              icon={TrendingUp}
              trend={tren(data.seri, "lajuPdrbTahunan", { higherIsBetter: true, formatDelta: (n) => fmt(n), unit: "poin %", showPercent: false })}
              hint={periodHintQ(yr(r.lajuPdrbTahunan), data.periods?.lajuPdrbTahunan)}
            />
          )}
          {v(r.ikk) !== null && (
            <StatCard
              label="Indeks Kemahalan Konstruksi"
              value={fmt(v(r.ikk)!)}
              icon={Building2}
              trend={tren(data.seri, "ikk", { higherIsBetter: false, formatDelta: (n) => fmt(n) })}
              hint={periodHint(yr(r.ikk))}
            />
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-gradient-subtle p-6 sm:p-8">
        <h2 className="font-display text-xl font-bold">Telusuri Indikator Detail</h2>
        <p className="mt-1 text-sm text-muted-foreground">Setiap indikator menyajikan tren tahunan, peringkat antar kab/kota Jateng, serta perbandingan dengan Provinsi & Nasional.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {indicatorLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="group flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium transition-all hover:border-primary/40 hover:shadow-soft"
            >
              <span>{l.label}</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Ringkasan;
