import { useState, useEffect } from 'react';
import { 
  ShoppingBag, ArrowLeft, Coffee, Utensils, Pizza, Ticket, 
  Loader2, Sparkles, AlertCircle, ArrowDownRight, ArrowUpRight, 
  Clock, LogIn, LogOut, Apple, Zap, PenTool, Cake, Film, Dumbbell 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { connectToMealCoin, getStudentBalance, burnMealCoins } from '../config/web3.js';

const STORE_ITEMS = [
  { id: 1, name: "Cold Coffee", price: 10, icon: Coffee, desc: "Redeem at Campus Nescafe", color: "text-amber-700", bg: "bg-amber-100", border: "border-amber-200" },
  { id: 5, name: "Fresh Fruit Bowl", price: 15, icon: Apple, desc: "Seasonal fruits from the juice bar", color: "text-red-600", bg: "bg-red-100", border: "border-red-200" },
  { id: 7, name: "Extra Dessert Pass", price: 15, icon: Cake, desc: "Double dessert serving at dinner", color: "text-pink-600", bg: "bg-pink-100", border: "border-pink-200" },
  { id: 2, name: "Midnight Snacks", price: 20, icon: Pizza, desc: "Samosa & Tea from Night Canteen", color: "text-orange-600", bg: "bg-orange-100", border: "border-orange-200" },
  { id: 6, name: "Energy Drink", price: 25, icon: Zap, desc: "Red Bull or Monster for exam nights", color: "text-yellow-600", bg: "bg-yellow-100", border: "border-yellow-200" },
  { id: 8, name: "Stationery Voucher", price: 30, icon: PenTool, desc: "₹100 off at the campus bookstore", color: "text-indigo-600", bg: "bg-indigo-100", border: "border-indigo-200" },
  { id: 3, name: "Premium Meal Pass", price: 50, icon: Utensils, desc: "Upgrade one regular meal to a premium feast", color: "text-emerald-600", bg: "bg-emerald-100", border: "border-emerald-200" },
  { id: 9, name: "Weekend Movie Ticket", price: 100, icon: Film, desc: "1 Ticket for the Sunday campus screening", color: "text-purple-600", bg: "bg-purple-100", border: "border-purple-200" },
  { id: 10, name: "Gym Discount", price: 200, icon: Dumbbell, desc: "20% off next month's recreation center fee", color: "text-slate-700", bg: "bg-slate-200", border: "border-slate-300" },
  { id: 4, name: "Mess Fee Rebate", price: 500, icon: Ticket, desc: "₹500 flat discount off next semester mess fee", color: "text-blue-600", bg: "bg-blue-100", border: "border-blue-200" },
];

export function StorePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  // Web3 States
  const [walletAddress, setWalletAddress] = useState("");
  const [contract, setContract] = useState(null);
  const [balance, setBalance] = useState("0");
  const [processingId, setProcessingId] = useState(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(null);

  // Transaction History State
  const [transactions, setTransactions] = useState([
    { id: 'tx-1', type: 'earn', amount: 100, item: 'Skipped Breakfast', date: 'Today, 08:30 AM', status: 'Completed' },
    { id: 'tx-2', type: 'earn', amount: 100, item: 'Skipped Lunch', date: 'Yesterday, 12:45 PM', status: 'Completed' }
  ]);

  useEffect(() => {
    // ULTRA-STRICT AUTH CHECK: Ignores broken or "null" strings in memory
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    
    if (storedUser && storedUser !== "null" && storedUser !== "undefined" && storedToken) {
      setUser(JSON.parse(storedUser));
      
      // Silently connect Web3 if successfully authenticated
      const initWeb3 = async () => {
        const connection = await connectToMealCoin();
        if (connection) {
          setContract(connection.contract);
          setWalletAddress(connection.userAddress);
          const currentBalance = await getStudentBalance(connection.contract, connection.userAddress);
          setBalance(currentBalance);
        }
      };
      initWeb3();
    } else {
      // Force wipe state if no valid session is found
      setUser(null);
      setBalance("0");
    }
  }, []);

  // Quick logout function directly inside the store for testing/demoing
  const handleStoreLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setBalance("0");
    setWalletAddress("");
    setContract(null);
  };

  const handleBuy = async (item) => {
    if (!user) {
        navigate('/login');
        return;
    }

    if (!contract || !walletAddress) {
       alert("Blockchain connection error. Please refresh the page to reconnect.");
       return;
    }

    if (parseFloat(balance) < item.price) {
       alert(`Insufficient MealCoins. You need ${item.price} MEAL.`);
       return;
    }

    setProcessingId(item.id);
    setPurchaseSuccess(null);

    // Smart contract interaction
    const success = await burnMealCoins(contract, item.price.toString());

    if (success) {
       const newBalance = await getStudentBalance(contract, walletAddress);
       setBalance(newBalance);
       setPurchaseSuccess(item.name);
       
       const newTx = {
           id: `tx-${Date.now()}`,
           type: 'spend',
           amount: item.price,
           item: item.name,
           date: 'Just now',
           status: 'Completed'
       };
       setTransactions([newTx, ...transactions]);
    } else {
       alert("Transaction failed or was rejected in MetaMask.");
    }
    
    setProcessingId(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 pb-24">
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                <ShoppingBag className="text-emerald-500" /> Reward Store
              </h1>
              <p className="text-slate-500 text-sm mt-1">Browse and redeem eco-friendly rewards.</p>
            </div>
          </div>

          {/* Conditional Rendering based on strict Auth */}
          {user ? (
              <div className="flex items-center gap-3">
                <div className="bg-emerald-50 border border-emerald-200 px-6 py-3 rounded-2xl flex items-center gap-3">
                   <div className="p-2 bg-emerald-500 rounded-full">
                      <Sparkles className="w-4 h-4 text-white" />
                   </div>
                   <div>
                     <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Your Balance</p>
                     <p className="text-2xl font-black text-emerald-600">{balance} MEAL</p>
                   </div>
                </div>
                
                {/* 👇 NEW INLINE LOGOUT BUTTON FOR DEMO TESTING 👇 */}
                <button 
                  onClick={handleStoreLogout}
                  title="Sign Out"
                  className="p-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-xl transition-colors flex items-center justify-center"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
          ) : (
              <div className="bg-slate-100 border border-slate-200 px-6 py-3 rounded-2xl flex items-center gap-3 text-slate-500">
                 <LogIn className="w-5 h-5" />
                 <span className="text-sm font-bold">Sign in to view your balance</span>
              </div>
          )}
        </div>

        {/* Success Message */}
        {purchaseSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-4">
            <Sparkles className="text-green-600" />
            <div>
              <p className="font-bold">Purchase Successful!</p>
              <p className="text-sm">You successfully bought <b>{purchaseSuccess}</b>. Check your student email for the QR code.</p>
            </div>
          </div>
        )}

        {/* Store Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {STORE_ITEMS.map((item) => {
            const Icon = item.icon;
            const isProcessing = processingId === item.id;
            const canAfford = user && parseFloat(balance) >= item.price;

            return (
              <div key={item.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow">
                <div className={`w-16 h-16 rounded-2xl ${item.bg} ${item.color} ${item.border} border flex items-center justify-center mb-6`}>
                  <Icon className="w-8 h-8" />
                </div>
                
                <h3 className="text-lg font-bold text-slate-800 mb-2 leading-tight">{item.name}</h3>
                <p className="text-slate-500 text-xs mb-6 flex-1">{item.desc}</p>
                
                <div className="flex items-center justify-between border-t border-slate-100 pt-5">
                  <div className="font-black text-lg text-emerald-600">
                    {item.price} <span className="text-[10px] text-emerald-700/60 uppercase">MEAL</span>
                  </div>
                  
                  {!user ? (
                      <button
                        onClick={() => navigate('/login')}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                      >
                        Login
                      </button>
                  ) : (
                      <button
                        onClick={() => handleBuy(item)}
                        disabled={isProcessing || (!canAfford && parseFloat(balance) !== 0)}
                        className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1 transition-all ${
                          isProcessing 
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                            : canAfford
                              ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 active:scale-95"
                              : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {isProcessing ? (
                          <><Loader2 className="w-3 h-3 animate-spin" /> ...</>
                        ) : (
                          canAfford ? "Buy" : "Lock"
                        )}
                      </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Conditional Transaction History */}
        {user && (
            <div className="mt-12 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-slate-400" /> Transaction History
                    </h2>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                                <th className="pb-4">Transaction</th>
                                <th className="pb-4">Date</th>
                                <th className="pb-4">Status</th>
                                <th className="pb-4 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {transactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="py-4 flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${tx.type === 'earn' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                            {tx.type === 'earn' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-700">{tx.item}</p>
                                            <p className="text-xs text-slate-400 capitalize">{tx.type === 'earn' ? 'Reward Minted' : 'Store Purchase'}</p>
                                        </div>
                                    </td>
                                    <td className="py-4 text-sm text-slate-500">{tx.date}</td>
                                    <td className="py-4">
                                        <span className="px-2 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-md border border-green-100">
                                            {tx.status}
                                        </span>
                                    </td>
                                    <td className={`py-4 text-right font-black ${tx.type === 'earn' ? 'text-emerald-500' : 'text-slate-700'}`}>
                                        {tx.type === 'earn' ? '+' : '-'}{tx.amount} <span className="text-xs font-bold uppercase opacity-60">MEAL</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

      </div>
    </div>
  );
}