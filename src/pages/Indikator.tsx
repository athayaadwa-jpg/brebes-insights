import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowLeft, Info, MapPin, TrendingUp, Trophy, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { SeriesChart, RankingChart } from "@/components/dashboard/Charts";
import { Button } from "@/components/ui/button";
import { getIndicator, INDICATORS, type SeriesPoint, type RankPoint } from "@/data/statistik";
import { formatSmart } from "@/lib/format";
import { useIndikatorSheets } from "@/hooks/useIndikatorSheets";

const fmt = (n: number) => formatSmart(n, 2);

const Indikator = () => {
  const { slug } = useParams();
  const meta = getIndicator(slug || "");
  const { data: sheets, isLoading, isError } = useIndikatorSheets();

  if (!meta) return <Navigate to="/ringkasan" replace />;

  const live = sheets?.indicators[meta.slug];

  // Series Brebes dari sheet -> SeriesPoint (jateng/nasional opsional, tidak
  // ada di sumber per-tahun -> dibiarkan undefined supaya garis tidak dirender).
  const series: SeriesPoint[] = (live?.series ?? []).map((p) => ({
    tahun: p.tahun,
    brebes: p.brebes,
  }));

  const ranking: RankPoint[] = live?.ranking ?? [];
  const jateng = live?.jateng ?? undefined;
  const nasional = live?.nasional ?? undefined;
  const rankingTahun = live?.rankingTahun ?? meta.highlight.tahun;

  // Highlight: pakai nilai dari sheet jika ada (entry Brebes pada ranking
  // tahun terbaru), fallback ke meta default.
  const brebesEntry = ranking.find((r) => r.wilayah === "Brebes");
  const brebesNilai = brebesEntry?.nilai ?? meta.highlight.brebes;

  // Hitung peringkat Brebes pada ranking tahun terbaru
  const sorted = [...ranking].sort((a, b) =>
    meta.higherIsBetter ? b.nilai - a.nilai : a.nilai - b.nilai
  );
  const rankBrebes = sorted.findIndex((d) => d.wilayah === "Brebes") + 1;

  const others = INDICATORS.filter((i) => i.slug !== meta.slug).slice(0, 4);

  return (
    <div className="animate-fade-in">
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link to="/ringkasan"><ArrowLeft className="mr-1 h-4 w-4" /> Kembali ke Ringkasan</Link>
      </Button>

      <PageHeader
        eyebrow={`Indikator · ${rankingTahun}`}
        title={meta.nama}
        description={meta.deskripsi}
      />

      {isLoading && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Mengambil data dari Google Sheets…
        </div>
      )}
      {isError && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          Gagal memuat data dari Google Sheets. Menampilkan nilai cadangan.
        </div>
      )}

      {/* Highlight comparison */}
      <section className={`grid gap-4 ${jateng !== undefined && nasional !== undefined ? "sm:grid-cols-3" : jateng !== undefined || nasional !== undefined ? "sm:grid-cols-2" : "sm:grid-cols-1"}`}>
        <div className="rounded-xl border-2 border-brebes/40 bg-card p-5 shadow-soft">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brebes">
            <MapPin className="h-3.5 w-3.5" /> Kab. Brebes
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="font-display text-4xl font-extrabold text-brebes">{fmt(brebesNilai)}</span>
            {meta.satuan && <span className={`text-sm font-medium text-muted-foreground ${meta.satuan === "%" ? "-ml-1.5" : ""}`}>{meta.satuan}</span>}
          </div>
          {ranking.length > 0 && rankBrebes > 0 && (
            <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-brebes/10 px-2 py-0.5 text-xs font-semibold text-brebes">
              <Trophy className="h-3 w-3" /> Peringkat {rankBrebes} dari {sorted.length}
            </div>
          )}
        </div>
        {jateng !== undefined && (
          <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-jateng">
              <MapPin className="h-3.5 w-3.5" /> Prov. Jawa Tengah
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="font-display text-4xl font-bold text-jateng">{fmt(jateng)}</span>
              {meta.satuan && <span className={`text-sm font-medium text-muted-foreground ${meta.satuan === "%" ? "-ml-1.5" : ""}`}>{meta.satuan}</span>}
            </div>
            <div className="mt-2 text-xs text-muted-foreground">Rata-rata Jawa Tengah</div>
          </div>
        )}
        {nasional !== undefined && (
          <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-nasional">
              <MapPin className="h-3.5 w-3.5" /> Nasional
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="font-display text-4xl font-bold text-nasional">{fmt(nasional)}</span>
              {meta.satuan && <span className={`text-sm font-medium text-muted-foreground ${meta.satuan === "%" ? "-ml-1.5" : ""}`}>{meta.satuan}</span>}
            </div>
            <div className="mt-2 text-xs text-muted-foreground">Angka Indonesia</div>
          </div>
        )}
      </section>

      {/* Series chart */}
      {series.length > 0 && (
        <section className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                <TrendingUp className="h-3.5 w-3.5" /> Tren {series.length} Tahun Terakhir
              </div>
              <h2 className="mt-1 font-display text-xl font-bold">Perkembangan {meta.nama}</h2>
              <p className="text-sm text-muted-foreground">Data tahunan Kab. Brebes berdasarkan publikasi BPS.</p>
            </div>
          </div>
          <SeriesChart data={series} satuan={meta.satuan} />
        </section>
      )}

      {/* Ranking chart */}
      {ranking.length > 0 && (
        <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="mb-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
              <Trophy className="h-3.5 w-3.5" /> Peringkat Antar Kabupaten/Kota · {rankingTahun}
            </div>
            <h2 className="mt-1 font-display text-xl font-bold">Posisi Brebes di Jawa Tengah</h2>
            <p className="text-sm text-muted-foreground">
              Diurutkan dari yang {meta.higherIsBetter ? "tertinggi" : "terendah"} (lebih baik). Batang berwarna menandai{" "}
              <span className="font-semibold text-brebes">Kab. Brebes</span>
              {jateng !== undefined && (
                <>, <span className="font-semibold text-jateng">Jawa Tengah</span></>
              )}
              {nasional !== undefined && (
                <>
                  {jateng !== undefined ? ", dan " : " dan "}
                  <span className="font-semibold text-nasional">Indonesia</span>
                </>
              )}
              .
            </p>
          </div>
          <RankingChart
            data={ranking}
            higherIsBetter={meta.higherIsBetter}
            satuan={meta.satuan}
            jateng={jateng}
            nasional={nasional}
          />
        </section>
      )}

      {/* Note */}
      <section className="mt-6 flex items-start gap-3 rounded-xl border border-info/20 bg-info/5 p-4 text-sm">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-info" />
        <p className="text-muted-foreground">
          <strong className="text-foreground">Sumber:</strong> Data dihimpun dari Google Sheet
          publikasi BPS Kabupaten Brebes. Tahun pembanding ranking mengikuti tahun terbaru
          yang tersedia di sheet sumber.
        </p>
      </section>

      {/* Other indicators */}
      <section className="mt-10">
        <h2 className="mb-4 font-display text-lg font-bold">Indikator Lainnya</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {others.map((o) => {
            const oLive = sheets?.indicators[o.slug];
            const oVal = oLive?.ranking.find((r) => r.wilayah === "Brebes")?.nilai
              ?? oLive?.series.at(-1)?.brebes
              ?? o.highlight.brebes;
            return (
              <Link
                key={o.slug}
                to={`/indikator/${o.slug}`}
                className="group rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-soft"
              >
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{o.satuan || "Indeks"}</div>
                <div className="mt-1 font-display font-semibold leading-snug group-hover:text-primary">{o.nama}</div>
                <div className="mt-2 text-2xl font-bold text-foreground">{fmt(oVal)}</div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Indikator;
