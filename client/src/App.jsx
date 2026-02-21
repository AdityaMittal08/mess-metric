import { useState } from 'react';
// Cleaned up the imports so they are only called once!
import { connectToMealCoin, getStudentBalance, mintMealCoins } from './config/web3.js'; 
import './App.css';
import { LandingPage } from './components/LandingPage.jsx';
import { LeaderboardPage } from './components/LeaderboardPage.jsx';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Login } from './components/Auth/login.jsx';
import { Register } from './components/Auth/Register.jsx';
import { StudentDashboardPage } from './components/StudentDashboardPage.jsx';
import { StudentProfilePage } from './components/StudentProfilePage.jsx';
import { ProtectedRoute } from './components/Auth/ProtectedRoute.jsx'; 
import { AdminLogin } from './components/Auth/AdminLogin.jsx';
import { AdminRegister } from './components/Auth/AdminRegister.jsx';
import { AdminDashboardPage } from './components/AdminDashboardPage.jsx';
import { StorePage } from './components/StorePage.jsx';

function App() {
  const [walletAddress, setWalletAddress] = useState("");
  const [contract, setContract] = useState(null);
  const [mealCoinBalance, setMealCoinBalance] = useState("0");
  const [isMinting, setIsMinting] = useState(false);

  const handleConnect = async () => {
    const connection = await connectToMealCoin();
    if (connection) {
      setContract(connection.contract);
      setWalletAddress(connection.userAddress);

      const balance = await getStudentBalance(connection.contract, connection.userAddress);
      setMealCoinBalance(balance);
    }
  };

  const handleMintTest = async () => {
    if (!contract || !walletAddress) return;
    
    setIsMinting(true);
    const success = await mintMealCoins(contract, walletAddress, "100");
    
    if (success) {
      const newBalance = await getStudentBalance(contract, walletAddress);
      setMealCoinBalance(newBalance);
    }
    setIsMinting(false);
  };

  return(
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50">
        
        {/* --- GLOBAL FLOATING WALLET BUTTON --- */}
        <div className="absolute top-4 right-4 z-50">
          {walletAddress ? (
            <div className="bg-white border-2 border-green-500 text-green-700 font-bold px-4 py-2 rounded-lg shadow-md flex flex-col items-end gap-2">
              <span>✅ Connected: {walletAddress.substring(0, 6)}...{walletAddress.slice(-4)}</span>
              <span className="text-sm text-gray-600">Balance: {mealCoinBalance} MEAL</span>
              
            </div>
          ) : (
            <button 
              onClick={handleConnect} 
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg shadow-md transition-all"
            >
              🦊 Connect MetaMask
            </button>
          )}
        </div>
        {/* ----------------------------------- */}

        <Routes>
          <Route path='/' element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path='/register' element={<Register />} />
          <Route path='/admin/login' element={<AdminLogin />} />
          <Route path='/admin/register' element={<AdminRegister />} />
          
          <Route element={<ProtectedRoute />}>
             <Route path='/student/dashboard' element={<StudentDashboardPage />} />
             <Route path='/student/profile' element={<StudentProfilePage />} />
          </Route>

          <Route path='admin/dashboard' element={<AdminDashboardPage />} />
          <Route path='/store' element={<StorePage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App;