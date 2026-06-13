"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Gift,
  Plus,
  Trash2,
  Trophy,
  Users,
  Sparkles,
  RefreshCw,
  CheckCircle,
  Clock,
  ChevronRight,
  Ticket,
  Award,
  PartyPopper,
  Zap,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

// Tipe data hadiah
interface Prize {
  id: number;
  name: string;
  quantity: number;
  winners: Winner[];
}

// Tipe data pemenang
interface Winner {
  id: number;
  guestId: number;
  guestName: string;
  guestEmail: string;
  prizeId: number;
  prizeName: string;
  drawnAt: string;
}

// Data tamu yang sudah check-in (sementara)
const checkedInGuests = [
  { id: 1, name: "Budi Santoso", email: "budi@email.com", checkedInAt: "09:15" },
  { id: 2, name: "Dewi Sartika", email: "dewi@email.com", checkedInAt: "09:30" },
  { id: 3, name: "Cahya Wijaya", email: "cahya@email.com", checkedInAt: "09:45" },
  { id: 4, name: "Anisa Rahma", email: "anisa@email.com", checkedInAt: "10:00" },
  { id: 5, name: "Rizki Fauzan", email: "rizki@email.com", checkedInAt: "10:15" },
  { id: 6, name: "Sinta Melati", email: "sinta@email.com", checkedInAt: "10:30" },
  { id: 7, name: "Bagas Putra", email: "bagas@email.com", checkedInAt: "10:45" },
  { id: 8, name: "Maya Sari", email: "maya@email.com", checkedInAt: "11:00" },
];

export default function DoorprizePage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userName, setUserName] = useState("EO");
  const [selectedEvent, setSelectedEvent] = useState(1);
  const [prizes, setPrizes] = useState<Prize[]>([
    { id: 1, name: "Voucher Belanja Rp100.000", quantity: 3, winners: [] },
    { id: 2, name: "Power Bank 10.000mAh", quantity: 2, winners: [] },
    { id: 3, name: "Earbuds Bluetooth", quantity: 1, winners: [] },
    { id: 4, name: "Tiket Nonton Film", quantity: 5, winners: [] },
  ]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnWinner, setDrawnWinner] = useState<Winner | null>(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [newPrizeName, setNewPrizeName] = useState("");
  const [newPrizeQuantity, setNewPrizeQuantity] = useState(1);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userName");
    router.push("/login");
  };

  // Ambil daftar tamu yang belum jadi pemenang
  const getAvailableGuests = () => {
    const allWinnerGuestIds = prizes.flatMap((p) => p.winners.map((w) => w.guestId));
    return checkedInGuests.filter((guest) => !allWinnerGuestIds.includes(guest.id));
  };

  // Lakukan undian
  const drawWinner = (prize: Prize) => {
    const availableGuests = getAvailableGuests();
    
    if (availableGuests.length === 0) {
      alert("Tidak ada tamu yang tersisa untuk diundi!");
      return;
    }
    
    if (prize.winners.length >= prize.quantity) {
      alert(`Hadiah ${prize.name} sudah mencapai kuota (${prize.quantity} pemenang)!`);
      return;
    }
    
    setIsDrawing(true);
    
    // Animasi delay biar dramatis
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * availableGuests.length);
      const winner = availableGuests[randomIndex];
      
      const newWinner: Winner = {
        id: Date.now(),
        guestId: winner.id,
        guestName: winner.name,
        guestEmail: winner.email,
        prizeId: prize.id,
        prizeName: prize.name,
        drawnAt: new Date().toLocaleTimeString(),
      };
      
      setPrizes(prizes.map((p) =>
        p.id === prize.id
          ? { ...p, winners: [...p.winners, newWinner] }
          : p
      ));
      
      setDrawnWinner(newWinner);
      setShowWinnerModal(true);
      setIsDrawing(false);
    }, 1000);
  };

  // Reset semua pemenang
  const resetAllWinners = () => {
    if (confirm("Yakin ingin mereset semua pemenang? Undian harus diulang dari awal.")) {
      setPrizes(prizes.map((p) => ({ ...p, winners: [] })));
    }
  };

  // Tambah hadiah baru
  const addPrize = () => {
    if (!newPrizeName.trim()) {
      alert("Nama hadiah harus diisi!");
      return;
    }
    
    setPrizes([
      ...prizes,
      {
        id: Date.now(),
        name: newPrizeName,
        quantity: newPrizeQuantity,
        winners: [],
      },
    ]);
    setNewPrizeName("");
    setNewPrizeQuantity(1);
  };

  // Hapus hadiah
  const deletePrize = (id: number) => {
    if (confirm("Yakin ingin menghapus hadiah ini?")) {
      setPrizes(prizes.filter((p) => p.id !== id));
    }
  };

  const totalWinners = prizes.reduce((sum, p) => sum + p.winners.length, 0);
  const totalQuota = prizes.reduce((sum, p) => sum + p.quantity, 0);
  const availableGuestsCount = getAvailableGuests().length;

  // Data event (sementara)
  const events = [
    { id: 1, name: "Seminar Digital Marketing", date: "15 Juni 2026" },
    { id: 2, name: "Workshop Next.js", date: "20 Juni 2026" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout} />

      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} userName={userName} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
          
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Gift className="text-purple-600" size={28} />
              Doorprize & Undian
            </h1>
            <p className="text-gray-400 text-sm">Kelola hadiah dan lakukan undian untuk tamu yang hadir</p>
          </div>

          {/* Pilih Event */}
          <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
            {events.map((event) => (
              <button
                key={event.id}
                onClick={() => setSelectedEvent(event.id)}
                className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${
                  selectedEvent === event.id
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {event.name}
              </button>
            ))}
          </div>

          {/* Stat Ringkasan */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Hadiah</p>
                  <p className="text-2xl font-bold text-gray-800">{prizes.length}</p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Gift size={20} className="text-purple-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Pemenang</p>
                  <p className="text-2xl font-bold text-green-600">{totalWinners} / {totalQuota}</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Trophy size={20} className="text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Tamu Tersisa</p>
                  <p className="text-2xl font-bold text-blue-600">{availableGuestsCount}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users size={20} className="text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Tombol Reset Semua */}
          {totalWinners > 0 && (
            <div className="flex justify-end mb-6">
              <button
                onClick={resetAllWinners}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-all duration-200"
              >
                <RefreshCw size={16} />
                Reset Semua Pemenang
              </button>
            </div>
          )}

          {/* Form Tambah Hadiah */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Plus size={18} className="text-purple-600" />
              Tambah Hadiah Baru
            </h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Nama hadiah (contoh: Voucher Rp50.000)"
                value={newPrizeName}
                onChange={(e) => setNewPrizeName(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm">Jumlah:</span>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={newPrizeQuantity}
                  onChange={(e) => setNewPrizeQuantity(parseInt(e.target.value) || 1)}
                  className="w-20 px-3 py-2 border border-gray-200 rounded-xl text-center focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
                <button
                  onClick={addPrize}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg transition-all duration-300"
                >
                  Tambah
                </button>
              </div>
            </div>
          </div>

          {/* Daftar Hadiah & Undian */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {prizes.map((prize) => {
              const remaining = prize.quantity - prize.winners.length;
              const isComplete = prize.winners.length >= prize.quantity;
              
              return (
                <div
                  key={prize.id}
                  className={`bg-white rounded-2xl shadow-sm border transition-all duration-300 overflow-hidden ${
                    isComplete ? "border-green-200 bg-green-50/30" : "border-gray-100"
                  }`}
                >
                  {/* Header Hadiah */}
                  <div className="p-5 border-b border-gray-100">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                          <Ticket size={18} className="text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">{prize.name}</h3>
                          <p className="text-sm text-gray-500">
                            Kuota: {prize.winners.length} / {prize.quantity}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => deletePrize(prize.id)}
                        className="text-gray-400 hover:text-red-500 transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="px-5 pt-4">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                        style={{ width: `${(prize.winners.length / prize.quantity) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Tombol Undi & Daftar Pemenang */}
                  <div className="p-5">
                    {!isComplete ? (
                      <button
                        onClick={() => drawWinner(prize)}
                        disabled={isDrawing || availableGuestsCount === 0}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isDrawing ? (
                          <>
                            <RefreshCw size={18} className="animate-spin" />
                            Mengundi...
                          </>
                        ) : (
                          <>
                            <Sparkles size={18} />
                            Undi {prize.name}
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="text-center py-2 text-green-600 flex items-center justify-center gap-2">
                        <CheckCircle size={18} />
                        Kuota terpenuhi!
                      </div>
                    )}

                    {/* Daftar Pemenang */}
                    {prize.winners.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                          🎉 Pemenang 🎉
                        </p>
                        <div className="space-y-2">
                          {prize.winners.map((winner) => (
                            <div
                              key={winner.id}
                              className="flex items-center justify-between p-2 bg-purple-50 rounded-lg"
                            >
                              <div>
                                <p className="font-medium text-gray-800 text-sm">{winner.guestName}</p>
                                <p className="text-xs text-gray-500">{winner.guestEmail}</p>
                              </div>
                              <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                                {winner.drawnAt}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Jika belum ada hadiah */}
          {prizes.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Belum ada hadiah</h3>
              <p className="text-gray-400 text-sm mt-1">Tambahkan hadiah di atas untuk mulai undian</p>
            </div>
          )}

          {/* Daftar Semua Pemenang */}
          {totalWinners > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-6">
              <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Award size={18} className="text-purple-600" />
                  Semua Pemenang ({totalWinners})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Nama</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Hadiah</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Waktu Undian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {prizes.flatMap((prize) =>
                      prize.winners.map((winner) => (
                        <tr key={winner.id} className="hover:bg-gray-50">
                          <td className="px-6 py-3 text-gray-800 font-medium">{winner.guestName}</td>
                          <td className="px-6 py-3 text-gray-500 text-sm">{winner.guestEmail}</td>
                          <td className="px-6 py-3">
                            <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700">
                              {winner.prizeName}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-gray-500 text-sm">{winner.drawnAt}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Winner Animation */}
      {showWinnerModal && drawnWinner && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center animate-bounce">
            <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <PartyPopper size={40} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">🎉 SELAMAT! 🎉</h2>
            <p className="text-gray-600 mb-4">{drawnWinner.guestName}</p>
            <div className="bg-purple-100 rounded-xl p-4 mb-4">
              <p className="text-sm text-gray-500">Mendapatkan</p>
              <p className="text-xl font-bold text-purple-600">{drawnWinner.prizeName}</p>
            </div>
            <button
              onClick={() => setShowWinnerModal(false)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:shadow-lg transition"
            >
              Lanjutkan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}