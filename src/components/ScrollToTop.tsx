import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scroll ke atas halaman setiap kali path berubah.
 * Menjamin saat pindah ke halaman indikator, posisi berada di judul (header), bukan di tengah/bawah.
 */
export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Reset scroll window
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    // Reset scroll pada container utama (jika ada area scroll khusus seperti <main>)
    const main = document.querySelector("main");
    if (main) main.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
};
