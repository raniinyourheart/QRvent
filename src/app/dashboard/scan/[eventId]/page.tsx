"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Html5QrcodeScanner } from "html5-qrcode";
import { CheckCircle, XCircle, Camera, ArrowLeft, Users, Clock } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

interface Guest {
  id: number;
  name: string;
  email: string;
  phone?: string;
  status: "checked_in" | "pending" | "cancelled";
  checkedInAt?: string;
  qrCode: string;
}

export default function ScanQRPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = parseInt(params.eventId as string);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userName, setUserName] = useState("EO");
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string; guest?: Guest } | null>(null);
  const [scanner, setScanner] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [event, setEvent] = useState<any>(null);
  const [guests, setGuests] = useState<Guest[]>([]);

  // Load event dari localStorage
  useEffect(() => {
    const events = JSON.parse(localStorage.getItem("events") || "[]");
    const foundEvent = events.find((e: any) => e.id === eventId);
    if (foundEvent) {
      setEvent(foundEvent);
      setGuests(foundEvent.guests || []);
    } else {
      router.push("/dashboard/events");
    }
  }, [eventId, router]);

  // Inisialisasi scanner
  useEffect(() => {
    const scannerElement = document.getElementById("qr-reader");
    if (scannerElement && !scanner && isScanning) {
      const qrScanner = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        false
      );

      qrScanner.render(onScanSuccess, onScanError);
      setScanner(qrScanner);
    }

    return () => {
      if (scanner) {
        scanner.clear();
      }
    };
  }, [isScanning, scanner]);

  const onScanSuccess = (decodedText: string, decodedResult: any) => {
    try {
      const qrData = JSON.parse(decodedText);
      const { guestId, guestName, guestEmail, eventId: qrEventId } = qrData;

      if (qrEventId !== eventId) {
        setScanResult({
          success: false,
          message: `QR Code ini untuk event lain!`,
        });
        setTimeout(() => setScanResult(null), 3000);
        return;
      }

      // Cek apakah tamu sudah check-in
      const guest = guests.find((g) => g.id === guestId || g.email === guestEmail);
      
      if (!guest) {
        setScanResult({
          success: false,
          message: `Tamu tidak ditemukan dalam daftar!`,
        });
        setTimeout(() => setScanResult(null), 3000);
        return;
      }

      if (guest.status === "checked_in") {
        setScanResult({
          success: false,
          message: `${guest.name} sudah melakukan check-in pada ${guest.checkedInAt}`,
          guest,
        });
        setTimeout(() => setScanResult(null), 3000);
        return;
      }

      // Update status tamu
      const updatedGuest = {
        ...guest,
        status: "checked_in" as const,
        checkedInAt: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      };

      const updatedGuests = guests.map((g) =>
        g.id === guest.id ? updatedGuest : g
      );

      // Update localStorage
      const events = JSON.parse(localStorage.getItem("events") || "[]");
      const updatedEvents = events.map((e: any) => {
        if (e.id === eventId) {
          return { ...e, guests: updatedGuests };
        }
        return e;
      });
      localStorage.setItem("events", JSON.stringify(updatedEvents));
      
      setGuests(updatedGuests);
      setScanResult({
        success: true,
        message: `${updatedGuest.name} berhasil check-in!`,
        guest: updatedGuest,
      });

      // Play beep sound (opsional)
      setTimeout(() => setScanResult(null), 2000);
    } catch (error) {
      setScanResult({
        success: false,
        message: "QR Code tidak valid!",
      });
      setTimeout(() => setScanResult(null), 2000);
    }
  };

  const onScanError = (error: string) => {
    console.error("Scan error:", error);
  };

  const stats = {
    total: guests.length,
    checkedIn: guests.filter((g) => g.status === "checked_in").length,
    pending: guests.filter((g) => g.status === "pending").length,
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userName");
    router.push("/login");
  };

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout} />

      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} userName={userName} />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
          
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => router.back()} className="p-2 rounded-lg text-gray-400 hover:text-gray-600">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Scanner QR Code</h1>
              <p className="text-gray-400 text-sm">{event.name}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Scanner */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Camera size={20} className="text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-800">Arahkan Kamera ke QR Code</h2>
              </div>
              
              <div id="qr-reader" className="w-full"></div>
              
              {scanResult && (
                <div className={`mt-4 p-3 rounded-xl flex items-center gap-2 ${
                  scanResult.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                }`}>
                  {scanResult.success ? <CheckCircle size={18} /> : <XCircle size={18} />}
                  <span>{scanResult.message}</span>
                </div>
              )}

              <button
                onClick={() => window.location.reload()}
                className="mt-4 w-full py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
              >
                Reset Scanner
              </button>
            </div>

            {/* Right: Statistik Kehadiran */}
            <div className="space-y-6">
              {/* Info Event */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-5 text-white">
                <h3 className="text-lg font-semibold">{event.name}</h3>
                <div className="flex gap-4 mt-2 text-sm opacity-90">
                  <span>📅 {event.date}</span>
                  <span>⏰ {event.startTime} - {event.endTime}</span>
                </div>
                <div className="mt-3 flex gap-2">
                  <span className="px-2 py-1 bg-white/20 rounded-lg text-xs">📍 {event.location}</span>
                </div>
              </div>

              {/* Stat Kehadiran */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Users size={18} className="text-purple-600" />
                  Rekap Kehadiran
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                    <p className="text-xs text-gray-500">Total Tamu</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-xl">
                    <p className="text-2xl font-bold text-green-600">{stats.checkedIn}</p>
                    <p className="text-xs text-gray-500">Hadir</p>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{Math.round((stats.checkedIn / stats.total) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${(stats.checkedIn / stats.total) * 100}%` }} />
                  </div>
                </div>
              </div>

              {/* Daftar Tamu Terbaru yang Check-in */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Clock size={18} className="text-purple-600" />
                  Check-in Terbaru
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {guests.filter(g => g.status === "checked_in").slice(0, 10).map((guest) => (
                    <div key={guest.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{guest.name}</p>
                        <p className="text-xs text-gray-400">{guest.email}</p>
                      </div>
                      <span className="text-xs text-green-600">{guest.checkedInAt}</span>
                    </div>
                  ))}
                  {guests.filter(g => g.status === "checked_in").length === 0 && (
                    <p className="text-center text-gray-400 text-sm py-4">Belum ada check-in</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}