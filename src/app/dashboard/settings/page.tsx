"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Settings,
  Bell,
  Shield,
  Palette,
  Save,
  CheckCircle,
  Trash2,
  Moon,
  Sun,
  AlertCircle,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import api from "@/lib/api";

export default function SettingsPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userName, setUserName] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [notifications, setNotifications] = useState({
    emailFeedback: true,
    emailDoorprize: true,
    pushCheckin: true,
    weeklyReport: true,
  });

  const [appearance, setAppearance] = useState({
    theme: "light",
    animations: true,
  });

  const [security, setSecurity] = useState({
    twoFactor: false,
    sessionTimeout: "30",
  });

  // Ambil tema dari localStorage saat pertama kali load
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setAppearance(prev => ({ ...prev, theme: savedTheme }));
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, []);

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

  // Ambil pengaturan dari API
  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await api.get("/settings");
        const data = response.data;
        
        if (data.notifications) setNotifications(data.notifications);
        if (data.appearance) {
          setAppearance(data.appearance);
          // Terapkan tema dari database
          if (data.appearance.theme === "dark") {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
          } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
          }
        }
        if (data.security) setSecurity(data.security);
      } catch (error: any) {
        console.error("Error fetching settings:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.push("/login");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [router]);

  const showSuccess = (message: string) => {
    setSaveMessage(message);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setSaveMessage("");
    }, 3000);
  };

  const saveSettings = async (type: string, data: any) => {
    try {
      await api.put("/settings", { type, data });
      return true;
    } catch (error) {
      console.error(`Error saving ${type} settings:`, error);
      return false;
    }
  };

  const handleSaveNotifications = async () => {
    const success = await saveSettings("notifications", notifications);
    showSuccess(success ? "Pengaturan notifikasi disimpan!" : "Gagal menyimpan pengaturan!");
  };

  const handleSaveAppearance = async () => {
    const success = await saveSettings("appearance", appearance);
    if (success) {
      showSuccess("Pengaturan tampilan disimpan!");
      // Terapkan tema
      if (appearance.theme === "dark") {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
    } else {
      showSuccess("Gagal menyimpan pengaturan!");
    }
  };

  const handleSaveSecurity = async () => {
    const success = await saveSettings("security", security);
    showSuccess(success ? "Pengaturan keamanan disimpan!" : "Gagal menyimpan pengaturan!");
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
            <p className="text-gray-500">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col lg:flex-row">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout} />

      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} userName={userName} />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
          
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <Settings className="text-gray-600 dark:text-gray-400" size={28} />
              Pengaturan
            </h1>
            <p className="text-gray-400 dark:text-gray-500 text-sm">Atur preferensi notifikasi, tampilan, dan keamanan</p>
          </div>

          {saveSuccess && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-2 text-green-700 dark:text-green-400">
              <CheckCircle size={18} />
              {saveMessage}
            </div>
          )}

          <div className="space-y-6">
            
            {/* NOTIFIKASI */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-700">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                  <Bell size={20} className="text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Preferensi Notifikasi</h2>
                  <p className="text-sm text-gray-400 dark:text-gray-500">Atur notifikasi yang ingin Anda terima</p>
                </div>
              </div>

              <div className="space-y-4 mt-4">
                {[
                  { key: "emailFeedback", label: "Feedback Baru", desc: "Dapatkan email saat ada feedback baru" },
                  { key: "emailDoorprize", label: "Pemenang Doorprize", desc: "Dapatkan notifikasi saat undian dilakukan" },
                  { key: "pushCheckin", label: "Check-in Peserta", desc: "Notifikasi realtime saat peserta check-in" },
                  { key: "weeklyReport", label: "Laporan Mingguan", desc: "Ringkasan aktivitas event setiap minggu" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">{item.label}</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key as keyof typeof notifications] })}
                      className={`w-12 h-6 rounded-full transition-all duration-300 ${notifications[item.key as keyof typeof notifications] ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-all duration-300 ${notifications[item.key as keyof typeof notifications] ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-700 mt-4">
                <button onClick={handleSaveNotifications} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium hover:shadow-lg transition flex items-center gap-2">
                  <Save size={16} /> Simpan Pengaturan
                </button>
              </div>
            </div>

            {/* TAMPILAN */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-700">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <Palette size={20} className="text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Tampilan Aplikasi</h2>
                  <p className="text-sm text-gray-400 dark:text-gray-500">Atur tema dan preferensi tampilan</p>
                </div>
              </div>

              <div className="space-y-4 mt-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="flex items-center gap-2">
                    {appearance.theme === "light" ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-blue-500" />}
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">Mode Gelap</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500">Tampilan gelap untuk kenyamanan mata</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const newTheme = appearance.theme === "light" ? "dark" : "light";
                      setAppearance({ ...appearance, theme: newTheme });
                      if (newTheme === "dark") {
                        document.documentElement.classList.add("dark");
                        localStorage.setItem("theme", "dark");
                      } else {
                        document.documentElement.classList.remove("dark");
                        localStorage.setItem("theme", "light");
                      }
                    }}
                    className={`w-12 h-6 rounded-full transition-all duration-300 ${
                      appearance.theme === "dark" ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-all duration-300 ${appearance.theme === "dark" ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">Animasi & Transisi</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">Aktifkan efek animasi yang halus</p>
                  </div>
                  <button
                    onClick={() => setAppearance({ ...appearance, animations: !appearance.animations })}
                    className={`w-12 h-6 rounded-full transition-all duration-300 ${appearance.animations ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-all duration-300 ${appearance.animations ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-700 mt-4">
                <button onClick={handleSaveAppearance} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium hover:shadow-lg transition flex items-center gap-2">
                  <Save size={16} /> Simpan Pengaturan
                </button>
              </div>
            </div>

            {/* KEAMANAN */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-700">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                  <Shield size={20} className="text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Keamanan Akun</h2>
                  <p className="text-sm text-gray-400 dark:text-gray-500">Atur pengaturan keamanan akun Anda</p>
                </div>
              </div>

              <div className="space-y-4 mt-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">Autentikasi Dua Faktor (2FA)</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">Lapisan keamanan tambahan untuk akun Anda</p>
                  </div>
                  <button
                    onClick={() => setSecurity({ ...security, twoFactor: !security.twoFactor })}
                    className={`w-12 h-6 rounded-full transition-all duration-300 ${security.twoFactor ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-all duration-300 ${security.twoFactor ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">Sesi Berakhir</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">Waktu sesi login berakhir otomatis</p>
                  </div>
                  <select
                    value={security.sessionTimeout}
                    onChange={(e) => setSecurity({ ...security, sessionTimeout: e.target.value })}
                    className="px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  >
                    <option value="15">15 menit</option>
                    <option value="30">30 menit</option>
                    <option value="60">1 jam</option>
                    <option value="120">2 jam</option>
                    <option value="480">8 jam</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-700 mt-4">
                <button onClick={handleSaveSecurity} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium hover:shadow-lg transition flex items-center gap-2">
                  <Save size={16} /> Simpan Pengaturan
                </button>
              </div>

              {/* Danger Zone */}
              <div className="pt-4 mt-4 border-t-2 border-red-200 dark:border-red-800">
                <div className="flex items-center gap-3 pb-4">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                    <AlertCircle size={20} className="text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-md font-semibold text-red-600 dark:text-red-400">Danger Zone</h3>
                    <p className="text-sm text-gray-400 dark:text-gray-500">Tindakan yang bersifat permanen</p>
                  </div>
                </div>

                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">Hapus Semua Data</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Menghapus semua event, tamu, dan feedback</p>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm("PERINGATAN! Tindakan ini tidak dapat dibatalkan. Yakin ingin menghapus semua data?")) {
                          alert("Fitur ini akan diimplementasikan dengan backend nanti.");
                        }
                      }}
                      className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition flex items-center gap-2"
                    >
                      <Trash2 size={16} />
                      Hapus Semua
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}