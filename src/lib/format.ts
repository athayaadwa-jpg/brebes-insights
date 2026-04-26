// Formatter angka terpusat untuk seluruh dashboard.
// Locale id-ID: pemisah ribuan = titik, desimal = koma.

const ID = "id-ID";

/** Bilangan bulat dengan pemisah ribuan. Contoh: 257290 -> "257.290". */
export const formatInt = (n: number): string =>
  Math.round(n).toLocaleString(ID, { maximumFractionDigits: 0 });

/**
 * Bilangan desimal dengan jumlah digit tetap (default 2).
 * Contoh: 14.37 -> "14,37"; 0.341 (3 digit) -> "0,341".
 */
export const formatDecimal = (n: number, digits = 2): string =>
  n.toLocaleString(ID, { minimumFractionDigits: digits, maximumFractionDigits: digits });

/**
 * Pemilih otomatis: integer jika |n| >= 1000, jika tidak desimal `digits`.
 * Cocok untuk grafik di mana sumbu bisa mencampur ribuan dan persen.
 */
export const formatSmart = (n: number, digits = 2): string =>
  Math.abs(n) >= 1000 ? formatInt(n) : formatDecimal(n, digits);

/** Rupiah penuh. Contoh: 563762 -> "Rp 563.762". */
export const formatRupiah = (n: number): string => `Rp ${formatInt(n)}`;

/**
 * Gabungan nilai + satuan dengan spasi yang tepat.
 * - "%" tanpa spasi: "14,37%"
 * - satuan lain dengan spasi: "67,45 tahun"
 * - tanpa satuan: hanya angka.
 */
export const withUnit = (value: string, unit?: string): string => {
  if (!unit) return value;
  if (unit === "%") return `${value}%`;
  return `${value} ${unit}`;
};

/**
 * Garis kemiskinan kadang ditulis "563,762" (= 563.762 Rp) di sumber sheet.
 * Jika nilai parser < 10.000 anggap satuan "ribu" dan kalikan 1000.
 */
export const normalizeGarisKemiskinan = (n: number): number =>
  n < 10000 ? Math.round(n * 1000) : Math.round(n);
