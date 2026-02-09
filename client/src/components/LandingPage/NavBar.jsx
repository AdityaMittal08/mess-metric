import { Leaf } from "lucide-react";
import { Link } from "react-router-dom";

export function NavBar() {
  return (
    <>
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-green-100 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              
              {/* Logo Section */}
              <div className="flex items-center space-x-2">
                <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-1.5 md:p-2 rounded-xl">
                  <Leaf className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                {/* 👇 FIXED: Smaller text on mobile (text-lg) -> Big on Desktop (text-2xl) */}
                <span className="text-lg md:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">
                  Mess-Metric
                </span>
              </div>

              {/* 👇 FIXED: Added 'hidden' so this DISAPPEARS on mobile */}
              <nav className="hidden md:flex space-x-6">
                <a
                  href="#features"
                  className="text-gray-600 hover:text-green-600 transition"
                >
                  Features
                </a>
                <a
                  href="/leaderboard"
                  className="text-gray-600 hover:text-green-600 transition"
                >
                  Leaderboard
                </a>
                <a
                  href="/"
                  className="text-gray-600 hover:text-green-600 transition"
                >
                  About
                </a>
                <a
                  href="/store"
                  className="text-gray-600 hover:text-green-600 transition"
                >
                  Store
                </a>
              </nav>

              {/* Get Started Button */}
              <Link to="/register">
                {/* 👇 FIXED: Adjusted padding and font size for mobile */}
                <button className="px-3 py-2 md:px-4 md:py-2 text-sm md:text-base rounded-lg text-white bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 whitespace-nowrap shadow-sm font-medium">
                Get Started
                </button>
              </Link>
            </div>
          </div>
        </header>
    </>
  );
}