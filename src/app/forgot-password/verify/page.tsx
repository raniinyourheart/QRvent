"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Key, ArrowLeft, AlertCircle } from "lucide-react";

export default function VerifyOTPPage() {
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const savedEmail = localStorage.getItem("resetEmail");
    if (!savedEmail) {
      router.push("/forgot-password");
    } else {
      setEmail(savedEmail);
    }
  }, [router]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto focus ke input berikutnya
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join("");
    
    if (otpCode.length !== 6) {
      setError("Please enter the 6-digit code!");
      return;
    }
    
    setIsLoading(true);
    
    // Simulasi verifikasi OTP (untuk demo, OTP "123456")
    setTimeout(() => {
      if (otpCode === "123456") {
        router.push("/forgot-password/reset");
      } else {
        setError("Invalid code! Please try again.");
        setIsLoading(false);
      }
    }, 1000);
  };

  const handleResend = () => {
    setError("");
    // Simulasi kirim ulang OTP
    alert("A new 6-digit code has been sent to your email!");
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
          
          <div className="flex justify-start items-center mb-8">
            <Link href="/forgot-password" className="flex items-center gap-2 text-gray-400 hover:text-blue-400 text-sm transition">
              <ArrowLeft size={16} />
              Back
            </Link>
          </div>

          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.5)]">
              <Key size={36} className="text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white text-center mb-2">Verify Code</h1>
          <p className="text-gray-400 text-sm text-center mb-8">
            We've sent a 6-digit code to <span className="text-blue-400">{email}</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex justify-center gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-2xl font-bold text-white bg-transparent border-b-2 border-gray-700 focus:border-blue-500 outline-none transition"
                />
              ))}
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
              className="w-full h-[50px] rounded-full text-white font-semibold bg-gradient-to-r from-blue-600 to-blue-700 shadow-[0_0_25px_rgba(37,99,235,0.4)] hover:shadow-[0_0_35px_rgba(37,99,235,0.6)] transition hover:scale-[1.02] disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Verifying...</>
              ) : (
                "Verify Code"
              )}
            </button>

            <p className="text-center text-gray-500 text-sm">
              Didn't receive the code?{' '}
              <button type="button" onClick={handleResend} className="text-blue-400 hover:text-blue-300 transition">
                Resend
              </button>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}