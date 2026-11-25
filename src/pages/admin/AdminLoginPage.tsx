import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { UtensilsCrossed, ShieldCheck, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { loginAdmin, settings } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = loginAdmin(email, password);
    if (success) {
      navigate('/admin');
    } else {
      setError('Invalid credentials. Please use admin@restaurant.com and admin123');
    }
  };

  const handleFillDemo = () => {
    setEmail('admin@restaurant.com');
    setPassword('admin123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-stone-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center space-y-3">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/25">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <span className="font-serif text-2xl font-bold text-white tracking-tight">
            {settings.restaurant_name}
          </span>
        </Link>
        <h2 className="text-xl font-serif font-bold text-stone-200">
          Restaurant Management Portal
        </h2>
        <p className="text-xs text-stone-400">
          Secure staff sign-in for orders, kitchen KDS, menu, and table QR codes.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-stone-950/80 backdrop-blur-xl py-8 px-6 sm:px-10 rounded-3xl border border-stone-800 shadow-2xl space-y-6">
          {/* Quick Demo Credentials Autofill Banner */}
          <div className="p-4 rounded-2xl bg-orange-950/40 border border-orange-500/30 text-xs text-orange-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-1.5 text-orange-400">
                <Sparkles className="w-4 h-4" /> Demo Credentials Ready
              </span>
              <button
                type="button"
                onClick={handleFillDemo}
                className="underline hover:text-white font-semibold cursor-pointer"
              >
                Auto-fill
              </button>
            </div>
            <p className="text-[11px] text-orange-300/80">
              Email: <code className="bg-orange-950 px-1.5 py-0.5 rounded">admin@restaurant.com</code>
              <br />
              Password: <code className="bg-orange-950 px-1.5 py-0.5 rounded">admin123</code>
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-200 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@restaurant.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-800 bg-stone-900 text-sm text-stone-100 placeholder-stone-600 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-800 bg-stone-900 text-sm text-stone-100 placeholder-stone-600 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer pt-3"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Enter Management Portal</span>
            </button>
          </form>

          <div className="pt-2 text-center">
            <Link
              to="/"
              className="text-xs text-stone-500 hover:text-stone-300 transition-colors"
            >
              ← Back to Customer Website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
