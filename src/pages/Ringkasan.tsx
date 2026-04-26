import { Link } from "react-router-dom";
import {
  ArrowRight, Banknote, BarChart3, Briefcase, GraduationCap, Scale, TrendingUp,
  Users, UserMinus, LineChart, Percent, AlertCircle, Building2, BookOpen, HeartPulse, Wallet, RefreshCw
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { useRingkasanSheets, type LatestValue } from "@/hooks/useRingkasanSheets";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const fmt = (n: number, digits = 2) =>
  n.toLocaleString("id-ID", { maximumFractionDigits: digits, minimumFractionDigits: digits });
const fmtInt = (n: number) => Math.round(n).toLocaleString("id-ID");
const fmtRp = (n: number) => `Rp ${Math.round(n).toLocaleString("id-ID")}`;

const indicatorLinks = [
  { to: "/indikator/tpt", label: "Tingkat Pengangguran Terbuka" },
  { to: "/indikator/tpak", label: "Tingkat Partisipasi Angkatan Kerja" },
  { to: "/indikator/kemiskinan", label: "Kemiskinan" },
  { to: "/indikator/ipm", label: "IPM" },
  { to: "/indikator/padi", label: "Luas Panen & Produksi Padi" },
  { to: "/indikator/pertumbuhan-ekonomi", label: "Pertumbuhan Ekonomi" },
];

// Hitung tren YoY (% point) berdasar dua entri terakhir yang punya nilai pada `key`.
const tren = (
  seri: Array<Record<string, number | null>>,
  key: string,
  higherIsBetter: boolean,
): { value: number; positive: boolean } | undefined => {
  const valid = seri.filter((r) => r[key] !== null && r[key] !== undefined);
  if (valid.length < 2) return undefined;
  const last = valid[valid.length - 1][key] as number;
  const prev = valid[valid.length - 2][key] as number;
  const delta = +(last - prev).toFixed(2);
  if (delta === 0) return undefined;
  const naik = delta > 0;
  return { value: delta, positive: higherIsBetter ? naik : !naik };
};

// Garis Kemiskinan kadang ditulis "563,762" di sheet (dimaksud 563.762 Rp).
// Jika nilai hasil parser < 10.000, anggap satuan "ribu" dan kalikan 1000.
const fixGarisKemiskinan = (v: number) => (v < 10000 ? Math.round(v * 1000) : Math.round(v));

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
              trend={tren(data.seri, "persenMiskin", false)}
              hint={`Tahun ${yr(r.persenMiskin)}`}
            />
          )}
          {v(r.jumlahMiskin) !== null && (
            <StatCard
              label="Jumlah Penduduk Miskin"
              value={fmt(v(r.jumlahMiskin)!, 2)}
              unit="ribu jiwa"
              icon={UserMinus}
              variant="accent"
              trend={tren(data.seri, "jumlahMiskin", false)}
              hint={`Tahun ${yr(r.jumlahMiskin)}`}
            />
          )}
          {v(r.miskinEkstrem) !== null && (
            <StatCard
              label="Kemiskinan Ekstrem"
              value={fmt(v(r.miskinEkstrem)!)}
              unit="%"
              icon={UserMinus}
              hint={`Tahun ${yr(r.miskinEkstrem)}`}
            />
          )}
          {v(r.garisKemiskinan) !== null && (
            <StatCard
              label="Garis Kemiskinan"
              value={fmtRp(fixGarisKemiskinan(v(r.garisKemiskinan)!))}
              unit="/kapita/bln"
              icon={Banknote}
              hint={`Tahun ${yr(r.garisKemiskinan)}`}
            />
          )}
          {v(r.p1) !== null && (
            <StatCard label="Indeks Kedalaman (P1)" value={fmt(v(r.p1)!)} icon={LineChart} hint={`Tahun ${yr(r.p1)}`} />
          )}
          {v(r.p2) !== null && (
            <StatCard label="Indeks Keparahan (P2)" value={fmt(v(r.p2)!)} icon={LineChart} hint={`Tahun ${yr(r.p2)}`} />
          )}
          {v(r.gini) !== null && (
            <StatCard
              label="Gini Ratio"
              value={fmt(v(r.gini)!, 3)}
              icon={Scale}
              hint={`Tahun ${yr(r.gini)} · 0 = merata, 1 = timpang`}
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
              trend={tren(data.seri, "tpak", true)}
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
              trend={tren(data.seri, "tpt", false)}
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
              trend={tren(data.seri, "ipmLF", true) ?? tren(data.seri, "ipm", true)}
              hint={`Tahun ${yr(r.ipm)}`}
            />
          )}
          {v(r.uhh) !== null && (
            <StatCard label="Umur Harapan Hidup" value={fmt(v(r.uhh)!)} unit="tahun" icon={HeartPulse} hint={`Tahun ${yr(r.uhh)}`} />
          )}
          {v(r.eys) !== null && (
            <StatCard label="Harapan Lama Sekolah" value={fmt(v(r.eys)!)} unit="tahun" icon={BookOpen} hint={`Tahun ${yr(r.eys)}`} />
          )}
          {v(r.mys) !== null && (
            <StatCard label="Rata-rata Lama Sekolah" value={fmt(v(r.mys)!)} unit="tahun" icon={BookOpen} hint={`Tahun ${yr(r.mys)}`} />
          )}
          {v(r.ppp) !== null && (
            <StatCard
              label="Pengeluaran per Kapita"
              value={fmtRp(v(r.ppp)! * 1000)}
              unit="/tahun"
              icon={Wallet}
              hint={`Disesuaikan · ${yr(r.ppp)}`}
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
          {v(r.ikk) !== null && (
            <StatCard
              label="Indeks Kemahalan Konstruksi"
              value={fmt(v(r.ikk)!)}
              icon={Building2}
              hint={`Tahun ${yr(r.ikk)}`}
            />
          )}
        </div>
      </section>

      {/* Quick links */}
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
