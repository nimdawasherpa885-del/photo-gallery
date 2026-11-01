/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Grid3X3,
  LayoutGrid,
  Sparkles,
  Upload,
  Heart,
  Tag,
  X,
  Plus,
} from 'lucide-react';
import { useGallery } from '../context/GalleryContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { PhotoCard } from '../components/PhotoCard.tsx';
import { LightboxModal } from '../components/LightboxModal.tsx';
import { PhotoUploadModal } from '../components/PhotoUploadModal.tsx';
import { Photo } from '../types.ts';

export const GalleryPage: React.FC = () => {
  const { photos, categories, deletePhoto } = useGallery();
  const { isAdmin } = useAuth();

  // Search, filter, sorting states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'likes' | 'views' | 'title'>('newest');
  const [gridDensity, setGridDensity] = useState<'normal' | 'dense'>('normal');

  // Modal states
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [photoToEdit, setPhotoToEdit] = useState<Photo | null>(null);

  // Filter and sort logic
  const filteredPhotos = useMemo(() => {
    return photos
      .filter((photo) => {
        // Category filter
        if (selectedCategory !== 'All' && photo.category !== selectedCategory) {
          return false;
        }

        // Tag filter
        if (selectedTag && (!photo.tags || !photo.tags.includes(selectedTag))) {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase().trim();
          const matchTitle = photo.title.toLowerCase().includes(query);
          const matchDesc = (photo.description || '').toLowerCase().includes(query);
          const matchPhotographer = (photo.photographer || '').toLowerCase().includes(query);
          const matchLocation = (photo.location || '').toLowerCase().includes(query);
          const matchTag = photo.tags && photo.tags.some((t) => t.toLowerCase().includes(query));

          if (!matchTitle && !matchDesc && !matchPhotographer && !matchLocation && !matchTag) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'likes') {
          return b.likes - a.likes;
        }
        if (sortBy === 'views') {
          return b.views - a.views;
        }
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  }, [photos, selectedCategory, selectedTag, searchQuery, sortBy]);

  const handleEditPhoto = (photo: Photo) => {
    setPhotoToEdit(photo);
    setIsUploadOpen(true);
  };

  const handleDeletePhoto = (photo: Photo) => {
    if (window.confirm(`Are you sure you want to delete "${photo.title}"?`)) {
      deletePhoto(photo.id);
    }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedTag(null);
    setSortBy('newest');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-in fade-in duration-200">
      {/* Hero / Header Section */}
      <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-800 p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 backdrop-blur-md px-3 py-1 text-xs font-medium text-white">
                <Sparkles className="h-3 w-3 text-amber-400" />
                Fine Art & Documentary Photography
              </span>
              {isAdmin && (
                <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-semibold text-amber-300 border border-amber-500/30">
                  Admin Mode Active
                </span>
              )}
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
              Lumina Visual Gallery
            </h1>
            <p className="mt-2 text-sm sm:text-base text-neutral-300">
              Immerse yourself in world-class compositions, high-resolution landscapes, and urban architecture.
            </p>
          </div>

          {/* Quick upload if admin */}
          {isAdmin && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                id="gallery-hero-upload-btn"
                onClick={() => {
                  setPhotoToEdit(null);
                  setIsUploadOpen(true);
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-neutral-900 shadow-md transition hover:bg-neutral-100 hover:scale-102 active:scale-98"
              >
                <Plus className="h-4 w-4" />
                <span>Upload Photograph</span>
              </button>
            </div>
          )}
        </div>

        {/* Ambient decorative blur background */}
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 h-64 w-64 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Control Toolbar: Search, Filters, Sorters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              id="gallery-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, artist, camera, or keyword..."
              className="w-full rounded-xl border border-neutral-300 bg-white pl-10 pr-9 py-2.5 text-sm text-neutral-900 shadow-xs focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-200"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Sorter & Density toggles */}
          <div className="flex items-center gap-3">
            {/* Sort selector */}
            <div className="flex items-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-700 shadow-xs">
              <ArrowUpDown className="h-3.5 w-3.5 text-neutral-400" />
              <span className="hidden sm:inline text-neutral-400">Sort:</span>
              <select
                id="gallery-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent font-medium text-neutral-900 focus:outline-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="likes">Most Popular</option>
                <option value="views">Most Viewed</option>
                <option value="title">Alphabetical</option>
              </select>
            </div>

            {/* Grid density selector */}
            <div className="hidden sm:flex items-center rounded-xl border border-neutral-300 bg-white p-1 shadow-xs">
              <button
                type="button"
                onClick={() => setGridDensity('normal')}
                title="Comfortable 3-column grid"
                className={`rounded-lg p-1.5 transition ${
                  gridDensity === 'normal'
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setGridDensity('dense')}
                title="Compact 4-column grid"
                className={`rounded-lg p-1.5 transition ${
                  gridDensity === 'dense'
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                id={`cat-filter-${cat.toLowerCase()}`}
                onClick={() => {
                  setSelectedCategory(cat);
                  setSelectedTag(null);
                }}
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                  active
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200/80 hover:text-neutral-900'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Active Tag Filter Indicator */}
        {selectedTag && (
          <div className="flex items-center gap-2 pt-1 text-xs text-neutral-600">
            <span>Filtered by tag:</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-neutral-200 px-2.5 py-0.5 font-medium text-neutral-800">
              <Tag className="h-3 w-3" />
              #{selectedTag}
              <button
                type="button"
                onClick={() => setSelectedTag(null)}
                className="hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          </div>
        )}
      </div>

      {/* Gallery Photos Header / Count */}
      <div className="mb-4 flex items-center justify-between text-xs font-medium text-neutral-500">
        <span>
          Showing {filteredPhotos.length} {filteredPhotos.length === 1 ? 'photograph' : 'photographs'}
        </span>
        {(searchQuery || selectedCategory !== 'All' || selectedTag) && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-neutral-800 hover:underline"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Photos Grid */}
      {filteredPhotos.length > 0 ? (
        <div
          className={`grid gap-5 sm:gap-6 ${
            gridDensity === 'normal'
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
          }`}
        >
          {filteredPhotos.map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              onSelect={setSelectedPhoto}
              onEdit={handleEditPhoto}
              onDelete={handleDeletePhoto}
              showAdminActions={isAdmin}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-200 text-neutral-500 mb-3">
            <Search className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-neutral-900">No photographs matched your query</h3>
          <p className="mt-1 max-w-sm text-xs text-neutral-500">
            Try adjusting your search terms, changing the category filter, or reset filters to browse the complete library.
          </p>
          <button
            type="button"
            onClick={clearAllFilters}
            className="mt-4 rounded-lg bg-neutral-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800 transition"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <LightboxModal
          photos={filteredPhotos}
          activePhotoId={selectedPhoto.id}
          onClose={() => setSelectedPhoto(null)}
          onSelectPhoto={setSelectedPhoto}
        />
      )}

      {/* Upload/Edit Photo Modal */}
      {isUploadOpen && (
        <PhotoUploadModal
          isOpen={isUploadOpen}
          onClose={() => {
            setIsUploadOpen(false);
            setPhotoToEdit(null);
          }}
          photoToEdit={photoToEdit}
        />
      )}
    </div>
  );
};
