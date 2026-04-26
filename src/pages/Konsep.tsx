import { useQuery } from "@tanstack/react-query";
import { AlertCircle, BookOpen, RefreshCw, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

type Konsep = { no: string; nama: string; definisi: string; sumber: string };
type KonsepResponse = { konsep: Konsep[]; lastUpdated: string };

const useKonsep = () =>
  useQuery<KonsepResponse>({
    queryKey: ["sheets-konsep"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke<KonsepResponse>("sheets-konsep");
      if (error) throw error;
      if (!data) throw new Error("Tidak ada data dari Google Sheets");
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

const KonsepPage = () => {
  const { data, isLoading, isError, error, refetch, isFetching } = useKonsep();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    if (!data?.konsep) return [];
    const needle = q.trim().toLowerCase();
    if (!needle) return data.konsep;
    return data.konsep.filter(
      (k) =>
        k.nama.toLowerCase().includes(needle) ||
        k.definisi.toLowerCase().includes(needle) ||
        k.sumber.toLowerCase().includes(needle),
    );
  }, [data, q]);

  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow="Glosarium"
        title="Konsep & Definisi"
        description="Penjelasan istilah dan konsep statistik yang digunakan dalam dashboard INTERES. Sumber data: Google Sheets BPS Kab. Brebes — diperbarui otomatis."
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari konsep, kata kunci, atau sumber data…"
            className="pl-9"
            aria-label="Cari konsep dan definisi"
          />
        </div>
        <div className="flex items-center gap-3">
          {data && (
            <span className="text-xs text-muted-foreground">
              {filtered.length} dari {data.konsep.length} konsep
            </span>
          )}
          <Button onClick={() => refetch()} size="sm" variant="outline" disabled={isFetching}>
            <RefreshCw className={`mr-2 h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
            Muat ulang
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-2 rounded-2xl border border-border bg-card p-4 shadow-soft">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 text-destructive" />
            <div className="flex-1">
              <p className="font-semibold text-destructive">Tidak dapat memuat konsep & definisi</p>
              <p className="mt-1 text-sm text-muted-foreground">{(error as Error)?.message ?? "Unknown error"}</p>
              <Button onClick={() => refetch()} size="sm" className="mt-4">
                <RefreshCw className="mr-2 h-4 w-4" /> Coba lagi
              </Button>
            </div>
          </div>
        </div>
      )}

      {data && !isLoading && (
        <>
          <div className="rounded-2xl border border-border bg-card p-2 shadow-soft sm:p-4">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-12 text-center">
                <BookOpen className="h-8 w-8 text-muted-foreground/60" />
                <p className="text-sm font-medium">Tidak ada konsep yang cocok</p>
                <p className="text-xs text-muted-foreground">Coba kata kunci lain.</p>
              </div>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {filtered.map((k, i) => (
                  <AccordionItem key={`${k.no}-${i}`} value={`item-${i}`}>
                    <AccordionTrigger className="text-left font-display font-semibold">
                      <span className="flex items-start gap-3">
                        <span className="mt-0.5 inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-primary/10 px-1.5 text-xs font-bold text-primary">
                          {k.no || i + 1}
                        </span>
                        <span>{k.nama}</span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="text-base leading-relaxed text-muted-foreground">
                      {/* Render multi-paragraf */}
                      <div className="space-y-3 whitespace-pre-line pl-9">
                        {k.definisi || <em className="text-muted-foreground/70">Definisi belum tersedia.</em>}
                      </div>
                      {k.sumber && (
                        <div className="mt-3 pl-9">
                          <Badge variant="secondary" className="text-xs font-normal">
                            Sumber: {k.sumber}
                          </Badge>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Pembaruan terakhir: {new Date(data.lastUpdated).toLocaleString("id-ID")}
          </p>
        </>
      )}
    </div>
  );
};

export default KonsepPage;
