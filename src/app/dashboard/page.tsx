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

export default function DashboardPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userName, setUserName] = useState("EO");

  useEffect(() => {
    const name = localStorage.getItem("userName");
    if (name) {
      setUserName(name);
    }
  }, []);

  // Data Stat Cards
  const stats = [
    { title: "Total Event", value: "3", icon: Calendar, color: "bg-blue-500" },
    { title: "Total Tamu", value: "247", icon: Users, color: "bg-green-500" },
    { title: "Hadir", value: "189", icon: CheckCircle, color: "bg-purple-500" },
    { title: "Tingkat Kehadiran", value: "76%", icon: TrendingUp, color: "bg-orange-500" },
  ];

  // Data untuk Donut Chart
  const attendanceData = [
    { name: "Hadir", value: 189, color: "#3b82f6" },
    { name: "Tidak Hadir", value: 58, color: "#e5e7eb" },
  ];

  // Data untuk Line Chart
  const trendData = [
    { name: "Seminar", target: 45, attended: 32 },
    { name: "Workshop", target: 78, attended: 45 },
    { name: "Launching", target: 124, attended: 67 },
    { name: "Webinar", target: 56, attended: 48 },
    { name: "Meetup", target: 89, attended: 71 },
  ];

  // Data Tabel Event Terbaru
  const recentEvents = [
    { id: 1, name: "Seminar Digital Marketing", date: "15 Juni 2026", guests: 45, attended: 32 },
    { id: 2, name: "Workshop Next.js", date: "20 Juni 2026", guests: 78, attended: 0 },
    { id: 3, name: "Grand Launching QRevnt", date: "25 Juni 2026", guests: 124, attended: 0 },
  ];

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userName");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout} />
      
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} userName={userName} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
          
          {/* Header dengan Tombol Buat Event */}
          <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Overview</h1>
              <p className="text-gray-400 text-sm">Lihat ringkasan event dan aktivitasmu</p>
            </div>
            <Link
              href="/dashboard/events/create"
              className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 hover:scale-[1.02] font-medium"
            >
              <Plus className="w-4 h-4" />
              Buat Event Baru
            </Link>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-800 mt-1">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-xl`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* GRAFIK SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            
            {/* Donut Chart - Tingkat Kehadiran (SUDAH DIPERBAIKI) */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp size={18} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Tingkat Kehadiran</h3>
                  <p className="text-gray-400 text-xs">Total 247 undangan</p>
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
                    <Tooltip formatter={(value) => `${value} orang`} />
                    <Legend 
                      formatter={(value) => <span className="text-gray-700">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center mt-2">
                <p className="text-2xl font-bold text-blue-600">76%</p>
                <p className="text-gray-400 text-xs">Tingkat kehadiran rata-rata</p>
              </div>
            </div>

            {/* Line Chart - Tren Kehadiran */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <BarChart3 size={18} className="text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Tren Kehadiran</h3>
                  <p className="text-gray-400 text-xs">Target vs Realisasi per Event</p>
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="target"
                      name="Target Undangan"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="attended"
                      name="Hadir"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent Events Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">Event Terbaru</h3>
              <p className="text-gray-400 text-sm mt-1">Daftar event yang baru saja dibuat</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Nama Event</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tanggal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tamu</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Hadir</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-800 font-medium">{event.name}</td>
                      <td className="px-6 py-4 text-gray-500 text-sm">{event.date}</td>
                      <td className="px-6 py-4 text-gray-600">{event.guests}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          event.attended > 0 ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {event.attended} / {event.guests}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link href={`/dashboard/guests/${event.id}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline">
                          Kelola →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}