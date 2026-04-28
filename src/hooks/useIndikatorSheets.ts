import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type IndikatorSeriesPoint = { tahun: number; brebes: number };
export type IndikatorRankPoint = { wilayah: string; nilai: number };
export type IndikatorComparePoint = { tahun: number; nilai: number };

export type IndikatorSheetsItem = {
  slug: string;
  series: IndikatorSeriesPoint[];
  seriesJateng: IndikatorComparePoint[];
  seriesNasional: IndikatorComparePoint[];
  ranking: IndikatorRankPoint[];
  rankingTahun: number | null;
  rankingByYear: Record<string, IndikatorRankPoint[]>;
  rankingYears: number[];
  jatengByYear: Record<string, number>;
  nasionalByYear: Record<string, number>;
  jateng: number | null;
  nasional: number | null;
};

export type IndikatorSheets = {
  indicators: Record<string, IndikatorSheetsItem>;
  fetchedAt: string;
};

export const useIndikatorSheets = () => {
  return useQuery<IndikatorSheets>({
    queryKey: ["sheets-indikator"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke<IndikatorSheets>("sheets-indikator");
      if (error) throw error;
      if (!data) throw new Error("Tidak ada data dari Google Sheets");
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
};
