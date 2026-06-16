"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  Star,
  Calendar,
  User,
  Mail,
  Search,
  Download,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  TrendingUp,
  Smile,
  Meh,
  Frown,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import api from "@/lib/api";

// Tipe data feedback
interface Feedback {
  id: number;
  guestName: string;
  guestEmail: string;
  eventId: number;
  eventName: string;
  rating: number;
  comment: string;
  createdAt: string;
  status: "read" | "unread";
}

interface Event {
  id: number;
  name: string;
}

export default function FeedbackPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userName, setUserName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<number | "all">("all");
  const [selectedRating, setSelectedRating] = useState<number | "all">("all");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "read" | "unread">("all");
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
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

  // Ambil data feedback dari API
  const fetchFeedbacks = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/feedbacks");
      setFeedbacks(response.data);
    } catch (error: any) {
      console.error("Error fetching feedbacks:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Ambil daftar event
  const fetchEvents = async () => {
    try {
      const response = await api.get("/events");
      setEvents(response.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
    fetchEvents();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  // Tandai sebagai sudah dibaca
  const markAsRead = async (id: number) => {
    try {
      await api.patch(`/feedbacks/${id}/read`);
      setFeedbacks(feedbacks.map((fb) =>
        fb.id === id ? { ...fb, status: "read" } : fb
      ));
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  // Hapus feedback
  const deleteFeedback = async (id: number) => {
    if (!confirm("Yakin ingin menghapus feedback ini?")) return;
    
    try {
      await api.delete(`/feedbacks/${id}`);
      setFeedbacks(feedbacks.filter((fb) => fb.id !== id));
      if (selectedFeedback?.id === id) setShowDetailModal(false);
    } catch (error) {
      console.error("Error deleting feedback:", error);
      alert("Gagal menghapus feedback!");
    }
  };

  // Export ke CSV
  const exportToCSV = () => {
    const filtered = getFilteredFeedbacks();
    if (filtered.length === 0) {
      alert("Tidak ada data untuk diexport!");
      return;
    }

    const csvData = filtered.map((fb) => ({
      "Nama": fb.guestName,
      "Email": fb.guestEmail,
      "Event": fb.eventName,
      "Rating": fb.rating,
      "Komentar": fb.comment,
      "Tanggal": fb.createdAt,
      "Status": fb.status === "read" ? "Sudah Dibaca" : "Belum Dibaca",
    }));
    
    const headers = Object.keys(csvData[0]);
    const csvRows = [
      headers.join(","),
      ...csvData.map(row => headers.map(h => `"${row[h as keyof typeof row]}"`).join(",")),
    ];
    
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `feedback_qrevnt_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filter feedback
  const getFilteredFeedbacks = () => {
    return feedbacks.filter((fb) => {
      const matchesSearch = fb.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            fb.guestEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            fb.comment.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesEvent = selectedEvent === "all" || fb.eventId === selectedEvent;
      const matchesRating = selectedRating === "all" || fb.rating === selectedRating;
      const matchesStatus = selectedStatus === "all" || fb.status === selectedStatus;
      return matchesSearch && matchesEvent && matchesRating && matchesStatus;
    });
  };

  const filteredFeedbacks = getFilteredFeedbacks();
  
  const stats = {
    total: feedbacks.length,
    unread: feedbacks.filter((fb) => fb.status === "unread").length,
    averageRating: feedbacks.length > 0 
      ? (feedbacks.reduce((sum, fb) => sum + fb.rating, 0) / feedbacks.length).toFixed(1)
      : "0",
    fiveStar: feedbacks.filter((fb) => fb.rating === 5).length,
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            className={star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
          />
        ))}
      </div>
    );
  };

  const getRatingIcon = (rating: number) => {
    if (rating >= 4) return <Smile size={20} className="text-green-500" />;
    if (rating === 3) return <Meh size={20} className="text-yellow-500" />;
    return <Frown size={20} className="text-red-500" />;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading feedback...</p>
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
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <MessageSquare className="text-blue-600" size={28} />
              Feedback & Evaluasi
            </h1>
            <p className="text-gray-400 text-sm">Lihat dan kelola feedback dari peserta event</p>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <p className="text-gray-400 text-sm">Total Feedback</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <p className="text-gray-400 text-sm">Belum Dibaca</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.unread}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <p className="text-gray-400 text-sm">Rating Rata-rata</p>
              <p className="text-2xl font-bold text-blue-600">{stats.averageRating} / 5</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <p className="text-gray-400 text-sm">⭐ Bintang 5</p>
              <p className="text-2xl font-bold text-green-600">{stats.fiveStar}</p>
            </div>
          </div>

          {/* Filter Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari nama, email, atau komentar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value === "all" ? "all" : parseInt(e.target.value))}
                className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none"
              >
                <option value="all">Semua Event</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>{event.name}</option>
                ))}
              </select>
              <select
                value={selectedRating}
                onChange={(e) => setSelectedRating(e.target.value === "all" ? "all" : parseInt(e.target.value))}
                className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none"
              >
                <option value="all">Semua Rating</option>
                <option value={5}>⭐⭐⭐⭐⭐ (5)</option>
                <option value={4}>⭐⭐⭐⭐ (4)</option>
                <option value={3}>⭐⭐⭐ (3)</option>
                <option value={2}>⭐⭐ (2)</option>
                <option value={1}>⭐ (1)</option>
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none"
              >
                <option value="all">Semua Status</option>
                <option value="unread">Belum Dibaca</option>
                <option value="read">Sudah Dibaca</option>
              </select>
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 transition"
              >
                <Download size={16} />
                Export CSV
              </button>
            </div>
          </div>

          {/* Daftar Feedback */}
          {filteredFeedbacks.length > 0 ? (
            <div className="space-y-4">
              {filteredFeedbacks.map((feedback) => (
                <div
                  key={feedback.id}
                  className={`bg-white rounded-2xl shadow-sm border transition-all duration-300 hover:shadow-md ${
                    feedback.status === "unread" ? "border-l-4 border-l-yellow-500" : "border-gray-100"
                  }`}
                >
                  <div className="p-5">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                              <User size={14} className="text-white" />
                            </div>
                            <span className="font-medium text-gray-800">{feedback.guestName}</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-400 text-xs">
                            <Mail size={12} />
                            <span>{feedback.guestEmail}</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-400 text-xs">
                            <Calendar size={12} />
                            <span>{feedback.createdAt}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 mb-3">
                          {renderStars(feedback.rating)}
                          {getRatingIcon(feedback.rating)}
                          <span className="text-xs text-gray-400">{feedback.eventName}</span>
                          {feedback.status === "unread" && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-700 flex items-center gap-1">
                              <Clock size={10} />
                              Belum Dibaca
                            </span>
                          )}
                        </div>
                        
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                          "{feedback.comment}"
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedFeedback(feedback);
                            setShowDetailModal(true);
                          }}
                          className="p-2 text-gray-400 hover:text-blue-600 transition"
                          title="Lihat Detail"
                        >
                          <Eye size={18} />
                        </button>
                        {feedback.status === "unread" && (
                          <button
                            onClick={() => markAsRead(feedback.id)}
                            className="p-2 text-gray-400 hover:text-green-600 transition"
                            title="Tandai Sudah Dibaca"
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => deleteFeedback(feedback.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition"
                          title="Hapus"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Belum ada feedback</h3>
              <p className="text-gray-400 text-sm mt-1">Feedback dari peserta akan muncul di sini</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Detail Feedback */}
      {showDetailModal && selectedFeedback && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Detail Feedback</h2>
                <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600">
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <User size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{selectedFeedback.guestName}</p>
                  <p className="text-sm text-gray-500">{selectedFeedback.guestEmail}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>{selectedFeedback.eventName}</span>
                <span>{selectedFeedback.createdAt}</span>
              </div>
              
              <div className="flex items-center gap-2">
                {renderStars(selectedFeedback.rating)}
                {getRatingIcon(selectedFeedback.rating)}
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-700 leading-relaxed">{selectedFeedback.comment}</p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3">
              {selectedFeedback.status === "unread" && (
                <button
                  onClick={() => {
                    markAsRead(selectedFeedback.id);
                    setShowDetailModal(false);
                  }}
                  className="flex-1 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 transition"
                >
                  Tandai Sudah Dibaca
                </button>
              )}
              <button
                onClick={() => {
                  deleteFeedback(selectedFeedback.id);
                  setShowDetailModal(false);
                }}
                className="flex-1 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition"
              >
                Hapus Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}