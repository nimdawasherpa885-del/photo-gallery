import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Camera, Image as ImageIcon, FolderKanban, Heart,
  ShieldCheck, User as UserIcon, LogOut, LogIn,
  Menu, X, Upload,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useGallery } from '../context/GalleryContext.tsx';

interface NavbarProps {
  onOpenUpload?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenUpload }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { favorites } = useGallery();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navLinks = [
    { label: 'Gallery', path: '/', icon: ImageIcon },
    { label: 'Albums', path: '/albums', icon: FolderKanban },
    { label: 'Favorites', path: '/favorites', icon: Heart, badge: favorites.length > 0 ? favorites.length : undefined },
  ];

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link to="/" className="group flex items-center gap-2.5 font-semibold text-neutral-900 tracking-tight">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
              <Camera className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold leading-none tracking-tight text-neutral-900">Lumina</span>
              <span className="text-[10px] uppercase font-medium tracking-wider text-neutral-500">Photo Gallery</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${active ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'}`}
                >
                  <Icon className={`h-4 w-4 ${active ? 'text-neutral-900' : 'text-neutral-500'}`} />
                  <span>{link.label}</span>
                  {link.badge !== undefined && (
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {isAdmin && (
              <Link
                to="/admin"
                className={`relative flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${isActive('/admin') ? 'bg-amber-100/70 text-amber-950 font-semibold' : 'text-amber-900 hover:bg-amber-50'}`}
              >
                <ShieldCheck className="h-4 w-4 text-amber-600" />
                <span>Admin Panel</span>
                <span className="rounded bg-amber-200/70 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-800">Admin</span>
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && onOpenUpload && (
            <button
              onClick={onOpenUpload}
              type="button"
              className="hidden sm:inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-400"
            >
              <Upload className="h-4 w-4" />
              <span>Upload Photo</span>
            </button>
          )}

          {isAuthenticated && user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 rounded-full p-1 transition-all hover:ring-2 hover:ring-neutral-200 focus:outline-none"
              >
                <span aria-label={user.name} className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-neutral-100 text-xs font-semibold uppercase text-neutral-700">
                  {user.name.slice(0, 1)}
                </span>
                <div className="hidden text-left xl:block">
                  <p className="text-xs font-semibold leading-tight text-neutral-800">{user.name}</p>
                  <p className="text-[11px] capitalize text-neutral-500">{user.role} role</p>
                </div>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-neutral-200 bg-white p-2 shadow-lg z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="border-b border-neutral-100 px-3 py-2">
                    <p className="text-sm font-semibold text-neutral-900">{user.name}</p>
                    <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${isAdmin ? 'bg-amber-100 text-amber-800' : 'bg-neutral-100 text-neutral-700'}`}>
                        {isAdmin ? <ShieldCheck className="h-3 w-3" /> : <UserIcon className="h-3 w-3" />}
                        {user.role}
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setUserDropdownOpen(false)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100">
                        <ShieldCheck className="h-4 w-4 text-amber-600" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}
                    <Link to="/favorites" onClick={() => setUserDropdownOpen(false)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100">
                      <Heart className="h-4 w-4 text-rose-500" />
                      <span>My Favorites ({favorites.length})</span>
                    </Link>
                  </div>

                  <div className="border-t border-neutral-100 pt-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800">
              <LogIn className="h-4 w-4" />
              <span>Sign In</span>
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-b border-neutral-200 bg-white px-4 py-3 md:hidden">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 text-base font-medium ${active ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-600 hover:bg-neutral-50'}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-5 w-5" />
                    <span>{link.label}</span>
                  </div>
                  {link.badge !== undefined && (
                    <span className="rounded-full bg-rose-500 px-2 py-0.5 text-xs font-bold text-white">{link.badge}</span>
                  )}
                </Link>
              );
            })}

            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-base font-medium ${isActive('/admin') ? 'bg-amber-100 text-amber-900' : 'text-amber-800 hover:bg-amber-50'}`}
              >
                <ShieldCheck className="h-5 w-5 text-amber-600" />
                <span>Admin Dashboard</span>
              </Link>
            )}

            {isAdmin && onOpenUpload && (
              <button
                type="button"
                onClick={() => { setMobileMenuOpen(false); onOpenUpload(); }}
                className="flex w-full items-center gap-2.5 rounded-lg bg-neutral-900 px-3 py-2 text-base font-medium text-white"
              >
                <Upload className="h-5 w-5" />
                <span>Upload New Photo</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
