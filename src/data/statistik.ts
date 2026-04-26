// Data statistik Kabupaten Brebes (ilustratif untuk demo dashboard).
// Sumber rujukan: BPS Kabupaten Brebes & Provinsi Jawa Tengah.

export const KAB_KOTA_JATENG = [
  "Cilacap", "Banyumas", "Purbalingga", "Banjarnegara", "Kebumen", "Purworejo",
  "Wonosobo", "Magelang", "Boyolali", "Klaten", "Sukoharjo", "Wonogiri",
  "Karanganyar", "Sragen", "Grobogan", "Blora", "Rembang", "Pati",
  "Kudus", "Jepara", "Demak", "Semarang", "Temanggung", "Kendal",
  "Batang", "Pekalongan", "Pemalang", "Tegal", "Brebes",
  "Kota Magelang", "Kota Surakarta", "Kota Salatiga", "Kota Semarang",
  "Kota Pekalongan", "Kota Tegal",
];

export type SeriesPoint = { tahun: number; brebes: number; jateng?: number; nasional?: number };
export type RankPoint = { wilayah: string; nilai: number };

export type IndicatorData = {
  slug: string;
  nama: string;
  satuan: string;
  deskripsi: string;
  highlight: { brebes: number; jateng?: number; nasional?: number; tahun: number };
  series: SeriesPoint[];
  // makin tinggi makin baik? (untuk styling rank: kemiskinan & TPT = false)
  higherIsBetter: boolean;
  ranking: RankPoint[];
};


export const RINGKASAN = {
  jumlahPenduduk: 2003706,
  pendudukLaki: 1009512,
  pendudukPerempuan: 994194,
  pendudukMiskin: 287900,
  miskinLaki: 145200,
  miskinPerempuan: 142700,
  persentaseKemiskinan: 14.37,
  garisKemiskinan: 524318, // Rp/kapita/bulan
  giniRatio: 0.341,
  pdrbAdhb: 64.82, // Triliun Rp
  pdrbAdhk: 42.15,
  pertumbuhanEkonomi: 5.12,
  ipm: 67.94,
  tpt: 8.27,
  tpak: 67.45,
  inflasi: 2.85,
  luasPanen: 156234, // ha
  produksiPadi: 854120, // ton
  tahun: 2024,
};

export const INDICATORS: IndicatorData[] = [
  {
    slug: "tpt",
    nama: "Tingkat Pengangguran Terbuka",
    satuan: "%",
    higherIsBetter: false,
    deskripsi:
      "Tingkat Pengangguran Terbuka (TPT) adalah persentase jumlah pengangguran terhadap jumlah angkatan kerja. Indikator ini menunjukkan persentase angkatan kerja yang tidak terserap oleh pasar tenaga kerja.",
    highlight: { brebes: 8.07, tahun: 2025 },
    series: [],
    ranking: [],
  },
  {
    slug: "tpak",
    nama: "Tingkat Partisipasi Angkatan Kerja",
    satuan: "%",
    higherIsBetter: true,
    deskripsi:
      "Tingkat Partisipasi Angkatan Kerja (TPAK) adalah persentase jumlah angkatan kerja terhadap jumlah penduduk usia kerja, menggambarkan besarnya partisipasi penduduk dalam aktivitas ekonomi.",
    highlight: { brebes: 71.90, tahun: 2025 },
    series: [],
    ranking: [],
  },
  {
    slug: "kemiskinan",
    nama: "Persentase Penduduk Miskin",
    satuan: "%",
    higherIsBetter: false,
    deskripsi:
      "Persentase Penduduk Miskin adalah persentase penduduk yang berada di bawah Garis Kemiskinan. Garis Kemiskinan merupakan jumlah rupiah minimum untuk memenuhi kebutuhan dasar makanan dan non-makanan.",
    highlight: { brebes: 14.15, tahun: 2025 },
    series: [],
    ranking: [],
  },
  {
    slug: "ipm",
    nama: "Indeks Pembangunan Manusia",
    satuan: "",
    higherIsBetter: true,
    deskripsi:
      "Indeks Pembangunan Manusia (IPM) mengukur capaian pembangunan manusia berbasis sejumlah komponen dasar kualitas hidup: umur panjang dan sehat, pengetahuan, dan standar hidup layak.",
    highlight: { brebes: 71.18, tahun: 2025 },
    series: [],
    ranking: [],
  },
  {
    slug: "luas-panen-padi",
    nama: "Luas Panen Padi",
    satuan: "ha",
    higherIsBetter: true,
    deskripsi:
      "Luas Panen Padi adalah luas tanaman padi yang dipungut hasilnya setelah cukup umur, dinyatakan dalam hektare.",
    highlight: { brebes: 87998, tahun: 2025 },
    series: [],
    ranking: [],
  },
  {
    slug: "produksi-padi",
    nama: "Produksi Padi",
    satuan: "ton",
    higherIsBetter: true,
    deskripsi:
      "Produksi Padi adalah hasil produksi gabah kering giling (GKG) dari luas panen padi pada periode tertentu.",
    highlight: { brebes: 463342, tahun: 2025 },
    series: [],
    ranking: [],
  },
  {
    slug: "pertumbuhan-ekonomi",
    nama: "Pertumbuhan Ekonomi (PDRB)",
    satuan: "%",
    higherIsBetter: true,
    deskripsi:
      "Pertumbuhan ekonomi diukur dari laju pertumbuhan Produk Domestik Regional Bruto (PDRB) atas dasar harga konstan, yang mencerminkan perubahan riil aktivitas ekonomi suatu wilayah.",
    highlight: { brebes: 6.28, tahun: 2025 },
    series: [],
    ranking: [],
  },
  {
    slug: "ikk",
    nama: "Indeks Kemahalan Konstruksi",
    satuan: "",
    higherIsBetter: false,
    deskripsi:
      "Indeks Kemahalan Konstruksi (IKK) menggambarkan perbandingan tingkat kemahalan harga bahan bangunan, sewa alat, dan upah kerja konstruksi suatu wilayah relatif terhadap wilayah lain.",
    highlight: { brebes: 104.48, tahun: 2024 },
    series: [],
    ranking: [],
  },
];

export const getIndicator = (slug: string) => INDICATORS.find(i => i.slug === slug);
