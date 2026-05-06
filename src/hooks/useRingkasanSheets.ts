import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type LatestValue = { tahun: number; value: number } | null;

export type RingkasanSheets = {
  ringkasan: {
    persenMiskin: LatestValue;
    jumlahMiskin: LatestValue;        // ribu jiwa
    garisKemiskinan: LatestValue;     // Rp/kapita/bulan
    p1: LatestValue;
    p2: LatestValue;
    miskinEkstrem: LatestValue;       // %
    gini: LatestValue;
    tpak: LatestValue;
    tpt: LatestValue;
    uhh: LatestValue;
    eys: LatestValue;
    mys: LatestValue;
    ppp: LatestValue;                 // ribu Rp / tahun
    ipm: LatestValue;
    ikk: LatestValue;
    luasPanen: LatestValue;           // hektare
    produksiPadi: LatestValue;        // ton GKG
    produksiBeras: LatestValue;       // ton beras
    pendudukLaki: LatestValue;        // jiwa
    pendudukPerempuan: LatestValue;   // jiwa
    pendudukTotal: LatestValue;       // jiwa
    pertumbuhanLU: LatestValue;       // %
    pdrbKonstan: LatestValue;         // miliar Rp
    lajuPdrbTahunan: LatestValue;     // %
    bangunanTempatTinggal: LatestValue; // unit
    produksiBawangMerah: LatestValue;   // kuintal
    produksiCabeRawit: LatestValue;     // kuintal
    produksiKentang: LatestValue;       // kuintal
    jumlahKecamatan: LatestValue;
    jumlahDesaKelurahan: LatestValue;
  };
  seri: Array<Record<string, number | null>>;
  pdrb: { periode: string; laju: number | null } | null;
  periods?: {
    pertumbuhanLU: string | null;
    pdrbKonstan: string | null;
    lajuPdrbTahunan: string | null;
  };
  lastUpdated: string;
  fallback?: boolean;
  stale?: boolean;
  error?: string;
};

const CACHE_KEY = "interes:ringkasan-sheets";

const emptyValue = null as LatestValue;

const fallbackData = (message: string): RingkasanSheets => ({
  ringkasan: {
    persenMiskin: emptyValue,
    jumlahMiskin: emptyValue,
    garisKemiskinan: emptyValue,
    p1: emptyValue,
    p2: emptyValue,
    miskinEkstrem: emptyValue,
    gini: emptyValue,
    tpak: emptyValue,
    tpt: emptyValue,
    uhh: emptyValue,
    eys: emptyValue,
    mys: emptyValue,
    ppp: emptyValue,
    ipm: emptyValue,
    ikk: emptyValue,
    luasPanen: emptyValue,
    produksiPadi: emptyValue,
    produksiBeras: emptyValue,
    pendudukLaki: emptyValue,
    pendudukPerempuan: emptyValue,
    pendudukTotal: emptyValue,
    pertumbuhanLU: emptyValue,
    pdrbKonstan: emptyValue,
    lajuPdrbTahunan: emptyValue,
    bangunanTempatTinggal: emptyValue,
    produksiBawangMerah: emptyValue,
    produksiCabeRawit: emptyValue,
    produksiKentang: emptyValue,
    jumlahKecamatan: emptyValue,
    jumlahDesaKelurahan: emptyValue,
  },
  seri: [],
  pdrb: null,
  periods: { pertumbuhanLU: null, pdrbKonstan: null, lajuPdrbTahunan: null },
  lastUpdated: new Date().toISOString(),
  fallback: true,
  error: message,
});

const readCache = (): RingkasanSheets | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) as RingkasanSheets : null;
  } catch {
    return null;
  }
};

const writeCache = (data: RingkasanSheets) => {
  if (typeof window === "undefined" || data.fallback) return;
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage quota/privacy mode errors.
  }
};

export const useRingkasanSheets = () => {
  return useQuery<RingkasanSheets>({
    queryKey: ["sheets-ringkasan"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke<RingkasanSheets>("sheets-ringkasan");
      if (error) {
        const cached = readCache();
        return cached ? { ...cached, fallback: true, stale: true, error: error.message } : fallbackData(error.message);
      }
      if (!data) return fallbackData("Tidak ada data dari Google Sheets");
      if (data.fallback) {
        const cached = readCache();
        return cached ? { ...cached, fallback: true, stale: true, error: data.error } : data;
      }
      writeCache(data);
      return data;
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    retryDelay: (attempt) => Math.min(5000 * 2 ** attempt, 30000),
  });
};
