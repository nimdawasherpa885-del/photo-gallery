/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Camera, Heart, Shield } from 'lucide-react';
import { useGallery } from '../context/GalleryContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';

export const Footer: React.FC = () => {
  const { stats } = useGallery();
  const { user, isAdmin } = useAuth();

  return (
    <footer className="border-t border-neutral-200 bg-neutral-50/50 mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-white">
              <Camera className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-900">Lumina Photo Gallery</p>
              <p className="text-xs text-neutral-500">
                Curated visual arts with role-based admin controls
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-neutral-600">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {stats.totalPhotos} Photos
            </span>
            <span className="text-neutral-300">•</span>
            <span className="font-medium">{stats.totalAlbums} Albums</span>
            <span className="text-neutral-300">•</span>
            <span className="flex items-center gap-1 font-medium text-rose-600">
              <Heart className="h-3 w-3 fill-current" />
              {stats.totalLikes} Total Likes
            </span>
            <span className="text-neutral-300">•</span>
            <span className="flex items-center gap-1 font-medium">
              <Shield className="h-3 w-3 text-amber-600" />
              Logged in as <strong className="text-neutral-900 capitalize">{user?.role || 'Guest'}</strong>
            </span>
          </div>

          {/* Supabase-backed — no demo reset needed */}
        </div>

        <div className="mt-6 border-t border-neutral-200/60 pt-4 text-center text-xs text-neutral-400">
          © {new Date().getFullYear()} Lumina Gallery. Designed for creative photographers, curators, and photography enthusiasts.
        </div>
      </div>
    </footer>
  );
};
