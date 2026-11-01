import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Camera, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { supabase } from '../lib/supabase.ts';

export const ResetPasswordPage: React.FC = () => {
  const { isLoading, session, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (password.length < 6) {
      setError('Your password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('The passwords do not match.');
      return;
    }

    setSaving(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSuccess('Your password has been changed.');
    window.setTimeout(() => navigate(isAdmin ? '/admin' : '/', { replace: true }), 900);
  };

  return (
    <div className="flex min-h-[82vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-900 text-white">
            <Camera className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Set a new password</h1>
          <p className="mt-1 text-xs text-neutral-500">Choose a new password for your Lumina account.</p>
        </div>

        {isLoading ? (
          <p className="text-center text-sm text-neutral-600">Checking your recovery link…</p>
        ) : !session ? (
          <div className="text-center">
            <p className="mb-4 text-sm text-neutral-600">This reset link is invalid or has expired. Request a new one from the sign-in page.</p>
            <Link to="/login" className="text-sm font-semibold text-neutral-900 underline">Return to sign in</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {success && <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">{success}</p>}

            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
              New password
              <input
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3.5 py-2 text-sm font-normal normal-case tracking-normal focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-200"
              />
            </label>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
              Confirm new password
              <input
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3.5 py-2 text-sm font-normal normal-case tracking-normal focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-200"
              />
            </label>
            <button
              type="submit"
              disabled={saving || !!success}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
            >
              <KeyRound className="h-4 w-4" />
              {saving ? 'Saving…' : 'Update password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
