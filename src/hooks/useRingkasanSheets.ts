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
  };
  seri: Array<Record<string, number | null>>;
  pdrb: { periode: string; laju: number | null } | null;
  lastUpdated: string;
};

export const useRingkasanSheets = () => {
  return useQuery<RingkasanSheets>({
    queryKey: ["sheets-ringkasan"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke<RingkasanSheets>("sheets-ringkasan");
      if (error) throw error;
      if (!data) throw new Error("Tidak ada data dari Google Sheets");
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
};
