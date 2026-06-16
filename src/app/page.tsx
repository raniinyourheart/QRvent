"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

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
function FeatureCard({ icon, title, desc, delay }: { icon:string; title:string; desc:string; delay:number }) {
  const { ref, inView } = useInView();
  return (
    <div ref={ref} className="feature-card" style={{
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : "translateY(32px)",
      transition: `opacity .6s ease ${delay}ms, transform .6s ease ${delay}ms`,
    }}>
      <div className="feature-icon">{icon}</div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-desc">{desc}</p>
    </div>
  );
}

// ── Step item ──────────────────────────────────────────────────────────────
function StepItem({ num, title, desc, delay }: { num:string; title:string; desc:string; delay:number }) {
  const { ref, inView } = useInView();
  return (
    <div ref={ref} className="step-item" style={{
      opacity: inView ? 1 : 0,
      transform: inView ? "translateX(0)" : "translateX(-24px)",
      transition: `opacity .55s ease ${delay}ms, transform .55s ease ${delay}ms`,
    }}>
      <div className="step-num">{num}</div>
      <div>
        <div className="step-title">{title}</div>
        <div className="step-desc">{desc}</div>
      </div>
    </div>
  );
}

// ── Stat counter ───────────────────────────────────────────────────────────
function StatCounter({ target, suffix, label }: { target:number; suffix:string; label:string }) {
  const { ref, inView } = useInView();
  const val = useCountUp(target, 1600, inView);
  return (
    <div ref={ref} className="stat-item">
      <div className="stat-num">{val}{suffix}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

// ── FAQ item ───────────────────────────────────────────────────────────────
function FaqItem({ q, a, delay }: { q:string; a:string; delay:number }) {
  const [open, setOpen] = useState(false);
  const { ref, inView } = useInView();
  return (
    <div ref={ref} className={`faq-item${open ? " faq-open" : ""}`} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : "translateY(20px)",
      transition: `opacity .5s ease ${delay}ms, transform .5s ease ${delay}ms`,
    }}>
      <button className="faq-q" onClick={() => setOpen(!open)}>
        <span>{q}</span>
        <span className={`faq-icon${open ? " rotated" : ""}`}>＋</span>
      </button>
      <div className="faq-a-wrap" style={{ maxHeight: open ? "300px" : "0" }}>
        <div className="faq-a">{a}</div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════════════════
export default function QRevntLanding() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled]  = useState(false);
  const [scanLine, setScanLine]  = useState(0);

  const goLogin = () => router.push("/login");

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    let raf: number; let dir = 1; let pos = 0;
    const step = () => {
      pos += dir * 0.7;
      if (pos >= 100) dir = -1;
      if (pos <= 0)   dir =  1;
      setScanLine(pos);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  const navLinks = [
    { label: "Beranda", href: "#beranda" },
    { label: "Fitur",   href: "#fitur" },
    { label: "Cara Kerja", href: "#cara-kerja" },
    { label: "Perbandingan", href: "#perbandingan" },
    { label: "About",   href: "#about" },
    { label: "FAQ",     href: "#faq" },
  ];

  const features = [
    { icon:"⚡", title:"Zero-Friction Scanner",   desc:"Staf langsung scan QR lewat browser — tidak perlu install aplikasi atau login. Cukup buka link, langsung siap." },
    { icon:"📡", title:"Offline-First Resilience", desc:"Koneksi internet putus? Sistem tetap jalan. Data tersimpan lokal dan otomatis sinkron saat jaringan pulih." },
    { icon:"⏱️", title:"Time-Based QR Expired",   desc:"QR tiap peserta punya masa berlaku. Kontrol kedisiplinan waktu hadir tanpa debat di gerbang masuk." },
    { icon:"📊", title:"Live Dashboard",           desc:"Grafik kehadiran real-time. Pantau siapa sudah hadir dan siapa belum — langsung dari satu layar." },
    { icon:"🎁", title:"Closed-Loop Doorprize",    desc:"Undian hadiah terintegrasi langsung dari data peserta yang hadir, tanpa spreadsheet terpisah." },
    { icon:"💬", title:"Anonymous Feedback",       desc:"Kumpulkan kesan-pesan peserta secara anonim. Laporan evaluasi siap unduh setelah acara." },
  ];

  const steps = [
    { num:"01", title:"Buat Event & Upload Tamu",     desc:"Daftarkan detail acara dan unggah daftar tamu via Excel dalam hitungan menit." },
    { num:"02", title:"QR & Email Otomatis Terkirim", desc:"Sistem auto-generate QR unik dan blast ke email seluruh peserta." },
    { num:"03", title:"Scan di Lokasi — Tanpa Login", desc:"Staf buka link scanner di browser, langsung bisa scan. Zero friction." },
    { num:"04", title:"Pantau & Unduh Laporan",       desc:"Data kehadiran real-time di dashboard, rekap Excel satu klik." },
  ];

  const faqs = [
    { q:"Apakah QRevnt benar-benar gratis?",
      a:"Ya! QRevnt gratis untuk event kampus, komunitas, dan UMKM. Kami berencana menghadirkan paket premium dengan fitur lanjutan untuk skala korporat di masa mendatang, namun paket dasar akan selalu gratis." },
    { q:"Bagaimana jika internet di lokasi mati saat acara berlangsung?",
      a:"Tenang — QRevnt menggunakan arsitektur Offline-First. Data scan tersimpan di memori lokal perangkat staf dan otomatis tersinkronisasi ke server begitu jaringan kembali tersedia." },
    { q:"Apakah peserta perlu install aplikasi untuk check-in?",
      a:"Tidak sama sekali. Peserta cukup menunjukkan QR code yang dikirim ke email mereka, lalu staf scan lewat browser biasa tanpa install apapun." },
    { q:"Berapa banyak peserta yang bisa ditangani?",
      a:"QRevnt dirancang untuk menangani event dari puluhan hingga ribuan peserta. Sistem pemindaian berbasis browser kami mampu memproses check-in dalam waktu kurang dari 3 detik per peserta." },
    { q:"Apakah data peserta aman?",
      a:"Sangat aman. Platform kami menggunakan Role-Based Access Control, URL Token terenkripsi untuk scanner, dan seluruh komunikasi dienkripsi via SSL/HTTPS sehingga data pribadi peserta terlindungi sepenuhnya." },
    { q:"Bisakah QRevnt diintegrasikan dengan sistem lain?",
      a:"QRevnt dirancang modular dan mendukung SDG 17 (Kemitraan). Integrasi dengan WhatsApp Business API sedang dalam roadmap jangka pendek, dan kami terbuka untuk kolaborasi dengan platform undangan digital lainnya." },
  ];

  const team = [
    { name:"Naylah Amirah Az Zikra", role:"Ketua Tim & Backend Developer" },
    { name:"Elsya Ananda Putri",     role:"Frontend Developer & UI/UX" },
    { name:"Lintang Maharani",       role:"System Analyst & Documentation" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --navy:   #0A1628;
          --blue:   #1E4DB7;
          --bright: #3B82F6;
          --sky:    #60A5FA;
          --ice:    #EFF6FF;
          --white:  #FFFFFF;
          --muted:  #93C5FD;
          --glass:  rgba(255,255,255,0.05);
          --glassb: rgba(255,255,255,0.11);
        }
        html { scroll-behavior: smooth; }
        body {
          font-family: 'Inter', sans-serif;
          background: var(--navy);
          color: var(--white);
          min-height: 100vh;
          overflow-x: hidden;
        }

        /* ───── NAVBAR ───── */
        .navbar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 48px;
          transition: background .3s, backdrop-filter .3s, box-shadow .3s;
        }
        .navbar.scrolled {
          background: rgba(10,22,40,.88);
          backdrop-filter: blur(18px);
          box-shadow: 0 1px 0 rgba(59,130,246,.18);
        }
        .nav-logo {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.45rem; font-weight: 800; letter-spacing: -.02em;
          display: flex; align-items: center; gap: 8px; text-decoration: none; color: inherit;
        }
        .nav-logo span { color: var(--sky); }
        .logo-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: var(--bright);
          animation: pulse-dot 2s ease-in-out infinite;
        }
        @keyframes pulse-dot {
          0%,100% { box-shadow: 0 0 0 0 rgba(59,130,246,.6); }
          50%      { box-shadow: 0 0 0 6px rgba(59,130,246,0); }
        }
        .nav-links { display: flex; gap: 28px; list-style: none; }
        .nav-links a {
          color: var(--muted); text-decoration: none;
          font-size: .875rem; font-weight: 500; transition: color .2s;
        }
        .nav-links a:hover { color: var(--white); }
        .nav-cta {
          background: var(--bright); color: var(--white); border: none; cursor: pointer;
          padding: 9px 22px; border-radius: 8px;
          font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: .875rem;
          transition: background .2s, transform .15s, box-shadow .2s;
          box-shadow: 0 4px 16px rgba(59,130,246,.3);
        }
        .nav-cta:hover { background: #2563EB; transform: translateY(-1px); box-shadow: 0 6px 24px rgba(59,130,246,.45); }
        .hamburger {
          display: none; flex-direction: column; gap: 5px;
          cursor: pointer; background: none; border: none; padding: 4px;
        }
        .hamburger span { display: block; width: 24px; height: 2px; background: var(--white); border-radius: 2px; }

        /* ───── MOBILE NAV ───── */
        .mobile-nav {
          display: none; position: fixed; inset: 0; z-index: 99;
          background: rgba(10,22,40,.97); backdrop-filter: blur(16px);
          flex-direction: column; align-items: center; justify-content: center; gap: 28px;
        }
        .mobile-nav.open { display: flex; }
        .mobile-nav a {
          color: var(--white); text-decoration: none;
          font-family: 'Space Grotesk', sans-serif; font-size: 1.4rem; font-weight: 700;
        }
        .mobile-close {
          position: absolute; top: 20px; right: 24px;
          background: none; border: none; color: var(--muted); font-size: 1.8rem; cursor: pointer;
        }

        /* ───── HERO ───── */
        .hero {
          min-height: 100vh; display: flex; align-items: center;
          padding: 100px 48px 60px; position: relative; overflow: hidden;
        }
        .hero-bg { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
        .hero-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(59,130,246,.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,.05) 1px, transparent 1px);
          background-size: 60px 60px;
        }
        .hero-glow {
          position: absolute; border-radius: 50%; filter: blur(80px);
        }
        .hero-glow-1 {
          width: 600px; height: 600px;
          background: radial-gradient(circle, #1E4DB7 0%, transparent 70%);
          top: -120px; left: -120px; opacity: .35;
        }
        .hero-glow-2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, #60A5FA 0%, transparent 70%);
          bottom: -60px; right: 8%; opacity: .18;
        }
        .hero-inner {
          position: relative; z-index: 2; max-width: 1200px; margin: 0 auto; width: 100%;
          display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center;
        }
        .hero-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(59,130,246,.14); border: 1px solid rgba(59,130,246,.3);
          border-radius: 100px; padding: 6px 14px;
          font-size: .78rem; font-weight: 600; color: var(--sky);
          letter-spacing: .08em; text-transform: uppercase; margin-bottom: 22px;
          animation: fade-up .7s ease both;
        }
        .eyebrow-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--sky); animation: pulse-dot 1.5s ease-in-out infinite; }
        .hero-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(2.3rem, 4vw, 3.5rem); font-weight: 800;
          line-height: 1.08; letter-spacing: -.03em; margin-bottom: 18px;
          animation: fade-up .7s .1s ease both;
        }
        .hero-title .accent {
          background: linear-gradient(135deg, var(--sky) 0%, var(--bright) 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .hero-sub {
          color: var(--muted); line-height: 1.65; font-size: 1.02rem;
          max-width: 460px; margin-bottom: 34px;
          animation: fade-up .7s .2s ease both;
        }
        .hero-actions {
          display: flex; gap: 12px; flex-wrap: wrap;
          animation: fade-up .7s .3s ease both;
        }
        .btn-primary {
          background: var(--bright); color: var(--white); border: none; cursor: pointer;
          padding: 13px 30px; border-radius: 10px;
          font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: .95rem;
          transition: background .2s, transform .15s, box-shadow .2s;
          box-shadow: 0 4px 20px rgba(59,130,246,.35);
        }
        .btn-primary:hover { background: #2563EB; transform: translateY(-2px); box-shadow: 0 8px 28px rgba(59,130,246,.5); }
        .btn-secondary {
          background: transparent; color: var(--sky);
          border: 1.5px solid rgba(96,165,250,.4); cursor: pointer;
          padding: 12px 26px; border-radius: 10px;
          font-family: 'Space Grotesk', sans-serif; font-weight: 600; font-size: .95rem;
          transition: border-color .2s, background .2s;
        }
        .btn-secondary:hover { border-color: var(--sky); background: rgba(96,165,250,.08); }

        /* ───── QR VISUAL ───── */
        .hero-visual { display: flex; justify-content: center; align-items: center; animation: fade-up .8s .15s ease both; }
        .qr-wrapper { position: relative; animation: float 4s ease-in-out infinite; }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
        .qr-card {
          background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.15);
          border-radius: 24px; padding: 28px; backdrop-filter: blur(20px); position: relative; overflow: hidden;
        }
        .qr-scan-line {
          position: absolute; left: 28px; right: 28px; height: 2px;
          background: linear-gradient(90deg, transparent, var(--sky), var(--bright), var(--sky), transparent);
          border-radius: 2px; box-shadow: 0 0 12px var(--bright); pointer-events: none;
          transition: top .05s linear;
        }
        .qr-label {
          text-align: center; margin-top: 14px;
          font-family: 'Space Grotesk', sans-serif; font-size: .75rem;
          font-weight: 600; letter-spacing: .1em; color: var(--sky); text-transform: uppercase;
        }
        .qr-ring {
          position: absolute; border-radius: 50%; border: 1px solid rgba(59,130,246,.22); pointer-events: none;
        }
        .qr-ring-1 { width: 280px; height: 280px; top: 50%; left: 50%; transform: translate(-50%,-50%); animation: spin-slow 18s linear infinite; }
        .qr-ring-2 { width: 360px; height: 360px; top: 50%; left: 50%; transform: translate(-50%,-50%); animation: spin-slow 28s linear infinite reverse; border-color: rgba(96,165,250,.1); }
        @keyframes spin-slow { to { transform: translate(-50%,-50%) rotate(360deg); } }
        .orbit-dot { position: absolute; width: 8px; height: 8px; border-radius: 50%; background: var(--sky); top: 50%; left: 50%; box-shadow: 0 0 8px var(--sky); }
        .orbit-dot:nth-child(1) { animation: orbit1 6s linear infinite; }
        .orbit-dot:nth-child(2) { animation: orbit2 9s linear infinite; }
        @keyframes orbit1 { from { transform: rotate(0deg) translateX(120px) rotate(0deg); } to { transform: rotate(360deg) translateX(120px) rotate(-360deg); } }
        @keyframes orbit2 { from { transform: rotate(120deg) translateX(160px) rotate(-120deg); } to { transform: rotate(480deg) translateX(160px) rotate(-480deg); } }

        /* ───── STATS ───── */
        .stats-bar {
          padding: 44px 48px;
          border-top: 1px solid rgba(59,130,246,.15);
          border-bottom: 1px solid rgba(59,130,246,.15);
        }
        .stats-inner { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(4,1fr); gap: 20px; }
        .stat-item { text-align: center; }
        .stat-num { font-family: 'Space Grotesk', sans-serif; font-size: 2.2rem; font-weight: 800; color: var(--sky); line-height: 1; margin-bottom: 6px; }
        .stat-label { color: var(--muted); font-size: .85rem; }

        /* ───── SECTION BASE ───── */
        .section { padding: 96px 48px; }
        .section-inner { max-width: 1200px; margin: 0 auto; }
        .section-label { font-size: .76rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--sky); margin-bottom: 10px; }
        .section-title { font-family: 'Space Grotesk', sans-serif; font-size: clamp(1.8rem,3vw,2.5rem); font-weight: 800; letter-spacing: -.02em; line-height: 1.15; margin-bottom: 14px; }
        .section-sub { color: var(--muted); font-size: .97rem; line-height: 1.65; max-width: 520px; margin-bottom: 52px; }

        /* ───── FEATURES ───── */
        .features-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 18px; }
        .feature-card {
          background: var(--glass); border: 1px solid var(--glassb);
          border-radius: 16px; padding: 26px;
          transition: border-color .25s, background .25s, transform .25s; cursor: default;
        }
        .feature-card:hover { border-color: rgba(59,130,246,.4); background: rgba(59,130,246,.08); transform: translateY(-4px); }
        .feature-icon { font-size: 1.7rem; margin-bottom: 12px; }
        .feature-title { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: .97rem; margin-bottom: 7px; }
        .feature-desc { color: var(--muted); font-size: .86rem; line-height: 1.6; }

        /* ───── HOW IT WORKS ───── */
        .how-bg { background: rgba(30,77,183,.06); border-top: 1px solid rgba(59,130,246,.1); border-bottom: 1px solid rgba(59,130,246,.1); }
        .how-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
        .steps { display: flex; flex-direction: column; gap: 22px; }
        .step-item { display: flex; gap: 18px; align-items: flex-start; }
        .step-num {
          font-family: 'Space Grotesk', sans-serif; font-size: .72rem; font-weight: 800;
          color: var(--sky); letter-spacing: .05em;
          background: rgba(59,130,246,.14); border: 1px solid rgba(59,130,246,.3);
          border-radius: 8px; padding: 4px 10px; white-space: nowrap; flex-shrink: 0; margin-top: 3px;
        }
        .step-title { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: .97rem; margin-bottom: 4px; }
        .step-desc { color: var(--muted); font-size: .86rem; line-height: 1.55; }

        /* dashboard mockup */
        .dash-mockup { background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.12); border-radius: 20px; padding: 24px; backdrop-filter: blur(10px); }
        .dash-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
        .dash-title-text { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: .92rem; }
        .dash-live { display: flex; align-items: center; gap: 6px; font-size: .73rem; color: #4ADE80; font-weight: 600; }
        .live-dot { width: 6px; height: 6px; border-radius: 50%; background: #4ADE80; animation: pulse-dot 1.2s ease-in-out infinite; }
        .dash-bar-wrap { display: flex; flex-direction: column; gap: 10px; margin-bottom: 18px; }
        .dash-bar-row { display: flex; align-items: center; gap: 10px; }
        .dash-bar-label { font-size: .73rem; color: var(--muted); width: 68px; flex-shrink: 0; }
        .dash-bar-track { flex: 1; height: 8px; background: rgba(255,255,255,.08); border-radius: 100px; overflow: hidden; }
        .dash-bar-fill { height: 100%; border-radius: 100px; animation: bar-grow 1.5s ease both; }
        @keyframes bar-grow { from { width: 0; } }
        .dash-bar-val { font-size: .73rem; color: var(--sky); width: 32px; text-align: right; font-weight: 600; }
        .dash-footer { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .dash-chip { background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.1); border-radius: 10px; padding: 12px; text-align: center; }
        .dash-chip-num { font-family: 'Space Grotesk', sans-serif; font-size: 1.35rem; font-weight: 800; color: var(--sky); }
        .dash-chip-label { font-size: .7rem; color: var(--muted); margin-top: 2px; }

        /* ───── COMPARISON ───── */
        .compare-table { width: 100%; border-collapse: collapse; margin-top: 36px; }
        .compare-table th, .compare-table td { padding: 13px 16px; text-align: center; font-size: .86rem; border-bottom: 1px solid rgba(255,255,255,.07); }
        .compare-table th { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: .76rem; color: var(--muted); letter-spacing: .06em; text-transform: uppercase; padding-bottom: 16px; }
        .compare-table td:first-child { text-align: left; color: var(--muted); }
        .col-qrevnt { color: var(--sky) !important; font-weight: 700; }
        .th-qrevnt { color: var(--sky) !important; background: rgba(59,130,246,.1); border-radius: 8px 8px 0 0; }
        .check { color: #4ADE80; font-size: 1.05rem; }
        .cross { color: #F87171; font-size: 1.05rem; }

        /* ───── ABOUT ───── */
        .about-bg { background: rgba(30,77,183,.05); border-top: 1px solid rgba(59,130,246,.1); border-bottom: 1px solid rgba(59,130,246,.1); }
        .about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 72px; align-items: center; }
        .about-text p { color: var(--muted); line-height: 1.75; font-size: .97rem; margin-bottom: 14px; }
        .about-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(59,130,246,.12); border: 1px solid rgba(59,130,246,.25);
          border-radius: 100px; padding: 5px 12px;
          font-size: .76rem; font-weight: 600; color: var(--sky); margin-bottom: 24px;
        }
        .team-grid { display: flex; flex-direction: column; gap: 14px; }
        .team-card {
          background: var(--glass); border: 1px solid var(--glassb);
          border-radius: 14px; padding: 18px 20px;
          display: flex; align-items: center; gap: 16px;
          transition: border-color .2s, background .2s;
        }
        .team-card:hover { border-color: rgba(59,130,246,.35); background: rgba(59,130,246,.07); }
        .team-avatar {
          width: 44px; height: 44px; border-radius: 50%;
          background: linear-gradient(135deg, var(--blue), var(--sky));
          display: flex; align-items: center; justify-content: center;
          font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 1rem; flex-shrink: 0;
        }
        .team-name { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: .93rem; margin-bottom: 3px; }
        .team-role { color: var(--muted); font-size: .8rem; }
        .sdg-row { display: flex; gap: 10px; margin-top: 28px; flex-wrap: wrap; }
        .sdg-badge {
          background: rgba(59,130,246,.12); border: 1px solid rgba(59,130,246,.28);
          border-radius: 8px; padding: 7px 14px;
          font-size: .78rem; font-weight: 600; color: var(--sky);
        }

        /* ───── FAQ ───── */
        .faq-list { display: flex; flex-direction: column; gap: 12px; max-width: 780px; }
        .faq-item {
          background: var(--glass); border: 1px solid var(--glassb);
          border-radius: 14px; overflow: hidden;
          transition: border-color .2s;
        }
        .faq-item.faq-open { border-color: rgba(59,130,246,.35); }
        .faq-q {
          width: 100%; background: none; border: none; cursor: pointer;
          display: flex; justify-content: space-between; align-items: center; gap: 16px;
          padding: 18px 22px; color: var(--white); text-align: left;
          font-family: 'Space Grotesk', sans-serif; font-weight: 600; font-size: .95rem;
        }
        .faq-icon { color: var(--sky); font-size: 1.2rem; flex-shrink: 0; transition: transform .3s; }
        .faq-icon.rotated { transform: rotate(45deg); }
        .faq-a-wrap { overflow: hidden; transition: max-height .35s ease; }
        .faq-a { padding: 0 22px 18px; color: var(--muted); font-size: .88rem; line-height: 1.65; }

        /* ───── CTA ───── */
        .cta-section { padding: 96px 48px; text-align: center; position: relative; overflow: hidden; }
        .cta-glow { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse at center, rgba(30,77,183,.4) 0%, transparent 65%); }
        .cta-inner { position: relative; z-index: 2; max-width: 620px; margin: 0 auto; }
        .cta-title { font-family: 'Space Grotesk', sans-serif; font-size: clamp(1.9rem,4vw,2.9rem); font-weight: 800; letter-spacing: -.03em; margin-bottom: 14px; line-height: 1.1; }
        .cta-sub { color: var(--muted); font-size: .97rem; line-height: 1.6; margin-bottom: 32px; }
        .cta-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

        /* ───── FOOTER ───── */
        .footer {
          padding: 32px 48px;
          border-top: 1px solid rgba(255,255,255,.08);
          display: flex; justify-content: space-between; align-items: center;
          color: var(--muted); font-size: .8rem; flex-wrap: wrap; gap: 12px;
        }
        .footer-logo { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 1.1rem; }
        .footer-logo span { color: var(--sky); }

        /* ───── ANIMATIONS ───── */
        @keyframes fade-up { from { opacity:0; transform: translateY(20px); } to { opacity:1; transform: translateY(0); } }

        /* ───── RESPONSIVE ───── */
        @media (max-width: 960px) {
          .navbar { padding: 14px 24px; }
          .nav-links, .nav-cta { display: none; }
          .hamburger { display: flex; }
          .hero { padding: 88px 24px 56px; }
          .hero-inner { grid-template-columns: 1fr; gap: 36px; }
          .hero-visual { order: -1; }
          .stats-inner { grid-template-columns: repeat(2,1fr); }
          .section { padding: 64px 24px; }
          .features-grid { grid-template-columns: repeat(2,1fr); }
          .how-grid, .about-grid { grid-template-columns: 1fr; gap: 40px; }
          .footer { justify-content: center; text-align: center; flex-direction: column; }
          .compare-table th, .compare-table td { padding: 10px 8px; font-size: .78rem; }
        }
        @media (max-width: 560px) {
          .features-grid { grid-template-columns: 1fr; }
          .stats-inner { grid-template-columns: 1fr 1fr; }
          .cta-actions { flex-direction: column; align-items: center; }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation: none !important; transition: none !important; }
        }
      `}</style>

      {/* ── Mobile Nav ── */}
      <div className={`mobile-nav${menuOpen ? " open" : ""}`}>
        <button className="mobile-close" onClick={() => setMenuOpen(false)}>✕</button>
        {navLinks.map(n => (
          <a key={n.label} href={n.href} onClick={() => setMenuOpen(false)}>{n.label}</a>
        ))}
        <button className="btn-primary" onClick={() => { setMenuOpen(false); goLogin(); }}>
          Mulai Gratis →
        </button>
      </div>

      {/* ── Navbar ── */}
      <nav className={`navbar${scrolled ? " scrolled" : ""}`}>
        <a href="#beranda" className="nav-logo">
          <span className="logo-dot" />
          QR<span>evnt</span>
        </a>
        <ul className="nav-links">
          {navLinks.map(n => (
            <li key={n.label}><a href={n.href}>{n.label}</a></li>
          ))}
        </ul>
        <button className="nav-cta" onClick={goLogin}>Mulai Gratis →</button>
        <button className="hamburger" onClick={() => setMenuOpen(true)} aria-label="Menu">
          <span /><span /><span />
        </button>
      </nav>

      {/* ══ BERANDA / HERO ══ */}
      <section className="hero" id="beranda">
        <div className="hero-bg">
          <div className="hero-grid" />
          <div className="hero-glow hero-glow-1" />
          <div className="hero-glow hero-glow-2" />
        </div>
        <div className="hero-inner">
          <div>
            <div className="hero-eyebrow">
              <span className="eyebrow-dot" />
              Platform Buku Tamu Digital
            </div>
            <h1 className="hero-title">
              Check-in Event<br />
              <span className="accent">Tanpa Antrian,</span><br />
              Tanpa Ribet.
            </h1>
            <p className="hero-sub">
              QRevnt mengubah registrasi peserta dari 20 menit antrean panjang menjadi
              3 detik scan QR — tanpa install aplikasi, tanpa login staf, tanpa batas.
            </p>
            <div className="hero-actions">
              <button className="btn-primary" onClick={goLogin}>Buat Event Sekarang →</button>
              <button className="btn-secondary" onClick={() => document.getElementById("cara-kerja")?.scrollIntoView({ behavior:"smooth" })}>
                Lihat Cara Kerja
              </button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="qr-wrapper">
              <div className="qr-ring qr-ring-1">
                <div className="orbit-dot" />
                <div className="orbit-dot" />
              </div>
              <div className="qr-ring qr-ring-2" />
              <div className="qr-card">
                <div className="qr-scan-line" style={{ top: `${28 + (scanLine / 100) * 160}px` }} />
                <QRDecor size={180} />
                <div className="qr-label">Scan to Check-in</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ STATS ══ */}
      <div className="stats-bar">
        <div className="stats-inner">
          <StatCounter target={20} suffix=" mnt" label="Waktu registrasi manual dipangkas" />
          <StatCounter target={60} suffix="%" label="Institusi masih pakai cara manual (UNESCO)" />
          <StatCounter target={4} suffix=" fitur" label="Terintegrasi dalam satu dashboard" />
          <StatCounter target={0} suffix=" login" label="Dibutuhkan staf scanner lapangan" />
        </div>
      </div>

      {/* ══ FITUR ══ */}
      <section className="section" id="fitur">
        <div className="section-inner">
          <div className="section-label">Fitur Unggulan</div>
          <h2 className="section-title">Satu Platform,<br />Semua Kebutuhan Event</h2>
          <p className="section-sub">
            Dari check-in cepat hingga evaluasi pasca-acara — QRevnt menyediakan
            ekosistem lengkap yang bekerja bahkan tanpa sinyal internet.
          </p>
          <div className="features-grid">
            {features.map((f, i) => (
              <FeatureCard key={i} {...f} delay={i * 80} />
            ))}
          </div>
        </div>
      </section>

      {/* ══ CARA KERJA ══ */}
      <section className="section how-bg" id="cara-kerja">
        <div className="section-inner">
          <div className="how-grid">
            <div>
              <div className="section-label">Cara Kerja</div>
              <h2 className="section-title" style={{ marginBottom: 36 }}>Dari Setup ke<br />Laporan — 4 Langkah</h2>
              <div className="steps">
                {steps.map((s, i) => <StepItem key={i} {...s} delay={i * 100} />)}
              </div>
            </div>
            <div className="dash-mockup">
              <div className="dash-header">
                <div className="dash-title-text">Seminar Nasional 2025</div>
                <div className="dash-live"><span className="live-dot" /> LIVE</div>
              </div>
              <div className="dash-bar-wrap">
                {[
                  { label:"Teknik",  pct:82, color:"#3B82F6" },
                  { label:"Bisnis",  pct:67, color:"#60A5FA" },
                  { label:"Hukum",   pct:51, color:"#93C5FD" },
                  { label:"Sains",   pct:74, color:"#2563EB" },
                ].map(r => (
                  <div className="dash-bar-row" key={r.label}>
                    <div className="dash-bar-label">{r.label}</div>
                    <div className="dash-bar-track">
                      <div className="dash-bar-fill" style={{ width:`${r.pct}%`, background:r.color }} />
                    </div>
                    <div className="dash-bar-val">{r.pct}%</div>
                  </div>
                ))}
              </div>
              <div className="dash-footer">
                {[["312","Sudah Hadir"],["88","Belum Hadir"],["78%","Kehadiran"],["3s","Avg. Scan"]].map(([n,l]) => (
                  <div className="dash-chip" key={l}>
                    <div className="dash-chip-num">{n}</div>
                    <div className="dash-chip-label">{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ PERBANDINGAN ══ */}
      <section className="section" id="perbandingan">
        <div className="section-inner">
          <div className="section-label">Perbandingan</div>
          <h2 className="section-title">QRevnt vs Solusi Lain</h2>
          <p className="section-sub">
            Platform lain memaksa install app, bergantung internet, dan tagih biaya mahal.
            QRevnt hadir untuk semua — dari kampus hingga UMKM.
          </p>
          <div style={{ overflowX:"auto" }}>
            <table className="compare-table">
              <thead>
                <tr>
                  <th style={{ textAlign:"left" }}>Fitur</th>
                  <th>Buku Fisik</th>
                  <th>Eventbrite</th>
                  <th>Whova</th>
                  <th className="th-qrevnt">QRevnt ✦</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Scan tanpa install app",          "✗","✗","✗","✓"],
                  ["Tahan offline / no internet",      "~","✗","✗","✓"],
                  ["Kontrol waktu QR expired",         "✗","✗","✗","✓"],
                  ["Doorprize terintegrasi",           "~","✗","✗","✓"],
                  ["Anonymous feedback",               "✗","✗","~","✓"],
                  ["Gratis untuk kampus & komunitas",  "✓","✗","✗","✓"],
                ].map(([feat,a,b,c,d],i) => (
                  <tr key={i}>
                    <td>{feat}</td>
                    {[a,b,c].map((v,j) => (
                      <td key={j}>
                        <span className={v==="✓"?"check":v==="~"?"":"cross"}>{v}</span>
                      </td>
                    ))}
                    <td className="col-qrevnt"><span className="check">{d}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ══ ABOUT ══ */}
      <section className="section about-bg" id="about">
        <div className="section-inner">
          <div className="about-grid">
            <div className="about-text">
              <div className="section-label">Tentang Kami</div>
              <h2 className="section-title">Dibuat oleh Mahasiswa,<br />untuk Semua Event</h2>
              <div className="about-badge">🏛️ Politeknik Negeri Batam</div>
              <p>
                QRevnt lahir dari masalah nyata yang kami rasakan sendiri saat menyelenggarakan
                seminar mahasiswa — antrean panjang, data kehadiran yang harus direkap manual berjam-jam,
                dan tidak ada sistem yang cocok untuk kantong mahasiswa.
              </p>
              <p>
                Dikembangkan oleh Tim Yalal Wathon dari Politeknik Negeri Batam, QRevnt bukan
                sekadar proyek lomba — ini adalah solusi nyata yang kami bangun dengan teknologi
                modern untuk mempercepat transformasi digital event di Indonesia.
              </p>
              <div className="sdg-row">
                <div className="sdg-badge">🏭 SDG 9 — Industri & Inovasi</div>
                <div className="sdg-badge">🤝 SDG 17 — Kemitraan Global</div>
              </div>
            </div>
            <div className="team-grid">
              {team.map((m, i) => (
                <div className="team-card" key={i}>
                  <div className="team-avatar">{m.name[0]}</div>
                  <div>
                    <div className="team-name">{m.name}</div>
                    <div className="team-role">{m.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <section className="section" id="faq">
        <div className="section-inner">
          <div className="section-label">FAQ</div>
          <h2 className="section-title">Pertanyaan yang<br />Sering Ditanyakan</h2>
          <p className="section-sub">
            Masih ada yang mengganjal? Berikut jawaban atas pertanyaan paling umum seputar QRevnt.
          </p>
          <div className="faq-list">
            {faqs.map((f, i) => (
              <FaqItem key={i} {...f} delay={i * 70} />
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section className="cta-section">
        <div className="cta-glow" />
        <div className="cta-inner">
          <h2 className="cta-title">Siap Upgrade Event Kamu?</h2>
          <p className="cta-sub">
            Gratis untuk event kampus dan komunitas. Setup 5 menit,
            peserta langsung bisa check-in hari ini.
          </p>
          <div className="cta-actions">
            <button className="btn-primary" onClick={goLogin}>Mulai Gratis Sekarang →</button>
            <button className="btn-secondary" onClick={() => document.getElementById("faq")?.scrollIntoView({ behavior:"smooth" })}>
              Lihat FAQ
            </button>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="footer">
        <div className="footer-logo">QR<span>evnt</span></div>
        <div>© 2026 QRevnt · Politeknik Negeri Batam · Tim Udang Keju Mang</div>
        <div>SDG 9 &amp; SDG 17</div>
      </footer>
    </>
  );
}