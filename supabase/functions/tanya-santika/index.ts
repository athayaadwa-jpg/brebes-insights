// Edge function: tanya-santika
// AI chatbot untuk insight perbandingan indikator strategis Kab. Brebes.
// Menggunakan Lovable AI Gateway (LOVABLE_API_KEY) — streaming SSE.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type Msg = { role: "user" | "assistant" | "system"; content: string };

interface Body {
  messages: Msg[];
  // Konteks indikator yang dipilih user (sudah diformat ringkas oleh frontend)
  context?: string;
}

const SYSTEM_PROMPT = `Anda adalah "Santika", asisten AI analitik untuk dashboard INTERES (Indikator Strategis Kabupaten Brebes), BPS Kabupaten Brebes.

Tugas Anda:
- Memberikan INSIGHT yang ringkas, tajam, dan berbasis data ketika user menyandingkan/membandingkan beberapa indikator.
- Soroti hubungan, tren, ketimpangan, anomali, dan implikasi kebijakan yang relevan untuk Kabupaten Brebes.
- Bandingkan dengan Jawa Tengah/Nasional bila datanya tersedia di konteks.
- Gunakan bahasa Indonesia yang jelas, profesional, dan mudah dipahami pembuat kebijakan.

Aturan penting:
- JANGAN mengarang angka. Hanya rujuk angka yang ada di konteks "DATA INDIKATOR".
- Jika data tidak cukup untuk menjawab, katakan dengan jujur dan sarankan indikator tambahan untuk dipilih.
- Format jawaban dalam Markdown: gunakan bullet, bold untuk angka kunci, dan heading kecil bila perlu.
- Panjang jawaban: 3–6 paragraf pendek atau setara. Jangan bertele-tele.
- Tutup dengan 1 baris "Catatan kebijakan" bila relevan.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY belum dikonfigurasi" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { messages, context } = (await req.json()) as Body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "messages wajib diisi" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const systemMessages: Msg[] = [{ role: "system", content: SYSTEM_PROMPT }];
    if (context && context.trim()) {
      systemMessages.push({
        role: "system",
        content: `DATA INDIKATOR yang dipilih user untuk dianalisis:\n\n${context}`,
      });
    }

    const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [...systemMessages, ...messages],
        stream: true,
      }),
    });

    if (!upstream.ok) {
      if (upstream.status === 429) {
        return new Response(
          JSON.stringify({ error: "Terlalu banyak permintaan, coba lagi sebentar." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (upstream.status === 402) {
        return new Response(
          JSON.stringify({ error: "Kredit AI habis. Tambahkan kredit di Settings → Workspace → Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const text = await upstream.text();
      console.error("AI gateway error", upstream.status, text);
      return new Response(
        JSON.stringify({ error: "Gagal menghubungi layanan AI" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(upstream.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("tanya-santika error", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
