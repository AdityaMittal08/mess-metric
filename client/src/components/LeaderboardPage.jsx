import React from 'react';
import { motion } from 'framer-motion';
import { LeaderboardHeader } from "./Leaderboard/LeaderboardHeader";
import { LeaderboardContent } from "./Leaderboard/LeaderboardContent";

export function LeaderboardPage() {
  return (
    // 1. Added full screen height and standard background color
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 pb-24">
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-5xl mx-auto space-y-6" // 3. Constrains width on massive monitors
      >
        
        {/* Your modular components remain perfectly intact */}
        <LeaderboardHeader />
        
        {/* NOTE: Make sure LeaderboardContent has its own loading states 
          and is successfully fetching from your http://localhost:5000/api/leaderboard route!
        */}
        <LeaderboardContent />

      </motion.div>
    </div>
  );
}