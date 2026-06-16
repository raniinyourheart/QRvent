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
  Trash2,
  Camera,
  Search,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import api from "@/lib/api";

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
  guests?: Guest[];
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
  const [userName, setUserName] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "upcoming" | "ongoing" | "completed">("all");

  // Ambil nama user dari localStorage
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
  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await api.get("/events");
      const eventsData = response.data;
      
      const sortedEvents = eventsData.sort((a: Event, b: Event) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setEvents(sortedEvents);
    } catch (error: any) {
      console.error("Error fetching events:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus event ini? Semua data tamu juga akan ikut terhapus!")) return;
    
    try {
      await api.delete(`/events/${id}`);
      fetchEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Gagal menghapus event!");
    }
  };

  const getEventStatus = (event: Event): "upcoming" | "ongoing" | "completed" => {
    const now = new Date();
    const eventDate = new Date(event.date);
    const eventStart = new Date(`${event.date}T${event.startTime || "00:00"}`);
    const eventEnd = new Date(`${event.date}T${event.endTime || "23:59"}`);

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

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase());
    const eventStatus = getEventStatus(event);
    const matchesStatus = filterStatus === "all" || eventStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: events.length,
    totalGuests: events.reduce((sum, e) => sum + (e.guests?.length || 0), 0),
    totalAttended: events.reduce((sum, e) => sum + (e.guests?.filter(g => g?.status === "checked_in").length || 0), 0),
    ongoing: events.filter(e => getEventStatus(e) === "ongoing").length,
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">Loading events...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout} />

      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} userName={userName} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Event Saya</h1>
              <p className="text-gray-400 dark:text-gray-500 text-sm">Kelola semua event yang telah Anda buat</p>
            </div>
            <Link
              href="/dashboard/events/create"
              className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] font-medium"
            >
              <Plus className="w-4 h-4" />
              Buat Event Baru
            </Link>
          </div>

          {/* Stat Ringkasan */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
              <p className="text-gray-400 dark:text-gray-500 text-sm">Total Event</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.total}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
              <p className="text-gray-400 dark:text-gray-500 text-sm">Total Tamu</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.totalGuests}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
              <p className="text-gray-400 dark:text-gray-500 text-sm">Total Hadir</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.totalAttended}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
              <p className="text-gray-400 dark:text-gray-500 text-sm">Event Berlangsung</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.ongoing}</p>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Cari event..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {["all", "upcoming", "ongoing", "completed"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    filterStatus === status
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
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
          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredEvents.map((event) => {
                const eventStatus = getEventStatus(event);
                const totalGuests = event.guests?.length || 0;
                const attendedGuests = event.guests?.filter(g => g.status === "checked_in").length || 0;
                
                return (
                  <div
                    key={event.id}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-300 hover:scale-[1.01] overflow-hidden"
                  >
                    {/* Header Card */}
                    <div className="p-5 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{event.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <MapPin size={14} className="text-gray-400 dark:text-gray-500" />
                            <span className="text-gray-500 dark:text-gray-400 text-sm">{event.location}</span>
                          </div>
                        </div>
                        {getStatusBadge(eventStatus)}
                      </div>
                    </div>

                    {/* Body Card */}
                    <div className="p-5 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                          <Calendar size={16} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 dark:text-gray-500">Tanggal</p>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {event.date} {event.startTime && `• ${event.startTime} - ${event.endTime || "Selesai"}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                          <Users size={16} className="text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-400 dark:text-gray-500">Kehadiran</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500 rounded-full transition-all duration-500"
                                style={{ width: totalGuests > 0 ? `${(attendedGuests / totalGuests) * 100}%` : "0%" }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {attendedGuests}/{totalGuests}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer Card - Tombol Aksi */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex flex-wrap gap-2">
                      <Link
                        href={`/dashboard/guests/${event.id}`}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all duration-200 text-sm font-medium"
                      >
                        <Eye size={16} />
                        Lihat Tamu
                      </Link>
                      
                      {(eventStatus === "upcoming" || eventStatus === "ongoing") && (
                        <Link
                          href={`/dashboard/scan/${event.id}`}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all duration-200 text-sm font-medium"
                        >
                          <Camera size={16} />
                          Scan QR
                        </Link>
                      )}
                      
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all duration-200 text-sm font-medium"
                      >
                        <Trash2 size={16} />
                        Hapus
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar size={32} className="text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Belum ada event</h3>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                {searchTerm || filterStatus !== "all" ? "Tidak ada event yang sesuai filter" : "Klik tombol 'Buat Event Baru' untuk memulai"}
              </p>
              {(searchTerm || filterStatus !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilterStatus("all");
                  }}
                  className="mt-4 text-blue-600 dark:text-blue-400 text-sm hover:underline"
                >
                  Reset Filter
                </button>
              )}
              {!searchTerm && filterStatus === "all" && (
                <Link
                  href="/dashboard/events/create"
                  className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-lg transition-all duration-300"
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