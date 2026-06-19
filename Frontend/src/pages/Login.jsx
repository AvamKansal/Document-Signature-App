import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import { FiMail, FiLock, FiLogIn } from "react-icons/fi";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await API.post("/auth/login", formData);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      alert("Login successful");
      navigate("/dashboard");
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen animated-gradient-indigo flex items-center justify-center p-4 select-none">
      
      <div className="glass-card w-full max-w-md p-8 md:p-10 shadow-2xl border border-white/20 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl">
        
        {/* Logo/Icon */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-500/30 animate-pulse">
            E
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">Welcome Back</h1>
          <p className="text-slate-400 text-xs mt-1 leading-normal">Sign in to manage and execute digital signature workflows.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email input */}
          <div className="space-y-1.5">
            <label className="premium-label flex items-center gap-1.5"><FiMail /> Email Address</label>
            <input
              type="email"
              name="email"
              required
              placeholder="e.g. john@doe.com"
              value={formData.email}
              onChange={handleChange}
              className="premium-input text-xs"
            />
          </div>

          {/* Password input */}
          <div className="space-y-1.5">
            <label className="premium-label flex items-center gap-1.5"><FiLock /> Password</label>
            <input
              type="password"
              name="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="premium-input text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full premium-btn premium-btn-primary mt-6 text-sm flex items-center justify-center gap-2"
          >
            <FiLogIn /> {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-slate-200/40 text-center">
          <span className="text-xs text-slate-450">Don't have an account? </span>
          <Link to="/register" className="text-xs font-bold text-indigo-650 hover:underline dark:text-indigo-400">
            Create Account
          </Link>
        </div>

      </div>

    </div>
  );
}

export default Login;
