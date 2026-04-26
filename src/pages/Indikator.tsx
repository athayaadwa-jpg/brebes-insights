import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowLeft, Info, MapPin, TrendingUp, Trophy } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { SeriesChart, RankingChart } from "@/components/dashboard/Charts";
import { Button } from "@/components/ui/button";
import { getIndicator, INDICATORS } from "@/data/statistik";
import { formatSmart, withUnit } from "@/lib/format";

const fmt = (n: number) => formatSmart(n, 2);

const Indikator = () => {
  const { slug } = useParams();
  const data = getIndicator(slug || "");
  if (!data) return <Navigate to="/ringkasan" replace />;

  // Hitung peringkat Brebes
  const sorted = [...data.ranking].sort((a, b) =>
    data.higherIsBetter ? b.nilai - a.nilai : a.nilai - b.nilai
  );
  const rankBrebes = sorted.findIndex((d) => d.wilayah === "Brebes") + 1;

  const others = INDICATORS.filter((i) => i.slug !== data.slug).slice(0, 4);

  return (
    <div className="animate-fade-in">
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link to="/ringkasan"><ArrowLeft className="mr-1 h-4 w-4" /> Kembali ke Ringkasan</Link>
      </Button>

      <PageHeader
        eyebrow={`Indikator · ${data.highlight.tahun}`}
        title={data.nama}
        description={data.deskripsi}
      />

      {/* Highlight comparison */}
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border-2 border-brebes/40 bg-card p-5 shadow-soft">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brebes">
            <MapPin className="h-3.5 w-3.5" /> Kab. Brebes
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="font-display text-4xl font-extrabold text-brebes">{fmt(data.highlight.brebes)}</span>
            {data.satuan && <span className={`text-sm font-medium text-muted-foreground ${data.satuan === "%" ? "-ml-1.5" : ""}`}>{data.satuan}</span>}
          </div>
          <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-brebes/10 px-2 py-0.5 text-xs font-semibold text-brebes">
            <Trophy className="h-3 w-3" /> Peringkat {rankBrebes} dari {sorted.length}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-jateng">
            <MapPin className="h-3.5 w-3.5" /> Prov. Jawa Tengah
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="font-display text-4xl font-bold text-jateng">{fmt(data.highlight.jateng)}</span>
            {data.satuan && <span className={`text-sm font-medium text-muted-foreground ${data.satuan === "%" ? "-ml-1.5" : ""}`}>{data.satuan}</span>}
          </div>
          <div className="mt-2 text-xs text-muted-foreground">Rata-rata Jawa Tengah</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-nasional">
            <MapPin className="h-3.5 w-3.5" /> Nasional
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="font-display text-4xl font-bold text-nasional">{fmt(data.highlight.nasional)}</span>
            {data.satuan && <span className={`text-sm font-medium text-muted-foreground ${data.satuan === "%" ? "-ml-1.5" : ""}`}>{data.satuan}</span>}
          </div>
          <div className="mt-2 text-xs text-muted-foreground">Angka Indonesia</div>
        </div>
      </section>

      {/* Series chart */}
      <section className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
              <TrendingUp className="h-3.5 w-3.5" /> Tren 5 Tahun Terakhir
            </div>
            <h2 className="mt-1 font-display text-xl font-bold">Perkembangan {data.nama}</h2>
            <p className="text-sm text-muted-foreground">Perbandingan Kab. Brebes, Provinsi Jawa Tengah, dan Nasional.</p>
          </div>
        </div>
        <SeriesChart data={data.series} satuan={data.satuan} />
      </section>

      {/* Ranking chart */}
      <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="mb-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <Trophy className="h-3.5 w-3.5" /> Peringkat Antar Kabupaten/Kota
          </div>
          <h2 className="mt-1 font-display text-xl font-bold">Posisi Brebes di Jawa Tengah</h2>
          <p className="text-sm text-muted-foreground">
            Diurutkan dari yang {data.higherIsBetter ? "tertinggi" : "terendah"} (lebih baik). Batang berwarna hijau menandai Kabupaten Brebes.
          </p>
        </div>
        <RankingChart data={data.ranking} higherIsBetter={data.higherIsBetter} satuan={data.satuan} />
      </section>

      {/* Note */}
      <section className="mt-6 flex items-start gap-3 rounded-xl border border-info/20 bg-info/5 p-4 text-sm">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-info" />
        <p className="text-muted-foreground">
          <strong className="text-foreground">Catatan:</strong> Data merupakan kompilasi dari publikasi resmi BPS.
          Angka peringkat antar kabupaten/kota merupakan ilustrasi untuk demo dashboard ini.
        </p>
      </section>

      {/* Other indicators */}
      <section className="mt-10">
        <h2 className="mb-4 font-display text-lg font-bold">Indikator Lainnya</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {others.map((o) => (
            <Link
              key={o.slug}
              to={`/indikator/${o.slug}`}
              className="group rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-soft"
            >
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{o.satuan || "Indeks"}</div>
              <div className="mt-1 font-display font-semibold leading-snug group-hover:text-primary">{o.nama}</div>
              <div className="mt-2 text-2xl font-bold text-foreground">{fmt(o.highlight.brebes)}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Indikator;
