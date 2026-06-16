"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import QRCode from "qrcode";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Tag,
  Save,
  Eye,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Upload,
  Download,
  QrCode,
  X,
  FileSpreadsheet,
  Trash2,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import api from "@/lib/api";

// Tema warna untuk event
const eventThemes = [
  { id: "purple", name: "Ungu Mewah", bg: "from-purple-600 to-purple-800" },
  { id: "blue", name: "Biru Profesional", bg: "from-blue-600 to-blue-800" },
  { id: "green", name: "Hijau Segar", bg: "from-green-600 to-green-800" },
  { id: "orange", name: "Oranye Kreatif", bg: "from-orange-600 to-orange-800" },
  { id: "pink", name: "Pink Modern", bg: "from-pink-600 to-pink-800" },
  { id: "indigo", name: "Indigo Elegan", bg: "from-indigo-600 to-indigo-800" },
];

// Tipe event
const eventTypes = [
  { id: "seminar", name: "Seminar", icon: "🎓" },
  { id: "wedding", name: "Pernikahan", icon: "💍" },
  { id: "party", name: "Pesta", icon: "🎉" },
  { id: "corporate", name: "Korporat", icon: "🏢" },
  { id: "community", name: "Komunitas", icon: "👥" },
];

export default function CreateEventPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userName, setUserName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [createdEvent, setCreatedEvent] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"manual" | "excel">("excel");
  
  // Excel import
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [excelData, setExcelData] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedGuests, setGeneratedGuests] = useState<any[]>([]);
  const [showResultModal, setShowResultModal] = useState(false);
  
  // Form data event
  const [formData, setFormData] = useState({
    name: "",
    type: "seminar",
    theme: "purple",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    locationType: "offline",
    capacity: 500,
    description: "",
    isPublic: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const today = new Date().toISOString().split("T")[0];

  // Helper: cek apakah jam yang dipilih sudah lewat
  const isTimeValid = (date: string, time: string) => {
    if (!date || !time) return true;
    
    const selectedDate = new Date(date);
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    
    // Jika tanggal yang dipilih adalah hari ini
    if (selectedDate.getTime() === todayDate.getTime()) {
      const now = new Date();
      const selectedTime = new Date(`${date}T${time}`);
      return selectedTime >= now;
    }
    return true;
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

  // Template Excel untuk download
  const downloadTemplate = () => {
    const template = [
      { Nama: "Budi Santoso", Email: "budi@gmail.com", Telepon: "081234567890" },
      { Nama: "Siti Aminah", Email: "siti@gmail.com", Telepon: "081234567891" },
      { Nama: "Agus Wijaya", Email: "agus@gmail.com", Telepon: "081234567892" },
    ];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template Tamu");
    XLSX.writeFile(wb, "template_tamu_event.xlsx");
  };

  // Import Excel
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet);
      
      const validGuests = rows.filter((row: any) => {
        return (row.Nama || row.name) && (row.Email || row.email);
      }).map((row: any, index) => ({
        id: index + 1,
        name: row.Nama || row.name,
        email: row.Email || row.email,
        phone: row.Telepon || row.phone || "",
        status: "pending",
      }));
      
      setExcelData(validGuests);
      if (validGuests.length === 0) {
        alert("Format Excel tidak sesuai. Gunakan kolom: Nama, Email, Telepon");
      }
    };
    reader.readAsArrayBuffer(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Generate QR massal dan simpan ke API
  const generateAllQR = async () => {
    if (excelData.length === 0) {
      alert("Tidak ada data tamu! Silahkan import Excel terlebih dahulu.");
      return;
    }

    setIsGenerating(true);
    const guestsWithQR = [];
    
    for (const guest of excelData) {
      const qrCode = `QR${Date.now()}${Math.floor(Math.random() * 10000)}`;
      const qrData = JSON.stringify({
        guestId: Date.now() + Math.random(),
        guestName: guest.name,
        guestEmail: guest.email,
        eventId: createdEvent?.id,
        eventName: createdEvent?.name,
        qrCode: qrCode,
      });
      
      const qrImage = await QRCode.toDataURL(qrData, {
        width: 200,
        margin: 1,
        color: { dark: "#3b82f6", light: "#ffffff" },
      });
      
      try {
        await api.post("/guests", {
          eventId: createdEvent.id,
          name: guest.name,
          email: guest.email,
          phone: guest.phone,
          qrCode: qrCode,
        });
      } catch (error) {
        console.error("Error saving guest:", error);
      }
      
      guestsWithQR.push({
        ...guest,
        qrImage,
        qrCode,
        generatedAt: new Date().toISOString(),
      });
    }
    
    setGeneratedGuests(guestsWithQR);
    setIsGenerating(false);
    setShowResultModal(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = "Nama event harus diisi";
    if (!formData.date) newErrors.date = "Tanggal event harus diisi";
    if (formData.date < today) newErrors.date = "Tidak bisa membuat event di tanggal yang sudah lewat!";
    
    if (!formData.startTime) {
      newErrors.startTime = "Waktu mulai harus diisi";
    } else if (formData.date === today && !isTimeValid(formData.date, formData.startTime)) {
      newErrors.startTime = "Tidak bisa memilih jam yang sudah lewat!";
    }
    
    if (!formData.endTime) {
      newErrors.endTime = "Waktu selesai harus diisi";
    }
    
    if (!formData.location.trim()) newErrors.location = "Lokasi harus diisi";
    if (formData.capacity < 1) newErrors.capacity = "Kapasitas minimal 1";
    if (!formData.description.trim()) newErrors.description = "Deskripsi event harus diisi";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await api.post("/events", {
        name: formData.name,
        type: formData.type,
        theme: formData.theme,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        location: formData.location,
        locationType: formData.locationType,
        capacity: formData.capacity,
        description: formData.description,
        isPublic: formData.isPublic,
      });
      
      const newEvent = response.data;
      setCreatedEvent({ id: newEvent.id, name: formData.name });
      setIsSubmitting(false);
      setShowGuestModal(true);
    } catch (error: any) {
      console.error("Error creating event:", error);
      alert(error.response?.data?.message || "Gagal membuat event!");
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    router.push("/dashboard/events");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const selectedTheme = eventThemes.find((t) => t.id === formData.theme);
  const selectedType = eventTypes.find((t) => t.id === formData.type);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout} />

      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} userName={userName} />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
          
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => router.back()} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Buat Event Baru</h1>
              <p className="text-gray-400 text-sm">Lengkapi informasi event Anda</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Preview */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Eye size={18} className="text-gray-500" />
                  <h2 className="font-semibold text-gray-700">Preview Event</h2>
                </div>
                <button type="button" onClick={() => setShowPreview(!showPreview)} className="text-sm text-blue-600 hover:underline">
                  {showPreview ? "Sembunyikan" : "Lihat Preview"}
                </button>
              </div>
              {showPreview && (
                <div className={`p-5 bg-gradient-to-r ${selectedTheme?.bg}`}>
                  <div className="bg-white/95 rounded-2xl p-5">
                    <div className="flex justify-between">
                      <div>
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-600">
                          {selectedType?.icon} {selectedType?.name}
                        </span>
                        <h3 className="text-xl font-bold text-gray-800 mt-2">{formData.name || "Nama Event"}</h3>
                        <div className="flex gap-4 mt-3 text-sm text-gray-500">
                          <span>📅 {formData.date || "Belum diisi"}</span>
                          <span>⏰ {formData.startTime || "???"} - {formData.endTime || "???"}</span>
                          <span>📍 {formData.location || "Belum diisi"}</span>
                        </div>
                      </div>
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                        <span className="text-2xl">{selectedType?.icon}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mt-4">{formData.description || "Deskripsi event..."}</p>
                  </div>
                </div>
              )}
            </div>

            {Object.keys(errors).length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-red-600 mb-2">
                  <AlertCircle size={18} />
                  <span className="font-medium">Perlu dilengkapi:</span>
                </div>
                <ul className="list-disc list-inside text-sm text-red-600">
                  {Object.values(errors).map((err, i) => <li key={i}>{err}</li>)}
                </ul>
              </div>
            )}

            {/* Informasi Dasar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Sparkles size={18} className="text-blue-600" />
                Informasi Dasar
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Nama Event *"
                    className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${errors.name ? "border-red-400" : "border-gray-200"}`}
                  />
                </div>
                <div>
                  <select name="type" value={formData.type} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl">
                    {eventTypes.map((type) => <option key={type.id} value={type.id}>{type.icon} {type.name}</option>)}
                  </select>
                </div>
                <div>
                  <div className="flex flex-wrap gap-2">
                    {eventThemes.map((theme) => (
                      <button key={theme.id} type="button" onClick={() => setFormData({ ...formData, theme: theme.id })}
                        className={`w-8 h-8 rounded-full bg-gradient-to-r ${theme.bg} ${formData.theme === theme.id ? "ring-2 ring-offset-2 ring-gray-400" : ""}`} title={theme.name} />
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2"><input type="radio" name="isPublic" checked={formData.isPublic === true} onChange={() => setFormData({ ...formData, isPublic: true })} />Publik</label>
                    <label className="flex items-center gap-2"><input type="radio" name="isPublic" checked={formData.isPublic === false} onChange={() => setFormData({ ...formData, isPublic: false })} />Privat</label>
                  </div>
                </div>
              </div>
            </div>

            {/* Waktu & Lokasi */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Clock size={18} className="text-blue-600" />
                Waktu & Lokasi
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <input 
                    type="date" 
                    name="date" 
                    value={formData.date} 
                    onChange={handleChange} 
                    min={today}
                    className={`w-full px-4 py-2.5 border rounded-xl ${errors.date ? "border-red-400" : "border-gray-200"}`} 
                  />
                  {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
                </div>
                <div>
                  <input 
                    type="time" 
                    name="startTime" 
                    value={formData.startTime} 
                    onChange={handleChange} 
                    className={`w-full px-4 py-2.5 border rounded-xl ${errors.startTime ? "border-red-400" : "border-gray-200"}`} 
                  />
                  {errors.startTime && <p className="text-xs text-red-500 mt-1">{errors.startTime}</p>}
                </div>
                <div>
                  <input 
                    type="time" 
                    name="endTime" 
                    value={formData.endTime} 
                    onChange={handleChange} 
                    className={`w-full px-4 py-2.5 border rounded-xl ${errors.endTime ? "border-red-400" : "border-gray-200"}`} 
                  />
                </div>
                <div className="md:col-span-2">
                  <input 
                    type="text" 
                    name="location" 
                    value={formData.location} 
                    onChange={handleChange} 
                    placeholder="Lokasi / Link Meeting *" 
                    className={`w-full px-4 py-2.5 border rounded-xl ${errors.location ? "border-red-400" : "border-gray-200"}`} 
                  />
                </div>
                <div>
                  <input 
                    type="number" 
                    name="capacity" 
                    value={formData.capacity} 
                    onChange={handleChange} 
                    min={1} 
                    placeholder="Kapasitas" 
                    className={`w-full px-4 py-2.5 border rounded-xl ${errors.capacity ? "border-red-400" : "border-gray-200"}`} 
                  />
                </div>
              </div>
            </div>

            {/* Deskripsi */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Tag size={18} className="text-blue-600" />
                Deskripsi Event
              </h2>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                rows={5} 
                placeholder="Deskripsi event..." 
                className={`w-full px-4 py-2.5 border rounded-xl ${errors.description ? "border-red-400" : "border-gray-200"}`} 
              />
            </div>

            {/* Tombol Submit */}
            <div className="flex gap-4 pt-4">
              <button type="button" onClick={() => router.back()} className="flex-1 px-6 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50">Batal</button>
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-lg disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Menyimpan...</> : <><Save size={18} /> Simpan Event</>}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* MODAL: Import Excel & Generate QR MASSAL */}
      {showGuestModal && createdEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
              <div className="flex items-center gap-2">
                <Users size={20} className="text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-800">Tambah Tamu ke Event</h2>
              </div>
              <button onClick={handleSkip} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            
            <div className="p-5">
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-5">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle size={18} />
                  <span className="font-medium">"{createdEvent.name}" telah disimpan</span>
                </div>
              </div>

              {/* Tab Manual vs Excel */}
              <div className="flex gap-2 mb-5 border-b">
                <button onClick={() => setActiveTab("excel")} className={`pb-2 px-4 ${activeTab === "excel" ? "border-b-2 border-blue-600 text-blue-600 font-medium" : "text-gray-400"}`}>
                  📊 Import Excel (Massal)
                </button>
                <button onClick={() => setActiveTab("manual")} className={`pb-2 px-4 ${activeTab === "manual" ? "border-b-2 border-blue-600 text-blue-600 font-medium" : "text-gray-400"}`}>
                  ✍️ Manual (1 per 1)
                </button>
              </div>

              {/* TAB EXCEL - MASSAL */}
              {activeTab === "excel" && (
                <div>
                  <div className="bg-blue-50 rounded-xl p-4 mb-5">
                    <div className="flex items-center gap-3">
                      <FileSpreadsheet size={28} className="text-blue-600" />
                      <div>
                        <h3 className="font-semibold text-gray-800">Import Tamu Massal via Excel</h3>
                        <p className="text-sm text-gray-500">Upload file Excel dengan ribuan tamu sekaligus</p>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button onClick={downloadTemplate} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-blue-300 text-blue-600 hover:bg-blue-100">
                        <Download size={16} /> Download Template
                      </button>
                      <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                        <Upload size={16} /> Upload Excel
                      </button>
                      <input ref={fileInputRef} type="file" accept=".xlsx, .xls" onChange={handleImportExcel} className="hidden" />
                    </div>
                  </div>

                  {excelData.length > 0 && (
                    <div className="mb-5">
                      <div className="flex justify-between items-center mb-3">
                        <p className="text-sm text-gray-600"><strong>{excelData.length}</strong> tamu siap di-generate</p>
                        <button onClick={() => setExcelData([])} className="text-red-500 text-sm flex items-center gap-1"><Trash2 size={14} /> Hapus</button>
                      </div>
                      <div className="max-h-40 overflow-y-auto border rounded-xl">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr><th className="px-3 py-2 text-left">Nama</th><th className="px-3 py-2 text-left">Email</th></tr>
                          </thead>
                          <tbody>
                            {excelData.slice(0, 10).map((guest, i) => (
                              <tr key={i} className="border-t"><td className="px-3 py-1">{guest.name}</td><td className="px-3 py-1">{guest.email}</td></tr>
                            ))}
                            {excelData.length > 10 && <tr><td colSpan={2} className="px-3 py-2 text-center text-gray-400">+{excelData.length - 10} tamu lainnya</td><td className="px-3 py-2"></td></tr>}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <button onClick={generateAllQR} disabled={excelData.length === 0 || isGenerating} className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium disabled:opacity-50 flex items-center justify-center gap-2">
                    {isGenerating ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Membuat QR untuk {excelData.length} tamu...</> : <><QrCode size={18} /> Generate QR Code Massal</>}
                  </button>
                </div>
              )}

              {/* TAB MANUAL */}
              {activeTab === "manual" && (
                <div className="text-center py-8">
                  <p className="text-gray-500">Untuk tamu 1 per 1, silahkan tambahkan dari halaman Daftar Tamu nanti.</p>
                  <button onClick={handleSkip} className="mt-4 px-6 py-2 rounded-lg bg-gray-200 text-gray-600">Lanjut ke Dashboard</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: HASIL GENERATE QR MASSAL */}
      {showResultModal && generatedGuests.length > 0 && createdEvent && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-100 sticky top-0 bg-white">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <CheckCircle size={24} className="text-green-600" />
                  <h2 className="text-xl font-bold text-gray-800">QR Code Berhasil Digenerate!</h2>
                </div>
                <button onClick={() => { setShowResultModal(false); router.push("/dashboard/events"); }} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
              </div>
            </div>
            
            <div className="p-5">
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-5 text-center">
                <p className="text-green-700">✅ {generatedGuests.length} QR Code berhasil dibuat</p>
                <p className="text-sm text-gray-500 mt-1">Data tamu telah tersimpan di database</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {generatedGuests.map((guest, idx) => (
                  <div key={idx} className="border rounded-xl p-3 text-center hover:shadow-md transition">
                    <img src={guest.qrImage} alt="QR" className="w-24 h-24 mx-auto" />
                    <p className="text-sm font-medium mt-2 truncate">{guest.name}</p>
                    <p className="text-xs text-gray-400 truncate">{guest.email}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-xl flex gap-3">
                <button onClick={() => window.print()} className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100">🖨️ Print Semua</button>
                <button onClick={handleSkip} className="flex-1 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium">Selesai</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}