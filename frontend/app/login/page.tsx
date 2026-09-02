'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Film, Lock, Mail, User as UserIcon, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../lib/authContext';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (isRegister) {
        await register(email, password, name);
      } else {
        await login(email, password);
      }
      router.push('/');
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Authentication failed. Please check your credentials.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16 pb-12 relative overflow-hidden">
      {/* Ambient background decoration */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-red/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="glass-card rounded-3xl p-8 border border-white/10 shadow-2xl">
          {/* Brand header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-3">
              <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-red to-red-500 flex items-center justify-center shadow-lg shadow-red-900/40">
                <Film className="w-6 h-6 text-white" />
              </span>
              <span className="text-2xl font-black tracking-wider text-white uppercase">
                CINE<span className="text-brand-red">VO</span>
              </span>
            </Link>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {isRegister ? 'Create Your Account' : 'Welcome Back'}
            </h2>
            <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
              Watching is always public and free. Sign in only if you want to sync Watchlist and History.
            </p>
          </div>

          {/* Error notice */}
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2.5 text-xs text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Your Name
                </label>
                <div className="relative flex items-center">
                  <UserIcon className="w-4 h-4 text-zinc-500 absolute left-3.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full bg-zinc-900/80 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-brand-red transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-zinc-900/80 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-brand-red transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-900/80 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-brand-red transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-brand-red hover:bg-red-700 text-white font-semibold text-sm shadow-xl shadow-red-900/30 transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Authenticating...' : isRegister ? 'Register & Sync' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Toggle between Login & Register */}
          <div className="mt-6 pt-6 border-t border-white/10 text-center text-xs text-zinc-400">
            {isRegister ? (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegister(false)}
                  className="text-white font-semibold hover:underline"
                >
                  Sign In
                </button>
              </p>
            ) : (
              <p>
                Don&apos;t have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegister(true)}
                  className="text-white font-semibold hover:underline"
                >
                  Create Account
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
