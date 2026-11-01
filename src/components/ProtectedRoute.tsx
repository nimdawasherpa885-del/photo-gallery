import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-amber-200 bg-amber-50/50 p-8 text-center shadow-lg">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 shadow-xs mb-4">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900">Administrator Access Required</h2>
          <p className="mt-2 text-sm text-neutral-600">
            The <code className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-semibold text-amber-900">/admin</code> dashboard
            is reserved for Admin accounts. Contact an administrator to request elevated access.
          </p>
          <div className="mt-6">
            <Link
              to="/"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Return to Public Gallery</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
