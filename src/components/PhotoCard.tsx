/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Heart, Maximize2, Edit3, Trash2, Tag, MapPin, Eye } from 'lucide-react';
import { Photo } from '../types.ts';
import { useGallery } from '../context/GalleryContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';

interface PhotoCardProps {
  photo: Photo;
  onSelect: (photo: Photo) => void;
  onEdit?: (photo: Photo) => void;
  onDelete?: (photo: Photo) => void;
  showAdminActions?: boolean;
}

export const PhotoCard: React.FC<PhotoCardProps> = ({
  photo,
  onSelect,
  onEdit,
  onDelete,
  showAdminActions = false,
}) => {
  const { toggleLike, isFavorite } = useGallery();
  const { isAdmin } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const favorited = isFavorite(photo.id);

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLike(photo.id);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) onEdit(photo);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete(photo);
  };

  return (
    <div
      id={`photo-card-${photo.id}`}
      onClick={() => onSelect(photo)}
      className="group relative cursor-pointer overflow-hidden rounded-xl border border-neutral-200/80 bg-neutral-100 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-neutral-400"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(photo);
        }
      }}
    >
      {/* Aspect ratio box with progressive load */}
      <div className="relative aspect-4/3 sm:aspect-square md:aspect-4/3 w-full overflow-hidden bg-neutral-100">
        {!isLoaded && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 animate-pulse">
            <span className="text-xs font-medium text-neutral-400">Loading...</span>
          </div>
        )}

        {hasError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-100 p-4 text-center">
            <span className="text-xs text-neutral-400">Image unavailable</span>
          </div>
        ) : (
          <img
            src={photo.url}
            alt={photo.title}
            loading="lazy"
            referrerPolicy="no-referrer"
            onLoad={() => setIsLoaded(true)}
            onError={() => {
              setHasError(true);
              setIsLoaded(true);
            }}
            className={`h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Top Badges (Category & Likes) */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none z-10">
          <span className="rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-medium text-white shadow-xs">
            {photo.category}
          </span>

          <div className="flex items-center gap-1.5 pointer-events-auto">
            {/* Admin quick buttons if in admin view or allowed */}
            {isAdmin && showAdminActions && (
              <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md rounded-full p-1 text-white">
                {onEdit && (
                  <button
                    type="button"
                    onClick={handleEditClick}
                    title="Edit photo"
                    id={`photo-card-edit-${photo.id}`}
                    className="p-1 rounded-full hover:bg-white/20 transition"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={handleDeleteClick}
                    title="Delete photo"
                    id={`photo-card-delete-${photo.id}`}
                    className="p-1 rounded-full text-red-400 hover:bg-white/20 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Like button */}
            <button
              type="button"
              id={`photo-card-like-${photo.id}`}
              onClick={handleLikeClick}
              title={favorited ? 'Unlike photo' : 'Like photo'}
              className={`flex items-center gap-1 rounded-full backdrop-blur-md px-2.5 py-1 text-xs font-medium transition-transform active:scale-90 ${
                favorited
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'bg-black/50 text-white hover:bg-black/70'
              }`}
            >
              <Heart className={`h-3.5 w-3.5 ${favorited ? 'fill-current text-white' : ''}`} />
              <span>{photo.likes}</span>
            </button>
          </div>
        </div>

        {/* Bottom Hover Overlay with details */}
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div className="transform translate-y-2 transition-transform duration-200 group-hover:translate-y-0 text-white">
            <h3 className="font-semibold text-base leading-snug line-clamp-1 drop-shadow-xs">
              {photo.title}
            </h3>

            {photo.description && (
              <p className="text-xs text-neutral-200 line-clamp-1 mt-0.5">
                {photo.description}
              </p>
            )}

            <div className="mt-2 flex items-center justify-between text-xs text-neutral-300">
              <span className="truncate">By {photo.photographer}</span>
              <div className="flex items-center gap-2">
                {photo.views > 0 && (
                  <span className="flex items-center gap-1 text-[11px]">
                    <Eye className="h-3 w-3" />
                    {photo.views}
                  </span>
                )}
                <span className="flex items-center gap-0.5 text-xs font-medium text-white/90">
                  <Maximize2 className="h-3.5 w-3.5" />
                  View
                </span>
              </div>
            </div>

            {/* Tag Pills */}
            {photo.tags && photo.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {photo.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-0.5 rounded bg-white/20 px-1.5 py-0.5 text-[10px] text-white backdrop-blur-xs"
                  >
                    <Tag className="h-2.5 w-2.5" />
                    {tag}
                  </span>
                ))}
                {photo.tags.length > 3 && (
                  <span className="rounded bg-white/10 px-1 py-0.5 text-[10px] text-neutral-300">
                    +{photo.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
