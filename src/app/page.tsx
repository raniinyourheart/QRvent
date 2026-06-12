import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
          QRevnt
        </h1>
        <p className="text-xl text-white/80 mb-8">
          Platform Multievent Digital Guest Book & Smart Check-in
        </p>
        <Link
          href="/login"
          className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg"
        >
          Login sebagai EO
        </Link>
      </div>
    </div>
  );
}