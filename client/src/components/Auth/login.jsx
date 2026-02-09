import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion"; 
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from "lucide-react";

export function Login() {
  const navigate = useNavigate();
  
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [buttonText, setButtonText] = useState("Sign In");

  // 👇 Updated Regex to enforce VIT Bhopal Email
  const emailRegex = /^[a-zA-Z0-9._%+-]+@vitbhopal\.ac\.in$/;

  // 👇 FUNCTION: Fills the form instantly for Judges
  const fillDemoCredentials = () => {
    setIdentifier("judge@vitbhopal.ac.in");
    setPassword("JudgePass123");
    setError(""); // Clear any previous errors
  };
  
  const handleLogin = async () => {
    setError("");
    
    if (!identifier || !password) {
      setError("Please enter both email and password");
      return;
    }
    
    // Check if it looks like an email (generic check is fine for login input)
    const isEmailInput = identifier.includes("@");
    
    setIsLoading(true);
    setButtonText("Signing In...");

    // Friendly "Waking up server" message if it takes too long
    const slowServerTimer = setTimeout(() => {
        setButtonText("Waking up server (may take 1 min)...");
    }, 3000);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://mess-metric-api.onrender.com';
      const port = `${API_URL}/api/auth/login`;
      
      console.log("Attempting login...");
      const response = await fetch(port, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          [isEmailInput ? "email" : "identifier"]: identifier.trim(), 
          password 
        }),
      });

      const data = await response.json();
      clearTimeout(slowServerTimer);

      if (!response.ok) {
        setError(data.message || "Login failed. Please check your credentials.");
        setIsLoading(false);
        setButtonText("Sign In");
        return;
      }

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/student/dashboard');
      } else {
        setError(data.message || "Login failed");
        setIsLoading(false);
        setButtonText("Sign In");
      }
    } catch (error) {
      clearTimeout(slowServerTimer);
      console.error("Login error:", error);
      setError("Unable to connect to server. Please check if backend is running.");
      setIsLoading(false);
      setButtonText("Sign In");
    }
  };

  useEffect(() => {
    const updateMousePosition = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", updateMousePosition);
    return () => window.removeEventListener("mousemove", updateMousePosition);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <div className="relative flex flex-col justify-center items-center h-screen bg-[#ecfdf5] overflow-hidden">
      
      <div className="absolute inset-0 z-0 h-full w-full bg-[radial-gradient(#006400_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.15]"></div>

      <div 
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(16, 183, 124, 0.15), transparent 40%)`,
        }}
      ></div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-md border-2 border-[#2f4b69]/10 shadow-2xl p-10 rounded-3xl flex flex-col items-center"
      >
        <Link to="/">
          <ArrowLeft className="absolute left-4 top-4 text-gray-500 hover:text-[#10b77c] transition-colors"/>
        </Link>
        
        <h2 className="text-3xl font-bold mb-2 text-[#2f4b69]">Welcome Back</h2>
        <p className="text-[#10b77c] font-medium mb-8">Please enter your details</p>
        
        <div className="w-full space-y-4">
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full"
          >
            <label className="block text-sm font-medium text-gray-700 mb-1">Login ID</label>
            <input 
              type="text" 
              placeholder="Email address or Registration Number" 
              value={identifier}
              className="w-full p-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-[#10b77c] transition-all bg-white/50"
              onChange={(e) => setIdentifier(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full"
          >
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              className="w-full p-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-[#10b77c] transition-all bg-white/50"
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200 w-full"
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading}
            className={`w-full mt-6 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all ${
              isLoading 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-[#10b77c] hover:bg-[#0b8359] hover:shadow-green-500/30"
            }`}
            onClick={handleLogin}
          >
            {isLoading ? buttonText : "Sign In"}
          </motion.button>
        </div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-sm text-gray-500"
        >
          Don't have an account?
          <Link to="/register">
            <span className="text-[#2f4b69] font-bold ml-1 cursor-pointer hover:underline">Sign up</span>
          </Link>
        </motion.p>
        
        {/* 👇 THE DEMO CREDENTIALS BUTTON */}
        <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            onClick={fillDemoCredentials}
            className="mt-8 text-[10px] md:text-xs font-bold text-gray-400 tracking-[0.2em] hover:text-emerald-600 transition-colors uppercase select-none"
        >
            Activate Demo Credentials
        </motion.button>

      </motion.div>
    </div>
  );
}