import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { motion } from 'motion/react';

const AiWasteChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const getDayName = (offset) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return days[d.getDay()];
  };

  useEffect(() => {
    const fetchForecast = async () => {
      const forecastData = [];
      const today = new Date().getDay();

      for (let i = 0; i < 7; i++) {
        const dayIndex = (today + i) % 7;
        const isWeekend = (dayIndex === 0 || dayIndex === 6) ? 1 : 0;
        const mockAttendance = Math.floor(1100 + Math.random() * 200);

        try {
          // 👇 Use the Smart URL
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
          const response = await axios.post(`${API_URL}/api/ai/predict`, {
            attendance: mockAttendance,
            day_of_week: dayIndex,
            is_weekend: isWeekend,
            is_special_event: 0
          });

          forecastData.push({
            day: getDayName(i),
            waste: parseFloat(response.data.data.predicted_waste_kg.toFixed(1)), // Round to 1 decimal
            attendance: mockAttendance
          });
        } catch (error) {
          forecastData.push({ day: getDayName(i), waste: 40 + i, attendance: 1200 });
        }
      }

      setData(forecastData);
      setLoading(false);
    };

    fetchForecast();
  }, []);

  if (loading) return <div className="text-center p-10 text-emerald-600 animate-pulse">🧠 AI is calculating forecast...</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-xl shadow-lg border border-emerald-100"
    >
      <div className="flex justify-between items-end mb-6">
        <div>
           <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-2xl">📉</span> AI Waste Forecast
          </h2>
          <p className="text-sm text-gray-500 ml-9">Predicted waste for the next 7 days</p>
        </div>
        <div className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-medium">
          Live Model v1.0
        </div>
      </div>
      
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorWaste" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            
            <XAxis 
              dataKey="day" 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#9ca3af', fontSize: 12}} 
              dy={10} // Pushes labels down slightly to avoid clutter
            />
            
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#9ca3af', fontSize: 12}} 
              tickFormatter={(value) => `${value}`} // Just numbers on axis to save space
            />
            
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#ffffff', 
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
              }}
              formatter={(value) => [`${value} kg`, "Predicted Waste"]}
              labelStyle={{ color: '#374151', fontWeight: 'bold', marginBottom: '5px' }}
              cursor={{ stroke: '#10b981', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            
            <Area 
              type="monotone" 
              dataKey="waste" 
              stroke="#10b981" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorWaste)" 
              animationDuration={2000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default AiWasteChart;