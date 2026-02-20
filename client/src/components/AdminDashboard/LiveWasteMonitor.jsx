import React, { useState, useEffect } from "react";
import axios from "axios";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Trash2, Activity } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function LiveWasteMonitor() {
  const [liveData, setLiveData] = useState([]);
  const [totalWaste, setTotalWaste] = useState(0);

  useEffect(() => {
    const fetchLiveWaste = async () => {
      try {
        // Fetch the latest 20 logs from the backend
        const res = await axios.get(`${API_URL}/api/reports/waste-live`);
        const formattedData = res.data.data.map(log => ({
          time: new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second:'2-digit' }),
          waste: parseFloat(log.wasteKg)
        })).reverse(); // Reverse so newest is on the right
        
        setLiveData(formattedData);
        
        // Calculate a running total for the UI
        const currentTotal = formattedData.reduce((acc, curr) => acc + curr.waste, 0);
        setTotalWaste(currentTotal.toFixed(2));
      } catch (error) {
        console.error("Failed to fetch live waste data:", error);
      }
    };

    // Initial fetch
    fetchLiveWaste();

    // Poll every 5 seconds to match smartBin.js simulation
    const intervalId = setInterval(fetchLiveWaste, 5000);
    
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="bg-white p-4 md:p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Trash2 size={20} className="text-rose-500" /> Live Smart Bin Status
          </h3>
          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Syncing every 5s
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-rose-500">{totalWaste} <span className="text-sm text-gray-400 font-bold">kg</span></p>
          <p className="text-xs font-bold text-gray-400 uppercase">Recent Total</p>
        </div>
      </div>

      <div className="flex-1 w-full min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={liveData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorLiveWaste" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
              formatter={(value) => [`${value} kg`, "Waste Detected"]}
            />
            <Area 
              type="stepAfter" 
              dataKey="waste" 
              stroke="#f43f5e" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorLiveWaste)" 
              isAnimationActive={false} // Disable animation to prevent jumpiness on 5s refresh
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}