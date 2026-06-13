"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Users,
  MapPin,
  Clock,
  Plus,
  Eye,
  Edit,
  Trash2,
  Camera,
  Search,
  Filter,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

// Tipe data untuk Event
interface Event {
  id: number;
  name: string;
  type: string;
  theme: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  locationType: string;
  capacity: number;
  description: string;
  isPublic: boolean;
  createdAt: string;
  guests: Guest[];
}

interface Guest {
  id: number;
  name: string;
  email: string;
  phone?: string;
  status: "checked_in" | "pending" | "cancelled";
  checkedInAt?: string;
  qrCode: string;
}

export default function EventsPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userName, setUserName] = useState("EO");
  const [events, setEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "upcoming" | "ongoing" | "completed">("all");

  // Load events dari localStorage
  useEffect(() => {
    const storedEvents = JSON.parse(localStorage.getItem("events") || "[]");
    // Urutkan berdasarkan tanggal terbaru
    const sortedEvents = storedEvents.sort((a: Event, b: Event) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    setEvents(sortedEvents);
  }, []);

  const handleDelete = (id: number) => {
    if (confirm("Yakin ingin menghapus event ini? Data tamu juga akan ikut terhapus!")) {
      const updatedEvents = events.filter((event) => event.id !== id);
      setEvents(updatedEvents);
      localStorage.setItem("events", JSON.stringify(updatedEvents));
    }
  };

  // Hitung status event berdasarkan tanggal dan waktu
  const getEventStatus = (event: Event): "upcoming" | "ongoing" | "completed" => {
    const now = new Date();
    const eventDate = new Date(event.date);
    const eventStart = new Date(`${event.date}T${event.startTime}`);
    const eventEnd = new Date(`${event.date}T${event.endTime}`);

    if (eventEnd < now) return "completed";
    if (eventStart <= now && eventEnd >= now) return "ongoing";
    return "upcoming";
  };

  const getStatusBadge = (status: "upcoming" | "ongoing" | "completed") => {
    switch (status) {
      case "upcoming":
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">📅 Akan Datang</span>;
      case "ongoing":
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">🔴 Berlangsung</span>;
      case "completed":
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">✅ Selesai</span>;
    }
  };

  // Filter events berdasarkan search dan status
  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase());
    const eventStatus = getEventStatus(event);
    const matchesStatus = filterStatus === "all" || eventStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: events.length,
    totalGuests: events.reduce((sum, e) => sum + (e.guests?.length || 0), 0),
    totalAttended: events.reduce((sum, e) => sum + (e.guests?.filter(g => g.status === "checked_in").length || 0), 0),
    ongoing: events.filter(e => getEventStatus(e) === "ongoing").length,
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userName");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout} />

      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} userName={userName} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Event Saya</h1>
              <p className="text-gray-400 text-sm">Kelola semua event yang telah Anda buat</p>
            </div>
            <Link
              href="/dashboard/events/create"
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] font-medium"
            >
              <Plus className="w-4 h-4" />
              Buat Event Baru
            </Link>
          </div>

          {/* Stat Ringkasan */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <p className="text-gray-400 text-sm">Total Event</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <p className="text-gray-400 text-sm">Total Tamu</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalGuests}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <p className="text-gray-400 text-sm">Total Hadir</p>
              <p className="text-2xl font-bold text-green-600">{stats.totalAttended}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <p className="text-gray-400 text-sm">Event Berlangsung</p>
              <p className="text-2xl font-bold text-purple-600">{stats.ongoing}</p>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari event..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
            <div className="flex gap-2">
              {["all", "upcoming", "ongoing", "completed"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    filterStatus === status
                      ? "bg-purple-600 text-white shadow-md"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {status === "all" && "Semua"}
                  {status === "upcoming" && "Akan Datang"}
                  {status === "ongoing" && "Berlangsung"}
                  {status === "completed" && "Selesai"}
                </button>
              ))}
            </div>
          </div>

          {/* Daftar Event - Card View */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredEvents.map((event) => {
              const eventStatus = getEventStatus(event);
              const totalGuests = event.guests?.length || 0;
              const attendedGuests = event.guests?.filter(g => g.status === "checked_in").length || 0;
              
              return (
                <div
                  key={event.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:scale-[1.01] overflow-hidden"
                >
                  {/* Header Card */}
                  <div className="p-5 border-b border-gray-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{event.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin size={14} className="text-gray-400" />
                          <span className="text-gray-500 text-sm">{event.location}</span>
                        </div>
                      </div>
                      {getStatusBadge(eventStatus)}
                    </div>
                  </div>

                  {/* Body Card */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Calendar size={16} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Tanggal</p>
                        <p className="text-sm font-medium text-gray-700">
                          {event.date} • {event.startTime} - {event.endTime}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                        <Users size={16} className="text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-400">Kehadiran</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 rounded-full transition-all duration-500"
                              style={{ width: totalGuests > 0 ? `${(attendedGuests / totalGuests) * 100}%` : "0%" }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {attendedGuests}/{totalGuests}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Card - Tombol Aksi */}
                  <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-2">
                    <Link
                      href={`/dashboard/guests/${event.id}`}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-all duration-200 text-sm font-medium"
                    >
                      <Eye size={16} />
                      Lihat Tamu
                    </Link>
                    
                    {/* Tombol Scanner - Hanya untuk event upcoming & ongoing */}
                    {(eventStatus === "upcoming" || eventStatus === "ongoing") && (
                      <Link
                        href={`/dashboard/scan/${event.id}`}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-purple-600 hover:bg-purple-50 transition-all duration-200 text-sm font-medium"
                      >
                        <Camera size={16} />
                        Scan QR
                      </Link>
                    )}
                    
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 transition-all duration-200 text-sm font-medium"
                    >
                      <Trash2 size={16} />
                      Hapus
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Jika tidak ada event */}
          {filteredEvents.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Belum ada event</h3>
              <p className="text-gray-400 text-sm mt-1">
                {searchTerm || filterStatus !== "all" ? "Tidak ada event yang sesuai filter" : "Klik tombol 'Buat Event Baru' untuk memulai"}
              </p>
              {(searchTerm || filterStatus !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilterStatus("all");
                  }}
                  className="mt-4 text-purple-600 text-sm hover:underline"
                >
                  Reset Filter
                </button>
              )}
              {!searchTerm && filterStatus === "all" && (
                <Link
                  href="/dashboard/events/create"
                  className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all duration-300"
                >
                  <Plus size={18} />
                  Buat Event Pertama
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}