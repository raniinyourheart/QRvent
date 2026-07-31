"use client";

import Link from "next/link";
import { Menu, User } from "lucide-react";

interface NavbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  userName: string;
}

export default function Navbar({ sidebarOpen, setSidebarOpen, userName }: NavbarProps) {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-20">
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-gray-600 hover:text-blue-600 transition"
            >
              <Menu size={24} />
            </button>
            
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Selamat datang,{" "}
                <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  {userName}
                </span>!
              </h2>
              <p className="text-gray-400 text-sm">Semoga harimu menyenangkan ✨</p>
            </div>
          </div>

          {/* Profile Button - Link ke halaman profile */}
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-3 hover:opacity-80 transition-all duration-300 cursor-pointer group"
          >
            <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-md group-hover:scale-105 transition-all duration-300">
              <User size={16} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                {userName}
              </p>
              <p className="text-xs text-gray-400">Event Organizer</p>
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
}