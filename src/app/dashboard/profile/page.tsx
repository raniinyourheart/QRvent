"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  Building,
  Briefcase,
  MapPin,
  Calendar,
  Camera,
  Save,
  CheckCircle,
  AlertCircle,
  Edit2,
  Key,
  Eye,
  EyeOff,
  Globe,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import api from "@/lib/api";

interface ProfileData {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  location: string;
  bio: string;
  website: string;
  avatar: string;
  joinDate: string;
  totalEvents: number;
  totalGuests: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userName, setUserName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "stats">("profile");
  const [isLoading, setIsLoading] = useState(true);
  
  // Password states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile data
  const [profile, setProfile] = useState<ProfileData>({
    id: 1,
    name: "",
    email: "",
    phone: "",
    company: "",
    position: "",
    location: "",
    bio: "",
    website: "",
    avatar: "",
    joinDate: "",
    totalEvents: 0,
    totalGuests: 0,
  });

  // Ambil user login dan data profile
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        // Ambil data user dari localStorage (dari login response)
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setProfile(prev => ({
            ...prev,
            id: userData.id,
            name: userData.name || userData.username,
            email: userData.email,
          }));
          setUserName(userData.name || userData.username);
        }

        // Ambil detail profil dari API
        try {
          const response = await api.get("/profile");
          const profileData = response.data;
          setProfile(prev => ({
            ...prev,
            phone: profileData.phone || "",
            company: profileData.company || "",
            position: profileData.position || "",
            location: profileData.location || "",
            bio: profileData.bio || "",
            website: profileData.website || "",
            avatar: profileData.avatar || "",
            joinDate: profileData.joinDate || "2026",
          }));
        } catch (error) {
          console.log("Profile API not ready yet, using defaults");
        }

        // Ambil statistik dari dashboard API
        try {
          const statsResponse = await api.get("/dashboard/stats");
          setProfile(prev => ({
            ...prev,
            totalEvents: statsResponse.data.totalEvents || 0,
            totalGuests: statsResponse.data.totalGuests || 0,
          }));
        } catch (error) {
          console.log("Stats API not ready yet");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile((prev) => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      // Update profile via API
      await api.put("/profile", {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        company: profile.company,
        position: profile.position,
        location: profile.location,
        bio: profile.bio,
        website: profile.website,
        avatar: profile.avatar,
      });

      // Update localStorage
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        userData.name = profile.name;
        userData.email = profile.email;
        localStorage.setItem("user", JSON.stringify(userData));
      }
      localStorage.setItem("userName", profile.name);
      setUserName(profile.name);
      
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Gagal menyimpan profil!");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reload data
    window.location.reload();
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!passwordData.currentPassword) {
      setPasswordError("Masukkan password saat ini!");
      return;
    }
    if (passwordData.newPassword.length < 4) {
      setPasswordError("Password baru minimal 4 karakter!");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Konfirmasi password tidak cocok!");
      return;
    }

    try {
      await api.patch("/profile/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setPasswordSuccess("Password berhasil diubah!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => setPasswordSuccess(""), 3000);
    } catch (error: any) {
      setPasswordError(error.response?.data?.message || "Gagal mengubah password!");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading profile...</p>
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

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <User className="text-blue-600" size={28} />
                Profil Saya
              </h1>
              <p className="text-gray-400 text-sm">Kelola informasi akun dan profil Anda</p>
            </div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-lg transition-all duration-300"
              >
                <Edit2 size={16} />
                Edit Profil
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-lg transition"
                >
                  <Save size={16} />
                  Simpan
                </button>
              </div>
            )}
          </div>

          {/* Success Message */}
          {saveSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-green-700">
              <CheckCircle size={18} />
              Profil berhasil diperbarui!
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* LEFT COLUMN - Avatar & Info Ringkas */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
                <div className="relative inline-block">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mx-auto overflow-hidden">
                    {profile.avatar ? (
                      <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-5xl text-white font-bold">
                        {profile.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  {isEditing && (
                    <>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition"
                      >
                        <Camera size={16} />
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </>
                  )}
                </div>
                <h2 className="text-xl font-bold text-gray-800 mt-4">{profile.name}</h2>
                <p className="text-blue-600 text-sm">{profile.position || "Event Organizer"}</p>
                <p className="text-gray-400 text-sm mt-1">{profile.company || "QRvent"}</p>
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                    <Calendar size={14} />
                    <span>Bergabung {profile.joinDate}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-800 mb-3">Statistik Event</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">Total Event</span>
                    <span className="text-2xl font-bold text-blue-600">{profile.totalEvents}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">Total Tamu</span>
                    <span className="text-2xl font-bold text-blue-600">{profile.totalGuests.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden mt-2">
                    <div className="w-2/3 h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" />
                  </div>
                  <p className="text-xs text-gray-400 text-center mt-2">★ Event Organizer Professional</p>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Tabs */}
              <div className="flex gap-2 border-b">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`px-5 py-2.5 font-medium transition-all duration-200 ${
                    activeTab === "profile"
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  📝 Informasi Profil
                </button>
                <button
                  onClick={() => setActiveTab("stats")}
                  className={`px-5 py-2.5 font-medium transition-all duration-200 ${
                    activeTab === "stats"
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  📊 Statistik
                </button>
              </div>

              {/* TAB PROFIL */}
              {activeTab === "profile" && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                        {isEditing ? (
                          <input
                            name="name"
                            value={profile.name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          />
                        ) : (
                          <p className="text-gray-800 py-2">{profile.name}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        {isEditing ? (
                          <input
                            name="email"
                            type="email"
                            value={profile.email}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          />
                        ) : (
                          <p className="text-gray-800 py-2">{profile.email}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">No. Telepon</label>
                        {isEditing ? (
                          <input
                            name="phone"
                            value={profile.phone}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          />
                        ) : (
                          <p className="text-gray-800 py-2">{profile.phone || "-"}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Perusahaan/Organisasi</label>
                        {isEditing ? (
                          <input
                            name="company"
                            value={profile.company}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          />
                        ) : (
                          <p className="text-gray-800 py-2">{profile.company || "-"}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan</label>
                        {isEditing ? (
                          <input
                            name="position"
                            value={profile.position}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          />
                        ) : (
                          <p className="text-gray-800 py-2">{profile.position || "-"}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi</label>
                        {isEditing ? (
                          <input
                            name="location"
                            value={profile.location}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          />
                        ) : (
                          <p className="text-gray-800 py-2">{profile.location || "-"}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bio Singkat</label>
                      {isEditing ? (
                        <textarea
                          name="bio"
                          value={profile.bio}
                          onChange={handleChange}
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      ) : (
                        <p className="text-gray-600 py-2 leading-relaxed">{profile.bio || "-"}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                      {isEditing ? (
                        <input
                          name="website"
                          value={profile.website}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      ) : (
                        <p className="text-blue-600 py-2">{profile.website || "-"}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB STATISTIK */}
              {activeTab === "stats" && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-semibold text-gray-800 mb-4">Ringkasan Event</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-xl">
                        <p className="text-3xl font-bold text-blue-600">{profile.totalEvents}</p>
                        <p className="text-sm text-gray-500">Total Event</p>
                      </div>
                      <div className="text-center p-4 bg-cyan-50 rounded-xl">
                        <p className="text-3xl font-bold text-cyan-600">{profile.totalGuests.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">Total Tamu</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-semibold text-gray-800 mb-4">Capaian</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Event Terselenggara</span>
                        <span className="font-medium text-gray-800">{profile.totalEvents} Event</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Peserta</span>
                        <span className="font-medium text-gray-800">{profile.totalGuests.toLocaleString()} Orang</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Tingkat Kehadiran Rata-rata</span>
                        <span className="font-medium text-green-600">76%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-6 text-white">
                    <h3 className="font-semibold mb-2">🎉 Selamat!</h3>
                    <p className="text-sm opacity-90">
                      Anda telah berhasil mengelola {profile.totalEvents} event dengan total {profile.totalGuests.toLocaleString()} tamu.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* UBAH PASSWORD SECTION */}
          <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <Key size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-md font-semibold text-gray-800">Ubah Password</h3>
                <p className="text-sm text-gray-400">Ganti password akun Anda</p>
              </div>
            </div>

            {passwordError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle size={16} />
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-green-600 text-sm">
                <CheckCircle size={16} />
                {passwordSuccess}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password Saat Ini</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-4 py-2 pr-10 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Masukkan password saat ini"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-4 py-2 pr-10 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Minimal 4 karakter"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password Baru</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2 pr-10 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Ulangi password baru"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-all duration-300 flex items-center gap-2"
              >
                <Key size={16} />
                Ubah Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}