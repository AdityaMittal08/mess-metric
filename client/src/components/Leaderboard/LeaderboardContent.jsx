import { motion } from "motion/react";
import { useState, useEffect } from "react";

export function LeaderboardContent() {
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState([]); 
  
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        // 👇 USE THE CLOUD URL
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const url = `${API_URL}/api/leaderboard/`; 

        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch leaderboard");
        }

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

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  const handleClick = (number) => {
    setCurrentPage(number);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="bg-gradient-to-r from-yellow-600 via-amber-600 to-orange-600 bg-clip-text text-transparent">
            Green Champion Leaderboard
          </span>
        </h1>
        <p className="text-xl text-gray-600">
          Celebrating our sustainability heroes
        </p>
      </motion.div>

      {isLoading && (
        <div className="text-center py-10 text-amber-600">Loading leaderboard...</div>
      )}
      
      {error && (
        <div className="text-center py-10 text-red-500 bg-red-50 rounded-lg">
          {error}
        </div>
      )}


      {!isLoading && !error && (
        <div className="bg-white/80 backdrop-blur-sm">
          <div className="p-6">
            <div className="space-y-2">
              {currentItems.length > 0 ? (
                currentItems.map((student, index) => {
                  const rankColors = {
                    1: "bg-amber-500",
                    2: "bg-gray-400",
                    3: "bg-orange-400",
                  };

                  const studentRank = (currentPage - 1) * itemsPerPage + index + 1;
                  const bgColor = rankColors[studentRank] || "bg-gray-100 text-gray-700";
                  const estimatedMeals = Math.floor(student.mealCoins / 10);
                  const estimatedCO2 = (estimatedMeals * 0.8).toFixed(1);

                  return (
                    <motion.div
                      key={studentRank || index} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 bg-white rounded-xl hover:shadow-lg transition-shadow border border-gray-100"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`flex items-center justify-center w-10 h-10 rounded-full ${bgColor} font-bold ${
                            studentRank <= 3 ? "text-white" : "text-gray-700"
                          }`}
                        >
                          {studentRank}
                        </div>

                        <div className="w-12 h-12">
                          <div className="bg-green-100 text-green-700 flex items-center justify-center w-12 h-12 rounded-full font-bold">
                            {student.name
                              ? student.name.split(" ").map((n) => n[0]).join("").substring(0, 2)
                              : "??"}
                          </div>
                        </div>

                        <div>
                          <div className="font-semibold capitalize">{student.name}</div>
                          <div className="text-sm text-gray-600">
                            {student.email} 
                          </div>
                        </div>
                      </div>

                      <div className="hidden md:flex items-center space-x-20 text-sm">
                        <div className="text-center">
                          <div className="font-bold">{estimatedMeals}</div>
                          <div className="text-xs text-gray-600">Meals</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold">{estimatedCO2} kg</div>
                          <div className="text-xs text-gray-600">CO₂</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-amber-600">
                            {student.mealCoins}
                          </div>
                          <div className="text-xs text-gray-600">Coins</div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="text-center text-gray-500 py-4">
                  No students found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!isLoading && !error && leaderboardData.length > 0 && (
        <div className="flex justify-center">
          <div className="flex justify-center gap-10 mt-5 border-orange-500 border-2 p-3 rounded-2xl text-base font-semibold w-fit">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`cursor-pointer ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-yellow-600'}`}
            >
              Previous
            </button>

            {totalPages <= 7 ? (
                pageNumbers.map((number) => (
                <button
                    key={number}
                    onClick={() => handleClick(number)}
                    className={
                    currentPage === number ? "text-orange-600" : "text-yellow-500"
                    }
                >
                    {number}
                </button>
                ))
            ) : (
                <span className="text-gray-600">Page {currentPage} of {totalPages}</span>
            )}

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`cursor-pointer ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-yellow-600'}`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </main>
  );
}