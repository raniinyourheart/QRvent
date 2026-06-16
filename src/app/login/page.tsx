"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Home, Eye, EyeOff } from "lucide-react";
import { authAPI } from "@/lib/api";

export default function AuthPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Login form state
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Sign Up form state
  const [signupUsername, setSignupUsername] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  // Handle Login dengan API
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!loginUsername.trim() || !loginPassword.trim()) {
      setError("Username dan password harus diisi!");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await authAPI.login({
        username: loginUsername,
        password: loginPassword,
      });
      
      const { token, user } = response.data;
      
      // Simpan token dan data user
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userName", user.name || user.username);
      
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Login gagal! Periksa username dan password.");
      setIsLoading(false);
    }
  };

  // Handle Sign Up dengan API
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!signupUsername.trim()) {
      setError("Username harus diisi!");
      return;
    }
    if (!signupEmail.trim() || !signupEmail.includes("@")) {
      setError("Email valid harus diisi!");
      return;
    }
    if (!signupPassword.trim() || signupPassword.length < 4) {
      setError("Password minimal 4 karakter!");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Register user
      await authAPI.register({
        username: signupUsername,
        email: signupEmail,
        password: signupPassword,
        name: signupUsername,
      });
      
      // Auto login setelah register
      const loginResponse = await authAPI.login({
        username: signupUsername,
        password: signupPassword,
      });
      
      const { token, user } = loginResponse.data;
      
      // Simpan token dan data user
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userName", user.name || user.username);
      
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.response?.data?.message || "Registrasi gagal! Mungkin username atau email sudah terdaftar.");
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setIsSignUp(!isSignUp);
    setError("");
    setLoginUsername("");
    setLoginPassword("");
    setSignupUsername("");
    setSignupEmail("");
    setSignupPassword("");
    setShowPassword(false);
  };

  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-5 relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-500 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-700 rounded-full blur-[120px] animate-pulse" />
      </div>

      <div className="relative w-[1200px] h-[700px] border border-blue-600 overflow-hidden shadow-[0_0_50px_#2563eb] bg-[#05000d] rounded-2xl">
        
        {/* Panel Biru yang bergerak */}
        <div
          className="absolute inset-0 transition-all duration-[1500ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
          style={{
            clipPath: isSignUp
              ? "polygon(0 0, 55% 0, 30% 100%, 0 100%)"
              : "polygon(32% 0, 100% 0, 100% 100%, 67% 100%)",
            background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)",
            boxShadow: "inset 0 0 80px rgba(59,130,246,0.5)",
          }}
        />

        {/* LOGIN FORM */}
        <form
          onSubmit={handleLogin}
          className={`
            absolute top-0 left-0 w-1/2 h-full flex items-center
            transition-all duration-[1000ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]
            ${isSignUp 
              ? "opacity-0 -translate-x-24 scale-90 blur-md pointer-events-none" 
              : "opacity-100 translate-x-0 scale-100 blur-0 pointer-events-auto"}
          `}
        >
          <div className="ml-20 w-[420px]">
            {/* Header dengan Kembali ke Beranda */}
            <div className="flex justify-start items-center mb-20">
              <Link 
                href="/" 
                className="flex items-center gap-2 text-white hover:text-blue-300 text-sm transition-all duration-300 hover:scale-105"
              >
                <Home size={16} />
                <span>Kembali ke Beranda</span>
              </Link>
            </div>
            
            <h1 className="text-white text-5xl font-bold mb-12 drop-shadow-[0_0_20px_rgba(59,130,246,0.8)] text-center">
              Login
            </h1>

            <div className="space-y-10">
              {/* Username */}
              <div className="relative group">
                <User size={18} className="absolute left-0 top-1/2 -translate-y-1/2 text-white group-hover:text-blue-400 transition-all duration-300" />
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="Username"
                  className="w-full bg-transparent outline-none text-white py-3 border-b border-white/50 focus:border-blue-400 transition-all duration-300 group-hover:border-blue-400 placeholder-white/40 pl-10"
                  disabled={isLoading}
                />
              </div>

              {/* Password */}
              <div className="relative group">
                <Lock size={18} className="absolute left-0 top-1/2 -translate-y-1/2 text-white group-hover:text-blue-400 transition-all duration-300" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-transparent outline-none text-white py-3 border-b border-white/50 focus:border-blue-400 transition-all duration-300 group-hover:border-blue-400 placeholder-white/40 pl-10 pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-white hover:text-blue-400 transition-all duration-300"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Forgot Password */}
              <div className="text-right -mt-4">
                <Link 
                  href="/forgot-password"
                  className="text-blue-300 hover:text-blue-200 text-sm font-medium transition-all duration-300 hover:scale-105 inline-block"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-red-400 text-sm text-center bg-red-500/10 py-2 rounded-lg">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-[55px] rounded-full text-white font-semibold bg-gradient-to-r from-blue-600 to-blue-800 shadow-[0_0_25px_#2563eb] hover:shadow-[0_0_45px_#3b82f6] transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Login"
                )}
              </button>

              {/* Switch to Sign Up */}
              <div className="text-center">
                <p className="text-white/80 text-sm">
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={switchMode}
                    className="text-blue-400 hover:text-blue-300 transition-all duration-300 hover:scale-105 inline-block font-medium"
                  >
                    Sign Up
                  </button>
                </p>
              </div>
            </div>
          </div>
        </form>

        {/* SIGNUP FORM */}
        <form
          onSubmit={handleSignUp}
          className={`
            absolute top-0 right-0 w-1/2 h-full flex items-center
            transition-all duration-[1000ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]
            ${isSignUp 
              ? "opacity-100 translate-x-0 scale-100 blur-0 pointer-events-auto" 
              : "opacity-0 translate-x-24 scale-90 blur-md pointer-events-none"}
          `}
        >
          <div className="w-[420px] ml-10">
            {/* Spacer (tidak ada Kembali ke Beranda di Sign Up) */}
            <div className="h-12 mb-8"></div>
            
            <h1 className="text-white text-4xl font-bold mb-8 drop-shadow-[0_0_20px_rgba(59,130,246,0.8)] text-center">
              Sign Up
            </h1>

            <div className="space-y-6">
              {/* Username */}
              <div className="relative group">
                <User size={18} className="absolute left-0 top-1/2 -translate-y-1/2 text-white group-hover:text-blue-400 transition-all duration-300" />
                <input
                  type="text"
                  value={signupUsername}
                  onChange={(e) => setSignupUsername(e.target.value)}
                  placeholder="Username"
                  className="w-full bg-transparent outline-none text-white border-b border-white/50 pb-3 focus:border-blue-400 transition-all duration-300 group-hover:border-blue-400 placeholder-white/40 pl-10"
                  disabled={isLoading}
                />
              </div>

              {/* Email */}
              <div className="relative group">
                <Mail size={18} className="absolute left-0 top-1/2 -translate-y-1/2 text-white group-hover:text-blue-400 transition-all duration-300" />
                <input
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full bg-transparent outline-none text-white border-b border-white/50 pb-3 focus:border-blue-400 transition-all duration-300 group-hover:border-blue-400 placeholder-white/40 pl-10"
                  disabled={isLoading}
                />
              </div>

              {/* Password */}
              <div className="relative group">
                <Lock size={18} className="absolute left-0 top-1/2 -translate-y-1/2 text-white group-hover:text-blue-400 transition-all duration-300" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-transparent outline-none text-white border-b border-white/50 pb-3 focus:border-blue-400 transition-all duration-300 group-hover:border-blue-400 placeholder-white/40 pl-10 pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-white hover:text-blue-400 transition-all duration-300"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-red-400 text-sm text-center bg-red-500/10 py-2 rounded-lg">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-[55px] rounded-full text-white font-semibold bg-gradient-to-r from-blue-600 to-blue-800 shadow-[0_0_25px_#2563eb] hover:shadow-[0_0_45px_#3b82f6] transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Sign Up"
                )}
              </button>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative px-4 text-white/50 text-sm bg-transparent">Atau</div>
              </div>

              {/* Google Sign Up */}
              <button
                type="button"
                className="w-full h-[50px] rounded-full bg-white/5 border border-white/20 text-white font-medium flex items-center justify-center gap-3 hover:bg-white/10 hover:border-blue-400/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all duration-300 group"
                onClick={() => alert("Fitur Google Login akan segera hadir!")}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="group-hover:text-blue-300 transition">Sign Up with Google</span>
              </button>

              {/* Switch to Login */}
              <div className="text-center mt-4">
                <p className="text-white/80 text-sm">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={switchMode}
                    className="text-blue-400 hover:text-blue-300 transition-all duration-300 hover:scale-105 inline-block font-medium"
                  >
                    Login
                  </button>
                </p>
              </div>
            </div>
          </div>
        </form>

        {/* WELCOME TEXT */}
        <div
          className={`
            absolute top-0 h-full w-[40%] flex items-center
            transition-all duration-[1500ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]
            ${isSignUp ? "left-0" : "right-0"}
          `}
        >
          <div className={`px-16 text-white ${isSignUp ? "pl-16" : "text-right pr-16 ml-auto"}`}>
            <h1 className="text-6xl font-bold leading-tight drop-shadow-[0_0_25px_rgba(59,130,246,0.8)]">
              WELCOME
              <br />
              BACK!
            </h1>
            <p className="mt-6 text-xl text-white/80">
              Sign in to continue
              <br />
              managing your events
              <br />
              seamlessly
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}