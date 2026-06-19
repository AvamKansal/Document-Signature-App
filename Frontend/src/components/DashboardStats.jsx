import { useEffect, useState } from "react";
import API from "../services/api";
import { FiFolder, FiClock, FiCheckSquare } from "react-icons/fi";

function DashboardStats() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await API.get("/docs/stats");
      setStats(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 px-6 pt-6">
      
      {/* Total Documents Card */}
      <div className="glass-card p-6 flex items-center justify-between border-l-4 border-l-indigo-600 hover:scale-102 transition-transform duration-250">
        <div className="space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Documents</span>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">{stats.totalDocuments}</h1>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-inner">
          <FiFolder className="w-5 h-5" />
        </div>
      </div>

      {/* Pending Documents Card */}
      <div className="glass-card p-6 flex items-center justify-between border-l-4 border-l-amber-500 hover:scale-102 transition-transform duration-250">
        <div className="space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Signature</span>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">{stats.pendingDocuments}</h1>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center text-amber-500 dark:text-amber-400 shadow-inner">
          <FiClock className="w-5 h-5 animate-spin-slow" />
        </div>
      </div>

      {/* Signed Documents Card */}
      <div className="glass-card p-6 flex items-center justify-between border-l-4 border-l-emerald-500 hover:scale-102 transition-transform duration-250">
        <div className="space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed Documents</span>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">{stats.signedDocuments}</h1>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-500 dark:text-emerald-400 shadow-inner">
          <FiCheckSquare className="w-5 h-5" />
        </div>
      </div>

    </div>
  );
}

export default DashboardStats;