import { PageHeader } from "@/components/dashboard/PageHeader";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const items = [
  {
    title: "Tingkat Pengangguran Terbuka (TPT)",
    body: "Persentase jumlah pengangguran terhadap jumlah angkatan kerja. Pengangguran terbuka mencakup mereka yang tidak bekerja dan sedang mencari kerja, mempersiapkan usaha, putus asa mencari kerja, atau sudah memiliki pekerjaan tetapi belum mulai bekerja.",
  },
  {
    title: "Tingkat Partisipasi Angkatan Kerja (TPAK)",
    body: "Persentase jumlah angkatan kerja terhadap jumlah penduduk usia kerja (15 tahun ke atas). Indikator ini menggambarkan besarnya partisipasi penduduk usia kerja dalam aktivitas ekonomi.",
  },
  {
    title: "Penduduk Miskin",
    body: "Penduduk yang memiliki rata-rata pengeluaran per kapita per bulan di bawah Garis Kemiskinan. Pendekatan yang digunakan adalah konsep kemampuan memenuhi kebutuhan dasar (basic needs approach).",
  },
  {
    title: "Garis Kemiskinan (GK)",
    body: "Nilai rupiah pengeluaran minimum yang diperlukan seseorang untuk memenuhi kebutuhan pokok hidupnya selama sebulan, baik kebutuhan makanan maupun non-makanan. Penduduk dengan pengeluaran di bawah GK dikategorikan miskin.",
  },
  {
    title: "Gini Ratio",
    body: "Ukuran ketimpangan distribusi pendapatan/pengeluaran. Bernilai antara 0 (pemerataan sempurna) hingga 1 (ketimpangan sempurna). Nilai < 0,3 = ketimpangan rendah, 0,3–0,5 = sedang, > 0,5 = tinggi.",
  },
  {
    title: "Indeks Pembangunan Manusia (IPM)",
    body: "Indeks komposit yang mengukur capaian pembangunan manusia, dibentuk dari tiga dimensi dasar: umur panjang dan sehat (UHH), pengetahuan (HLS & RLS), dan standar hidup layak (pengeluaran per kapita disesuaikan).",
  },
  {
    title: "Produk Domestik Regional Bruto (PDRB)",
    body: "Jumlah nilai tambah bruto (gross value added) yang dihasilkan seluruh unit usaha dalam suatu wilayah, atau nilai barang dan jasa akhir yang dihasilkan dalam periode tertentu. Disajikan atas dasar harga berlaku (ADHB) dan konstan (ADHK).",
  },
  {
    title: "Pertumbuhan Ekonomi",
    body: "Laju pertumbuhan PDRB atas dasar harga konstan, mencerminkan perubahan riil aktivitas ekonomi (telah mengeliminasi pengaruh inflasi).",
  },
  {
    title: "Inflasi",
    body: "Kenaikan harga barang dan jasa secara umum dan terus-menerus dalam jangka waktu tertentu, diukur melalui Indeks Harga Konsumen (IHK).",
  },
  {
    title: "Luas Panen Padi",
    body: "Luas tanaman padi yang diambil hasilnya setelah cukup umur, dinyatakan dalam hektar. Tidak termasuk yang gagal panen (puso).",
  },
  {
    title: "Produksi Padi",
    body: "Hasil produksi padi dalam bentuk Gabah Kering Giling (GKG) yang diperoleh dari luas panen periode tertentu.",
  },
];

const Konsep = () => (
  <div className="animate-fade-in">
    <PageHeader
      eyebrow="Glosarium"
      title="Konsep & Definisi"
      description="Penjelasan istilah dan konsep statistik yang digunakan dalam dashboard INTERES, mengacu pada metadata resmi BPS."
    />
    <div className="rounded-2xl border border-border bg-card p-2 shadow-soft sm:p-4">
      <Accordion type="single" collapsible className="w-full">
        {items.map((it, i) => (
          <AccordionItem key={i} value={`item-${i}`}>
            <AccordionTrigger className="text-left font-display font-semibold">{it.title}</AccordionTrigger>
            <AccordionContent className="text-base leading-relaxed text-muted-foreground">{it.body}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </div>
);

export default Konsep;
