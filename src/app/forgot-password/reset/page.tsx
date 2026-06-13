"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters!");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      setSuccess(true);
      
      // Hapus data reset dari localStorage
      localStorage.removeItem("resetEmail");
      
      // Redirect ke login setelah 2 detik
      setTimeout(() => {
        router.push("/login");
      }, 2000);
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
          
          {!success ? (
            <>
              <div className="flex justify-start items-center mb-8">
                <Link href="/forgot-password/verify" className="flex items-center gap-2 text-gray-400 hover:text-blue-400 text-sm transition">
                  <Lock size={16} />
                  Back
                </Link>
              </div>

              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.5)]">
                  <Lock size={36} className="text-white" />
                </div>
              </div>

              <h1 className="text-3xl font-bold text-white text-center mb-2">Reset Password</h1>
              <p className="text-gray-400 text-sm text-center mb-8">
                Enter your new password below
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative group">
                  <Lock size={18} className="absolute left-0 bottom-3 text-gray-400 group-hover:text-blue-400 transition" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password"
                    className="w-full bg-transparent outline-none text-white py-3 border-b border-gray-700 focus:border-blue-500 transition placeholder:text-gray-500 pl-8"
                  />
                </div>

                <div className="relative group">
                  <Lock size={18} className="absolute left-0 bottom-3 text-gray-400 group-hover:text-blue-400 transition" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full bg-transparent outline-none text-white py-3 border-b border-gray-700 focus:border-blue-500 transition placeholder:text-gray-500 pl-8 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 bottom-3 text-gray-400 hover:text-blue-400 transition"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
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
                    <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Resetting...</>
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/30">
                  <CheckCircle size={36} className="text-green-400" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Password Reset Successfully!</h1>
              <p className="text-gray-400 text-sm mb-6">
                Your password has been changed. Redirecting to login...
              </p>
              <Link href="/login" className="text-blue-400 hover:text-blue-300 text-sm transition">
                Go to Login →
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}