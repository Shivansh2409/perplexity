import React, { useState } from "react";
import { Link } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [loginError, setLoginError] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const authState = useSelector((state) => state.auth);
  const { register } = useAuth();

  // Watch for successful login and navigate
  React.useEffect(() => {
    if (authState.user && !authState.loading) {
      navigate("/");
    }
  }, [authState.user, authState.loading, navigate]);

  // Display login errors
  React.useEffect(() => {
    if (authState.error && !authState.loading) {
      setLoginError(authState.error);
    }
  }, [authState.error, authState.loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await register({ username, email, password });
    setLoginError("");
    console.log("Registration attempt:", { username, email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d] text-[#ececec] font-sans">
      <div className="max-w-md w-full bg-[#191a1a] rounded-2xl shadow-sm border border-[#2b2b2b] p-8 hover:shadow-lg transition-shadow duration-300 animate-fade-in-up">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold mb-2 tracking-tight text-white">
            Create an Account
          </h1>
          <p className="text-[#a0a0a0] text-sm">
            Start your AI-powered research journey
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          {loginError && (
            <div className="p-3 bg-red-900/20 border border-red-700/50 rounded-lg text-red-400 text-sm">
              {loginError}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-[#c4c4c4] mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#222324] border border-[#333333] rounded-lg focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-[#555555] text-white placeholder-[#666666] transition-all duration-200"
              placeholder="johndoe"
              required
            />
          </div>
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
            Sign Up
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-[#a0a0a0]">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[#2582ff] hover:text-[#4295ff] font-medium transition-colors"
          >
            Sign in
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

export default Register;
