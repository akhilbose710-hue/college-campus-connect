import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      console.log('Attempting login...');
      const { user } = await login(email, password);
      console.log('Login successful, navigating...', user);
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 100);
    } catch (err) {
      console.error('Login Error:', err);
      setError(err.message || err.error_description || 'Login failed');
      setLoading(false);
    }
  };

  // Helper to fill credentials for demo
  const fillCredentials = (roleEmail) => {
    setEmail(roleEmail);
    setPassword('password123');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Logo Section */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 shadow-xl text-white mb-6 transform transition-transform hover:scale-105 duration-300">
            <LayoutDashboard size={32} />
          </div>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Sign in to access your Campus Connect dashboard
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white p-8 shadow-xl shadow-slate-200/50 ring-1 ring-slate-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Email Address</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    required
                    className="block w-full rounded-xl border-slate-200 bg-slate-50 pl-10 text-sm text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:bg-white focus:ring-primary-500 transition-colors py-2.5"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Password</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    required
                    className="block w-full rounded-xl border-slate-200 bg-slate-50 pl-10 text-sm text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:bg-white focus:ring-primary-500 transition-colors py-2.5"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 ring-1 ring-red-100 flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-red-600 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-200 transition-all hover:bg-primary-700 hover:shadow-primary-300 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Sign in to Dashboard'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          {/* Quick Login Helpers (Optional, removable for prod) */}
          <div className="mt-8 border-t border-slate-100 pt-6">
            <p className="text-xs text-center text-slate-400 mb-4 font-medium uppercase tracking-widest">Quick Demo Login</p>
            <div className="flex flex-wrap justify-center gap-2">
              <button onClick={() => fillCredentials('student1@example.com')} className="text-[10px] font-medium px-2 py-1 bg-slate-50 text-slate-600 rounded hover:bg-slate-100 border border-slate-200">
                Student
              </button>
              <button onClick={() => fillCredentials('staff1@example.com')} className="text-[10px] font-medium px-2 py-1 bg-slate-50 text-slate-600 rounded hover:bg-slate-100 border border-slate-200">
                Staff
              </button>
              <button onClick={() => fillCredentials('admin@example.com')} className="text-[10px] font-medium px-2 py-1 bg-slate-50 text-slate-600 rounded hover:bg-slate-100 border border-slate-200">
                Admin
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Campus Connect ERP. All rights reserved.
        </p>
      </div>
    </div>
  );
}