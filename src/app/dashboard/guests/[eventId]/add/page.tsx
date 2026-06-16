"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Save,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import api from "@/lib/api";
import QRCode from "qrcode";

export default function AddGuestPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = parseInt(params.eventId as string);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userName, setUserName] = useState("");
  const [event, setEvent] = useState<{ id: number; name: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [generatedQR, setGeneratedQR] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [lastAddedGuest, setLastAddedGuest] = useState<{ name: string; email: string } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const userData = JSON.parse(user);
      setUserName(userData.name || userData.username || "EO");
    } else {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await api.get(`/events/${eventId}`);
        setEvent(response.data);
      } catch (error) {
        console.error("Error fetching event:", error);
        setError("Event tidak ditemukan");
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvent();
  }, [eventId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const generateQRCode = async (guestId: number, guestName: string, guestEmail: string) => {
    const qrData = JSON.stringify({
      id: guestId,
      name: guestName,
      email: guestEmail,
      eventId: eventId,
      eventName: event?.name,
      qrCode: `QR${Date.now()}${Math.floor(Math.random() * 10000)}`,
    });

    const qrUrl = await QRCode.toDataURL(qrData, {
      width: 250,
      margin: 2,
      color: { dark: "#1e3a8a", light: "#ffffff" },
    });
    return qrUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Nama tamu harus diisi!");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setError("Email valid harus diisi!");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post("/guests", {
        eventId: eventId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        qrCode: `QR${Date.now()}${Math.floor(Math.random() * 10000)}`,
      });

      const guestId = response.data.id;
      const guestName = formData.name;
      const guestEmail = formData.email;

      setLastAddedGuest({ name: guestName, email: guestEmail });

      const qrUrl = await generateQRCode(guestId, guestName, guestEmail);
      setGeneratedQR(qrUrl);
      setShowQR(true);

      setFormData({ name: "", email: "", phone: "" });
    } catch (err: any) {
      console.error("Error adding guest:", err);
      setError(err.response?.data?.message || "Gagal menambahkan tamu!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadQR = () => {
    if (generatedQR && lastAddedGuest) {
      const link = document.createElement("a");
      link.download = `QR_${lastAddedGuest.name.replace(/\s/g, "_")}.png`;
      link.href = generatedQR;
      link.click();
    }
  };

  const handleAddAnother = () => {
    setShowQR(false);
    setGeneratedQR("");
    setLastAddedGuest(null);
  };

  const handleGoToGuests = () => {
    router.push(`/dashboard/guests/${eventId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800">Event tidak ditemukan</h1>
            <Link href="/dashboard/guests" className="text-blue-600 mt-4 inline-block">
              Kembali ke Daftar Event
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout} />

      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} userName={userName} />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
          
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link href="/dashboard/guests" className="hover:text-blue-600 transition">Daftar Tamu</Link>
            <span>/</span>
            <Link href={`/dashboard/guests/${eventId}`} className="hover:text-blue-600 transition">
              {event.name}
            </Link>
            <span>/</span>
            <span className="text-gray-800 font-medium">Tambah Tamu</span>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Tambah Tamu Baru</h1>
              <p className="text-gray-400 text-sm">
                Event: <span className="font-medium">{event.name}</span>
              </p>
            </div>
          </div>

          {!showQR ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative group">
                  <User size={18} className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-blue-400 transition" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Nama Lengkap *"
                    className="w-full bg-transparent outline-none text-gray-800 py-2 border-b border-gray-200 focus:border-blue-500 transition-all placeholder:text-gray-400 pl-7"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="relative group">
                  <Mail size={18} className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-blue-400 transition" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email *"
                    className="w-full bg-transparent outline-none text-gray-800 py-2 border-b border-gray-200 focus:border-blue-500 transition-all placeholder:text-gray-400 pl-7"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="relative group">
                  <Phone size={18} className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-blue-400 transition" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="No. Telepon (Opsional)"
                    className="w-full bg-transparent outline-none text-gray-800 py-2 border-b border-gray-200 focus:border-blue-500 transition-all placeholder:text-gray-400 pl-7"
                    disabled={isSubmitting}
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex-1 px-6 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Simpan & Generate QR
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle size={32} className="text-green-600" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Tamu Berhasil Ditambahkan!</h2>
              <p className="text-gray-500 mb-6">
                {lastAddedGuest?.name} telah ditambahkan ke event {event?.name}
              </p>

              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <div className="flex justify-center mb-4">
                  <img src={generatedQR} alt="QR Code" className="w-48 h-48" />
                </div>
                <p className="text-sm text-gray-600 mb-2">QR Code untuk {lastAddedGuest?.name}</p>
                <p className="text-xs text-gray-400">Scan untuk check-in saat acara</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={downloadQR}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                >
                  Download QR
                </button>
                <button
                  onClick={handleAddAnother}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium hover:shadow-lg transition"
                >
                  Tambah Lagi
                </button>
                <button
                  onClick={handleGoToGuests}
                  className="flex-1 py-2.5 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition"
                >
                  Lihat Daftar Tamu
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}