import { useState, useEffect } from "react";
import { Coffee, Sun, Sunset, Moon, Check, X, Loader2, ScanFace } from "lucide-react"; 
import axios from "axios";

// ... (Keep your weeklyMenu exactly the same) ...
const weeklyMenu = {
  Monday: [
    { type: "Breakfast", time: "07:30 - 09:30", menu: "Idli, Vada, Sambar, Chutney", calories: 400, icon: Coffee },
    { type: "Lunch", time: "12:30 - 14:30", menu: "Rajma Chawal, Mix Veg, Curd, Roti", calories: 750, icon: Sun },
    { type: "Snacks", time: "17:00 - 18:00", menu: "Samosa, Tea", calories: 250, icon: Sunset },
    { type: "Dinner", time: "19:30 - 21:30", menu: "Aloo Gobhi, Dal Fry, Rice, Chapati", calories: 600, icon: Moon },
  ],
  Tuesday: [
    { type: "Breakfast", time: "07:30 - 09:30", menu: "Aloo Paratha, Curd, Pickle, Tea", calories: 500, icon: Coffee },
    { type: "Lunch", time: "12:30 - 14:30", menu: "Chole Bhature, Salad, Lassi", calories: 850, icon: Sun },
    { type: "Snacks", time: "17:00 - 18:00", menu: "Pasta, Coffee", calories: 300, icon: Sunset },
    { type: "Dinner", time: "19:30 - 21:30", menu: "Egg Curry, Jeera Rice, Salad", calories: 700, icon: Moon },
  ],
  Wednesday: [
    { type: "Breakfast", time: "07:30 - 09:30", menu: "Poha, Jalebi, Sev, Tea", calories: 450, icon: Coffee },
    { type: "Lunch", time: "12:30 - 14:30", menu: "Kadhi Pakora, Rice, Bhindi Fry", calories: 700, icon: Sun },
    { type: "Snacks", time: "17:00 - 18:00", menu: "Sandwich, Tea", calories: 200, icon: Sunset },
    { type: "Dinner", time: "19:30 - 21:30", menu: "Chicken Biryani / Veg Biryani, Raita", calories: 900, icon: Moon },
  ],
  Thursday: [
    { type: "Breakfast", time: "07:30 - 09:30", menu: "Uttapam, Coconut Chutney, Sambar", calories: 400, icon: Coffee },
    { type: "Lunch", time: "12:30 - 14:30", menu: "Dal Makhani, Naan, Salad", calories: 800, icon: Sun },
    { type: "Snacks", time: "17:00 - 18:00", menu: "Maggi, Coffee", calories: 350, icon: Sunset },
    { type: "Dinner", time: "19:30 - 21:30", menu: "Matar Paneer, Rice, Roti", calories: 650, icon: Moon },
  ],
  Friday: [
    { type: "Breakfast", time: "07:30 - 09:30", menu: "Puri Bhaji, Halwa, Tea", calories: 600, icon: Coffee },
    { type: "Lunch", time: "12:30 - 14:30", menu: "Sambhar Rice, Poriyal, Papad", calories: 700, icon: Sun },
    { type: "Snacks", time: "17:00 - 18:00", menu: "Bread Pakora, Tea", calories: 300, icon: Sunset },
    { type: "Dinner", time: "19:30 - 21:30", menu: "Fish Curry / Malai Kofta, Rice", calories: 750, icon: Moon },
  ],
  Saturday: [
    { type: "Breakfast", time: "07:30 - 09:30", menu: "Pav Bhaji, Chopped Onions", calories: 550, icon: Coffee },
    { type: "Lunch", time: "12:30 - 14:30", menu: "Khichdi, Begun Bhaja, Papad", calories: 500, icon: Sun },
    { type: "Snacks", time: "17:00 - 18:00", menu: "Biscuits, Tea", calories: 150, icon: Sunset },
    { type: "Dinner", time: "19:30 - 21:30", menu: "Paneer Chilli, Fried Rice", calories: 800, icon: Moon },
  ],
  Sunday: [
    { type: "Breakfast", time: "08:00 - 10:00", menu: "Masala Dosa, Sambar, Chutney", calories: 450, icon: Coffee },
    { type: "Lunch", time: "12:30 - 14:30", menu: "Chicken Curry / Paneer Butter Masala, Rice, Naan", calories: 950, icon: Sun },
    { type: "Snacks", time: "17:00 - 18:00", menu: "Corn Chat, Tea", calories: 200, icon: Sunset },
    { type: "Dinner", time: "19:30 - 21:30", menu: "Light Khichdi, Dahi", calories: 400, icon: Moon },
  ],
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function DailyMealTracker({user}) {
  const [mealStatus, setMealStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(null);

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
    const fetchMenu = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/menu/today`);
        const icons = { Breakfast: Coffee, Lunch: Sun, Snacks: Sunset, Dinner: Moon };
        const fetchedMeals = res.data.data.map((meal, index) => ({
          id: meal._id || index,
          type: meal.type,
          time: meal.time || "Scheduled",
          menu: meal.items.join(", "),
          icon: icons[meal.type] || Sun,
          isEating: true
        }));
        setMealStatus(fetchedMeals);
      } catch (error) {
        console.warn("Failed to fetch menu, falling back to local state.");
        setMealStatus([
          { id: "b1", type: "Breakfast", time: "07:30 - 09:30", menu: "Idli, Vada, Sambar", icon: Coffee, isEating: true },
          { id: "l1", type: "Lunch", time: "12:30 - 14:30", menu: "Rajma Chawal, Mix Veg", icon: Sun, isEating: true },
          { id: "s1", type: "Snacks", time: "17:00 - 18:00", menu: "Samosa, Tea", icon: Sunset, isEating: true },
          { id: "d1", type: "Dinner", time: "19:30 - 21:30", menu: "Aloo Gobhi, Dal Fry", icon: Moon, isEating: true },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);
  
  const toggleMeal = async (id, type, currentStatus) => {
    setIsUpdating(id);
    const newStatus = !currentStatus;

    try {
      // 1. Optimistic UI Update (change it immediately)
      setMealStatus((prevMeals) =>
        prevMeals.map((meal) => meal.id === id ? { ...meal, isEating: newStatus } : meal)
      );
      await new Promise(resolve => setTimeout(resolve, 800));

      // 3. (Optional) Your real backend call is commented out below for later
      /* const token = localStorage.getItem("token");
      if (token) {
        await axios.post(`${API_URL}/api/attendance/mark`, 
          { mealType: type, status: newStatus ? "present" : "pending_verification" },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      */
      
    } catch (error) {
      console.error("Failed to update attendance:", error);
      // Revert UI on failure
      setMealStatus((prevMeals) =>
        prevMeals.map((meal) => meal.id === id ? { ...meal, isEating: currentStatus } : meal)
      );
    } finally {
      setIsUpdating(null);
    }
  };

  if (!user || loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-emerald-600 animate-pulse">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p className="font-medium">Loading your meals...</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          {greeting}, <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">{user.name || 'Student'}</span>
        </h1>
        <p className="text-slate-500 mt-1 flex items-center gap-2">
          <span className="bg-emerald-100 px-2 py-0.5 rounded text-sm font-bold text-emerald-800">
            {currentDayName}
          </span>
          <span className="bg-slate-100 px-2 py-0.5 rounded text-sm font-medium text-slate-600">
            {formattedDate}
          </span>
          <span className="text-sm hidden sm:inline">- Don't forget to mark your meals for today.</span>
        </p>
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
                  : "bg-amber-50/40 border-amber-200 shadow-md shadow-amber-50" // <--- CHANGED STYLING
              }`}
            >
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2.5 rounded-xl ${meal.isEating ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <button
                    onClick={() => toggleMeal(meal.id, meal.type, meal.isEating)}
                    disabled={isProcessing}
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

              {/* 👇 UPDATED FOOTER TO SHOW PENDING STATUS 👇 */}
              <div className={`px-5 py-3 border-t rounded-b-2xl flex items-center justify-between text-xs font-medium ${
                meal.isEating 
                  ? "bg-emerald-50/50 border-emerald-100 text-emerald-700" 
                  : "bg-amber-100/50 border-amber-200 text-amber-700"
              }`}>
                <div className="flex items-center gap-1.5">
                  {meal.isEating ? <Check className="w-3.5 h-3.5" /> : <ScanFace className="w-4 h-4 animate-pulse" />}
                  {meal.isEating ? "Registered" : "Pending Biometric"}
                </div>
                {!meal.isEating && (
                  <span className="text-amber-700 bg-amber-200/60 px-2 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Awaiting
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