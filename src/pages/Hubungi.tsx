import { useState } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Mail, MapPin, Phone, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const pesanSchema = z.object({
  nama: z.string().trim().min(1, "Nama wajib diisi").max(100, "Nama maksimum 100 karakter"),
  email: z.string().trim().email("Email tidak valid").max(255),
  subjek: z.string().trim().min(1, "Subjek wajib diisi").max(200, "Subjek maksimum 200 karakter"),
  pesan: z.string().trim().min(5, "Pesan minimum 5 karakter").max(2000, "Pesan maksimum 2000 karakter"),
});

const Hubungi = () => {
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);
    const parsed = pesanSchema.safeParse({
      nama: fd.get("nama"),
      email: fd.get("email"),
      subjek: fd.get("subjek"),
      pesan: fd.get("pesan"),
    });
    if (!parsed.success) {
      toast.error("Form belum lengkap", { description: parsed.error.issues[0]?.message });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke("kirim-pesan", { body: parsed.data });
      if (error) throw error;
      toast.success("Pesan berhasil dikirim!", { description: "Tim kami akan menghubungi Anda segera." });
      form.reset();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      toast.error("Gagal mengirim pesan", { description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow="Kontak"
        title="Hubungi Kami"
        description="Punya pertanyaan, masukan, atau permintaan data tertentu? Silakan hubungi tim pengelola INTERES."
      />

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          {[
            { icon: MapPin, title: "Alamat", body: "Jl. MT. Haryono No. 74\nBrebes, Jawa Tengah 52212" },
            { icon: Mail, title: "Email", body: "bps3329@bps.go.id" },
            { icon: Phone, title: "Telepon", body: "(0283) 671168" },
            { icon: Clock, title: "Jam Layanan", body: "Senin – Kamis\n08.00 – 15.00 WIB\nJum'at\n08.00 – 15.30 WIB" },
          ].map((c) => (
            <div key={c.title} className="flex gap-4 rounded-xl border border-border bg-card p-5 shadow-soft">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <c.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="font-display font-semibold">{c.title}</div>
                <div className="whitespace-pre-line text-sm text-muted-foreground">{c.body}</div>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-soft lg:col-span-3 sm:p-8">
          <h2 className="font-display text-xl font-bold">Kirim Pesan</h2>
          <p className="-mt-3 text-sm text-muted-foreground">Kami akan merespons dalam 1–2 hari kerja.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nama">Nama Lengkap</Label>
              <Input id="nama" required placeholder="Nama Anda" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required placeholder="email@contoh.com" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="subjek">Subjek</Label>
            <Input id="subjek" required placeholder="Topik pesan Anda" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pesan">Pesan</Label>
            <Textarea id="pesan" required placeholder="Tuliskan pertanyaan atau masukan Anda…" rows={6} />
          </div>
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? "Mengirim…" : (<><Send className="mr-2 h-4 w-4" /> Kirim Pesan</>)}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Hubungi;
