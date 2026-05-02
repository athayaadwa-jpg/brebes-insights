import { useMemo, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowLeft, Info, MapPin, TrendingUp, TrendingDown, Minus, Trophy, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { SeriesChart, RankingChart } from "@/components/dashboard/Charts";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getIndicator, INDICATORS, type SeriesPoint, type RankPoint } from "@/data/statistik";
import { formatSmart } from "@/lib/format";
import { useIndikatorSheets } from "@/hooks/useIndikatorSheets";
import { useRingkasanSheets } from "@/hooks/useRingkasanSheets";

const fmt = (n: number) => formatSmart(n, 2);

// Komponen badge perubahan (naik/turun) dari periode sebelumnya.
// higherIsBetter menentukan warna: kenaikan pada indikator "lebih tinggi
// lebih baik" tampil hijau, sebaliknya merah.
const DeltaBadge = ({
  current,
  previous,
  satuan,
  higherIsBetter,
  prevTahun,
}: {
  current: number;
  previous: number | null | undefined;
  satuan: string;
  higherIsBetter: boolean;
  prevTahun?: number | null;
}) => {
  if (previous === null || previous === undefined || !Number.isFinite(previous)) {
    return (
      <div className="mt-2 text-xs text-muted-foreground">Belum ada pembanding</div>
    );
  }
  const diff = current - previous;
  const pct = previous !== 0 ? (diff / Math.abs(previous)) * 100 : 0;
  const isUp = diff > 0;
  const isFlat = Math.abs(diff) < 1e-9;
  const good = isFlat ? null : higherIsBetter ? isUp : !isUp;
  const tone = isFlat
    ? "bg-muted text-muted-foreground"
    : good
    ? "bg-success/10 text-success"
    : "bg-destructive/10 text-destructive";
  const Icon = isFlat ? Minus : isUp ? TrendingUp : TrendingDown;
  const sign = isFlat ? "" : isUp ? "+" : "−";
  const absDiff = Math.abs(diff);
  const unitText = satuan === "%" ? " poin" : satuan ? ` ${satuan}` : "";
  return (
    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap ${tone}`}>
        <Icon className="h-3 w-3 shrink-0" />
        <span>{sign}{fmt(absDiff)}{unitText}</span>
        {previous !== 0 && (
          <span className="opacity-80">({sign}{fmt(Math.abs(pct))}%)</span>
        )}
      </span>
      {prevTahun && (
        <span className="text-xs text-muted-foreground whitespace-nowrap">dibanding {prevTahun}</span>
      )}
    </div>
  );
};

const AGRI_SLUGS = new Set(["luas-panen-padi", "produksi-padi", "produksi-beras"]);

const Indikator = () => {
  const { slug } = useParams();
  const meta = getIndicator(slug || "");
  const isAgri = AGRI_SLUGS.has(meta?.slug ?? "");
  const { data: sheets, isLoading, isError } = useIndikatorSheets();
  const { data: ringkasan } = useRingkasanSheets();

  // Suffix periode (mis. "Triwulan II") — hanya berlaku untuk indikator PDRB/Pertumbuhan Ekonomi
  // jika header sumber memuatnya.
  const periodeSuffix =
    meta?.slug === "pertumbuhan-ekonomi"
      ? ringkasan?.periods?.pertumbuhanLU ?? null
      : null;

  const live = sheets?.indicators[meta?.slug ?? ""];

  // Tahun terpilih untuk grafik ranking (default = tahun terbaru).
  // Disimpan sebagai string untuk kompatibilitas dengan komponen Select.
  const rankingYears = useMemo(() => {
    const ys = live?.rankingYears ?? [];
    return [...ys].sort((a, b) => b - a); // semua tahun, terbaru di depan
  }, [live]);
  const [pickedYear, setPickedYear] = useState<string>("");
  const activeYear = pickedYear ? Number(pickedYear) : rankingYears[0];

  if (!meta) return <Navigate to="/ringkasan" replace />;

  // ----- Series Brebes (semua tahun yang tersedia) + series Jateng & Nasional -----
  const allSeries = live?.series ?? [];

  const jatengMap = new Map<number, number>(
    (live?.seriesJateng ?? []).map((p) => [p.tahun, p.nilai]),
  );
  const nasionalMap = new Map<number, number>(
    (live?.seriesNasional ?? []).map((p) => [p.tahun, p.nilai]),
  );

  const series: SeriesPoint[] = allSeries.map((p) => ({
    tahun: p.tahun,
    brebes: p.brebes,
    jateng: isAgri ? undefined : jatengMap.get(p.tahun),
    nasional: isAgri ? undefined : nasionalMap.get(p.tahun),
  }));
  const trenLabel = `Tren ${series.length} Tahun Terakhir`;

  // ----- Ranking untuk tahun terpilih -----
  const rankingByYear = (live?.rankingByYear ?? {}) as Record<string, RankPoint[]>;
  const ranking: RankPoint[] = activeYear ? rankingByYear[String(activeYear)] ?? [] : [];
  const jatengActive = activeYear ? live?.jatengByYear?.[String(activeYear)] : undefined;
  const nasionalActive = activeYear ? live?.nasionalByYear?.[String(activeYear)] : undefined;

  // ----- Highlight comparison (tahun terbaru vs sebelumnya) -----
  const latestYear = live?.rankingTahun ?? meta.highlight.tahun;
  const prevYear = (live?.rankingYears ?? [])
    .filter((y) => y < (latestYear ?? Infinity))
    .sort((a, b) => b - a)[0] ?? null;

  const brebesLatest =
    rankingByYear[String(latestYear)]?.find((r) => r.wilayah === "Brebes")?.nilai
    ?? allSeries.at(-1)?.brebes
    ?? meta.highlight.brebes;
  const brebesPrev = prevYear
    ? rankingByYear[String(prevYear)]?.find((r) => r.wilayah === "Brebes")?.nilai
      ?? allSeries.find((p) => p.tahun === prevYear)?.brebes
      ?? null
    : null;

  const jatengLatest = isAgri ? undefined : (live?.jateng ?? undefined);
  const jatengPrev = isAgri ? null : (prevYear ? live?.jatengByYear?.[String(prevYear)] ?? null : null);
  const nasionalLatest = isAgri ? undefined : (live?.nasional ?? undefined);
  const nasionalPrev = isAgri ? null : (prevYear ? live?.nasionalByYear?.[String(prevYear)] ?? null : null);

  // Hitung peringkat Brebes pada tahun terbaru
  const latestRanking = rankingByYear[String(latestYear)] ?? [];
  const sortedLatest = [...latestRanking].sort((a, b) =>
    meta.higherIsBetter ? b.nilai - a.nilai : a.nilai - b.nilai
  );
  const rankBrebes = sortedLatest.findIndex((d) => d.wilayah === "Brebes") + 1;

  const others = INDICATORS.filter((i) => i.slug !== meta.slug).slice(0, 4);

  return (
    <div className="animate-fade-in">
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link to="/ringkasan"><ArrowLeft className="mr-1 h-4 w-4" /> Kembali ke Ringkasan</Link>
      </Button>

      <PageHeader
        eyebrow={`Indikator · ${latestYear}${periodeSuffix ? ` · ${periodeSuffix}` : ""}`}
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
      <section className={`grid gap-4 ${jatengLatest !== undefined && nasionalLatest !== undefined ? "sm:grid-cols-3" : jatengLatest !== undefined || nasionalLatest !== undefined ? "sm:grid-cols-2" : "sm:grid-cols-1"}`}>
        <div className="rounded-xl border-2 border-brebes/40 bg-card p-5 shadow-soft">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brebes">
            <MapPin className="h-3.5 w-3.5" /> Kab. Brebes
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="font-display text-4xl font-extrabold text-brebes">{fmt(brebesLatest)}</span>
            {meta.satuan && <span className={`text-sm font-medium text-muted-foreground ${meta.satuan === "%" ? "-ml-1.5" : ""}`}>{meta.satuan}</span>}
          </div>
          <DeltaBadge
            current={brebesLatest}
            previous={brebesPrev}
            satuan={meta.satuan}
            higherIsBetter={meta.higherIsBetter}
            prevTahun={prevYear}
          />
          {ranking.length > 0 && rankBrebes > 0 && (
            <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-brebes/10 px-2 py-0.5 text-xs font-semibold text-brebes">
              <Trophy className="h-3 w-3" /> Peringkat {rankBrebes} dari {sortedLatest.length}
            </div>
          )}
        </div>
        {jatengLatest !== undefined && (
          <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-jateng">
              <MapPin className="h-3.5 w-3.5" /> Prov. Jawa Tengah
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="font-display text-4xl font-bold text-jateng">{fmt(jatengLatest)}</span>
              {meta.satuan && <span className={`text-sm font-medium text-muted-foreground ${meta.satuan === "%" ? "-ml-1.5" : ""}`}>{meta.satuan}</span>}
            </div>
            <DeltaBadge
              current={jatengLatest}
              previous={jatengPrev}
              satuan={meta.satuan}
              higherIsBetter={meta.higherIsBetter}
              prevTahun={prevYear}
            />
          </div>
        )}
        {nasionalLatest !== undefined && (
          <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-nasional">
              <MapPin className="h-3.5 w-3.5" /> Nasional
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="font-display text-4xl font-bold text-nasional">{fmt(nasionalLatest)}</span>
              {meta.satuan && <span className={`text-sm font-medium text-muted-foreground ${meta.satuan === "%" ? "-ml-1.5" : ""}`}>{meta.satuan}</span>}
            </div>
            <DeltaBadge
              current={nasionalLatest}
              previous={nasionalPrev}
              satuan={meta.satuan}
              higherIsBetter={meta.higherIsBetter}
              prevTahun={prevYear}
            />
          </div>
        )}
      </section>

      {/* Series chart */}
      {series.length > 0 && (
        <section className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                <TrendingUp className="h-3.5 w-3.5" /> {trenLabel}
              </div>
              <h2 className="mt-1 font-display text-xl font-bold">Perkembangan {meta.nama}</h2>
              <p className="text-sm text-muted-foreground">
                Perbandingan Kab. Brebes, Jawa Tengah, dan Nasional berdasarkan publikasi BPS.
              </p>
            </div>
          </div>
          <SeriesChart data={series} satuan={meta.satuan} />
        </section>
      )}

      {/* Ranking chart */}
      {rankingYears.length > 0 && (
        <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                <Trophy className="h-3.5 w-3.5" /> Peringkat Antar Kabupaten/Kota · {activeYear}
              </div>
              <h2 className="mt-1 font-display text-xl font-bold">Posisi Brebes di Jawa Tengah</h2>
              <p className="text-sm text-muted-foreground">
                Diurutkan dari yang {meta.higherIsBetter ? "tertinggi" : "terendah"} (lebih baik). Batang berwarna menandai{" "}
                <span className="font-semibold text-brebes">Kab. Brebes</span>
                {jatengActive !== undefined && (
                  <>, <span className="font-semibold text-jateng">Jawa Tengah</span></>
                )}
                {nasionalActive !== undefined && (
                  <>
                    {jatengActive !== undefined ? ", dan " : " dan "}
                    <span className="font-semibold text-nasional">Indonesia</span>
                  </>
                )}
                .
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Tahun:</span>
              <Select
                value={String(activeYear ?? "")}
                onValueChange={(v) => setPickedYear(v)}
              >
                <SelectTrigger className="h-9 w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {rankingYears.map((y) => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <RankingChart
            data={ranking}
            higherIsBetter={meta.higherIsBetter}
            satuan={meta.satuan}
            jateng={jatengActive ?? undefined}
            nasional={nasionalActive ?? undefined}
          />
        </section>
      )}

      {/* Note */}
      <section className="mt-6 flex items-start gap-3 rounded-xl border border-info/20 bg-info/5 p-4 text-sm">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-info" />
        <p className="text-muted-foreground">
          <strong className="text-foreground">Sumber:</strong> Data dihimpun dari
          publikasi BPS Kabupaten Brebes. Perubahan dihitung terhadap periode sebelumnya
          yang tersedia pada sheet sumber.
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
