"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Users,
  CheckCircle,
  Plus,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import api from "@/lib/api";

// Tipe data
interface User {
  id: number;
  username: string;
  email: string;
  name: string;
}

interface Event {
  id: number;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  guests?: Guest[];
}

interface Guest {
  id: number;
  name: string;
  status: "checked_in" | "pending" | "cancelled";
}

interface DashboardStats {
  totalEvents: number;
  totalGuests: number;
  totalAttended: number;
  attendanceRate: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userName, setUserName] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    totalGuests: 0,
    totalAttended: 0,
    attendanceRate: 0,
  });

  const [attendanceData, setAttendanceData] = useState([
    { name: "Hadir", value: 0, color: "#3b82f6" },
    { name: "Tidak Hadir", value: 0, color: "#e5e7eb" },
  ]);

  const [trendData, setTrendData] = useState<{ name: string; target: number; attended: number }[]>([
    { name: "Loading...", target: 0, attended: 0 },
  ]);

  const [recentEvents, setRecentEvents] = useState<Event[]>([]);

  // Ambil data user dari localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setUserName(userData.name || userData.username || "User");
      } catch (e) {
        console.error("Error parsing user data:", e);
        router.push("/login");
      }
    } else {
      router.push("/login");
    }
  }, [router]);

  // Ambil data dari API
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        // Fetch events
        const eventsResponse = await api.get("/events");
        const eventsData = eventsResponse.data || [];
        setEvents(eventsData);

        // Hitung statistik dari data events yang didapat
        let totalGuests = 0;
        let totalAttended = 0;

        eventsData.forEach((event: Event) => {
          const guests = event.guests || [];
          totalGuests += guests.length;
          totalAttended += guests.filter((g: Guest) => g.status === "checked_in").length;
        });

        const totalEvents = eventsData.length;
        const attendanceRate = totalGuests > 0 ? Math.round((totalAttended / totalGuests) * 100) : 0;

        setStats({
          totalEvents,
          totalGuests,
          totalAttended,
          attendanceRate,
        });

        // Update data grafik lingkaran
        setAttendanceData([
          { name: "Hadir", value: totalAttended, color: "#3b82f6" },
          { name: "Tidak Hadir", value: totalGuests - totalAttended, color: "#e5e7eb" },
        ]);

        // Update data grafik garis (tren per event)
        const trend = eventsData.slice(0, 5).map((event: Event) => {
          const guests = event.guests || [];
          const attended = guests.filter((g: Guest) => g.status === "checked_in").length;
          return {
            name: event.name.length > 15 ? event.name.slice(0, 15) + "..." : event.name,
            target: guests.length,
            attended: attended,
          };
        });
        
        if (trend.length > 0) {
          setTrendData(trend);
        } else {
          setTrendData([{ name: "Belum ada event", target: 0, attended: 0 }]);
        }

        // Recent events (3 terbaru)
        setRecentEvents(eventsData.slice(0, 3));

      } catch (error: any) {
        console.error("Error fetching dashboard data:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.push("/login");
        }
        // Set default empty data on error
        setStats({
          totalEvents: 0,
          totalGuests: 0,
          totalAttended: 0,
          attendanceRate: 0,
        });
        setAttendanceData([
          { name: "Hadir", value: 0, color: "#3b82f6" },
          { name: "Tidak Hadir", value: 0, color: "#e5e7eb" },
        ]);
        setTrendData([{ name: "Tidak ada data", target: 0, attended: 0 }]);
        setRecentEvents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">Loading dashboard...</p>
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
          <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Overview</h1>
              <p className="text-gray-400 dark:text-gray-500 text-sm">
                Selamat datang kembali, <span className="font-semibold text-blue-600 dark:text-blue-400">{userName}</span>
              </p>
            </div>
            <Link
              href="/dashboard/events/create"
              className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] font-medium"
            >
              <Plus className="w-4 h-4" />
              Buat Event Baru
            </Link>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 dark:text-gray-500 text-sm">Total Event</p>
                  <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{stats.totalEvents}</p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
                  <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 dark:text-gray-500 text-sm">Total Tamu</p>
                  <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{stats.totalGuests}</p>
                </div>
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-xl">
                  <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 dark:text-gray-500 text-sm">Hadir</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">{stats.totalAttended}</p>
                </div>
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 dark:text-gray-500 text-sm">Tingkat Kehadiran</p>
                  <p className="text-3xl font-bold text-orange-500 dark:text-orange-400 mt-1">{stats.attendanceRate}%</p>
                </div>
                <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-xl">
                  <TrendingUp className="w-5 h-5 text-orange-500 dark:text-orange-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Grafik Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Donut Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <TrendingUp size={18} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Tingkat Kehadiran</h3>
                  <p className="text-gray-400 dark:text-gray-500 text-xs">Total {stats.totalGuests} undangan</p>
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={attendanceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={false}
                    >
                      {attendanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => `${value} orang`} 
                      contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "none", borderRadius: "8px", color: "white" }} 
                    />
                    <Legend formatter={(value) => <span className="text-gray-700 dark:text-gray-300">{value}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center mt-2">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.attendanceRate}%</p>
                <p className="text-gray-400 dark:text-gray-500 text-xs">Tingkat kehadiran rata-rata</p>
              </div>
            </div>

            {/* Line Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <BarChart3 size={18} className="text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Tren Kehadiran</h3>
                  <p className="text-gray-400 dark:text-gray-500 text-xs">Target vs Realisasi per Event</p>
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.3} />
                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "none", borderRadius: "8px", color: "white" }} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="target"
                      name="Target Undangan"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="attended"
                      name="Hadir"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent Events Table */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Event Terbaru</h3>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Event yang baru saja Anda buat</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 dark:text-gray-400 uppercase tracking-wider">Nama Event</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 dark:text-gray-400 uppercase tracking-wider">Tanggal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 dark:text-gray-400 uppercase tracking-wider">Tamu</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 dark:text-gray-400 uppercase tracking-wider">Hadir</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 dark:text-gray-400 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {recentEvents.length > 0 ? (
                    recentEvents.map((event) => {
                      const guests = event.guests || [];
                      const totalGuests = guests.length;
                      const attendedGuests = guests.filter((g: Guest) => g.status === "checked_in").length;
                      return (
                        <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <td className="px-6 py-4 text-gray-800 dark:text-gray-200 font-medium">{event.name}</td>
                          <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm">{event.date || "-"}</td>
                          <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{totalGuests}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                              attendedGuests > 0 
                                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" 
                                : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                            }`}>
                              {attendedGuests} / {totalGuests}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <Link href={`/dashboard/guests/${event.id}`} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium hover:underline">
                              Kelola →
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-400 dark:text-gray-500">
                        Belum ada event. Klik "Buat Event Baru" untuk memulai
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}