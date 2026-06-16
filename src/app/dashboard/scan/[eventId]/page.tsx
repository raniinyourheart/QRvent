"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Html5QrcodeScanner } from "html5-qrcode";
import { ArrowLeft, Camera, CheckCircle, XCircle, Maximize2 } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import api from "@/lib/api";

export default function ScanQRPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = parseInt(params.eventId as string);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userName, setUserName] = useState("");
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null);
  const [event, setEvent] = useState<{ id: number; name: string } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const scannerRef = useRef<any>(null);
  const [isScannerReady, setIsScannerReady] = useState(false);

  // Ambil user login
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const userData = JSON.parse(user);
      setUserName(userData.name || userData.username || "EO");
    } else {
      router.push("/login");
    }
  }, [router]);

  // Ambil data event dari API
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await api.get(`/events/${eventId}`);
        setEvent(response.data);
      } catch (error) {
        console.error("Error fetching event:", error);
      }
    };
    fetchEvent();
  }, [eventId]);

  // Inisialisasi scanner setelah komponen siap
  useEffect(() => {
    const timer = setTimeout(() => {
      const element = document.getElementById("qr-reader");
      if (element && !scannerRef.current) {
        const scanner = new Html5QrcodeScanner(
          "qr-reader",
          {
            fps: 15, // Lebih cepat (15 frame per detik)
            qrbox: { width: 400, height: 400 }, // Lebih besar
            aspectRatio: 1.0,
            showTorchButtonIfSupported: true,
            defaultZoomValueIfSupported: 2, // Zoom default
          },
          false
        );

        scanner.render(
          async (decodedText) => {
            console.log("Scanned:", decodedText);
            
            try {
              const qrData = JSON.parse(decodedText);
              const { id, name, email } = qrData;
              
              // Cari tamu berdasarkan ID atau email
              const guestsResponse = await api.get(`/guests/${eventId}`);
              const guests = guestsResponse.data;
              const guest = guests.find((g: any) => g.id === id || g.email === email);
              
              if (guest && guest.status !== "checked_in") {
                // Update status tamu via API
                await api.patch(`/guests/${guest.id}/checkin`);
                setScanResult({ success: true, message: `✅ ${guest.name} berhasil check-in!` });
              } else if (guest && guest.status === "checked_in") {
                setScanResult({ success: false, message: `❌ ${guest.name} sudah check-in sebelumnya!` });
              } else {
                setScanResult({ success: false, message: "❌ Tamu tidak ditemukan!" });
              }
            } catch (error) {
              setScanResult({ success: false, message: "❌ QR Code tidak valid!" });
            }
            
            setTimeout(() => setScanResult(null), 2000);
          },
          (error) => {
            console.log("Scan error:", error);
          }
        );

        scannerRef.current = scanner;
        setIsScannerReady(true);
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current.clear();
        scannerRef.current = null;
      }
    };
  }, [eventId]);

  const handleFullscreen = () => {
    const scannerElement = document.getElementById("qr-reader");
    if (scannerElement) {
      if (!isFullscreen) {
        scannerElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-100 flex">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout} />
        <div className="flex-1 flex flex-col">
          <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} userName={userName} />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading event data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout} />
      
      <div className="flex-1 flex flex-col">
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} userName={userName} />
        
        <div className="p-6">
          <button 
            onClick={() => router.push("/dashboard/events")} 
            className="flex items-center gap-2 text-gray-600 mb-4 hover:text-blue-600 transition"
          >
            <ArrowLeft size={18} /> Back to Events
          </button>
          
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Camera className="text-blue-600" size={24} />
                <h1 className="text-xl font-bold">QR Code Scanner</h1>
              </div>
              <button
                onClick={handleFullscreen}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
                title="Fullscreen mode"
              >
                <Maximize2 size={16} />
                Fullscreen
              </button>
            </div>
            
            <p className="text-gray-500 mb-4">
              Event: <span className="font-semibold">{event.name}</span>
            </p>
            
            {/* Scanner area - lebih lebar */}
            <div className="w-full max-w-3xl mx-auto">
              <div id="qr-reader" className="w-full"></div>
            </div>
            
            {!isScannerReady && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 text-sm mt-2">Starting camera...</p>
              </div>
            )}
            
            {scanResult && (
              <div className={`mt-4 p-3 rounded-lg text-center ${
                scanResult.success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}>
                {scanResult.message}
              </div>
            )}
            
            <p className="text-center text-gray-500 text-sm mt-4">
              Point camera at guest's QR code to check in
            </p>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700 text-center">
                💡 Tips: Make sure QR code is clearly visible and well lit
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}