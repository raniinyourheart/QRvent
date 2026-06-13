"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Calendar,
  Users,
  Gift,
  MessageSquare,
  Settings,
  LogOut,
  X,
} from "lucide-react";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  onLogout: () => void;
}

const menuItems = [
  { name: "Dashboard", icon: Home, href: "/dashboard" },
  { name: "Event Saya", icon: Calendar, href: "/dashboard/events" },
  { name: "Daftar Tamu", icon: Users, href: "/dashboard/guests" },
  { name: "Doorprize", icon: Gift, href: "/dashboard/doorprize" },
  { name: "Feedback", icon: MessageSquare, href: "/dashboard/feedback" },
  { name: "Pengaturan", icon: Settings, href: "/dashboard/settings" },
];

export default function Sidebar({ sidebarOpen, setSidebarOpen, onLogout }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`
        fixed lg:sticky top-0 left-0 z-30
        bg-gradient-to-b from-blue-800 via-blue-900 to-blue-950
        text-white
        transition-all duration-300 ease-in-out
        h-screen
        shadow-xl
        flex flex-col
        ${sidebarOpen ? "w-64" : "w-20"}
      `}
    >
      {/* LOGO - QRvent aja, glowing */}
      <div className="flex items-center justify-between p-5 border-b border-blue-700 flex-shrink-0">
        <div className="flex items-center gap-2">
          {sidebarOpen ? (
            <span className="font-bold text-xl bg-gradient-to-r from-white via-blue-200 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">
              QRvent
            </span>
          ) : (
            <span className="font-bold text-xl bg-gradient-to-r from-white via-blue-200 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">
              Q
            </span>
          )}
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden text-blue-300 hover:text-white transition"
        >
          <X size={20} />
        </button>
      </div>

      {/* Menu Items */}
      <nav className="mt-6 px-3 flex-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 mb-1 rounded-lg transition-all duration-200
                ${isActive 
                  ? "bg-white/10 text-white shadow-[0_0_12px_rgba(255,255,255,0.3)] backdrop-blur-sm" 
                  : "text-blue-200 hover:bg-blue-700/50 hover:text-white"
                }
              `}
            >
              <item.icon size={19} />
              {sidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="w-full p-4 border-t border-blue-700 bg-blue-900/30 flex-shrink-0">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-blue-200 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200"
        >
          <LogOut size={19} />
          {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
}