import { BookOpenCheck, Calendar, Info, Ruler } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { INDICATORS } from "@/data/statistik";

/* Metadata metodologi untuk setiap indikator */
const metaMethodology: Record<
  string,
  { caraBaca: string; periodeData: string; sumberData: string; catatan?: string }
> = {
  tpt: {
    caraBaca:
      "Semakin rendah nilainya semakin baik, artinya semakin sedikit angkatan kerja yang tidak terserap pasar tenaga kerja.",
    periodeData: "Tahunan (Agustus), mengacu pada Sakernas semester II.",
    sumberData: "Survei Angkatan Kerja Nasional (Sakernas), BPS.",
  },
  tpak: {
    caraBaca:
      "Semakin tinggi nilainya semakin baik, menunjukkan semakin besar proporsi penduduk usia kerja yang aktif dalam kegiatan ekonomi.",
    periodeData: "Tahunan (Agustus), mengacu pada Sakernas semester II.",
    sumberData: "Survei Angkatan Kerja Nasional (Sakernas), BPS.",
  },
  kemiskinan: {
    caraBaca:
      "Semakin rendah nilainya semakin baik. Angka ini menunjukkan persentase penduduk yang pengeluarannya di bawah Garis Kemiskinan.",
    periodeData: "Semesteran (Maret & September).",
    sumberData: "Survei Sosial Ekonomi Nasional (Susenas), BPS.",
    catatan:
      "Garis Kemiskinan dihitung berdasarkan kebutuhan minimum 2.100 kkal per kapita/hari ditambah kebutuhan non-makanan esensial.",
  },
  ipm: {
    caraBaca:
      "Semakin tinggi nilainya semakin baik. IPM berkisar 0–100, terdiri dari dimensi kesehatan, pendidikan, dan standar hidup layak.",
    periodeData: "Tahunan.",
    sumberData: "Publikasi IPM, BPS.",
    catatan:
      "Komponen: Umur Harapan Hidup (UHH), Harapan Lama Sekolah (HLS), Rata-rata Lama Sekolah (RLS), dan Pengeluaran Riil per Kapita.",
  },
  "luas-panen-padi": {
    caraBaca:
      "Semakin tinggi nilainya semakin baik, menandakan luas areal padi yang berhasil dipanen semakin besar.",
    periodeData: "Tahunan (Januari–Desember).",
    sumberData: "Kerangka Sampel Area (KSA), BPS.",
  },
  "produksi-padi": {
    caraBaca:
      "Semakin tinggi nilainya semakin baik. Angka ini mencerminkan total hasil gabah kering giling (GKG) dalam ton.",
    periodeData: "Tahunan (Januari–Desember).",
    sumberData: "Kerangka Sampel Area (KSA), BPS.",
    catatan: "Perbedaan angka desimal dapat terjadi karena pembulatan.",
  },
  "produksi-beras": {
    caraBaca:
      "Semakin tinggi nilainya semakin baik. Merupakan konversi dari produksi padi (GKG) ke beras siap konsumsi.",
    periodeData: "Tahunan (Januari–Desember).",
    sumberData: "Kerangka Sampel Area (KSA), BPS.",
    catatan: "Faktor konversi GKG ke beras mengikuti standar BPS.",
  },
  "pertumbuhan-ekonomi": {
    caraBaca:
      "Semakin tinggi nilainya semakin baik. Angka ini menunjukkan laju pertumbuhan PDRB atas dasar harga konstan (year-on-year atau quarter-to-quarter).",
    periodeData: "Triwulanan dan Tahunan.",
    sumberData: "Publikasi PDRB, BPS.",
    catatan:
      "Perbandingan antar-wilayah menggunakan pertumbuhan PDRB ADHK (harga konstan) untuk menghilangkan efek inflasi.",
  },
  ikk: {
    caraBaca:
      "Semakin rendah nilainya semakin baik, menandakan biaya konstruksi di wilayah tersebut relatif lebih murah.",
    periodeData: "Tahunan.",
    sumberData: "Survei Harga Konstruksi, BPS.",
  },
  uhh: {
    caraBaca:
      "Semakin tinggi nilainya semakin baik. Menunjukkan rata-rata tahun hidup yang diharapkan sejak lahir.",
    periodeData: "Tahunan.",
    sumberData: "Publikasi IPM, BPS.",
  },
  hls: {
    caraBaca:
      "Semakin tinggi nilainya semakin baik. Menunjukkan lamanya pendidikan (dalam tahun) yang diharapkan akan dirasakan anak di masa mendatang.",
    periodeData: "Tahunan.",
    sumberData: "Publikasi IPM, BPS.",
  },
  rls: {
    caraBaca:
      "Semakin tinggi nilainya semakin baik. Menunjukkan rata-rata jumlah tahun pendidikan formal yang ditempuh penduduk usia 25+ tahun.",
    periodeData: "Tahunan.",
    sumberData: "Publikasi IPM, BPS.",
  },
  "pengeluaran-riil": {
    caraBaca:
      "Semakin tinggi nilainya semakin baik. Mencerminkan daya beli masyarakat yang telah disesuaikan dengan paritas daya beli.",
    periodeData: "Tahunan.",
    sumberData: "Publikasi IPM, BPS.",
  },
  "gini-rasio": {
    caraBaca:
      "Semakin rendah nilainya semakin baik (mendekati 0 = merata sempurna). Gini Rasio mengukur ketimpangan distribusi pengeluaran penduduk.",
    periodeData: "Semesteran (Maret & September).",
    sumberData: "Survei Sosial Ekonomi Nasional (Susenas), BPS.",
    catatan: "Nilai berkisar 0–1. Di bawah 0,3 = ketimpangan rendah; 0,3–0,5 = sedang; di atas 0,5 = tinggi.",
  },
};

const Metodologi = () => {
  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow="Catatan Metodologi"
        title="Cara Membaca Indikator"
        description="Panduan singkat mengenai interpretasi setiap indikator, periode data yang digunakan, dan sumber datanya."
      />

      {/* Panduan umum */}
      <section className="mb-8 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold">
          <Info className="h-5 w-5 text-primary" /> Panduan Umum
        </h2>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
          <li>
            <strong className="text-foreground">Arah indikator:</strong> Setiap indikator memiliki interpretasi berbeda —
            beberapa lebih baik bila nilainya tinggi (misal IPM), sementara yang lain lebih baik bila rendah (misal kemiskinan).
            Warna badge perubahan (hijau/merah) sudah menyesuaikan interpretasi ini.
          </li>
          <li>
            <strong className="text-foreground">Perbandingan wilayah:</strong> Data disajikan dengan perbandingan 35 Kabupaten/Kota
            di Jawa Tengah. Peringkat dihitung berdasarkan arah indikator.
          </li>
          <li>
            <strong className="text-foreground">Perubahan (delta):</strong> Dihitung dari selisih nilai tahun terbaru
            dengan tahun sebelumnya, baik dalam satuan asli maupun persentase.
          </li>
          <li>
            <strong className="text-foreground">Sumber data:</strong> Seluruh data bersumber dari Publikasi dan Rilis resmi BPS.
          </li>
        </ul>
      </section>

      {/* Detail per indikator */}
      <section className="space-y-4">
        {INDICATORS.map((ind) => {
          const m = metaMethodology[ind.slug];
          if (!m) return null;
          return (
            <div
              key={ind.slug}
              className="rounded-xl border border-border bg-card p-5 shadow-soft transition-all hover:shadow-elegant"
            >
              <h3 className="font-display text-base font-bold">{ind.nama}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{ind.satuan ? `Satuan: ${ind.satuan}` : "Tanpa satuan (indeks)"}</p>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="flex items-start gap-2">
                  <Ruler className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-primary">Cara Membaca</div>
                    <p className="mt-0.5 text-sm text-muted-foreground">{m.caraBaca}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-primary">Periode Data</div>
                    <p className="mt-0.5 text-sm text-muted-foreground">{m.periodeData}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <BookOpenCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-primary">Sumber Data</div>
                    <p className="mt-0.5 text-sm text-muted-foreground">{m.sumberData}</p>
                  </div>
                </div>
              </div>

              {m.catatan && (
                <div className="mt-3 flex items-start gap-2 rounded-lg border border-info/20 bg-info/5 px-3 py-2">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-info" />
                  <p className="text-xs text-muted-foreground">{m.catatan}</p>
                </div>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
};

export default Metodologi;
