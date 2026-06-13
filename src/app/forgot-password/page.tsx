"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, ArrowLeft, AlertCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email!");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      localStorage.setItem("resetEmail", email);
      router.push("/forgot-password/verify");
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-5 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-500 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-700 rounded-full blur-[120px] animate-pulse" />
      </div>

      <div className="relative w-[500px]">
        <div className="bg-black rounded-2xl border border-blue-500/50 shadow-[0_0_50px_rgba(37,99,235,0.3)] p-8">

          <div className="flex justify-start items-center mb-8 mt-3">
            <Link
              href="/login"
              className="flex items-center gap-2 text-gray-400 hover:text-blue-400 text-sm transition"
            >
              <ArrowLeft size={16} />
              Back to Login
            </Link>
          </div>

          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.5)]">
              <Mail size={36} className="text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white text-center mb-2">
            Forgot Password?
          </h1>

          <p className="text-gray-400 text-sm text-center mb-8">
            Enter your email and we'll send you a 6-digit code to reset your
            password
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <Mail
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-transparent outline-none text-white py-3 border-b border-gray-700 focus:border-blue-500 transition-all duration-300 placeholder:text-gray-500 pl-16"
              />
            </div>

            {error && (
              <div className="flex items-center justify-center gap-2 text-red-400 text-sm bg-red-500/10 py-2 px-3 rounded-lg border border-red-500/20">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-[50px] rounded-full text-white font-semibold bg-gradient-to-r from-blue-600 to-blue-700 shadow-[0_0_25px_rgba(37,99,235,0.4)] hover:shadow-[0_0_35px_rgba(37,99,235,0.6)] transition-all duration-300 hover:scale-[1.02] disabled:opacity-60 disabled:scale-100 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending Code...
                </>
              ) : (
                "Send Code"
              )}
            </button>
          </form>

        </div>
      </div>
    </main>
  );
}