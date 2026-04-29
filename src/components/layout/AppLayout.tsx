import { NavLink, Outlet } from "react-router-dom";
import { Home, LayoutDashboard, BookOpen, HelpCircle, Mail, TrendingUp, Users, Wheat, GraduationCap, Briefcase, LineChart, Menu, X, Sprout, Building2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import logoInteres from "@/assets/logo-interes.png";

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
        <div className="flex min-w-0 items-center gap-2">
          <img src={logoInteres} alt="Interes" className="h-7 w-auto shrink-0 object-contain" />
          <span className="truncate font-display text-sm font-semibold text-foreground/80">
            ​
          </span>
...
            <div className="text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/70">
              ​
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
            <div className="font-semibold text-sidebar-foreground/80">​</div>
            <div>BPS Kabupaten Brebes</div>
            <div>2026</div>
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
