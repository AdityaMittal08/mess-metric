import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Crown, Medal, Leaf, Coins, Wind } from "lucide-react";

export function LeaderboardContent() {
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState([]); 
  
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const response = await fetch(`${API_URL}/api/leaderboard/`);
        const data = await response.json();

        if (!response.ok) throw new Error(data.message || "Failed to fetch leaderboard");
        setLeaderboardData(data);
      } catch (error) {
        console.error("Error:", error);
        setError("Unable to connect to server. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = leaderboardData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(leaderboardData.length / itemsPerPage);

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  // Split data for the Podium (Top 3) vs the List (Rest)
  const isFirstPage = currentPage === 1;
  const topThree = isFirstPage ? currentItems.slice(0, 3) : [];
  const listItems = isFirstPage ? currentItems.slice(3) : currentItems;

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Dynamic Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
          <span className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 bg-clip-text text-transparent drop-shadow-sm">
            Eco-Warriors Leaderboard
          </span>
        </h1>
        <p className="text-lg text-slate-500 font-medium">
          Ranking the campus champions of sustainability.
        </p>
      </motion.div>

      {/* Loading & Error States */}
      {isLoading && (
        <div className="flex justify-center items-center py-20 text-emerald-600 animate-pulse font-bold text-lg gap-2">
          <Leaf className="animate-bounce" /> Calculating Rankings...
        </div>
      )}
      
      {error && (
        <div className="text-center py-10 text-rose-500 bg-rose-50 border border-rose-200 rounded-2xl font-bold">
          {error}
        </div>
      )}

      {!isLoading && !error && (
        <>
          {/* 🏆 THE PODIUM (Only visible on Page 1) */}
          {isFirstPage && topThree.length >= 3 && (
            <div className="flex flex-row justify-center items-end gap-3 md:gap-6 mb-16 mt-8 px-2">
              
              {/* Rank 2: Silver */}
              <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="w-1/3 max-w-[200px] bg-gradient-to-t from-slate-200 to-slate-50 rounded-t-3xl border-t-4 border-slate-300 p-4 flex flex-col items-center text-center h-[220px] justify-start pt-8 relative shadow-lg"
              >
                <div className="absolute -top-8 bg-slate-100 p-3 rounded-full border-4 border-white shadow-md">
                  <Medal className="w-8 h-8 text-slate-400" />
                </div>
                <div className="bg-slate-300 text-slate-700 w-12 h-12 rounded-full flex items-center justify-center font-black text-xl mb-3 shadow-inner">2</div>
                <h3 className="font-bold text-slate-800 line-clamp-1 text-sm md:text-base">{topThree[1]?.name || "Unknown"}</h3>
                <p className="text-sm font-black text-emerald-600 mt-2 flex items-center gap-1"><Coins className="w-3 h-3"/> {topThree[1]?.mealCoins || 0}</p>
              </motion.div>

              {/* Rank 1: Gold */}
              <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="w-1/3 max-w-[220px] bg-gradient-to-t from-yellow-200 to-amber-50 rounded-t-3xl border-t-4 border-yellow-400 p-4 flex flex-col items-center text-center h-[280px] justify-start pt-10 relative shadow-2xl z-10"
              >
                <div className="absolute -top-10 bg-yellow-400 p-4 rounded-full border-4 border-white shadow-xl">
                  <Crown className="w-10 h-10 text-white drop-shadow-md" />
                </div>
                <div className="bg-yellow-400 text-yellow-900 w-16 h-16 rounded-full flex items-center justify-center font-black text-3xl mb-3 shadow-inner ring-4 ring-yellow-200">1</div>
                <h3 className="font-black text-slate-900 text-base md:text-lg line-clamp-1">{topThree[0]?.name || "Unknown"}</h3>
                <p className="text-lg font-black text-emerald-600 mt-2 flex items-center gap-1 bg-white px-3 py-1 rounded-full shadow-sm">
                  <Coins className="w-4 h-4"/> {topThree[0]?.mealCoins || 0}
                </p>
                <div className="text-xs font-bold text-amber-700 mt-3 bg-amber-100 px-2 py-1 rounded-md">⭐ Top Saver</div>
              </motion.div>

              {/* Rank 3: Bronze */}
              <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="w-1/3 max-w-[200px] bg-gradient-to-t from-orange-200 to-orange-50 rounded-t-3xl border-t-4 border-orange-300 p-4 flex flex-col items-center text-center h-[190px] justify-start pt-8 relative shadow-lg"
              >
                <div className="absolute -top-8 bg-orange-100 p-3 rounded-full border-4 border-white shadow-md">
                  <Medal className="w-8 h-8 text-orange-500" />
                </div>
                <div className="bg-orange-300 text-orange-800 w-12 h-12 rounded-full flex items-center justify-center font-black text-xl mb-3 shadow-inner">3</div>
                <h3 className="font-bold text-slate-800 line-clamp-1 text-sm md:text-base">{topThree[2]?.name || "Unknown"}</h3>
                <p className="text-sm font-black text-emerald-600 mt-2 flex items-center gap-1"><Coins className="w-3 h-3"/> {topThree[2]?.mealCoins || 0}</p>
              </motion.div>

            </div>
          )}

          {/* 📋 THE LIST (Ranks 4+) */}
          <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-4 md:p-8 shadow-sm border border-slate-200/60">
            <div className="space-y-3">
              {listItems.length > 0 ? (
                listItems.map((student, index) => {
                  const studentRank = isFirstPage ? index + 4 : (currentPage - 1) * itemsPerPage + index + 1;
                  
                  // SAFETY CHECK: Ensure mealCoins defaults to 0 to prevent NaN errors
                  const currentCoins = student.mealCoins || 0;
                  const estimatedMeals = Math.floor(currentCoins / 10);
                  const estimatedCO2 = (estimatedMeals * 0.8).toFixed(1);

                  return (
                    <motion.div
                      key={student._id || studentRank} 
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.01, translateX: 5 }}
                      className="flex items-center justify-between p-4 md:p-5 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-100 group"
                    >
                      {/* Left: Rank & Info */}
                      <div className="flex items-center space-x-4 md:space-x-6">
                        <div className="w-10 text-center font-black text-slate-400 text-lg group-hover:text-emerald-500 transition-colors">
                          #{studentRank}
                        </div>

                        <div className="hidden md:flex bg-emerald-100 text-emerald-600 items-center justify-center w-12 h-12 rounded-full font-bold shadow-inner">
                          {student.name ? student.name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase() : "??"}
                        </div>

                        <div>
                          <div className="font-bold text-slate-800 capitalize text-base md:text-lg">{student.name || "Student"}</div>
                          <div className="text-xs text-slate-500 font-medium">{student.email}</div>
                        </div>
                      </div>

                      {/* Right: Stats */}
                      <div className="flex items-center space-x-6 md:space-x-12 text-sm">
                        <div className="hidden md:block text-center">
                          <div className="font-black text-slate-700 flex items-center justify-center gap-1"><Leaf className="w-4 h-4 text-emerald-500"/> {estimatedMeals}</div>
                          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mt-1">Meals Saved</div>
                        </div>
                        <div className="hidden sm:block text-center">
                          <div className="font-black text-slate-700 flex items-center justify-center gap-1"><Wind className="w-4 h-4 text-blue-500"/> {estimatedCO2}kg</div>
                          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mt-1">CO₂ Reduced</div>
                        </div>
                        <div className="text-right md:text-center bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
                          <div className="font-black text-emerald-600 text-lg">{currentCoins}</div>
                          <div className="text-[10px] uppercase tracking-wider text-emerald-700/60 font-bold">Coins</div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="text-center text-slate-500 py-10 font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                  No more eco-warriors found.
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Pagination Container */}
      {!isLoading && !error && leaderboardData.length > itemsPerPage && (
        <div className="flex justify-center mt-10">
          <div className="flex items-center gap-2 bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors ${currentPage === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100 hover:text-emerald-600'}`}
            >
              Prev
            </button>

            <div className="flex items-center gap-1 px-2">
              {pageNumbers.map((number) => (
                <button
                  key={number}
                  onClick={() => setCurrentPage(number)}
                  className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                    currentPage === number 
                      ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30" 
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {number}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors ${currentPage === totalPages ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100 hover:text-emerald-600'}`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </main>
  );
}