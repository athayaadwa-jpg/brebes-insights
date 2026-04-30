import { useState, useRef, useEffect, useMemo } from "react";
import { MessageCircle, Send, Sparkles, X, Loader2, RotateCcw, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useRingkasanSheets, type LatestValue } from "@/hooks/useRingkasanSheets";
import { formatDecimal, formatInt, formatRupiah, normalizeGarisKemiskinan } from "@/lib/format";

type Msg = { role: "user" | "assistant"; content: string };

// Definisi indikator yang bisa dipilih user untuk dianalisis Santika.
// Setiap entri tahu cara mengambil nilai terbaru + tren dari payload Ringkasan.
type IndicatorDef = {
  key: string;
  label: string;
  group: string;
  // Mengembalikan baris ringkas: "Label: nilai (tahun) — tren: ..."
  format: (data: NonNullable<ReturnType<typeof useRingkasanSheets>["data"]>) => string | null;
};

const fmt = (n: number) => formatDecimal(n);
const fmtI = (n: number) => formatInt(n);

// Helper untuk membuat ringkasan tren 3 titik terakhir dari series.
const trendStr = (
  seri: Array<Record<string, number | null>>,
  key: string,
  formatter: (n: number) => string = fmt,
) => {
  const valid = seri.filter((r) => r[key] !== null && r[key] !== undefined).slice(-3);
  if (valid.length === 0) return "";
  return valid.map((r) => `${r.tahun}=${formatter(r[key] as number)}`).join(", ");
};

const v = (lv: LatestValue) => (lv ? lv.value : null);
const yr = (lv: LatestValue) => (lv ? lv.tahun : null);

const INDICATORS: IndicatorDef[] = [
  {
    key: "pendudukTotal", group: "Demografi", label: "Jumlah Penduduk",
    format: (d) => v(d.ringkasan.pendudukTotal) === null ? null
      : `Jumlah Penduduk: ${fmtI(v(d.ringkasan.pendudukTotal)!)} jiwa (${yr(d.ringkasan.pendudukTotal)}). Tren: ${trendStr(d.seri, "pendudukTotal", fmtI)}`,
  },
  {
    key: "pendudukLaki", group: "Demografi", label: "Penduduk Laki-laki",
    format: (d) => v(d.ringkasan.pendudukLaki) === null ? null
      : `Penduduk Laki-laki: ${fmtI(v(d.ringkasan.pendudukLaki)!)} jiwa (${yr(d.ringkasan.pendudukLaki)}). Tren: ${trendStr(d.seri, "pendudukLaki", fmtI)}`,
  },
  {
    key: "pendudukPerempuan", group: "Demografi", label: "Penduduk Perempuan",
    format: (d) => v(d.ringkasan.pendudukPerempuan) === null ? null
      : `Penduduk Perempuan: ${fmtI(v(d.ringkasan.pendudukPerempuan)!)} jiwa (${yr(d.ringkasan.pendudukPerempuan)}). Tren: ${trendStr(d.seri, "pendudukPerempuan", fmtI)}`,
  },
  {
    key: "persenMiskin", group: "Kemiskinan", label: "% Penduduk Miskin",
    format: (d) => v(d.ringkasan.persenMiskin) === null ? null
      : `Persentase Penduduk Miskin: ${fmt(v(d.ringkasan.persenMiskin)!)}% (${yr(d.ringkasan.persenMiskin)}). Tren: ${trendStr(d.seri, "persenMiskin")}`,
  },
  {
    key: "jumlahMiskin", group: "Kemiskinan", label: "Jumlah Penduduk Miskin",
    format: (d) => v(d.ringkasan.jumlahMiskin) === null ? null
      : `Jumlah Penduduk Miskin: ${fmt(v(d.ringkasan.jumlahMiskin)!)} ribu jiwa (${yr(d.ringkasan.jumlahMiskin)}). Tren: ${trendStr(d.seri, "jumlahMiskin")}`,
  },
  {
    key: "miskinEkstrem", group: "Kemiskinan", label: "Kemiskinan Ekstrem",
    format: (d) => v(d.ringkasan.miskinEkstrem) === null ? null
      : `Kemiskinan Ekstrem: ${fmt(v(d.ringkasan.miskinEkstrem)!)}% (${yr(d.ringkasan.miskinEkstrem)}). Tren: ${trendStr(d.seri, "miskinEkstrem")}`,
  },
  {
    key: "garisKemiskinan", group: "Kemiskinan", label: "Garis Kemiskinan",
    format: (d) => v(d.ringkasan.garisKemiskinan) === null ? null
      : `Garis Kemiskinan: ${formatRupiah(normalizeGarisKemiskinan(v(d.ringkasan.garisKemiskinan)!))}/kapita/bulan (${yr(d.ringkasan.garisKemiskinan)})`,
  },
  {
    key: "gini", group: "Kemiskinan", label: "Gini Ratio",
    format: (d) => v(d.ringkasan.gini) === null ? null
      : `Gini Ratio: ${fmt(v(d.ringkasan.gini)!)} (${yr(d.ringkasan.gini)}). Tren: ${trendStr(d.seri, "gini")}`,
  },
  {
    key: "tpak", group: "Ketenagakerjaan", label: "TPAK",
    format: (d) => v(d.ringkasan.tpak) === null ? null
      : `TPAK (Tingkat Partisipasi Angkatan Kerja): ${fmt(v(d.ringkasan.tpak)!)}% (${yr(d.ringkasan.tpak)}). Tren: ${trendStr(d.seri, "tpak")}`,
  },
  {
    key: "tpt", group: "Ketenagakerjaan", label: "TPT",
    format: (d) => v(d.ringkasan.tpt) === null ? null
      : `TPT (Tingkat Pengangguran Terbuka): ${fmt(v(d.ringkasan.tpt)!)}% (${yr(d.ringkasan.tpt)}). Tren: ${trendStr(d.seri, "tpt")}`,
  },
  {
    key: "ipm", group: "Pembangunan Manusia", label: "IPM",
    format: (d) => v(d.ringkasan.ipm) === null ? null
      : `IPM: ${fmt(v(d.ringkasan.ipm)!)} (${yr(d.ringkasan.ipm)}). Tren: ${trendStr(d.seri, "ipm")}`,
  },
  {
    key: "uhh", group: "Pembangunan Manusia", label: "Umur Harapan Hidup",
    format: (d) => v(d.ringkasan.uhh) === null ? null
      : `Umur Harapan Hidup: ${fmt(v(d.ringkasan.uhh)!)} tahun (${yr(d.ringkasan.uhh)})`,
  },
  {
    key: "eys", group: "Pembangunan Manusia", label: "Harapan Lama Sekolah",
    format: (d) => v(d.ringkasan.eys) === null ? null
      : `Harapan Lama Sekolah: ${fmt(v(d.ringkasan.eys)!)} tahun (${yr(d.ringkasan.eys)})`,
  },
  {
    key: "mys", group: "Pembangunan Manusia", label: "Rata-rata Lama Sekolah",
    format: (d) => v(d.ringkasan.mys) === null ? null
      : `Rata-rata Lama Sekolah: ${fmt(v(d.ringkasan.mys)!)} tahun (${yr(d.ringkasan.mys)})`,
  },
  {
    key: "ppp", group: "Pembangunan Manusia", label: "Pengeluaran per Kapita",
    format: (d) => v(d.ringkasan.ppp) === null ? null
      : `Pengeluaran per Kapita: ${fmtI(v(d.ringkasan.ppp)!)} ribu Rp/tahun (${yr(d.ringkasan.ppp)})`,
  },
  {
    key: "luasPanen", group: "Pertanian", label: "Luas Panen Padi",
    format: (d) => v(d.ringkasan.luasPanen) === null ? null
      : `Luas Panen Padi: ${fmtI(v(d.ringkasan.luasPanen)!)} hektare (${yr(d.ringkasan.luasPanen)})`,
  },
  {
    key: "produksiPadi", group: "Pertanian", label: "Produksi Padi",
    format: (d) => v(d.ringkasan.produksiPadi) === null ? null
      : `Produksi Padi: ${fmtI(v(d.ringkasan.produksiPadi)!)} ton GKG (${yr(d.ringkasan.produksiPadi)})`,
  },
  {
    key: "pdrbKonstan", group: "Ekonomi", label: "PDRB Harga Konstan",
    format: (d) => v(d.ringkasan.pdrbKonstan) === null ? null
      : `PDRB Atas Dasar Harga Konstan: ${fmt(v(d.ringkasan.pdrbKonstan)!)} miliar Rp (${yr(d.ringkasan.pdrbKonstan)}${d.periods?.pdrbKonstan ? " · " + d.periods.pdrbKonstan : ""})`,
  },
  {
    key: "pertumbuhanLU", group: "Ekonomi", label: "Pertumbuhan Ekonomi",
    format: (d) => v(d.ringkasan.pertumbuhanLU) === null ? null
      : `Pertumbuhan Ekonomi (Lapangan Usaha): ${fmt(v(d.ringkasan.pertumbuhanLU)!)}% (${yr(d.ringkasan.pertumbuhanLU)}${d.periods?.pertumbuhanLU ? " · " + d.periods.pertumbuhanLU : ""})`,
  },
  {
    key: "ikk", group: "Ekonomi", label: "Indeks Kemahalan Konstruksi",
    format: (d) => v(d.ringkasan.ikk) === null ? null
      : `IKK: ${fmt(v(d.ringkasan.ikk)!)} (${yr(d.ringkasan.ikk)})`,
  },
];

const STREAM_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tanya-santika`;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export const TanyaSantika = () => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [streaming, setStreaming] = useState(false);
  const { data } = useRingkasanSheets();
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Group indicators untuk render checkbox per kategori
  const grouped = useMemo(() => {
    const map = new Map<string, IndicatorDef[]>();
    INDICATORS.forEach((i) => {
      if (!map.has(i.group)) map.set(i.group, []);
      map.get(i.group)!.push(i);
    });
    return Array.from(map.entries());
  }, []);

  // Auto-scroll ke bawah saat ada pesan baru
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streaming]);

  const toggle = (k: string) =>
    setSelected((s) => {
      const next = new Set(s);
      next.has(k) ? next.delete(k) : next.add(k);
      return next;
    });

  // Susun konteks teks berisi indikator-indikator yang dipilih.
  const buildContext = (): string => {
    if (!data || selected.size === 0) return "";
    const lines: string[] = [];
    INDICATORS.forEach((ind) => {
      if (selected.has(ind.key)) {
        const line = ind.format(data);
        if (line) lines.push(`- ${line}`);
      }
    });
    return lines.join("\n");
  };

  const send = async () => {
    const text = input.trim();
    if (!text || streaming) return;
    setInput("");

    const userMsg: Msg = { role: "user", content: text };
    const nextMsgs = [...messages, userMsg];
    setMessages(nextMsgs);
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    let assistantText = "";
    const upsert = (chunk: string) => {
      assistantText += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantText } : m));
        }
        return [...prev, { role: "assistant", content: assistantText }];
      });
    };

    try {
      const resp = await fetch(STREAM_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({
          messages: nextMsgs,
          context: buildContext(),
        }),
        signal: controller.signal,
      });

      if (!resp.ok || !resp.body) {
        let errMsg = "Gagal memanggil Santika.";
        try {
          const j = await resp.json();
          errMsg = j.error || errMsg;
        } catch { /* ignore */ }
        upsert(`⚠️ ${errMsg}`);
        setStreaming(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let done = false;
      while (!done) {
        const { value, done: streamDone } = await reader.read();
        if (streamDone) break;
        buffer += decoder.decode(value, { stream: true });

        let nl: number;
        while ((nl = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, nl);
          buffer = buffer.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const parsed = JSON.parse(json);
            const c = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (c) upsert(c);
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        upsert(`⚠️ ${(e as Error).message}`);
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  };

  const reset = () => {
    abortRef.current?.abort();
    setMessages([]);
    setStreaming(false);
  };

  const suggestionPrompts = [
    "Bandingkan kondisi kemiskinan dan ketenagakerjaan terkini.",
    "Apa hubungan IPM dengan pengeluaran per kapita di Brebes?",
    "Bagaimana posisi pertumbuhan ekonomi terhadap kemiskinan?",
  ];

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Tanya Santika"
        className={cn(
          "fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-gradient-to-br from-primary to-primary-glow px-4 py-3 text-sm font-semibold text-primary-foreground shadow-elegant transition-all hover:scale-105 hover:shadow-soft",
          open && "opacity-0 pointer-events-none",
        )}
      >
        <Sparkles className="h-4 w-4" />
        <span className="hidden sm:inline">Tanya Santika</span>
        <MessageCircle className="h-4 w-4 sm:hidden" />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md lg:max-w-lg">
          <SheetHeader className="border-b border-border bg-gradient-to-br from-primary/5 to-accent/5 px-5 py-4">
            <SheetTitle className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
                <Sparkles className="h-4 w-4" />
              </span>
              Tanya Santika
            </SheetTitle>
            <SheetDescription className="text-xs">
              Asisten AI untuk insight perbandingan indikator strategis Kab. Brebes.
            </SheetDescription>
          </SheetHeader>

          {/* Indicator picker */}
          <div className="border-b border-border bg-muted/30 px-5 py-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">
                Pilih indikator untuk dianalisis
              </span>
              {selected.size > 0 && (
                <button
                  onClick={() => setSelected(new Set())}
                  className="text-[11px] text-muted-foreground hover:text-foreground"
                >
                  Hapus pilihan
                </button>
              )}
            </div>
            <ScrollArea className="max-h-32">
              <div className="space-y-2 pr-2">
                {grouped.map(([group, items]) => (
                  <div key={group}>
                    <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                      {group}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {items.map((ind) => {
                        const active = selected.has(ind.key);
                        return (
                          <button
                            key={ind.key}
                            onClick={() => toggle(ind.key)}
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                              active
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-background text-foreground hover:border-primary/40",
                            )}
                          >
                            {active && <Check className="h-3 w-3" />}
                            {ind.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            {selected.size > 0 && (
              <div className="mt-2 text-[11px] text-muted-foreground">
                <Badge variant="secondary" className="mr-1">{selected.size}</Badge>
                indikator dipilih sebagai konteks.
              </div>
            )}
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4">
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Halo! Saya <strong>Santika</strong>. Pilih beberapa indikator di atas, lalu tanyakan
                  perbandingan atau hubungannya. Beberapa contoh:
                </p>
                <div className="flex flex-col gap-2">
                  {suggestionPrompts.map((p) => (
                    <button
                      key={p}
                      onClick={() => setInput(p)}
                      className="rounded-lg border border-border bg-card px-3 py-2 text-left text-xs text-foreground/80 transition-colors hover:border-primary/40 hover:bg-muted"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex",
                    m.role === "user" ? "justify-end" : "justify-start",
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm",
                      m.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground",
                    )}
                  >
                    {m.role === "assistant" ? (
                      <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-2 prose-headings:my-2 prose-ul:my-2 prose-li:my-0">
                        <ReactMarkdown>{m.content || "…"}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    )}
                  </div>
                </div>
              ))}
              {streaming && messages[messages.length - 1]?.role === "user" && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-muted px-3.5 py-2.5">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input */}
          <div className="border-t border-border bg-card px-4 py-3">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                rows={1}
                placeholder={
                  selected.size === 0
                    ? "Pilih indikator dulu, lalu tanyakan…"
                    : "Tanya perbandingan / insight…"
                }
                className="flex-1 resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              />
              {messages.length > 0 && (
                <Button onClick={reset} variant="outline" size="icon" title="Mulai ulang">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
              <Button onClick={send} disabled={!input.trim() || streaming} size="icon">
                {streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
            <p className="mt-1.5 text-[10px] text-muted-foreground">
              Insight dihasilkan AI berdasarkan data yang dipilih. Verifikasi sebelum digunakan untuk pengambilan keputusan.
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
