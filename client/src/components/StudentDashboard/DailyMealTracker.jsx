import { useState, useEffect } from "react";
import { Coffee, Sun, Sunset, Moon, Check, Loader2, ScanFace, AlertCircle } from "lucide-react"; 
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function DailyMealTracker({user}) {
  const [mealStatus, setMealStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(null);
  const [errorLog, setErrorLog] = useState(null);

  const todayDate = new Date();
  const currentDayName = todayDate.toLocaleDateString('en-US', { weekday: 'long' }); 
  const formattedDate = todayDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  
  const getISTHour = () => {
    const now = new Date();
    return parseInt(
      now.toLocaleTimeString("en-US", {
        timeZone: "Asia/Kolkata",
        hour: "numeric",
        hour12: false,
      })
    );
  };

  const hour = getISTHour();
  let greeting = "Good Night";

  if (hour >= 5 && hour < 12) greeting = "Good Morning";
  else if (hour >= 12 && hour < 17) greeting = "Good Afternoon";
  else if (hour >= 17 && hour < 24) greeting = "Good Evening";

  useEffect(() => {
    const fetchMenuAndStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        
        // 1. Fetch data safely
        const [menuRes, reqsRes] = await Promise.allSettled([
          axios.get(`${API_URL}/api/menu/today`),
          token ? axios.get(`${API_URL}/api/meals/my-requests`, {
            headers: { Authorization: `Bearer ${token}` }
          }) : Promise.resolve({ data: null })
        ]);

        // 2. Safely extract Menu Data (matching your menu.controller.js)
        let menuData = [];
        if (menuRes.status === "fulfilled" && menuRes.value?.data) {
           // Your backend returns { day: "...", meals: [...] } for /today
           menuData = menuRes.value.data.meals || menuRes.value.data.data || [];
        }

        if (!menuData || menuData.length === 0) {
           throw new Error("Menu returned empty from server");
        }

        // 3. Safely extract Skip Requests
        let skipReqs = [];
        if (reqsRes.status === "fulfilled" && reqsRes.value?.data) {
            const resData = reqsRes.value.data;
            skipReqs = resData.skipRequests || resData.data?.skipRequests || [];
        }

        // Filter skip requests to only apply to TODAY
        const todayString = new Date().toISOString().split('T')[0];
        const todaysSkips = skipReqs.filter(req => {
            if (!req.createdAt && !req.date) return true; 
            const reqDate = new Date(req.createdAt || req.date).toISOString().split('T')[0];
            return reqDate === todayString;
        });

        const icons = { Breakfast: Coffee, Lunch: Sun, Snacks: Sunset, Dinner: Moon };
        
        // 4. Map the data to the UI
        const fetchedMeals = menuData.map((meal, index) => {
          // Find if there is a skip request for this specific meal today
          const skipRequest = todaysSkips.find(req => req.mealType === meal.type);

          return {
            id: meal._id || `fallback-${index}`,
            type: meal.type || "Unknown Meal",
            time: meal.time || "Scheduled",
            // 👇 Fixed: Read the string directly as it comes from your backend
            menu: meal.menu || "Menu not updated", 
            icon: icons[meal.type] || Sun,
            isEating: !skipRequest, 
            skipStatus: skipRequest ? skipRequest.status : null 
          };
        });
        
        setMealStatus(fetchedMeals);
      } catch (error) {
        console.error("Dashboard Fetch Error:", error);
        setErrorLog(error.message);
        
        // Failsafe state
        setMealStatus([
          { id: "b1", type: "Breakfast", time: "07:30 - 09:30", menu: "Idli, Vada, Sambar", icon: Coffee, isEating: true, skipStatus: null },
          { id: "l1", type: "Lunch", time: "12:30 - 14:30", menu: "Rajma Chawal, Mix Veg", icon: Sun, isEating: true, skipStatus: null },
          { id: "s1", type: "Snacks", time: "17:00 - 18:00", menu: "Samosa, Tea", icon: Sunset, isEating: true, skipStatus: null },
          { id: "d1", type: "Dinner", time: "19:30 - 21:30", menu: "Aloo Gobhi, Dal Fry", icon: Moon, isEating: true, skipStatus: null },
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMenuAndStatus();
  }, []);
  
  const toggleMeal = async (id, type, currentStatus) => {
  setIsUpdating(id);
  const newStatus = !currentStatus;

  // 1. Optimistic UI Update: change it immediately in the browser
  setMealStatus((prevMeals) =>
    prevMeals.map((meal) => (meal.id === id ? { ...meal, isEating: newStatus } : meal))
  );

  try {
    // 2. If turning OFF, notify the backend
    if (!newStatus) {
      const token = localStorage.getItem("token");
      if (token) {
        await axios.post(
          `${API_URL}/api/meals/skip`,
          { mealType: type },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // If successful, we stay OFF
      }
    }
  } catch (error) {
    console.error("Failed to submit skip request:", error);
    // 3. REVERT: If the API fails, turn the switch back ON
    setMealStatus((prevMeals) =>
      prevMeals.map((meal) => (meal.id === id ? { ...meal, isEating: currentStatus } : meal))
    );
    alert("Could not process skip request. Please check your connection.");
  } finally {
    setIsUpdating(null);
  }
};

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-emerald-600 animate-pulse">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p className="font-medium">Loading your meals...</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      
      {errorLog && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>Connection issue: {errorLog}. Showing offline menu.</span>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 flex flex-wrap items-center gap-2">
          {greeting}, <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent break-words max-w-full">{user?.name || 'Student'}</span>
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="bg-emerald-100 px-2 py-0.5 rounded text-sm font-bold text-emerald-800 whitespace-nowrap">
            {currentDayName}
          </span>
          <span className="bg-slate-100 px-2 py-0.5 rounded text-sm font-medium text-slate-600 whitespace-nowrap">
            {formattedDate}
          </span>
          <span className="text-sm text-slate-500 hidden sm:inline">- Don't forget to mark your meals for today.</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mealStatus.map((meal) => {
          const Icon = meal.icon;
          const isProcessing = isUpdating === meal.id;
          
          return (
            <div 
              key={meal.id} 
              className={`relative rounded-2xl border transition-all duration-300 ${
                meal.isEating 
                  ? "bg-white border-emerald-100 shadow-lg shadow-emerald-50" 
                  : meal.skipStatus === "Approved"
                    ? "bg-blue-50/40 border-blue-200 shadow-md shadow-blue-50" 
                    : "bg-amber-50/40 border-amber-200 shadow-md shadow-amber-50" 
              }`}
            >
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2.5 rounded-xl ${meal.isEating ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <button
                    onClick={() => toggleMeal(meal.id, meal.type, meal.isEating)}
                    disabled={isProcessing || meal.skipStatus === "Approved"}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none disabled:opacity-50 ${
                      meal.isEating ? "bg-emerald-500" : "bg-slate-300"
                    }`}
                  >
                    {isProcessing ? (
                      <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-white animate-spin" />
                    ) : (
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-300 ${
                          meal.isEating ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    )}
                  </button>
                </div>

                <div className="mb-2">
                  <h3 className={`text-lg font-bold ${meal.isEating ? "text-slate-800" : "text-slate-500"}`}>
                    {meal.type}
                  </h3>
                  <p className="text-xs font-medium text-slate-400">{meal.time}</p>
                </div>

                <div className="min-h-[60px]">
                  <p className={`text-sm leading-relaxed ${meal.isEating ? "text-slate-600" : "text-slate-400 line-through"}`}>
                    {meal.menu}
                  </p>
                </div>
              </div>

              <div className={`px-5 py-3 border-t rounded-b-2xl flex items-center justify-between text-xs font-medium ${
                meal.isEating 
                  ? "bg-emerald-50/50 border-emerald-100 text-emerald-700" 
                  : meal.skipStatus === "Approved"
                    ? "bg-blue-100/50 border-blue-200 text-blue-700"
                    : "bg-amber-100/50 border-amber-200 text-amber-700"
              }`}>
                <div className="flex items-center gap-1.5">
                  {meal.isEating ? (
                     <Check className="w-3.5 h-3.5" /> 
                  ) : meal.skipStatus === "Approved" ? (
                     <Check className="w-4 h-4 text-blue-600" />
                  ) : (
                     <ScanFace className="w-4 h-4 animate-pulse" />
                  )}

                  {meal.isEating 
                      ? "Registered" 
                      : meal.skipStatus === "Approved"
                          ? "Skip Approved"
                          : "Pending Biometric"}
                </div>
                {!meal.isEating && (
                  <span className={`px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                      meal.skipStatus === "Approved"
                          ? "text-blue-700 bg-blue-200/60 border-blue-300 shadow-sm"
                          : "text-amber-700 bg-amber-200/60 border-amber-300"
                  }`}>
                    {meal.skipStatus === "Approved" ? (
                       <>🪙 +50 Coins</>
                    ) : (
                       <><Loader2 className="w-3 h-3 animate-spin" /> Awaiting</>
                    )}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}