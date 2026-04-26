import { PageHeader } from "@/components/dashboard/PageHeader";
import { BarChart3, BookOpen, LayoutDashboard, MousePointer2, Search, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: LayoutDashboard,
    title: "1. Mulai dari Ringkasan Eksekutif",
    body: "Halaman ringkasan menampilkan angka-angka kunci Kabupaten Brebes seperti jumlah penduduk, kemiskinan, IPM, hingga PDRB. Cocok sebagai gambaran umum awal.",
  },
  {
    icon: TrendingUp,
    title: "2. Buka Indikator Detail",
    body: "Setiap indikator memiliki halaman tersendiri berisi: definisi singkat, grafik tren 5 tahun terakhir, peringkat antar kab/kota Jateng, serta perbandingan dengan Provinsi & Nasional.",
  },
  {
    icon: BarChart3,
    title: "3. Baca Grafik dengan Tepat",
    body: "Grafik garis menunjukkan pergerakan dari waktu ke waktu. Grafik batang horizontal menunjukkan posisi peringkat. Batang berwarna hijau adalah Kabupaten Brebes.",
  },
  {
    icon: MousePointer2,
    title: "4. Hover untuk Detail Angka",
    body: "Arahkan kursor (atau ketuk pada perangkat sentuh) ke titik/batang grafik untuk melihat angka pasti pada tooltip.",
  },
  {
    icon: BookOpen,
    title: "5. Cek Konsep & Definisi",
    body: "Bila ragu memahami suatu istilah, buka halaman Konsep & Definisi untuk penjelasan baku sesuai metadata BPS.",
  },
  {
    icon: Search,
    title: "6. Bandingkan & Analisis",
    body: "Gunakan kombinasi tren historis dan posisi peringkat untuk menarik kesimpulan, misalnya: apakah Brebes membaik lebih cepat dari rata-rata Jateng.",
  },
];

const Panduan = () => (
  <div className="animate-fade-in">
    <PageHeader
      eyebrow="Cara Menggunakan"
      title="Panduan Penggunaan"
      description="Ikuti langkah-langkah berikut agar dapat memanfaatkan dashboard INTERES secara optimal."
    />

    <div className="grid gap-4 sm:grid-cols-2">
      {steps.map((s) => (
        <div key={s.title} className="rounded-xl border border-border bg-gradient-card p-6 shadow-soft transition-all hover:shadow-elegant">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <s.icon className="h-5 w-5" />
          </div>
          <h3 className="mt-3 font-display text-lg font-bold">{s.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
        </div>
      ))}
    </div>

    <div className="mt-8 rounded-2xl border border-accent/30 bg-accent/10 p-6">
      <h3 className="font-display text-lg font-bold">Tips Singkat</h3>
      <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm text-foreground/80">
        <li>Untuk indikator <em>kemiskinan</em> dan <em>TPT</em>, semakin <strong>rendah</strong> nilainya semakin baik.</li>
        <li>Untuk <em>IPM, TPAK, pertumbuhan ekonomi, dan produksi padi</em>, semakin <strong>tinggi</strong> semakin baik.</li>
        <li>Garis putus-putus pada grafik tren menandakan angka Nasional.</li>
        <li>Pada perangkat seluler, gunakan ikon menu di kiri atas untuk berpindah halaman.</li>
      </ul>
    </div>
  </div>
);

export default Panduan;
