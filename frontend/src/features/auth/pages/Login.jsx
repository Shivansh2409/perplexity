import React, { useState } from "react";
import { Link } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const authState = useSelector((state) => state.auth);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // TODO: Connect to Auth Hook -> API later
    const res = await login({ email, password });

    navigate("/");
    console.log("Login attempt:", { email, password }, res);
  };

  if (authState.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d] text-[#ececec] font-sans">
        <div className="text-center">
          <h1 className="text-3xl font-semibold mb-2 tracking-tight text-white">
            Loading...
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d] text-[#ececec] font-sans">
      <div className="max-w-md w-full bg-[#191a1a] rounded-2xl shadow-sm border border-[#2b2b2b] p-8 hover:shadow-lg transition-shadow duration-300 animate-fade-in-up">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold mb-2 tracking-tight text-white">
            Welcome Back
          </h1>
          <p className="text-[#a0a0a0] text-sm">
            Sign in to continue your research
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#c4c4c4] mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#222324] border border-[#333333] rounded-lg focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-[#555555] text-white placeholder-[#666666] transition-all duration-200"
              placeholder="you@domain.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#c4c4c4] mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#222324] border border-[#333333] rounded-lg focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-[#555555] text-white placeholder-[#666666] transition-all duration-200"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#ececec] hover:bg-white text-[#0d0d0d] font-semibold py-2.5 rounded-lg transition-colors duration-200 shadow-sm"
          >
            Sign In
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-[#a0a0a0]">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-[#2582ff] hover:text-[#4295ff] font-medium transition-colors"
          >
            Sign up
          </Link>
        </div>
      </div>

      {/* Subtle fade-in animation */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `,
        }}
      />
    </div>
  );
};

export default Login;
