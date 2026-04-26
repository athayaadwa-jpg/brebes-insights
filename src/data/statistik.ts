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

const mkRanking = (brebesNilai: number, range: [number, number]) => {
  const [min, max] = range;
  const others = KAB_KOTA_JATENG.filter(w => w !== "Brebes").map(w => ({
    wilayah: w,
    nilai: +(min + Math.random() * (max - min)).toFixed(2),
  }));
  return [...others, { wilayah: "Brebes", nilai: brebesNilai }];
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
    highlight: { brebes: 8.27, jateng: 5.13, nasional: 4.91, tahun: 2024 },
    series: [
      { tahun: 2020, brebes: 9.84, jateng: 6.48, nasional: 7.07 },
      { tahun: 2021, brebes: 9.78, jateng: 5.95, nasional: 6.49 },
      { tahun: 2022, brebes: 9.07, jateng: 5.57, nasional: 5.86 },
      { tahun: 2023, brebes: 8.65, jateng: 5.13, nasional: 5.32 },
      { tahun: 2024, brebes: 8.27, jateng: 5.13, nasional: 4.91 },
    ],
    ranking: mkRanking(8.27, [2.5, 9.5]),
  },
  {
    slug: "tpak",
    nama: "Tingkat Partisipasi Angkatan Kerja",
    satuan: "%",
    higherIsBetter: true,
    deskripsi:
      "Tingkat Partisipasi Angkatan Kerja (TPAK) adalah persentase jumlah angkatan kerja terhadap jumlah penduduk usia kerja, menggambarkan besarnya partisipasi penduduk dalam aktivitas ekonomi.",
    highlight: { brebes: 67.45, jateng: 71.94, nasional: 70.63, tahun: 2024 },
    series: [
      { tahun: 2020, brebes: 64.10, jateng: 68.13, nasional: 67.77 },
      { tahun: 2021, brebes: 65.25, jateng: 70.10, nasional: 67.80 },
      { tahun: 2022, brebes: 66.30, jateng: 70.85, nasional: 68.63 },
      { tahun: 2023, brebes: 66.92, jateng: 71.45, nasional: 69.48 },
      { tahun: 2024, brebes: 67.45, jateng: 71.94, nasional: 70.63 },
    ],
    ranking: mkRanking(67.45, [60, 78]),
  },
  {
    slug: "kemiskinan",
    nama: "Persentase Penduduk Miskin",
    satuan: "%",
    higherIsBetter: false,
    deskripsi:
      "Persentase Penduduk Miskin adalah persentase penduduk yang berada di bawah Garis Kemiskinan. Garis Kemiskinan merupakan jumlah rupiah minimum untuk memenuhi kebutuhan dasar makanan dan non-makanan.",
    highlight: { brebes: 14.37, jateng: 10.47, nasional: 9.03, tahun: 2024 },
    series: [
      { tahun: 2020, brebes: 17.03, jateng: 11.84, nasional: 10.19 },
      { tahun: 2021, brebes: 17.43, jateng: 11.79, nasional: 10.14 },
      { tahun: 2022, brebes: 16.05, jateng: 10.93, nasional: 9.57 },
      { tahun: 2023, brebes: 15.10, jateng: 10.77, nasional: 9.36 },
      { tahun: 2024, brebes: 14.37, jateng: 10.47, nasional: 9.03 },
    ],
    ranking: mkRanking(14.37, [3.5, 18]),
  },
  {
    slug: "ipm",
    nama: "Indeks Pembangunan Manusia",
    satuan: "",
    higherIsBetter: true,
    deskripsi:
      "Indeks Pembangunan Manusia (IPM) mengukur capaian pembangunan manusia berbasis sejumlah komponen dasar kualitas hidup: umur panjang dan sehat, pengetahuan, dan standar hidup layak.",
    highlight: { brebes: 67.94, jateng: 73.39, nasional: 74.39, tahun: 2024 },
    series: [
      { tahun: 2020, brebes: 65.41, jateng: 71.87, nasional: 71.94 },
      { tahun: 2021, brebes: 65.93, jateng: 72.16, nasional: 72.29 },
      { tahun: 2022, brebes: 66.71, jateng: 72.79, nasional: 72.91 },
      { tahun: 2023, brebes: 67.45, jateng: 73.13, nasional: 73.55 },
      { tahun: 2024, brebes: 67.94, jateng: 73.39, nasional: 74.39 },
    ],
    ranking: mkRanking(67.94, [65, 85]),
  },
  {
    slug: "padi",
    nama: "Luas Panen & Produksi Padi",
    satuan: "ribu ton",
    higherIsBetter: true,
    deskripsi:
      "Luas Panen Padi adalah luas tanaman padi yang dipungut hasilnya setelah cukup umur. Produksi Padi merupakan hasil produksi gabah kering giling (GKG) dari luas panen tersebut.",
    highlight: { brebes: 854.12, jateng: 9456.3, nasional: 53983.6, tahun: 2024 },
    series: [
      { tahun: 2020, brebes: 798.4, jateng: 9489.2, nasional: 54649.2 },
      { tahun: 2021, brebes: 812.6, jateng: 9618.5, nasional: 54415.3 },
      { tahun: 2022, brebes: 835.1, jateng: 9694.7, nasional: 54748.9 },
      { tahun: 2023, brebes: 821.7, jateng: 9320.4, nasional: 53980.1 },
      { tahun: 2024, brebes: 854.12, jateng: 9456.3, nasional: 53983.6 },
    ],
    ranking: mkRanking(854.12, [120, 900]),
  },
  {
    slug: "pertumbuhan-ekonomi",
    nama: "Pertumbuhan Ekonomi (PDRB)",
    satuan: "%",
    higherIsBetter: true,
    deskripsi:
      "Pertumbuhan ekonomi diukur dari laju pertumbuhan Produk Domestik Regional Bruto (PDRB) atas dasar harga konstan, yang mencerminkan perubahan riil aktivitas ekonomi suatu wilayah.",
    highlight: { brebes: 5.12, jateng: 4.98, nasional: 5.05, tahun: 2024 },
    series: [
      { tahun: 2020, brebes: -1.87, jateng: -2.65, nasional: -2.07 },
      { tahun: 2021, brebes: 3.45, jateng: 3.33, nasional: 3.70 },
      { tahun: 2022, brebes: 5.02, jateng: 5.31, nasional: 5.31 },
      { tahun: 2023, brebes: 4.96, jateng: 4.98, nasional: 5.05 },
      { tahun: 2024, brebes: 5.12, jateng: 4.98, nasional: 5.05 },
    ],
    ranking: mkRanking(5.12, [3.5, 7.2]),
  },
];

export const getIndicator = (slug: string) => INDICATORS.find(i => i.slug === slug);
