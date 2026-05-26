import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../api/authAPI";
import { toast } from "react-toastify";
import { User, Mail, Lock, UserPlus, Shield } from "lucide-react";

const RegisterPage = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const response = await register({ username, email, password, role });
      if (response.success) {
        toast.success("Registration successful! Please login.");
        navigate("/login");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white border border-gray-200 rounded-lg shadow-sm p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 m-0">
            Create Account
          </h2>
          <p className="text-sm text-gray-500 mt-2 m-0">
            Join Eatify to explore delicious foods.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-700" htmlFor="username">
              Username
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="username"
                type="text"
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-sm text-gray-800 outline-none focus:border-blue-500"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="john_doe"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-700" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="email"
                type="email"
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-sm text-gray-800 outline-none focus:border-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-700" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="password"
                type="password"
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-sm text-gray-800 outline-none focus:border-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-700" htmlFor="role">
              I want to:
            </label>
            <div className="relative">
              <Shield size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                id="role"
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-sm text-gray-850 bg-white outline-none focus:border-blue-500"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="customer">Order Food (Customer)</option>
                <option value="owner">Register Restaurant (Owner)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 rounded text-sm flex items-center justify-center gap-2 cursor-pointer border-none mt-2"
            disabled={loading}
          >
            <UserPlus size={16} />
            {loading ? "Registering..." : "Sign Up"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className="text-orange-600 hover:text-orange-700 font-bold no-underline">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
