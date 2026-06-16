"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Users,
  ChevronRight,
  Plus,  // ✅ Tambahkan Plus
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import api from "@/lib/api";

// Tipe data event
interface Event {
  id: number;
  name: string;
  date: string;
}

interface Guest {
  id: number;
  status: string;
  eventId: number;
}

export default function GuestsPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userName, setUserName] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [guestsMap, setGuestsMap] = useState<Map<number, Guest[]>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

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

  // Ambil daftar event dan guest dari API
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      // Ambil events
      const eventsResponse = await api.get("/events");
      const eventsData = eventsResponse.data;
      
      // Urutkan berdasarkan tanggal terbaru
      const sortedEvents = eventsData.sort((a: Event, b: Event) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setEvents(sortedEvents);

      // Ambil guests untuk setiap event
      const guestsMapTemp = new Map<number, Guest[]>();
      for (const event of sortedEvents) {
        try {
          const guestsResponse = await api.get(`/guests/${event.id}`);
          guestsMapTemp.set(event.id, guestsResponse.data);
        } catch (error) {
          guestsMapTemp.set(event.id, []);
        }
      }
      setGuestsMap(guestsMapTemp);
    } catch (error: any) {
      console.error("Error fetching data:", error);
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
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  // Hitung statistik per event
  const getEventStats = (eventId: number) => {
    const guests = guestsMap.get(eventId) || [];
    const totalGuests = guests.length;
    const attendedGuests = guests.filter((g: Guest) => g.status === "checked_in").length;
    return { totalGuests, attendedGuests };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading events...</p>
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
          
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Daftar Tamu</h1>
            <p className="text-gray-400 text-sm">Pilih event untuk mengelola daftar tamu</p>
          </div>

          {/* Grid Pilih Event */}
          {events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => {
                const { totalGuests, attendedGuests } = getEventStats(event.id);
                const attendancePercent = totalGuests > 0 ? (attendedGuests / totalGuests) * 100 : 0;
                
                return (
                  <Link
                    key={event.id}
                    href={`/dashboard/guests/${event.id}`}
                    className="group bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all duration-300 overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                          <Calendar size={22} className="text-white" />
                        </div>
                        <ChevronRight
                          size={20}
                          className="text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all"
                        />
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-800 mb-1 line-clamp-1">
                        {event.name}
                      </h3>
                      <p className="text-gray-500 text-sm mb-4">{event.date || "-"}</p>
                      
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-1">
                          <Users size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-600">{totalGuests} tamu</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 rounded-full"
                              style={{ width: `${attendancePercent}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">
                            {attendedGuests}/{totalGuests}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Belum ada event</h3>
              <p className="text-gray-400 text-sm mt-1">
                Buat event terlebih dahulu untuk mengelola daftar tamu
              </p>
              <Link
                href="/dashboard/events/create"
                className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-lg transition-all duration-300"
              >
                <Plus size={18} />
                Buat Event Baru
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}