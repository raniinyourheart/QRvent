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

export default function SettingsPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userName, setUserName] = useState("EO");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailFeedback: true,
    emailDoorprize: true,
    pushCheckin: true,
    weeklyReport: true,
  });

  // Appearance settings
  const [appearance, setAppearance] = useState({
    theme: "light",
    animations: true,
  });

  // Security settings
  const [security, setSecurity] = useState({
    twoFactor: false,
    sessionTimeout: "30",
  });

  useEffect(() => {
    const name = localStorage.getItem("userName");
    if (name) setUserName(name);
  }, []);

  const showSuccess = (message: string) => {
    setSaveMessage(message);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setSaveMessage("");
    }, 3000);
  };

  const handleSaveNotifications = () => showSuccess("Pengaturan notifikasi disimpan!");
  const handleSaveAppearance = () => showSuccess("Pengaturan tampilan disimpan!");
  const handleSaveSecurity = () => showSuccess("Pengaturan keamanan disimpan!");

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

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
          
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Settings className="text-gray-600" size={28} />
              Pengaturan
            </h1>
            <p className="text-gray-400 text-sm">Atur preferensi notifikasi, tampilan, dan keamanan</p>
          </div>

          {saveSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-green-700">
              <CheckCircle size={18} />
              {saveMessage}
            </div>
          )}

          <div className="space-y-6">
            
            {/* NOTIFIKASI */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Bell size={20} className="text-purple-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Preferensi Notifikasi</h2>
                  <p className="text-sm text-gray-400">Atur notifikasi yang ingin Anda terima</p>
                </div>
              </div>

              <div className="space-y-4 mt-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-800">Feedback Baru</p>
                    <p className="text-sm text-gray-400">Dapatkan email saat ada feedback baru</p>
                  </div>
                  <button
                    onClick={() => setNotifications({ ...notifications, emailFeedback: !notifications.emailFeedback })}
                    className={`w-12 h-6 rounded-full transition-all duration-300 ${notifications.emailFeedback ? "bg-blue-600" : "bg-gray-300"}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-all duration-300 ${notifications.emailFeedback ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-800">Pemenang Doorprize</p>
                    <p className="text-sm text-gray-400">Dapatkan notifikasi saat undian dilakukan</p>
                  </div>
                  <button
                    onClick={() => setNotifications({ ...notifications, emailDoorprize: !notifications.emailDoorprize })}
                    className={`w-12 h-6 rounded-full transition-all duration-300 ${notifications.emailDoorprize ? "bg-blue-600" : "bg-gray-300"}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-all duration-300 ${notifications.emailDoorprize ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-800">Check-in Peserta</p>
                    <p className="text-sm text-gray-400">Notifikasi realtime saat peserta check-in</p>
                  </div>
                  <button
                    onClick={() => setNotifications({ ...notifications, pushCheckin: !notifications.pushCheckin })}
                    className={`w-12 h-6 rounded-full transition-all duration-300 ${notifications.pushCheckin ? "bg-blue-600" : "bg-gray-300"}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-all duration-300 ${notifications.pushCheckin ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-800">Laporan Mingguan</p>
                    <p className="text-sm text-gray-400">Ringkasan aktivitas event setiap minggu</p>
                  </div>
                  <button
                    onClick={() => setNotifications({ ...notifications, weeklyReport: !notifications.weeklyReport })}
                    className={`w-12 h-6 rounded-full transition-all duration-300 ${notifications.weeklyReport ? "bg-blue-600" : "bg-gray-300"}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-all duration-300 ${notifications.weeklyReport ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 mt-4">
                <button onClick={handleSaveNotifications} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium hover:shadow-lg transition flex items-center gap-2">
                  <Save size={16} /> Simpan Pengaturan
                </button>
              </div>
            </div>

            {/* TAMPILAN */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Palette size={20} className="text-green-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Tampilan Aplikasi</h2>
                  <p className="text-sm text-gray-400">Atur tema dan preferensi tampilan</p>
                </div>
              </div>

              <div className="space-y-4 mt-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    {appearance.theme === "light" ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-blue-500" />}
                    <div>
                      <p className="font-medium text-gray-800">Mode Gelap</p>
                      <p className="text-sm text-gray-400">Tampilan gelap untuk kenyamanan mata</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setAppearance({ ...appearance, theme: appearance.theme === "light" ? "dark" : "light" })}
                    className={`w-12 h-6 rounded-full transition-all duration-300 ${appearance.theme === "dark" ? "bg-blue-600" : "bg-gray-300"}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-all duration-300 ${appearance.theme === "dark" ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-800">Animasi & Transisi</p>
                    <p className="text-sm text-gray-400">Aktifkan efek animasi yang halus</p>
                  </div>
                  <button
                    onClick={() => setAppearance({ ...appearance, animations: !appearance.animations })}
                    className={`w-12 h-6 rounded-full transition-all duration-300 ${appearance.animations ? "bg-blue-600" : "bg-gray-300"}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-all duration-300 ${appearance.animations ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 mt-4">
                <button onClick={handleSaveAppearance} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium hover:shadow-lg transition flex items-center gap-2">
                  <Save size={16} /> Simpan Pengaturan
                </button>
              </div>
            </div>

            {/* KEAMANAN */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <Shield size={20} className="text-red-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Keamanan Akun</h2>
                  <p className="text-sm text-gray-400">Atur pengaturan keamanan akun Anda</p>
                </div>
              </div>

              <div className="space-y-4 mt-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-800">Autentikasi Dua Faktor (2FA)</p>
                    <p className="text-sm text-gray-400">Lapisan keamanan tambahan untuk akun Anda</p>
                  </div>
                  <button
                    onClick={() => setSecurity({ ...security, twoFactor: !security.twoFactor })}
                    className={`w-12 h-6 rounded-full transition-all duration-300 ${security.twoFactor ? "bg-blue-600" : "bg-gray-300"}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-all duration-300 ${security.twoFactor ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-800">Sesi Berakhir</p>
                    <p className="text-sm text-gray-400">Waktu sesi login berakhir otomatis</p>
                  </div>
                  <select
                    value={security.sessionTimeout}
                    onChange={(e) => setSecurity({ ...security, sessionTimeout: e.target.value })}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
                  >
                    <option value="15">15 menit</option>
                    <option value="30">30 menit</option>
                    <option value="60">1 jam</option>
                    <option value="120">2 jam</option>
                    <option value="480">8 jam</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 mt-4">
                <button onClick={handleSaveSecurity} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium hover:shadow-lg transition flex items-center gap-2">
                  <Save size={16} /> Simpan Pengaturan
                </button>
              </div>

              {/* Danger Zone */}
              <div className="pt-4 mt-4 border-t-2 border-red-200">
                <div className="flex items-center gap-3 pb-4">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                    <AlertCircle size={20} className="text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-md font-semibold text-red-600">Danger Zone</h3>
                    <p className="text-sm text-gray-400">Tindakan yang bersifat permanen</p>
                  </div>
                </div>

                <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <p className="font-medium text-gray-800">Hapus Semua Data</p>
                      <p className="text-sm text-gray-500">Menghapus semua event, tamu, dan feedback</p>
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