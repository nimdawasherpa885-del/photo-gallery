/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Layers,
  Plus,
  Edit3,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react';
import { useGallery } from '../context/GalleryContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { PhotoCard } from '../components/PhotoCard.tsx';
import { LightboxModal } from '../components/LightboxModal.tsx';
import { PhotoUploadModal } from '../components/PhotoUploadModal.tsx';
import { AlbumModal } from '../components/AlbumModal.tsx';
import { Photo } from '../types.ts';

export const AlbumDetailPage: React.FC = () => {
  const { albumId } = useParams<{ albumId: string }>();
  const { albums, photos, deletePhoto } = useGallery();
  const { isAdmin } = useAuth();

  const album = albums.find((a) => a.id === albumId);
  const albumPhotos = photos.filter((p) => p.albumId === albumId);

  // Modals
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isPhotoUploadOpen, setIsPhotoUploadOpen] = useState(false);
  const [photoToEdit, setPhotoToEdit] = useState<Photo | null>(null);
  const [isAlbumEditOpen, setIsAlbumEditOpen] = useState(false);

  if (!album) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-neutral-900">Album Not Found</h2>
        <p className="mt-2 text-sm text-neutral-500">
          The album you are looking for does not exist or may have been deleted.
        </p>
        <Link
          to="/albums"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-neutral-800 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Albums</span>
        </Link>
      </div>
    );
  }

  const handleEditPhoto = (photo: Photo) => {
    setPhotoToEdit(photo);
    setIsPhotoUploadOpen(true);
  };

  const handleDeletePhoto = (photo: Photo) => {
    if (window.confirm(`Are you sure you want to delete "${photo.title}"?`)) {
      deletePhoto(photo.id);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-in fade-in duration-200">
      {/* Breadcrumb navigation */}
      <nav className="mb-6 flex items-center gap-2 text-xs font-medium text-neutral-500">
        <Link to="/albums" className="hover:text-neutral-900 transition flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>All Albums</span>
        </Link>
        <span>/</span>
        <span className="text-neutral-900 font-semibold truncate">{album.title}</span>
      </nav>

      {/* Album Hero Header with Cover Backdrop */}
      <div className="relative mb-10 overflow-hidden rounded-3xl bg-neutral-950 text-white shadow-xl">
        <div className="absolute inset-0">
          {album.coverUrl && <img src={album.coverUrl} alt="" className="h-full w-full object-cover opacity-35 filter blur-xs" />}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-transparent" />
        </div>

        <div className="relative z-10 p-6 sm:p-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-medium text-white">
              {album.category}
            </span>
            <span className="flex items-center gap-1 text-xs text-neutral-300">
              <Calendar className="h-3.5 w-3.5" />
              Created {album.createdAt}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
            {album.title}
          </h1>

          <p className="mt-3 text-sm sm:text-base text-neutral-200 leading-relaxed">
            {album.description || 'Curated series of high-quality photographs.'}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-lg bg-black/40 backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-neutral-200">
              <Layers className="h-4 w-4 text-amber-400" />
              <span>{albumPhotos.length} {albumPhotos.length === 1 ? 'Photograph' : 'Photographs'}</span>
            </div>

            {/* Admin Controls */}
            {isAdmin && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="album-detail-add-photo-btn"
                  onClick={() => {
                    setPhotoToEdit(null);
                    setIsPhotoUploadOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-1.5 text-xs font-semibold text-neutral-900 shadow-sm hover:bg-neutral-100 transition"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Photo to Album</span>
                </button>

                <button
                  type="button"
                  id="album-detail-edit-btn"
                  onClick={() => setIsAlbumEditOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-900/80 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md hover:bg-neutral-800 transition"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Edit Album</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Photo Grid within Album */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-neutral-900">Photos in Collection</h2>
          <span className="text-xs text-neutral-500">
            {albumPhotos.length} {albumPhotos.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {albumPhotos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {albumPhotos.map((photo) => (
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
          <div className="flex min-h-[30vh] flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center">
            <ImageIcon className="h-10 w-10 text-neutral-400 mb-2" />
            <h3 className="text-base font-bold text-neutral-900">No photos in this album yet</h3>
            <p className="text-xs text-neutral-500 max-w-sm mt-1">
              Photos can be assigned to this album when uploading or editing a photograph.
            </p>
            {isAdmin && (
              <button
                type="button"
                onClick={() => {
                  setPhotoToEdit(null);
                  setIsPhotoUploadOpen(true);
                }}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800 transition"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Upload First Photo</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <LightboxModal
          photos={albumPhotos}
          activePhotoId={selectedPhoto.id}
          onClose={() => setSelectedPhoto(null)}
          onSelectPhoto={setSelectedPhoto}
        />
      )}

      {/* Upload/Edit Photo Modal with this album preselected */}
      {isPhotoUploadOpen && (
        <PhotoUploadModal
          isOpen={isPhotoUploadOpen}
          onClose={() => {
            setIsPhotoUploadOpen(false);
            setPhotoToEdit(null);
          }}
          photoToEdit={
            photoToEdit || {
              id: '',
              title: '',
              description: '',
              url: '',
              category: album.category,
              albumId: album.id,
              tags: [],
              likes: 0,
              views: 0,
              photographer: '',
              createdAt: '',
            }
          }
        />
      )}

      {/* Edit Album Modal */}
      {isAlbumEditOpen && (
        <AlbumModal
          isOpen={isAlbumEditOpen}
          onClose={() => setIsAlbumEditOpen(false)}
          albumToEdit={album}
        />
      )}
    </div>
  );
};
