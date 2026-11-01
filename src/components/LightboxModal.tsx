/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Heart,
  Download,
  Info,
  Camera,
  MapPin,
  Calendar,
  Layers,
  Tag,
  Eye,
  Check,
  Share2,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { Photo } from '../types.ts';
import { useGallery } from '../context/GalleryContext.tsx';
import { Link } from 'react-router-dom';

interface LightboxModalProps {
  photos: Photo[];
  activePhotoId: string | null;
  onClose: () => void;
  onSelectPhoto: (photo: Photo) => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  photos,
  activePhotoId,
  onClose,
  onSelectPhoto,
}) => {
  const { toggleLike, isFavorite, incrementViews, albums } = useGallery();
  const [showInfo, setShowInfo] = useState(true);
  const [isZoomed, setIsZoomed] = useState(false);
  const [copied, setCopied] = useState(false);

  // Find index of current photo
  const currentIndex = photos.findIndex((p) => p.id === activePhotoId);
  const currentPhoto = currentIndex !== -1 ? photos[currentIndex] : null;

  // Increment view counter once opened
  useEffect(() => {
    if (currentPhoto) {
      incrementViews(currentPhoto.id);
    }
  }, [currentPhoto?.id]);

  const handlePrev = useCallback(() => {
    if (photos.length <= 1 || currentIndex === -1) return;
    const prevIndex = (currentIndex - 1 + photos.length) % photos.length;
    onSelectPhoto(photos[prevIndex]);
    setIsZoomed(false);
  }, [photos, currentIndex, onSelectPhoto]);

  const handleNext = useCallback(() => {
    if (photos.length <= 1 || currentIndex === -1) return;
    const nextIndex = (currentIndex + 1) % photos.length;
    onSelectPhoto(photos[nextIndex]);
    setIsZoomed(false);
  }, [photos, currentIndex, onSelectPhoto]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'i' || e.key === 'I') {
        setShowInfo((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, handlePrev, handleNext]);

  // Lock body scroll while lightbox is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (!currentPhoto) return null;

  const favorited = isFavorite(currentPhoto.id);
  const album = albums.find((a) => a.id === currentPhoto.albumId);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentPhoto.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    // Open in new tab or trigger download
    window.open(currentPhoto.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      id="lightbox-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md transition-opacity duration-200"
    >
      {/* Top action bar */}
      <div className="absolute top-0 inset-x-0 z-20 flex h-16 items-center justify-between px-4 sm:px-6 bg-gradient-to-b from-black/80 to-transparent text-white">
        <div className="flex items-center gap-3">
          <span className="rounded-md bg-white/10 px-2.5 py-1 text-xs font-medium text-neutral-300 backdrop-blur-xs">
            {currentIndex + 1} / {photos.length}
          </span>
          <span className="hidden sm:inline-block text-sm font-medium text-neutral-200 truncate max-w-xs md:max-w-md">
            {currentPhoto.title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Like button in lightbox */}
          <button
            type="button"
            id="lightbox-like-btn"
            onClick={() => toggleLike(currentPhoto.id)}
            title={favorited ? 'Unlike' : 'Like'}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              favorited
                ? 'bg-rose-600 text-white'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Heart className={`h-4 w-4 ${favorited ? 'fill-current' : ''}`} />
            <span>{currentPhoto.likes}</span>
          </button>

          {/* Zoom toggle */}
          <button
            type="button"
            id="lightbox-zoom-btn"
            onClick={() => setIsZoomed(!isZoomed)}
            title={isZoomed ? 'Fit to screen' : 'Zoom 100%'}
            className="rounded-lg bg-white/10 p-2 text-white transition hover:bg-white/20"
          >
            {isZoomed ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>

          {/* Info toggle */}
          <button
            type="button"
            id="lightbox-info-btn"
            onClick={() => setShowInfo(!showInfo)}
            title="Toggle details"
            className={`rounded-lg p-2 transition ${
              showInfo ? 'bg-white text-neutral-900' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Info className="h-4 w-4" />
          </button>

          {/* Close button */}
          <button
            type="button"
            id="lightbox-close-btn"
            onClick={onClose}
            title="Close (Esc)"
            className="rounded-lg bg-white/10 p-2 text-white transition hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="relative flex h-full w-full items-center justify-center pt-16 pb-4 px-2 sm:px-6">
        {/* Previous button */}
        {photos.length > 1 && (
          <button
            type="button"
            id="lightbox-prev-btn"
            onClick={handlePrev}
            title="Previous (Left Arrow)"
            className="absolute left-3 sm:left-6 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-black/50 text-white shadow-lg backdrop-blur-md transition hover:bg-black/80 hover:scale-105 active:scale-95 focus:outline-none"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        {/* Center Image Stage */}
        <div
          className={`flex h-full w-full items-center justify-center transition-all ${
            showInfo ? 'lg:pr-96' : ''
          }`}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
        >
          <div className="relative flex max-h-[82vh] max-w-full items-center justify-center overflow-auto">
            <img
              src={currentPhoto.url}
              alt={currentPhoto.title}
              referrerPolicy="no-referrer"
              className={`select-none rounded-lg shadow-2xl transition-all duration-200 ${
                isZoomed
                  ? 'max-h-none max-w-none cursor-zoom-out object-none scale-125'
                  : 'max-h-[80vh] max-w-full object-contain cursor-zoom-in'
              }`}
              onClick={() => setIsZoomed(!isZoomed)}
            />
          </div>
        </div>

        {/* Next button */}
        {photos.length > 1 && (
          <button
            type="button"
            id="lightbox-next-btn"
            onClick={handleNext}
            title="Next (Right Arrow)"
            className={`absolute z-20 flex h-11 w-11 items-center justify-center rounded-full bg-black/50 text-white shadow-lg backdrop-blur-md transition hover:bg-black/80 hover:scale-105 active:scale-95 focus:outline-none ${
              showInfo ? 'right-3 sm:right-6 lg:right-100' : 'right-3 sm:right-6'
            }`}
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}

        {/* Right Info Drawer */}
        {showInfo && (
          <aside
            id="lightbox-info-drawer"
            className="absolute right-0 top-16 bottom-0 z-30 w-full sm:w-96 border-l border-neutral-800 bg-neutral-900/95 p-6 text-white backdrop-blur-xl overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-200"
          >
            <div className="flex flex-col h-full justify-between gap-6">
              <div className="space-y-5">
                {/* Category badge */}
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-neutral-800 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-neutral-300">
                    {currentPhoto.category}
                  </span>
                  <span className="text-xs text-neutral-400">
                    ID: {currentPhoto.id}
                  </span>
                </div>

                {/* Title and Description */}
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-white">
                    {currentPhoto.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-300">
                    {currentPhoto.description || 'No description provided.'}
                  </p>
                </div>

                {/* Metadata Items */}
                <div className="space-y-3 rounded-xl border border-neutral-800 bg-neutral-950/50 p-4 text-xs">
                  <div className="flex items-center justify-between text-neutral-300">
                    <span className="flex items-center gap-2 text-neutral-400">
                      <Camera className="h-3.5 w-3.5" />
                      Photographer
                    </span>
                    <span className="font-medium text-white">{currentPhoto.photographer}</span>
                  </div>

                  {currentPhoto.location && (
                    <div className="flex items-center justify-between text-neutral-300">
                      <span className="flex items-center gap-2 text-neutral-400">
                        <MapPin className="h-3.5 w-3.5" />
                        Location
                      </span>
                      <span className="font-medium text-white truncate max-w-[180px] text-right">
                        {currentPhoto.location}
                      </span>
                    </div>
                  )}

                  {currentPhoto.camera && (
                    <div className="flex items-center justify-between text-neutral-300">
                      <span className="flex items-center gap-2 text-neutral-400">
                        <Camera className="h-3.5 w-3.5" />
                        Camera
                      </span>
                      <span className="font-medium text-white truncate max-w-[180px] text-right">
                        {currentPhoto.camera}
                      </span>
                    </div>
                  )}

                  {currentPhoto.resolution && (
                    <div className="flex items-center justify-between text-neutral-300">
                      <span className="flex items-center gap-2 text-neutral-400">
                        <Layers className="h-3.5 w-3.5" />
                        Resolution
                      </span>
                      <span className="font-medium text-white">{currentPhoto.resolution}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-neutral-300">
                    <span className="flex items-center gap-2 text-neutral-400">
                      <Calendar className="h-3.5 w-3.5" />
                      Added On
                    </span>
                    <span className="font-medium text-white">{currentPhoto.createdAt}</span>
                  </div>

                  <div className="flex items-center justify-between text-neutral-300">
                    <span className="flex items-center gap-2 text-neutral-400">
                      <Eye className="h-3.5 w-3.5" />
                      Views
                    </span>
                    <span className="font-medium text-white">{currentPhoto.views}</span>
                  </div>
                </div>

                {/* Album Connection */}
                {album && (
                  <div className="rounded-xl border border-neutral-800 bg-neutral-800/40 p-3">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                      Part of Album
                    </span>
                    <Link
                      to={`/albums/${album.id}`}
                      onClick={onClose}
                      className="mt-1 flex items-center gap-2 group text-sm font-semibold text-white hover:text-amber-400"
                    >
                      <Layers className="h-4 w-4 text-amber-500" />
                      <span className="truncate">{album.title}</span>
                      <span className="text-xs text-neutral-400 group-hover:translate-x-0.5 transition">→</span>
                    </Link>
                  </div>
                )}

                {/* Tags */}
                {currentPhoto.tags && currentPhoto.tags.length > 0 && (
                  <div>
                    <span className="text-xs font-medium uppercase tracking-wider text-neutral-400">
                      Tags
                    </span>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {currentPhoto.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 rounded-md bg-neutral-800 px-2 py-1 text-xs text-neutral-200"
                        >
                          <Tag className="h-3 w-3 text-neutral-400" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="space-y-2 pt-4 border-t border-neutral-800">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    id="lightbox-share-btn"
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800 py-2.5 text-xs font-medium text-white transition hover:bg-neutral-700"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="h-3.5 w-3.5" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleDownload}
                    id="lightbox-download-btn"
                    className="flex items-center justify-center gap-1.5 rounded-lg bg-neutral-100 py-2.5 text-xs font-semibold text-neutral-900 transition hover:bg-white"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Open Full Res</span>
                  </button>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
