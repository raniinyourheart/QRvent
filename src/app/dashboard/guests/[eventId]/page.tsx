"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";
import { Html5QrcodeScanner } from "html5-qrcode";
import {
  ArrowLeft,
  Users,
  UserPlus,
  Upload,
  QrCode,
  Search,
  Download,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  FileSpreadsheet,
  FileText,
  Printer,
  X,
  Camera,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import api from "@/lib/api";

// Tipe data tamu
interface Guest {
  id: number;
  name: string;
  email: string;
  phone?: string;
  status: "checked_in" | "pending" | "cancelled";
  checkedInAt?: string;
  qrCode: string;
}

interface Event {
  id: number;
  name: string;
  date: string;
}

export default function GuestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = parseInt(params.eventId as string);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userName, setUserName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "checked_in" | "pending" | "cancelled">("all");
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [qrImageUrl, setQrImageUrl] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scannerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [event, setEvent] = useState<Event | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);

  // ========== HELPER FUNCTIONS FORMAT TANGGAL ==========
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTimeOnly = (dateTimeString: string) => {
    if (!dateTimeString) return "-";
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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

  // Ambil data event dan guests dari API
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const eventResponse = await api.get(`/events/${eventId}`);
      setEvent(eventResponse.data);

      const guestsResponse = await api.get(`/guests/${eventId}`);
      setGuests(guestsResponse.data);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
      } else if (error.response?.status === 404) {
        setEvent(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [eventId]);

  // Inisialisasi scanner
  useEffect(() => {
    if (showScanner) {
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: { width: 300, height: 300 },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true,
        },
        false
      );

      scanner.render(
        async (decodedText) => {
          try {
            const qrData = JSON.parse(decodedText);
            const { id, name, email } = qrData;
            
            const guest = guests.find(g => g.id === id || g.email === email);
            
            if (guest && guest.status !== "checked_in") {
              await api.patch(`/guests/${guest.id}/checkin`);
              await fetchData();
              setScanResult({ success: true, message: `✅ ${guest.name} berhasil check-in!` });
            } else if (guest && guest.status === "checked_in") {
              setScanResult({ success: false, message: `❌ ${guest.name} sudah check-in sebelumnya!` });
            } else {
              setScanResult({ success: false, message: "❌ Tamu tidak ditemukan!" });
            }
          } catch {
            setScanResult({ success: false, message: "❌ QR Code tidak valid!" });
          }
          
          setTimeout(() => setScanResult(null), 3000);
        },
        (error) => {
          console.log("Scan error:", error);
        }
      );

      scannerRef.current = scanner;

      return () => {
        if (scannerRef.current) {
          scannerRef.current.clear();
        }
      };
    }
  }, [showScanner, guests]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  // Generate QR Code
  const generateQR = async (guest: Guest) => {
    try {
      const qrData = JSON.stringify({
        id: guest.id,
        name: guest.name,
        email: guest.email,
        eventId: eventId,
        eventName: event?.name,
        qrCode: guest.qrCode,
      });
      const qrUrl = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: "#1e3a8a",
          light: "#ffffff",
        },
      });
      setQrImageUrl(qrUrl);
      setSelectedGuest(guest);
      setShowQRModal(true);
    } catch (error) {
      console.error("Error generating QR:", error);
      alert("Gagal generate QR Code!");
    }
  };

  // Download QR Code as PNG
  const downloadQR = () => {
    if (qrImageUrl && selectedGuest) {
      try {
        const link = document.createElement("a");
        const fileName = `QR_${selectedGuest.qrCode}_${selectedGuest.name.replace(/\s/g, "_")}.png`;
        link.download = fileName;
        link.href = qrImageUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error("Error downloading QR:", error);
        alert("Gagal download QR Code!");
      }
    } else {
      alert("QR Code belum siap, coba generate ulang!");
    }
  };

  // Print QR Code
  const printQR = () => {
    if (!qrImageUrl || !selectedGuest) {
      alert("QR Code belum siap!");
      return;
    }
    
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>QR Code - ${selectedGuest.name}</title>
            <meta charset="UTF-8">
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                font-family: 'Segoe UI', Arial, sans-serif; 
                display: flex; 
                justify-content: center; 
                align-items: center; 
                min-height: 100vh; 
                background: #f0f0f0;
              }
              .container { 
                text-align: center; 
                padding: 30px;
                background: white;
                border-radius: 16px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.1);
              }
              img { 
                width: 280px; 
                height: 280px; 
                margin: 20px 0;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                padding: 12px;
              }
              h2 { 
                color: #1e3a8a; 
                margin-bottom: 8px;
                font-size: 24px;
              }
              p { 
                color: #4b5563; 
                margin: 6px 0; 
              }
              .event-name {
                color: #3b82f6;
                font-weight: 500;
              }
              .qr-code-text {
                font-family: monospace;
                font-size: 11px;
                margin-top: 12px;
                color: #9ca3af;
                letter-spacing: 0.5px;
              }
              .divider {
                width: 50px;
                height: 2px;
                background: linear-gradient(90deg, #2563eb, #7c3aed);
                margin: 12px auto;
                border-radius: 2px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>${selectedGuest.name}</h2>
              <div class="divider"></div>
              <p class="event-name">${event?.name}</p>
              <p>Kode: <strong>${selectedGuest.qrCode}</strong></p>
              <img src="${qrImageUrl}" alt="QR Code" />
              <p>Scan untuk check-in</p>
              <p class="qr-code-text">QRvent — Digital Guest Book Platform</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    } else {
      alert("Pop-up terblokir! Izinkan pop-up untuk halaman ini.");
    }
  };

  // Import Excel dan simpan ke API
  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const data = new Uint8Array(event.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet);

      let successCount = 0;
      
      for (const row of rows) {
        const name = (row as any).Nama || (row as any).name;
        const email = (row as any).Email || (row as any).email;
        const phone = (row as any).Telepon || (row as any).phone || "";
        
        if (name && email) {
          try {
            await api.post("/guests", {
              eventId: eventId,
              name: name,
              email: email,
              phone: phone,
              qrCode: `QR${Date.now()}${Math.floor(Math.random() * 10000)}`,
            });
            successCount++;
          } catch (error) {
            console.error("Error saving guest:", error);
          }
        }
      }

      if (successCount > 0) {
        alert(`${successCount} tamu berhasil diimport!`);
        fetchData();
      } else {
        alert("Format Excel tidak sesuai. Gunakan kolom: Nama, Email, Telepon");
      }
    };
    reader.readAsArrayBuffer(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Export to Excel
  const exportToExcel = () => {
    const exportData = guests.map((guest) => ({
      "Nama": guest.name,
      "Email": guest.email,
      "Telepon": guest.phone || "-",
      "Status": guest.status === "checked_in" ? "Hadir" : guest.status === "pending" ? "Belum Hadir" : "Batal",
      "Waktu Check-in": guest.checkedInAt ? formatTimeOnly(guest.checkedInAt) : "-",
      "Kode QR": guest.qrCode,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Daftar Tamu");
    XLSX.writeFile(workbook, `Daftar_Tamu_${event?.name}_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.setTextColor(30, 58, 138);
    doc.text(`Daftar Tamu - ${event?.name}`, 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Tanggal: ${formatDate(event?.date || "")} | Total: ${guests.length} tamu`, 14, 30);
    
    const tableData = guests.map((guest) => [
      guest.name,
      guest.email,
      guest.phone || "-",
      guest.status === "checked_in" ? "Hadir" : guest.status === "pending" ? "Belum Hadir" : "Batal",
      guest.checkedInAt ? formatTimeOnly(guest.checkedInAt) : "-",
    ]);
    
    autoTable(doc, {
      startY: 40,
      head: [["Nama", "Email", "Telepon", "Status", "Waktu Check-in"]],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontSize: 10 },
      bodyStyles: { fontSize: 9 },
      alternateRowStyles: { fillColor: [243, 244, 246] },
    });
    
    doc.save(`Daftar_Tamu_${event?.name}_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  // Hapus tamu
  const handleDeleteGuest = async (id: number) => {
    if (!confirm("Yakin ingin menghapus tamu ini?")) return;
    
    try {
      await api.delete(`/guests/${id}`);
      fetchData();
    } catch (error) {
      console.error("Error deleting guest:", error);
      alert("Gagal menghapus tamu!");
    }
  };

  const getStatusBadge = (status: Guest["status"]) => {
    switch (status) {
      case "checked_in":
        return <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-green-100 text-green-700"><CheckCircle size={12} /> Hadir</span>;
      case "pending":
        return <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700"><Clock size={12} /> Belum Hadir</span>;
      case "cancelled":
        return <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-red-100 text-red-700"><XCircle size={12} /> Batal</span>;
    }
  };

  const filteredGuests = guests.filter((guest) => {
    const matchesSearch = guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          guest.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || guest.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: guests.length,
    checkedIn: guests.filter((g) => g.status === "checked_in").length,
    pending: guests.filter((g) => g.status === "pending").length,
    cancelled: guests.filter((g) => g.status === "cancelled").length,
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
            <Link href="/dashboard/guests" className="text-blue-600 mt-4 inline-block">Kembali ke Daftar Event</Link>
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
          
          {/* Breadcrumb */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Link href="/dashboard/guests" className="hover:text-blue-600 transition">Daftar Tamu</Link>
              <span>/</span>
              <span className="text-gray-800 font-medium">{event.name}</span>
            </div>
            
            <button
              onClick={() => setShowScanner(!showScanner)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300"
            >
              <Camera size={18} />
              {showScanner ? "Tutup Scanner" : "Buka Scanner QR"}
            </button>
          </div>

          {/* Scanner QR Section */}
          {showScanner && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Camera className="text-blue-600" />
                Scan QR Code Tamu
              </h2>
              <div id="qr-reader" className="w-full max-w-md mx-auto"></div>
              {scanResult && (
                <div className={`mt-4 p-3 rounded-lg text-center ${
                  scanResult.success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}>
                  {scanResult.message}
                </div>
              )}
              <p className="text-center text-gray-500 text-sm mt-4">
                Arahkan kamera ke QR Code tamu untuk melakukan check-in
              </p>
            </div>
          )}

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{event.name}</h1>
              <p className="text-gray-400 text-sm">{formatDate(event.date)}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportExcel}
                accept=".xlsx, .xls, .csv"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-all duration-200"
              >
                <FileSpreadsheet size={18} />
                Import Excel
              </button>
              <button
                onClick={exportToExcel}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all duration-200"
              >
                <Download size={18} />
                Export Excel
              </button>
              <button
                onClick={exportToPDF}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-200"
              >
                <FileText size={18} />
                Export PDF
              </button>
              <Link
                href={`/dashboard/guests/${event.id}/add`}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-lg transition-all duration-300"
              >
                <UserPlus size={18} />
                Tambah Tamu
              </Link>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <p className="text-gray-400 text-sm">Total Tamu</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <p className="text-gray-400 text-sm">Hadir</p>
              <p className="text-2xl font-bold text-green-600">{stats.checkedIn}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <p className="text-gray-400 text-sm">Belum Hadir</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <p className="text-gray-400 text-sm">Batal</p>
              <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama atau email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {["all", "checked_in", "pending", "cancelled"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    filterStatus === status
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {status === "all" && "Semua"}
                  {status === "checked_in" && "Hadir"}
                  {status === "pending" && "Belum Hadir"}
                  {status === "cancelled" && "Batal"}
                </button>
              ))}
            </div>
          </div>

          {/* Tabel Tamu */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Nama</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Telepon</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Waktu Check-in</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredGuests.map((guest) => (
                    <tr key={guest.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-800">{guest.name}</p>
                        <p className="text-xs text-gray-400 font-mono">{guest.qrCode}</p>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">{guest.email}</td>
                      <td className="px-6 py-4 text-gray-500 text-sm">{guest.phone || "-"}</td>
                      <td className="px-6 py-4">{getStatusBadge(guest.status)}</td>
                      <td className="px-6 py-4 text-gray-500 text-sm">{formatTimeOnly(guest.checkedInAt || "")}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => generateQR(guest)}
                            className="p-1 text-gray-400 hover:text-purple-600 transition"
                            title="Lihat QR Code"
                          >
                            <QrCode size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteGuest(guest.id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition"
                            title="Hapus"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredGuests.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users size={28} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Belum ada tamu</h3>
                <p className="text-gray-400 text-sm mt-1">Import Excel atau tambah tamu secara manual</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal QR Code */}
      {showQRModal && selectedGuest && qrImageUrl && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">QR Code Tamu</h2>
              <button onClick={() => setShowQRModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="text-center">
              <p className="text-gray-600 mb-1">{selectedGuest.name}</p>
              <p className="text-gray-400 text-sm mb-4">{selectedGuest.email}</p>
              
              <div className="bg-white p-4 rounded-xl inline-block border border-gray-200">
                <img 
                  src={qrImageUrl} 
                  alt="QR Code" 
                  className="w-64 h-64 mx-auto"
                  onError={() => alert("Gagal memuat QR Code")}
                />
              </div>
              
              <p className="text-xs text-gray-400 mt-3 font-mono">Kode: {selectedGuest.qrCode}</p>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={downloadQR}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  📥 Download PNG
                </button>
                <button
                  onClick={printQR}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  🖨️ Print
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}