"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  User,
  Mail,
  MessageSquare,
  Send,
  Star,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

import api from "@/lib/api";

export default function FeedbackPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  
  const eventId = parseInt(params.eventId as string);
  const guestId = searchParams.get("guest");

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    guestName: "",
    guestEmail: "",
    rating: 0,
    comment: "",
  });

  useEffect(() => {
    const loadInitialData = async () => {
      if (!guestId) {
        setError("Link tidak valid. Parameter tamu tidak ditemukan.");
        setIsBlocked(true);
        setLoading(false);
        return;
      }

      try {
        const eventRes = await api.get(`/events/${eventId}`);
        setEvent(eventRes.data);

        const checkRes = await api.get(`/feedbacks/check?eventId=${eventId}&guestId=${guestId}`);
        
        setFormData((prev) => ({
          ...prev,
          guestName: checkRes.data.guestName,
          guestEmail: checkRes.data.guestEmail,
        }));

        if (checkRes.data.hasSubmitted) {
          setSuccess(true);
        }
      } catch (err: any) {
        const statusCode = err.response?.status;
        const errorMessage = err.response?.data?.message;

        if (statusCode === 403 || statusCode === 404) {
          setIsBlocked(true);
          setError(errorMessage ?? "Akses ditolak.");
        } else {
          setError(errorMessage ?? "Gagal memuat data halaman.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [eventId, guestId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.guestName.trim())
      return setError("Nama wajib diisi.");

    if (!formData.guestEmail.trim())
      return setError("Email wajib diisi.");

    if (formData.rating === 0)
      return setError("Silakan berikan rating.");

    setIsSubmitting(true);

    try {
      await api.post("/feedback", {
        eventId,
        guestId: guestId ? parseInt(guestId) : null,
        guestName: formData.guestName,
        guestEmail: formData.guestEmail,
        rating: formData.rating,
        comment: formData.comment,
      });

      setSuccess(true);
    } catch (err: any) {
      setError(
        err.response?.data?.message ??
          "Gagal mengirim feedback."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full w-12 h-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isBlocked) {
    return (
      <div className="min-h-screen min-w-full from-blue-600 to-cyan-300 bg-gradient-to-r flex items-center justify-center p-5">
        <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center py-12">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
            <AlertCircle size={42} className="text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Akses Ditolak</h2>
          <p className="text-gray-600 mb-8 px-4">{error}</p>
          <Link
            href="/"
            className="inline-block px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold hover:shadow-xl transition"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-w-full from-blue-600 to-cyan-300 bg-gradient-to-r flex items-center justify-center p-5">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        {!success ? (
          <>
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center mx-auto mb-4 text-white text-3xl font-bold">
                Q
              </div>

              <h1 className="text-3xl font-bold text-gray-800">
                Berikan Feedback
              </h1>

              <p className="text-gray-500 mt-2">
                Terima kasih telah menghadiri
              </p>

              <h2 className="font-semibold text-blue-600 mt-1">
                {event?.name}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <User
                  size={18}
                  className="absolute left-3 top-4 text-gray-400"
                />

                <input
                  type="text"
                  name="guestName"
                  placeholder="Nama Lengkap"
                  value={formData.guestName}
                  onChange={handleChange}
                  disabled={true}
                  className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 focus:outline-none focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-4 text-gray-400"
                />

                <input
                  type="email"
                  name="guestEmail"
                  placeholder="Email"
                  value={formData.guestEmail}
                  onChange={handleChange}
                  disabled={true}
                  className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 focus:outline-none focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>

              <div>
                <p className="font-medium text-gray-700 mb-3">
                  Rating Acara
                </p>

                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, rating: star }))
                      }
                    >
                      <Star
                        size={42}
                        className={
                          star <= formData.rating
                            ? "fill-yellow-400 text-yellow-400 transition"
                            : "text-gray-300 transition"
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <MessageSquare
                  size={18}
                  className="absolute left-3 top-4 text-gray-400"
                />

                <textarea
                  rows={5}
                  name="comment"
                  placeholder="Tulis kritik atau saran..."
                  value={formData.comment}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 resize-none focus:outline-none focus:border-blue-500"
                />
              </div>

              {error && (
                <div className="bg-red-50 rounded-xl p-3 text-red-600 flex gap-2 items-center">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 font-semibold hover:shadow-xl transition flex justify-center items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Kirim Feedback
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-6">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={42} className="text-green-600" />
            </div>

            <h2 className="text-3xl font-bold text-gray-800 mb-3">
              Terima Kasih!
            </h2>

            <p className="text-gray-500 mb-8">
              Feedback Anda berhasil dikirim.
            </p>

            <Link
              href="/"
              className="inline-block px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold hover:shadow-xl transition"
            >
              Kembali ke Beranda
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}