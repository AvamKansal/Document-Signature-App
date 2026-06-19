import { useEffect, useState } from "react";
import API from "../services/api";
import { FiUpload, FiShare2, FiEdit3, FiClock, FiFileText } from "react-icons/fi";

function RecentActivity() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const docsRes = await API.get("/docs");

      if (docsRes.data.length === 0) {
        setLogs([]);
        return;
      }

      // Fetch audit logs for the most recent document
      const latestDoc = docsRes.data[0];
      const auditRes = await API.get(`/audit/${latestDoc._id}`);
      setLogs(auditRes.data.slice(0, 5));
    } catch (error) {
      console.log("Failed to load activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case "DOCUMENT_UPLOADED":
        return <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/30"><FiUpload className="w-3.5 h-3.5" /></div>;
      case "SIGN_LINK_GENERATED":
      case "SIGN_REQUEST_INITIATED":
        return <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/30"><FiShare2 className="w-3.5 h-3.5" /></div>;
      case "DOCUMENT_SIGNED":
      case "SIGNED_PDF_GENERATED":
        return <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/30"><FiEdit3 className="w-3.5 h-3.5" /></div>;
      default:
        return <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 flex items-center justify-center border border-slate-200 dark:border-slate-800"><FiFileText className="w-3.5 h-3.5" /></div>;
    }
  };

  return (
    <div className="glass-card p-6 m-6">
      <h2 className="text-base font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
        <FiClock className="w-4 h-4 text-indigo-500" /> Recent Document Activity
      </h2>

      {loading ? (
        <div className="py-4 text-center text-xs animate-pulse text-indigo-600">Loading trail...</div>
      ) : logs.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-6">No recent activity found. Upload a document to start tracking.</p>
      ) : (
        <div className="relative border-l border-slate-200 dark:border-slate-800 ml-4 space-y-6 py-2 select-none">
          {logs.map((log) => (
            <div key={log._id} className="relative pl-8 group">
              {/* Timeline dot */}
              <div className="absolute -left-4 top-0.5 transition-transform duration-200 group-hover:scale-105">
                {getActionIcon(log.action)}
              </div>
              
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-800 dark:text-white capitalize">
                  {log.action.toLowerCase().replace(/_/g, " ")}
                </span>
                <p className="text-[11px] text-slate-450 leading-normal">{log.details}</p>
                <span className="block text-[10px] text-slate-400">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RecentActivity;