import { NavLink, Outlet } from "react-router-dom";
import { BarChart3, Home, LayoutDashboard, BookOpen, HelpCircle, Mail, TrendingUp, Users, Wheat, GraduationCap, Briefcase, LineChart, Menu, X, Sprout, Building2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Beranda", icon: Home, end: true },
  { to: "/ringkasan", label: "Ringkasan Eksekutif", icon: LayoutDashboard },
  {
    section: "Indikator Detail",
    items: [
      { to: "/indikator/tpt", label: "Tingkat Pengangguran Terbuka", icon: Briefcase },
      { to: "/indikator/tpak", label: "Tingkat Partisipasi Angkatan Kerja", icon: Users },
      { to: "/indikator/kemiskinan", label: "Kemiskinan", icon: TrendingUp },
      { to: "/indikator/ipm", label: "Indeks Pembangunan Manusia", icon: GraduationCap },
      { to: "/indikator/luas-panen-padi", label: "Luas Panen Padi", icon: Sprout },
      { to: "/indikator/produksi-padi", label: "Produksi Padi", icon: Wheat },
      { to: "/indikator/pertumbuhan-ekonomi", label: "Pertumbuhan Ekonomi", icon: LineChart },
      { to: "/indikator/ikk", label: "Indeks Kemahalan Konstruksi", icon: Building2 },
    ],
  },
  {
    section: "Informasi",
    items: [
      { to: "/konsep", label: "Konsep & Definisi", icon: BookOpen },
      { to: "/panduan", label: "Panduan", icon: HelpCircle },
      { to: "/hubungi", label: "Hubungi Kami", icon: Mail },
    ],
  },
];

export const AppLayout = () => {
  const [open, setOpen] = useState(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
      isActive
        ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-soft"
        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
    );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile topbar */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-hero text-primary-foreground">
            <BarChart3 className="h-4 w-4" />
          </div>
          <span className="font-display text-lg font-bold">INTERES</span>
        </div>
        <button onClick={() => setOpen(!open)} className="rounded-md p-2 hover:bg-muted" aria-label="Menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-14 bottom-0 z-30 w-72 transform border-r border-sidebar-border bg-sidebar transition-transform lg:top-0 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="hidden items-center gap-3 border-b border-sidebar-border px-6 py-5 lg:flex">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-accent shadow-glow">
              <BarChart3 className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <div className="font-display text-xl font-bold text-sidebar-foreground">INTERES</div>
              <div className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60">
                Indikator Statistik Brebes
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {nav.map((item, idx) => {
              if ("section" in item) {
                return (
                  <div key={idx} className="pt-4">
                    <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                      {item.section}
                    </div>
                    {item.items.map((sub) => (
                      <NavLink key={sub.to} to={sub.to} className={linkClass} onClick={() => setOpen(false)}>
                        <sub.icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{sub.label}</span>
                      </NavLink>
                    ))}
                  </div>
                );
              }
              return (
                <NavLink key={item.to} to={item.to} end={item.end} className={linkClass} onClick={() => setOpen(false)}>
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="border-t border-sidebar-border p-4 text-xs text-sidebar-foreground/60">
            <div className="font-semibold text-sidebar-foreground/80">Sumber Data</div>
            <div>BPS Kabupaten Brebes</div>
            <div>BPS Provinsi Jawa Tengah</div>
          </div>
        </div>
      </aside>

      <main className="lg:pl-72">
        <div className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-10">
          <Outlet />
        </div>
      </main>

      {open && <div className="fixed left-0 right-0 top-14 bottom-0 z-20 bg-foreground/40 lg:hidden" onClick={() => setOpen(false)} />}
    </div>
  );
};
