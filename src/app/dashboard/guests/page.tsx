"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Users,
  Plus,
  ChevronRight,
  UserPlus,
  Upload,
  QrCode,
  Mail,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

// Data event (sementara, nanti dari database)
const events = [
  { id: 1, name: "Seminar Digital Marketing", date: "15 Juni 2026", guests: 45, attended: 32 },
  { id: 2, name: "Workshop Next.js", date: "20 Juni 2026", guests: 78, attended: 0 },
  { id: 3, name: "Grand Launching QRevnt", date: "25 Juni 2026", guests: 124, attended: 0 },
];

export default function GuestsPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userName, setUserName] = useState("EO");

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
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Daftar Tamu</h1>
            <p className="text-gray-400 text-sm">Pilih event untuk mengelola daftar tamu</p>
          </div>

          {/* Grid Pilih Event */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
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
                  <p className="text-gray-500 text-sm mb-4">{event.date}</p>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                      <Users size={14} className="text-gray-400" />
                      <span className="text-sm text-gray-600">{event.guests} tamu</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${(event.attended / event.guests) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        {event.attended}/{event.guests}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}