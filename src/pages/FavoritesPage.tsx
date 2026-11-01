/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Image as ImageIcon, ArrowRight, Sparkles } from 'lucide-react';
import { useGallery } from '../context/GalleryContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { PhotoCard } from '../components/PhotoCard.tsx';
import { LightboxModal } from '../components/LightboxModal.tsx';
import { Photo } from '../types.ts';

export const FavoritesPage: React.FC = () => {
  const { photos, favorites } = useGallery();
  const { isAdmin } = useAuth();
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  // Filter photos in favorites
  const favoritePhotos = photos.filter((photo) => favorites.includes(photo.id));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-neutral-200 pb-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Heart className="h-5 w-5 text-rose-500 fill-rose-500" />
            <span className="text-xs uppercase font-semibold tracking-wider text-rose-600">
              Personal Curation
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">
            Saved Favorites
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            A private showcase of the photographs and artworks you have bookmarked.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full bg-rose-50 px-3.5 py-1.5 text-xs font-semibold text-rose-700 border border-rose-100">
            <Heart className="h-3.5 w-3.5 fill-current" />
            <span>{favoritePhotos.length} {favoritePhotos.length === 1 ? 'Favorite Photo' : 'Favorite Photos'}</span>
          </div>
        </div>
      </div>

      {/* Grid */}
      {favoritePhotos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoritePhotos.map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              onSelect={setSelectedPhoto}
              showAdminActions={isAdmin}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="flex min-h-[45vh] flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-500 mb-4">
            <Heart className="h-7 w-7 fill-rose-100 text-rose-500" />
          </div>
          <h3 className="text-lg font-bold text-neutral-900">No favorites saved yet</h3>
          <p className="mt-1 max-w-sm text-xs text-neutral-500 leading-relaxed">
            When you browse the main gallery, click the heart icon on any photograph to build your curated moodboard.
          </p>
          <Link
            to="/"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-neutral-800 transition"
          >
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>Browse Main Gallery</span>
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <LightboxModal
          photos={favoritePhotos}
          activePhotoId={selectedPhoto.id}
          onClose={() => setSelectedPhoto(null)}
          onSelectPhoto={setSelectedPhoto}
        />
      )}
    </div>
  );
};
