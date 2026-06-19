import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import { FiUser, FiMail, FiLock, FiUserPlus } from "react-icons/fi";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await API.post("/auth/register", formData);
      alert("Registration successful! Proceed to Login.");
      navigate("/login");
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen animated-gradient-indigo flex items-center justify-center p-4 select-none">
      
      <div className="glass-card w-full max-w-md p-8 md:p-10 shadow-2xl border border-white/20 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-200">
        
        {/* Logo/Icon */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-500/30">
            E
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">Create Account</h1>
          <p className="text-slate-400 text-xs mt-1 leading-normal">Register to start managing digital signature contracts safely.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name input */}
          <div className="space-y-1.5">
            <label className="premium-label flex items-center gap-1.5"><FiUser /> Full Name</label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. John Doe"
              value={formData.name}
              onChange={handleChange}
              className="premium-input text-xs"
            />
          </div>

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
            <FiUserPlus /> {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-slate-200/40 text-center">
          <span className="text-xs text-slate-450">Already have an account? </span>
          <Link to="/login" className="text-xs font-bold text-indigo-650 hover:underline dark:text-indigo-400">
            Sign In
          </Link>
        </div>

      </div>

    </div>
  );
}

export default Register;