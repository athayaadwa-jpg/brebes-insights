import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, Database, Layers, MapPin, ShieldCheck, TrendingUp } from "lucide-react";
import heroImage from "@/assets/hero-brebes.jpg";
import logoInteresLight from "@/assets/logo-interes-light.png";
import { Button } from "@/components/ui/button";

const features = [
  { icon: Layers, title: "Data Terintegrasi", desc: "Indikator strategis kependudukan, ekonomi, dan kesejahteraan dalam satu tampilan." },
  { icon: TrendingUp, title: "Tren 5 Tahun", desc: "Pantau perkembangan setiap indikator dengan grafik time-series yang jelas." },
  { icon: BarChart3, title: "Perbandingan Wilayah", desc: "Data bersumber dari rilis resmi BPS" },
  { icon: ShieldCheck, title: "Sumber Resmi", desc: "Data bersumber dari BPS Kabupaten Brebes dan Provinsi Jawa Tengah." },
];

const Beranda = () => {
  return (
    <div className="space-y-16 animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl shadow-elegant">
        <img
          src={heroImage}
          alt="Lanskap Kabupaten Brebes"
          width={1920}
          height={1080}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/85 to-primary-glow/70" />
        <div className="relative px-6 py-16 sm:px-12 sm:py-24 lg:py-28">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent/95 px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent-foreground shadow-soft">
            <MapPin className="h-3 w-3" /> Kabupaten Brebes · Jawa Tengah
          </div>
          <img
            src={logoInteresLight}
            alt="Interes"
            className="mt-5 h-16 w-auto object-contain sm:h-20 lg:h-24"
          />
          <h1 className="mt-3 max-w-3xl font-display text-3xl leading-tight text-primary-foreground sm:text-4xl lg:text-2xl font-bold">
            Indikator Strategis Kabupaten Brebes
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-primary-foreground/90 sm:text-lg">
            Dashboard interaktif yang menyajikan indikator-indikator statistik utama Kabupaten Brebes secara
            ringkas, akurat, dan mudah dipahami. Manfaatkan untuk memantau kondisi terkini wilayah —
            mulai dari kependudukan, ketenagakerjaan, kemiskinan, hingga pertumbuhan ekonomi.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-soft">
              <Link to="/ringkasan">
                Lihat Ringkasan Eksekutif <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary-foreground/40 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground">
              <Link to="/panduan">Panduan Penggunaan</Link>
            </Button>
          </div>

          {/* Inline mini-stats */}
          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {[
              { v: "2,08 jt", l: "Penduduk" },
              { v: "17", l: "Kecamatan" },
              { v: "5+", l: "Tahun Data" },
              { v: "14", l: "Indikator Detail" },
            ].map((s) => (
              <div key={s.l} className="rounded-xl border border-primary-foreground/20 bg-primary-foreground/10 p-4 backdrop-blur-sm">
                <div className="font-display text-2xl font-bold text-primary-foreground">{s.v}</div>
                <div className="text-xs text-primary-foreground/75">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            <Database className="h-3 w-3" /> Tentang Aplikasi
          </div>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Satu jendela untuk memahami<br />kondisi Kabupaten Brebes
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            <strong className="text-foreground">INTERES</strong> menghadirkan kompilasi indikator statistik
            terpilih untuk membantu pemerintah daerah, akademisi, jurnalis, pelaku usaha, dan masyarakat umum
            memperoleh gambaran cepat namun komprehensif tentang Kabupaten Brebes. Setiap indikator dilengkapi
            dengan tren historis, posisi peringkat, dan perbandingan terhadap rata-rata Jawa Tengah serta angka
            Nasional.
          </p>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            Dengan tampilan visual yang ringkas, INTERES dirancang untuk mendukung pengambilan keputusan
            berbasis data <em>(evidence-based decision making)</em>.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl border border-border bg-gradient-card p-5 shadow-soft transition-all hover:shadow-elegant hover:-translate-y-0.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-3 font-display text-base font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA cards */}
      <section className="rounded-2xl border border-border bg-gradient-subtle p-8 sm:p-12">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">Mulai eksplorasi data</h2>
        <p className="mt-2 text-muted-foreground">Pilih titik awal untuk menjelajahi indikator-indikator Kabupaten Brebes.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            { to: "/ringkasan", title: "Ringkasan Eksekutif", desc: "Angka-angka kunci dalam satu halaman." },
            { to: "/indikator/kemiskinan", title: "Kemiskinan", desc: "Persentase, garis, & jumlah penduduk miskin." },
            { to: "/indikator/pertumbuhan-ekonomi", title: "Pertumbuhan Ekonomi", desc: "Laju PDRB Brebes vs Jateng & Nasional." },
          ].map((c) => (
            <Link
              key={c.to}
              to={c.to}
              className="group rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-soft"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold">{c.title}</h3>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{c.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Beranda;
