import { Link } from "react-router-dom";
import { ArrowRight, Banknote, BarChart3, Briefcase, GraduationCap, Scale, TrendingUp, Users, UserMinus, Wheat, LineChart, Percent } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { RINGKASAN } from "@/data/statistik";

const fmt = (n: number) => n.toLocaleString("id-ID");
const fmtRp = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

const indicatorLinks = [
  { to: "/indikator/tpt", label: "Tingkat Pengangguran Terbuka" },
  { to: "/indikator/tpak", label: "Tingkat Partisipasi Angkatan Kerja" },
  { to: "/indikator/kemiskinan", label: "Kemiskinan" },
  { to: "/indikator/ipm", label: "IPM" },
  { to: "/indikator/padi", label: "Luas Panen & Produksi Padi" },
  { to: "/indikator/pertumbuhan-ekonomi", label: "Pertumbuhan Ekonomi" },
];

const Ringkasan = () => {
  const r = RINGKASAN;
  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow={`Data Tahun ${r.tahun}`}
        title="Ringkasan Eksekutif"
        description="Sajian angka-angka kunci yang menggambarkan kondisi terkini Kabupaten Brebes pada satu halaman. Klik indikator untuk melihat detail tren dan peringkat."
      />

      {/* Kependudukan */}
      <section className="mb-10">
        <h2 className="mb-4 font-display text-lg font-bold tracking-tight">Kependudukan</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Jumlah Penduduk" value={fmt(r.jumlahPenduduk)} unit="jiwa" icon={Users} variant="primary" hint={`Tahun ${r.tahun}`} />
          <StatCard label="Penduduk Laki-laki" value={fmt(r.pendudukLaki)} unit="jiwa" icon={Users} hint={`${((r.pendudukLaki / r.jumlahPenduduk) * 100).toFixed(2)}% dari total`} />
          <StatCard label="Penduduk Perempuan" value={fmt(r.pendudukPerempuan)} unit="jiwa" icon={Users} hint={`${((r.pendudukPerempuan / r.jumlahPenduduk) * 100).toFixed(2)}% dari total`} />
        </div>
      </section>

      {/* Kemiskinan */}
      <section className="mb-10">
        <h2 className="mb-4 font-display text-lg font-bold tracking-tight">Kemiskinan & Pemerataan</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Penduduk Miskin" value={fmt(r.pendudukMiskin)} unit="jiwa" icon={UserMinus} variant="accent" />
          <StatCard label="Miskin Laki-laki" value={fmt(r.miskinLaki)} unit="jiwa" icon={UserMinus} />
          <StatCard label="Miskin Perempuan" value={fmt(r.miskinPerempuan)} unit="jiwa" icon={UserMinus} />
          <StatCard label="Persentase Kemiskinan" value={r.persentaseKemiskinan.toFixed(2)} unit="%" icon={Percent} variant="accent" trend={{ value: -0.73, positive: true }} hint="vs tahun sebelumnya" />
          <StatCard label="Garis Kemiskinan" value={fmtRp(r.garisKemiskinan)} unit="/kapita/bln" icon={Banknote} />
          <StatCard label="Gini Ratio" value={r.giniRatio.toFixed(3)} icon={Scale} hint="0 = merata, 1 = timpang" />
        </div>
      </section>

      {/* Ekonomi */}
      <section className="mb-10">
        <h2 className="mb-4 font-display text-lg font-bold tracking-tight">Ekonomi</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="PDRB ADHB" value={r.pdrbAdhb} unit="triliun Rp" icon={BarChart3} variant="primary" />
          <StatCard label="PDRB ADHK" value={r.pdrbAdhk} unit="triliun Rp" icon={BarChart3} />
          <StatCard label="Pertumbuhan Ekonomi" value={r.pertumbuhanEkonomi.toFixed(2)} unit="%" icon={LineChart} variant="primary" trend={{ value: 0.16, positive: true }} hint="YoY" />
          <StatCard label="Inflasi" value={r.inflasi.toFixed(2)} unit="%" icon={TrendingUp} hint="Year-on-year" />
        </div>
      </section>

      {/* Sosial & Ketenagakerjaan */}
      <section className="mb-10">
        <h2 className="mb-4 font-display text-lg font-bold tracking-tight">Sosial & Ketenagakerjaan</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="IPM" value={r.ipm.toFixed(2)} icon={GraduationCap} variant="primary" trend={{ value: 0.49, positive: true }} hint="Pembangunan manusia" />
          <StatCard label="TPT" value={r.tpt.toFixed(2)} unit="%" icon={Briefcase} trend={{ value: -0.38, positive: true }} hint="Pengangguran terbuka" />
          <StatCard label="TPAK" value={r.tpak.toFixed(2)} unit="%" icon={Users} trend={{ value: 0.53, positive: true }} hint="Partisipasi kerja" />
        </div>
      </section>

      {/* Pertanian */}
      <section className="mb-10">
        <h2 className="mb-4 font-display text-lg font-bold tracking-tight">Pertanian</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard label="Luas Panen Padi" value={fmt(r.luasPanen)} unit="hektar" icon={Wheat} variant="accent" />
          <StatCard label="Produksi Padi" value={fmt(r.produksiPadi)} unit="ton GKG" icon={Wheat} variant="accent" />
        </div>
      </section>

      {/* Quick links */}
      <section className="rounded-2xl border border-border bg-gradient-subtle p-6 sm:p-8">
        <h2 className="font-display text-xl font-bold">Telusuri Indikator Detail</h2>
        <p className="mt-1 text-sm text-muted-foreground">Setiap indikator menyajikan tren 5 tahun, peringkat antar kab/kota Jateng, serta perbandingan dengan Provinsi & Nasional.</p>
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
