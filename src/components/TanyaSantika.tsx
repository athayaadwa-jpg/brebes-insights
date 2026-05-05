import { useState, useRef, useEffect, useMemo } from "react";
import { MessageCircle, Send, Sparkles, Loader2, RotateCcw, Check, ChevronDown, Search } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useRingkasanSheets, type LatestValue } from "@/hooks/useRingkasanSheets";
import { formatDecimal, formatInt, formatRupiah, normalizeGarisKemiskinan } from "@/lib/format";

type Msg = { role: "user" | "assistant"; content: string };

type IndicatorDef = {
  key: string;
  label: string;
  group: string;
  format: (data: NonNullable<ReturnType<typeof useRingkasanSheets>["data"]>) => string | null;
};

const fmt = (n: number) => formatDecimal(n);
const fmtI = (n: number) => formatInt(n);

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
    key: "p1", group: "Kemiskinan", label: "Indeks Kedalaman (P1)",
    format: (d) => v(d.ringkasan.p1) === null ? null
      : `Indeks Kedalaman Kemiskinan (P1): ${fmt(v(d.ringkasan.p1)!)} (${yr(d.ringkasan.p1)}). Tren: ${trendStr(d.seri, "p1")}`,
  },
  {
    key: "p2", group: "Kemiskinan", label: "Indeks Keparahan (P2)",
    format: (d) => v(d.ringkasan.p2) === null ? null
      : `Indeks Keparahan Kemiskinan (P2): ${fmt(v(d.ringkasan.p2)!)} (${yr(d.ringkasan.p2)}). Tren: ${trendStr(d.seri, "p2")}`,
  },
  {
    key: "garisKemiskinan", group: "Kemiskinan", label: "Garis Kemiskinan",
    format: (d) => v(d.ringkasan.garisKemiskinan) === null ? null
      : `Garis Kemiskinan: ${formatRupiah(normalizeGarisKemiskinan(v(d.ringkasan.garisKemiskinan)!))}/kapita/bulan (${yr(d.ringkasan.garisKemiskinan)})`,
  },
  {
    key: "gini", group: "Kemiskinan", label: "Gini Rasio",
    format: (d) => v(d.ringkasan.gini) === null ? null
      : `Gini Rasio: ${fmt(v(d.ringkasan.gini)!)} (${yr(d.ringkasan.gini)}). Tren: ${trendStr(d.seri, "gini")}`,
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
      : `Umur Harapan Hidup: ${fmt(v(d.ringkasan.uhh)!)} tahun (${yr(d.ringkasan.uhh)}). Tren: ${trendStr(d.seri, "uhh")}`,
  },
  {
    key: "eys", group: "Pembangunan Manusia", label: "Harapan Lama Sekolah",
    format: (d) => v(d.ringkasan.eys) === null ? null
      : `Harapan Lama Sekolah: ${fmt(v(d.ringkasan.eys)!)} tahun (${yr(d.ringkasan.eys)}). Tren: ${trendStr(d.seri, "eys")}`,
  },
  {
    key: "mys", group: "Pembangunan Manusia", label: "Rata-rata Lama Sekolah",
    format: (d) => v(d.ringkasan.mys) === null ? null
      : `Rata-rata Lama Sekolah: ${fmt(v(d.ringkasan.mys)!)} tahun (${yr(d.ringkasan.mys)}). Tren: ${trendStr(d.seri, "mys")}`,
  },
  {
    key: "ppp", group: "Pembangunan Manusia", label: "Pengeluaran per Kapita",
    format: (d) => v(d.ringkasan.ppp) === null ? null
      : `Pengeluaran per Kapita: ${fmtI(v(d.ringkasan.ppp)!)} ribu Rp/tahun (${yr(d.ringkasan.ppp)}). Tren: ${trendStr(d.seri, "ppp", fmtI)}`,
  },
  {
    key: "luasPanen", group: "Pertanian", label: "Luas Panen Padi",
    format: (d) => v(d.ringkasan.luasPanen) === null ? null
      : `Luas Panen Padi: ${fmtI(v(d.ringkasan.luasPanen)!)} hektare (${yr(d.ringkasan.luasPanen)}). Tren: ${trendStr(d.seri, "luasPanen", fmtI)}`,
  },
  {
    key: "produksiPadi", group: "Pertanian", label: "Produksi Padi",
    format: (d) => v(d.ringkasan.produksiPadi) === null ? null
      : `Produksi Padi: ${fmtI(v(d.ringkasan.produksiPadi)!)} ton GKG (${yr(d.ringkasan.produksiPadi)}). Tren: ${trendStr(d.seri, "produksiPadi", fmtI)}`,
  },
  {
    key: "produksiBeras", group: "Pertanian", label: "Produksi Beras",
    format: (d) => v(d.ringkasan.produksiBeras) === null ? null
      : `Produksi Beras: ${fmtI(v(d.ringkasan.produksiBeras)!)} ton (${yr(d.ringkasan.produksiBeras)}). Tren: ${trendStr(d.seri, "produksiBeras", fmtI)}`,
  },
  {
    key: "pdrbKonstan", group: "Ekonomi", label: "PDRB Harga Konstan",
    format: (d) => v(d.ringkasan.pdrbKonstan) === null ? null
      : `PDRB Atas Dasar Harga Konstan: ${fmt(v(d.ringkasan.pdrbKonstan)!)} miliar Rp (${yr(d.ringkasan.pdrbKonstan)}${d.periods?.pdrbKonstan ? " · " + d.periods.pdrbKonstan : ""})`,
  },
  {
    key: "pertumbuhanLU", group: "Ekonomi", label: "Pertumbuhan Ekonomi (LU)",
    format: (d) => v(d.ringkasan.pertumbuhanLU) === null ? null
      : `Pertumbuhan Ekonomi (Lapangan Usaha): ${fmt(v(d.ringkasan.pertumbuhanLU)!)}% (${yr(d.ringkasan.pertumbuhanLU)}${d.periods?.pertumbuhanLU ? " · " + d.periods.pertumbuhanLU : ""})`,
  },
  {
    key: "lajuPdrbTahunan", group: "Ekonomi", label: "Laju PDRB Tahunan",
    format: (d) => v(d.ringkasan.lajuPdrbTahunan) === null ? null
      : `Laju Pertumbuhan PDRB Tahunan: ${fmt(v(d.ringkasan.lajuPdrbTahunan)!)}% (${yr(d.ringkasan.lajuPdrbTahunan)}${d.periods?.lajuPdrbTahunan ? " · " + d.periods.lajuPdrbTahunan : ""})`,
  },
  {
    key: "ikk", group: "Ekonomi", label: "Indeks Kemahalan Konstruksi",
    format: (d) => v(d.ringkasan.ikk) === null ? null
      : `IKK: ${fmt(v(d.ringkasan.ikk)!)} (${yr(d.ringkasan.ikk)}). Tren: ${trendStr(d.seri, "ikk")}`,
  },
];

const STREAM_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tanya-santika`;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export const TanyaSantika = () => {
  const [open, setOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [streaming, setStreaming] = useState(false);
  const { data } = useRingkasanSheets();
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const grouped = useMemo(() => {
    const map = new Map<string, IndicatorDef[]>();
    INDICATORS.forEach((i) => {
      if (!map.has(i.group)) map.set(i.group, []);
      map.get(i.group)!.push(i);
    });
    return Array.from(map.entries());
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streaming]);

  // Auto-resize textarea to content, capped at 5 lines
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, [input]);

  const toggle = (k: string) =>
    setSelected((s) => {
      const next = new Set(s);
      next.has(k) ? next.delete(k) : next.add(k);
      return next;
    });

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
          {/* Header */}
          <SheetHeader className="shrink-0 space-y-1 border-b border-border bg-gradient-to-br from-primary/10 to-accent/10 px-4 py-3 pr-12 text-left sm:px-5 sm:py-4">
            <SheetTitle className="flex items-center gap-2 text-base sm:text-lg">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-glow text-primary-foreground sm:h-8 sm:w-8">
                <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </span>
              Tanya Santika
            </SheetTitle>
            <SheetDescription className="text-muted-foreground leading-snug text-xs">
              Asisten AI untuk insight perbandingan indikator strategis Kab. Brebes.
            </SheetDescription>
          </SheetHeader>

          {/* Indicator picker — collapsible */}
          <div className="shrink-0 border-b border-border bg-muted/40">
            <button
              type="button"
              onClick={() => setPickerOpen((s) => !s)}
              className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left sm:px-5"
              aria-expanded={pickerOpen}
            >
              <div className="flex min-w-0 items-center gap-2">
                <span className="text-xs font-semibold text-foreground">Pilih indikator</span>
                {selected.size > 0 ? (
                  <Badge className="h-5 shrink-0 px-1.5 text-[10px] bg-primary text-primary-foreground">
                    {selected.size} dipilih
                  </Badge>
                ) : (
                  <span className="truncate text-[11px] text-muted-foreground">untuk dianalisis</span>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {selected.size > 0 && (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => { e.stopPropagation(); setSelected(new Set()); }}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); setSelected(new Set()); } }}
                    className="text-[11px] text-destructive hover:text-destructive/80 font-medium"
                  >
                    Hapus
                  </span>
                )}
                <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", pickerOpen && "rotate-180")} />
              </div>
            </button>
            {pickerOpen && (
              <div className="px-4 pb-3 sm:px-5">
                <ScrollArea className="h-48 sm:h-56">
                  <div className="space-y-3 pr-2">
                    {grouped.map(([group, items]) => (
                      <div key={group}>
                        <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-primary/70">
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
                                  "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all",
                                  active
                                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                    : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-accent/50",
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
              </div>
            )}
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 sm:px-5">
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Halo! Saya <strong className="text-foreground">Santika</strong>. Pilih beberapa indikator di atas, lalu tanyakan
                  perbandingan atau hubungannya. Beberapa contoh:
                </p>
                <div className="flex flex-col gap-2">
                  {suggestionPrompts.map((p) => (
                    <button
                      key={p}
                      onClick={() => setInput(p)}
                      className="rounded-lg border border-border bg-card px-3 py-2.5 text-left text-xs text-foreground transition-colors hover:border-primary/40 hover:bg-accent/50"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3 sm:space-y-4">
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
                      "max-w-[88%] break-words rounded-2xl px-3.5 py-2.5 text-sm",
                      m.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted/80 text-foreground border border-border rounded-bl-md",
                    )}
                  >
                    {m.role === "assistant" ? (
                      <div className="prose prose-sm max-w-none break-words dark:prose-invert prose-p:my-2 prose-headings:my-2 prose-ul:my-2 prose-ul:pl-5 prose-ol:my-2 prose-ol:pl-5 prose-li:my-0 prose-pre:overflow-x-auto">
                        <ReactMarkdown>{m.content || "…"}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap break-words">{m.content}</p>
                    )}
                  </div>
                </div>
              ))}
              {streaming && messages[messages.length - 1]?.role === "user" && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-muted/80 border border-border px-3.5 py-2.5 rounded-bl-md">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input */}
          <div className="shrink-0 border-t border-border bg-card/80 backdrop-blur-sm px-3 py-2.5 pb-[max(env(safe-area-inset-bottom),0.625rem)] sm:px-4 sm:py-3">
            <div className="flex items-end gap-2">
              <textarea
                ref={textareaRef}
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
                className="flex-1 resize-none overflow-hidden rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                style={{ maxHeight: 120 }}
              />
              {messages.length > 0 && (
                <Button onClick={reset} variant="outline" size="icon" title="Mulai ulang" className="h-9 w-9 shrink-0 rounded-xl sm:h-10 sm:w-10">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
              <Button onClick={send} disabled={!input.trim() || streaming} size="icon" className="h-9 w-9 shrink-0 rounded-xl sm:h-10 sm:w-10">
                {streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
            <p className="mt-1.5 text-[10px] leading-snug text-muted-foreground">
              Insight AI berdasarkan data terpilih. Verifikasi sebelum dipakai untuk keputusan.
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
