import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Camera, LogIn, UserPlus, AlertCircle, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { supabase } from '../lib/supabase.ts';

export const LoginPage: React.FC = () => {
  const { login, signup, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect');

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  React.useEffect(() => {
    if (isAuthenticated && user) {
      navigate(redirectPath ?? (user.role === 'admin' ? '/admin' : '/'), { replace: true });
    }
  }, [isAuthenticated, user, navigate, redirectPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) { setError(error.message); return; }
        setSuccessMsg('If an account exists for that email, a password reset link is on its way.');
        return;
      }
      if (mode === 'login') {
        const result = await login(email, password);
        if (!result.success) { setError(result.error || 'Failed to sign in.'); return; }
        navigate(redirectPath ?? (result.role === 'admin' ? '/admin' : '/'), { replace: true });
      } else {
        const result = await signup(name, email, password);
        if (!result.success) { setError(result.error || 'Failed to create account.'); return; }
        setSuccessMsg('Account created! Check your email to confirm, then sign in.');
        setMode('login');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[82vh] items-center justify-center px-4 py-12 animate-in fade-in duration-200">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-900 text-white shadow-md mb-3">
            <Camera className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">Welcome to Lumina</h1>
          <p className="text-xs text-neutral-500 mt-1">Sign in to explore and like photographs</p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl">
          <div className="flex rounded-xl bg-neutral-100 p-1 mb-5">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
              className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${mode === 'login' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(''); setSuccessMsg(''); }}
              className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${mode === 'signup' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'}`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {successMsg && (
            <div className="mb-4 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-700 border border-emerald-200">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Sarah Jenkins"
                  className="w-full rounded-lg border border-neutral-300 px-3.5 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-200"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-neutral-300 px-3.5 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-200"
              />
            </div>

            {mode === 'login' && (
              <div className="text-right -mt-2">
                <button type="button" onClick={() => { setMode('forgot'); setError(''); setSuccessMsg(''); }} className="text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:underline">
                  Forgot password?
                </button>
              </div>
            )}

            {mode !== 'forgot' && <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-neutral-300 px-3.5 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-200"
              />
              <span className="text-[11px] text-neutral-400 mt-1 block">Must be at least 6 characters</span>
            </div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-900 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800 transition disabled:opacity-50"
            >
              {mode === 'login' ? <LogIn className="h-4 w-4" /> : mode === 'forgot' ? <KeyRound className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
              <span>{loading ? 'Processing...' : mode === 'login' ? 'Sign In' : mode === 'forgot' ? 'Send reset link' : 'Create Account'}</span>
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-neutral-100 text-center text-xs text-neutral-500">
            {mode === 'login' ? (
              <p>Don't have an account?{' '}
                <button type="button" onClick={() => setMode('signup')} className="font-semibold text-neutral-900 hover:underline">Sign up now</button>
              </p>
            ) : mode === 'forgot' ? (
              <p>Remembered your password?{' '}
                <button type="button" onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }} className="font-semibold text-neutral-900 hover:underline">Back to sign in</button>
              </p>
            ) : (
              <p>Already have an account?{' '}
                <button type="button" onClick={() => setMode('login')} className="font-semibold text-neutral-900 hover:underline">Sign in</button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
