import { useNavigate, useLocation } from "react-router-dom";
import { FiLayout, FiFolder, FiUser, FiLogOut, FiEdit } from "react-icons/fi";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 py-3.5 px-6 flex justify-between items-center shadow-sm select-none">
      
      {/* Brand Logo */}
      <div onClick={() => navigate("/dashboard")} className="flex items-center gap-2.5 cursor-pointer group">
        <div className="w-9 h-9 rounded-xl bg-indigo-650 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-all duration-200">
          E
        </div>
        <span className="font-extrabold text-lg text-slate-800 dark:text-white tracking-tight">
          E-Sign<span className="text-indigo-600 dark:text-indigo-400">Hub</span>
        </span>
      </div>

      {/* Navigation Options */}
      <div className="flex items-center gap-1.5 md:gap-3">
        {[
          { path: "/dashboard", label: "Dashboard", icon: <FiLayout className="w-4 h-4" /> },
          { path: "/templates", label: "Templates", icon: <FiFolder className="w-4 h-4" /> },
          { path: "/profile", label: "Developer Profile", icon: <FiUser className="w-4 h-4" /> }
        ].map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-250 ${
              isActive(item.path)
                ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-250 dark:hover:bg-slate-850"
            }`}
          >
            {item.icon}
            <span className="hidden sm:inline">{item.label}</span>
          </button>
        ))}

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />

        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer"
        >
          <FiLogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>

    </nav>
  );
}

export default Navbar;
