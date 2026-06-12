"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Users, CheckCircle, Plus, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  
  // Cek login (sementara)
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/login");
    }
  }, [router]);

  // Data statis dulu ya Adek (nanti kita ambil dari database)
  const stats = [
    { title: "Total Event", value: "3", icon: Calendar, color: "bg-blue-500" },
    { title: "Total Tamu", value: "247", icon: Users, color: "bg-green-500" },
    { title: "Hadir", value: "189", icon: CheckCircle, color: "bg-purple-500" },
    { title: "Tingkat Kehadiran", value: "76%", icon: TrendingUp, color: "bg-orange-500" },
  ];

  const recentEvents = [
    { id: 1, name: "Seminar Digital Marketing", date: "15 Juni 2026", guests: 45, attended: 32 },
    { id: 2, name: "Workshop Next.js", date: "20 Juni 2026", guests: 78, attended: 0 },
    { id: 3, name: "Grand Launching QRevnt", date: "25 Juni 2026", guests: 124, attended: 0 },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">Q</span>
              </div>
              <h1 className="text-xl font-bold text-gray-800">QRevnt Dashboard</h1>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem("isLoggedIn");
                router.push("/login");
              }}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header dengan Tombol Buat Event */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Halo, EO!</h2>
            <p className="text-gray-500">Selamat datang di dashboard QRevnt</p>
          </div>
          <Link
            href="/dashboard/events/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            Buat Event Baru
          </Link>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-full`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Events */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-800">Event Terbaru</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Event</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tamu</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hadir</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-800">{event.name}</td>
                    <td className="px-6 py-4 text-gray-500">{event.date}</td>
                    <td className="px-6 py-4 text-gray-500">{event.guests}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        event.attended > 0 ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {event.attended} / {event.guests}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/dashboard/guests/${event.id}`} className="text-blue-600 hover:text-blue-800 text-sm">
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
  );
}