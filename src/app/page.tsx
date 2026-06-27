"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Menu,
  X,
  Home,
  Zap,
  Layers,
  BarChart3,
  Info,
  MessageSquare,
  ArrowRight,
  Wifi,
  Clock,
  Gift,
  CheckCircle,
  QrCode,
  Users,
  Calendar,
  Award,
  Sparkles,
} from "lucide-react";

// ── count-up hook ──────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1800, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf: number;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      setValue(Math.floor((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start]);
  return value;
}

// ── in-view hook ───────────────────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ── decorative QR ─────────────────────────────────────────────────────────
function QRDecor({ size = 180 }: { size?: number }) {
  const pattern = [
    [1,1,1,1,1,1,1,0,1,0,0,1,0,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,0,1,1,0,0,1,0,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,0,1,1,0,1,0,1,1,1,0,0,1],
    [1,0,1,1,1,0,1,0,0,1,0,1,0,1,0,1,1,1,0,0,1],
    [1,0,1,1,1,0,1,0,1,1,1,0,0,1,0,1,1,1,0,0,1],
    [1,0,0,0,0,0,1,0,0,0,1,0,0,1,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,0,1,0,1,0,1,1,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0],
    [1,0,1,1,0,1,1,1,0,0,1,0,1,0,1,1,0,1,0,1,0],
    [0,1,0,0,1,0,0,0,1,1,0,1,0,1,0,0,1,0,1,0,1],
    [1,0,1,0,1,1,1,0,1,0,1,0,1,0,1,0,1,1,0,1,0],
    [0,1,0,1,0,0,0,1,0,1,0,1,0,1,0,1,0,0,1,0,1],
    [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],
    [0,0,0,0,0,0,0,0,1,0,1,1,0,1,0,0,0,1,0,0,0],
    [1,1,1,1,1,1,1,0,0,1,0,0,1,0,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,1,0,1,0,0,1,0,1,0,0,0,1,0],
    [1,0,1,1,1,0,1,0,0,1,0,1,1,0,1,0,1,0,1,0,1],
    [1,0,1,1,1,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,0],
    [1,0,1,1,1,0,1,0,0,1,1,0,1,0,1,0,1,0,1,0,1],
    [1,0,0,0,0,0,1,0,1,0,0,1,0,1,0,1,0,1,0,0,0],
    [1,1,1,1,1,1,1,0,0,1,1,0,1,0,1,1,1,0,1,0,1],
  ];
  const cols = pattern[0].length;
  const rows = pattern.length;
  const cell = size / Math.max(cols, rows);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg">
      {pattern.map((row, r) =>
        row.map((v, c) =>
          v ? <rect key={`${r}-${c}`} x={c * cell} y={r * cell}
                width={cell - 0.5} height={cell - 0.5} rx={cell * 0.18} fill="white" /> : null
        )
      )}
    </svg>
  );
}

// ── Feature card ───────────────────────────────────────────────────────────
function FeatureCard({ icon: Icon, title, desc, delay }: { icon: React.ElementType; title: string; desc: string; delay: number }) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className="bg-white/5 border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:border-blue-500/50 hover:bg-blue-600/10 hover:-translate-y-1"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(32px)",
        transition: `opacity .6s ease ${delay}ms, transform .6s ease ${delay}ms`,
      }}
    >
      <Icon className="w-8 h-8 text-blue-400 mb-3" />
      <h3 className="font-bold text-lg text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

// ── Step item ──────────────────────────────────────────────────────────────
function StepItem({ num, title, desc, delay }: { num: string; title: string; desc: string; delay: number }) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className="flex gap-4 items-start"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateX(0)" : "translateX(-24px)",
        transition: `opacity .55s ease ${delay}ms, transform .55s ease ${delay}ms`,
      }}
    >
      <div className="text-sm font-bold text-blue-400 bg-blue-500/20 border border-blue-500/30 rounded-lg px-3 py-1 whitespace-nowrap">
        {num}
      </div>
      <div>
        <h3 className="font-bold text-white mb-1">{title}</h3>
        <p className="text-gray-400 text-sm">{desc}</p>
      </div>
    </div>
  );
}

// ── Stat counter ───────────────────────────────────────────────────────────
function StatCounter({ target, suffix, label }: { target: number; suffix: string; label: string }) {
  const { ref, inView } = useInView();
  const val = useCountUp(target, 1600, inView);
  return (
    <div ref={ref} className="text-center">
      <div className="text-3xl font-bold text-blue-400">{val}{suffix}</div>
      <div className="text-gray-400 text-sm mt-1">{label}</div>
    </div>
  );
}

// ── FAQ item ───────────────────────────────────────────────────────────────
function FaqItem({ q, a, delay }: { q: string; a: string; delay: number }) {
  const [open, setOpen] = useState(false);
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={`bg-white/5 border rounded-xl overflow-hidden transition-all duration-300 ${open ? "border-blue-500/50" : "border-white/10"}`}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(20px)",
        transition: `opacity .5s ease ${delay}ms, transform .5s ease ${delay}ms`,
      }}
    >
      <button
        className="w-full flex justify-between items-center gap-4 p-5 text-white font-semibold text-left"
        onClick={() => setOpen(!open)}
      >
        <span>{q}</span>
        <span className={`text-blue-400 text-xl transition-transform duration-300 ${open ? "rotate-45" : ""}`}>+</span>
      </button>
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: open ? "300px" : "0" }}
      >
        <div className="px-5 pb-5 text-gray-400 text-sm leading-relaxed">{a}</div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════════════════
export default function QRventLanding() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scanLine, setScanLine] = useState(0);

  const goLogin = () => router.push("/login");

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    let raf: number;
    let dir = 1;
    let pos = 0;
    const step = () => {
      pos += dir * 0.7;
      if (pos >= 100) dir = -1;
      if (pos <= 0) dir = 1;
      setScanLine(pos);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  const navLinks = [
    { label: "Beranda", href: "#beranda" },
    { label: "Fitur", href: "#fitur" },
    { label: "Cara Kerja", href: "#cara-kerja" },
    { label: "Perbandingan", href: "#perbandingan" },
    { label: "About", href: "#about" },
    { label: "FAQ", href: "#faq" },
  ];

  const features = [
    { icon: Zap, title: "Zero-Friction Scanner", desc: "Staf langsung scan QR lewat browser — tidak perlu install aplikasi atau login. Cukup buka link, langsung siap." },
    { icon: Wifi, title: "Offline-First Resilience", desc: "Koneksi internet putus? Sistem tetap jalan. Data tersimpan lokal dan otomatis sinkron saat jaringan pulih." },
    { icon: Clock, title: "Time-Based QR Expired", desc: "QR tiap peserta punya masa berlaku. Kontrol kedisiplinan waktu hadir tanpa debat di gerbang masuk." },
    { icon: BarChart3, title: "Live Dashboard", desc: "Grafik kehadiran real-time. Pantau siapa sudah hadir dan siapa belum — langsung dari satu layar." },
    { icon: Gift, title: "Closed-Loop Doorprize", desc: "Undian hadiah terintegrasi langsung dari data peserta yang hadir, tanpa spreadsheet terpisah." },
    { icon: MessageSquare, title: "Anonymous Feedback", desc: "Kumpulkan kesan-pesan peserta secara anonim. Laporan evaluasi siap unduh setelah acara." },
  ];

  const steps = [
    { num: "01", title: "Buat Event & Upload Tamu", desc: "Daftarkan detail acara dan unggah daftar tamu via Excel dalam hitungan menit." },
    { num: "02", title: "QR & Email Otomatis Terkirim", desc: "Sistem auto-generate QR unik dan blast ke email seluruh peserta." },
    { num: "03", title: "Scan di Lokasi — Tanpa Login", desc: "Staf buka link scanner di browser, langsung bisa scan. Zero friction." },
    { num: "04", title: "Pantau & Unduh Laporan", desc: "Data kehadiran real-time di dashboard, rekap Excel satu klik." },
  ];

  const faqs = [
    { q: "Apakah QRvent benar-benar gratis?", a: "Ya! QRvent gratis untuk event kampus, komunitas, dan UMKM. Kami berencana menghadirkan paket premium dengan fitur lanjutan untuk skala korporat di masa mendatang, namun paket dasar akan selalu gratis." },
    { q: "Bagaimana jika internet di lokasi mati saat acara berlangsung?", a: "Tenang — QRvent menggunakan arsitektur Offline-First. Data scan tersimpan di memori lokal perangkat staf dan otomatis tersinkronisasi ke server begitu jaringan kembali tersedia." },
    { q: "Apakah peserta perlu install aplikasi untuk check-in?", a: "Tidak sama sekali. Peserta cukup menunjukkan QR code yang dikirim ke email mereka, lalu staf scan lewat browser biasa tanpa install apapun." },
    { q: "Berapa banyak peserta yang bisa ditangani?", a: "QRvent dirancang untuk menangani event dari puluhan hingga ribuan peserta. Sistem pemindaian berbasis browser kami mampu memproses check-in dalam waktu kurang dari 3 detik per peserta." },
    { q: "Apakah data peserta aman?", a: "Sangat aman. Platform kami menggunakan Role-Based Access Control, URL Token terenkripsi untuk scanner, dan seluruh komunikasi dienkripsi via SSL/HTTPS sehingga data pribadi peserta terlindungi sepenuhnya." },
    { q: "Bisakah QRvent diintegrasikan dengan sistem lain?", a: "QRvent dirancang modular dan mendukung SDG 17 (Kemitraan). Integrasi dengan WhatsApp Business API sedang dalam roadmap jangka pendek, dan kami terbuka untuk kolaborasi dengan platform undangan digital lainnya." },
  ];

  const team = [
    { name: "Lintang Maharani", role: "Ketua Tim & Backend Developer" },
    { name: "Elsya Ananda Putri", role: "Frontend Developer & UI/UX" },
    { name: "Alfredo Alexander Mendez", role: "System Analyst & Documentation" },
  ];

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0A1628] text-white overflow-x-hidden">
      {/* Mobile Nav Overlay */}
      <div
        className={`fixed inset-0 z-50 bg-[#0A1628]/95 backdrop-blur-xl transition-all duration-300 ${
          menuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        <button
          onClick={() => setMenuOpen(false)}
          className="absolute top-5 right-5 text-gray-400 hover:text-white"
        >
          <X size={28} />
        </button>
        <div className="flex flex-col items-center justify-center h-full gap-6">
          {navLinks.map((item) => (
            <button
              key={item.label}
              onClick={() => scrollTo(item.href.substring(1))}
              className="text-white text-xl font-bold hover:text-blue-400 transition"
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => {
              setMenuOpen(false);
              goLogin();
            }}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Mulai Gratis →
          </button>
        </div>
      </div>

      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 md:px-12 py-4 transition-all duration-300 ${
          scrolled ? "bg-[#0A1628]/90 backdrop-blur-lg shadow-lg" : ""
        }`}
      >
        <a href="#beranda" className="flex items-center gap-2 text-xl font-bold">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          QR<span className="text-blue-400">vent</span>
        </a>

        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((item) => (
            <button
              key={item.label}
              onClick={() => scrollTo(item.href.substring(1))}
              className="text-gray-300 hover:text-white text-sm font-medium transition"
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={goLogin}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-600/30"
          >
            Mulai Gratis →
          </button>
        </div>

        <button onClick={() => setMenuOpen(true)} className="md:hidden text-white">
          <Menu size={24} />
        </button>
      </nav>

      {/* Hero Section */}
      <section id="beranda" className="relative min-h-screen flex items-center px-6 md:px-12 py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoNTksMTMwLDI0NiwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+')] opacity-30" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-400/15 rounded-full blur-[80px]" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto w-full">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 rounded-full px-4 py-1.5 text-sm text-blue-300 mb-6">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                Platform Buku Tamu Digital
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
                Check-in Event
                <br />
                <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                  Tanpa Antrian,
                </span>
                <br />
                Tanpa Ribet.
              </h1>
              <p className="text-gray-400 text-lg mb-8 max-w-md">
                QRvent mengubah registrasi peserta dari 20 menit antrean panjang menjadi
                3 detik scan QR — tanpa install aplikasi, tanpa login staf, tanpa batas.
              </p>
              <div className="flex gap-4 flex-wrap">
                <button
                  onClick={goLogin}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-all hover:scale-105 shadow-lg shadow-blue-600/30"
                >
                  Buat Event Sekarang →
                </button>
                <button
                  onClick={() => scrollTo("cara-kerja")}
                  className="border border-white/30 text-white px-8 py-3 rounded-xl font-medium hover:bg-white/10 transition"
                >
                  Lihat Cara Kerja
                </button>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-full border border-blue-500/20 w-[280px] h-[280px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin-slow" />
                <div className="absolute inset-0 rounded-full border border-blue-400/10 w-[360px] h-[360px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin-slow-reverse" />
                <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                  <div
                    className="absolute left-6 right-6 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent rounded-full"
                    style={{ top: `${28 + (scanLine / 100) * 160}px` }}
                  />
                  <QRDecor size={180} />
                  <div className="text-center mt-4 text-xs font-semibold text-blue-400 tracking-widest">
                    Scan to Check-in
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <div className="border-t border-b border-blue-500/20 py-12 px-6 md:px-12">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatCounter target={20} suffix=" mnt" label="Waktu registrasi manual dipangkas" />
          <StatCounter target={60} suffix="%" label="Institusi masih pakai cara manual (UNESCO)" />
          <StatCounter target={4} suffix=" fitur" label="Terintegrasi dalam satu dashboard" />
          <StatCounter target={0} suffix=" login" label="Dibutuhkan staf scanner lapangan" />
        </div>
      </div>

      {/* Features Section */}
      <section id="fitur" className="py-20 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-2">
              Fitur Unggulan
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Satu Platform,<br />Semua Kebutuhan Event
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Dari check-in cepat hingga evaluasi pasca-acara — QRvent menyediakan
              ekosistem lengkap yang bekerja bahkan tanpa sinyal internet.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <FeatureCard key={i} {...feature} delay={i * 80} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="cara-kerja" className="py-20 px-6 md:px-12 bg-white/5 border-y border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-2">
                Cara Kerja
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-8">
                Dari Setup ke<br />Laporan — 4 Langkah
              </h2>
              <div className="space-y-5">
                {steps.map((step, i) => (
                  <StepItem key={i} {...step} delay={i * 100} />
                ))}
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="font-bold">Seminar Nasional 2025</div>
                <div className="flex items-center gap-1 text-green-400 text-xs font-semibold">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  LIVE
                </div>
              </div>
              <div className="space-y-2 mb-4">
                {[
                  { label: "Teknik", pct: 82, color: "#3B82F6" },
                  { label: "Bisnis", pct: 67, color: "#60A5FA" },
                  { label: "Hukum", pct: 51, color: "#93C5FD" },
                  { label: "Sains", pct: 74, color: "#2563EB" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div className="text-xs text-gray-400 w-12">{item.label}</div>
                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ width: `${item.pct}%`, backgroundColor: item.color }}
                      />
                    </div>
                    <div className="text-xs text-blue-400 w-8 text-right">{item.pct}%</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  ["312", "Sudah Hadir"],
                  ["88", "Belum Hadir"],
                  ["78%", "Kehadiran"],
                  ["3s", "Avg. Scan"],
                ].map(([num, label]) => (
                  <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                    <div className="text-xl font-bold text-blue-400">{num}</div>
                    <div className="text-xs text-gray-400">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section id="perbandingan" className="py-20 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-2">
              Perbandingan
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">QRvent vs Solusi Lain</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Platform lain memaksa install app, bergantung internet, dan tagih biaya mahal.
              QRvent hadir untuk semua — dari kampus hingga UMKM.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-sm font-bold text-gray-400 uppercase">Fitur</th>
                  <th className="py-3 px-4 text-sm font-bold text-gray-400">Buku Fisik</th>
                  <th className="py-3 px-4 text-sm font-bold text-gray-400">Eventbrite</th>
                  <th className="py-3 px-4 text-sm font-bold text-gray-400">Whova</th>
                  <th className="py-3 px-4 text-sm font-bold text-blue-400 bg-blue-500/10 rounded-t-lg">QRvent ✦</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Scan tanpa install app", "✗", "✗", "✗", "✓"],
                  ["Tahan offline / no internet", "~", "✗", "✗", "✓"],
                  ["Kontrol waktu QR expired", "✗", "✗", "✗", "✓"],
                  ["Doorprize terintegrasi", "~", "✗", "✗", "✓"],
                  ["Anonymous feedback", "✗", "✗", "~", "✓"],
                  ["Gratis untuk kampus & komunitas", "✓", "✗", "✗", "✓"],
                ].map(([feat, a, b, c, d], i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="py-3 px-4 text-gray-400 text-sm">{feat}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={a === "✓" ? "text-green-500" : a === "~" ? "text-yellow-500" : "text-red-500"}>{a}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={b === "✓" ? "text-green-500" : b === "~" ? "text-yellow-500" : "text-red-500"}>{b}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={c === "✓" ? "text-green-500" : c === "~" ? "text-yellow-500" : "text-red-500"}>{c}</span>
                    </td>
                    <td className="py-3 px-4 text-center text-blue-400 font-semibold">
                      <span className="text-green-500">{d}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-6 md:px-12 bg-white/5 border-y border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <div className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-2">
                Tentang Kami
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Dibuat oleh Mahasiswa,<br />untuk Semua Event
              </h2>
              <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 rounded-full px-3 py-1 text-sm text-blue-400 mb-6">
                🏛️ Politeknik Negeri Batam
              </div>
              <p className="text-gray-400 leading-relaxed mb-4">
                QRvent lahir dari masalah nyata yang kami rasakan sendiri saat menyelenggarakan
                seminar mahasiswa — antrean panjang, data kehadiran yang harus direkap manual berjam-jam,
                dan tidak ada sistem yang cocok untuk kantong mahasiswa.
              </p>
              <p className="text-gray-400 leading-relaxed mb-6">
                Dikembangkan oleh <span className="text-blue-400 font-semibold">Tim Udang Keju Mang</span> dari Politeknik Negeri Batam,
                QRvent bukan sekadar proyek lomba — ini adalah solusi nyata yang kami bangun dengan teknologi
                modern untuk mempercepat transformasi digital event di Indonesia.
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg px-3 py-1.5 text-sm text-blue-400">
                  🏭 SDG 9 — Industri & Inovasi
                </div>
                <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg px-3 py-1.5 text-sm text-blue-400">
                  🤝 SDG 17 — Kemitraan Global
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {team.map((member, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4 hover:border-blue-500/30 transition">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-blue-400 flex items-center justify-center font-bold text-white">
                    {member.name[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{member.name}</div>
                    <div className="text-gray-400 text-sm">{member.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-2">
              FAQ
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pertanyaan yang<br />Sering Ditanyakan
            </h2>
            <p className="text-gray-400">
              Masih ada yang mengganjal? Berikut jawaban atas pertanyaan paling umum seputar QRvent.
            </p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <FaqItem key={i} {...faq} delay={i * 70} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 md:px-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Siap Upgrade Event Kamu?</h2>
          <p className="text-gray-400 mb-8">
            Gratis untuk event kampus dan komunitas. Setup 5 menit,
            peserta langsung bisa check-in hari ini.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={goLogin}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-all hover:scale-105 shadow-lg shadow-blue-600/30"
            >
              Mulai Gratis Sekarang →
            </button>
            <button
              onClick={() => scrollTo("faq")}
              className="border border-white/30 text-white px-8 py-3 rounded-xl font-medium hover:bg-white/10 transition"
            >
              Lihat FAQ
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
<footer className="bg-black py-6 px-6 md:px-12 border-t border-gray-800">
  <div className="max-w-6xl mx-auto text-center">
    <p className="text-gray-400 text-sm">© 2026 QRvent</p>
    <p className="text-gray-500 text-xs mt-1">
      Tim Udang Keju Mang · Politeknik Negeri Batam
    </p>
  </div>
</footer>
</div>
);
}