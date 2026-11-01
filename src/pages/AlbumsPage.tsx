/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  Search,
  Plus,
  Layers,
  Calendar,
  Edit3,
  Trash2,
  ArrowRight,
} from 'lucide-react';
import { useGallery } from '../context/GalleryContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { AlbumModal } from '../components/AlbumModal.tsx';
import { Album } from '../types.ts';

export const AlbumsPage: React.FC = () => {
  const { albums, photos, deleteAlbum } = useGallery();
  const { isAdmin } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [albumToEdit, setAlbumToEdit] = useState<Album | null>(null);

  // Filter albums by search
  const filteredAlbums = useMemo(() => {
    return albums.filter((album) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        album.title.toLowerCase().includes(q) ||
        (album.description || '').toLowerCase().includes(q) ||
        album.category.toLowerCase().includes(q)
      );
    });
  }, [albums, searchQuery]);

  const handleEdit = (e: React.MouseEvent, album: Album) => {
    e.preventDefault();
    e.stopPropagation();
    setAlbumToEdit(album);
    setIsModalOpen(true);
  };

  const handleDelete = (e: React.MouseEvent, album: Album) => {
    e.preventDefault();
    e.stopPropagation();
    if (
      window.confirm(
        `Are you sure you want to delete the album "${album.title}"? Photos inside will remain standalone in the gallery.`
      )
    ) {
      deleteAlbum(album.id);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-neutral-200 pb-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FolderKanban className="h-5 w-5 text-neutral-800" />
            <span className="text-xs uppercase font-semibold tracking-wider text-neutral-500">
              Curated Collections
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">
            Photo Albums
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            Browse structured photographic series grouped by theme, location, and stylistic moods.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Admin Create Album button */}
          {isAdmin && (
            <button
              type="button"
              id="create-album-btn"
              onClick={() => {
                setAlbumToEdit(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Create New Album</span>
            </button>
          )}
        </div>
      </div>

      {/* Search & Stats Bar */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            id="albums-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search albums by title or topic..."
            className="w-full rounded-xl border border-neutral-300 bg-white pl-10 pr-4 py-2 text-sm text-neutral-900 shadow-xs focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-200"
          />
        </div>

        <span className="text-xs font-medium text-neutral-500">
          Showing {filteredAlbums.length} of {albums.length} albums
        </span>
      </div>

      {/* Albums Grid */}
      {filteredAlbums.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlbums.map((album) => {
            const albumPhotos = photos.filter((p) => p.albumId === album.id);
            const coverImage = album.coverUrl || albumPhotos[0]?.url;

            return (
              <div
                key={album.id}
                id={`album-card-${album.id}`}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Cover Image */}
                <Link
                  to={`/albums/${album.id}`}
                  className="relative aspect-16/10 w-full overflow-hidden bg-neutral-100"
                >
                  {coverImage ? (
                    <img src={coverImage} alt={album.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-neutral-400"><FolderKanban className="h-10 w-10" /></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-medium text-white">
                      {album.category}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-black/50 backdrop-blur-md px-2 py-0.5 text-xs font-semibold">
                      <Layers className="h-3.5 w-3.5" />
                      {albumPhotos.length} {albumPhotos.length === 1 ? 'photo' : 'photos'}
                    </span>
                  </div>
                </Link>

                {/* Album Content */}
                <div className="flex flex-1 flex-col justify-between p-5">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <Link to={`/albums/${album.id}`}>
                        <h2 className="text-lg font-bold text-neutral-900 group-hover:text-amber-600 transition">
                          {album.title}
                        </h2>
                      </Link>

                      {/* Admin Quick actions */}
                      {isAdmin && (
                        <div className="flex items-center gap-1 text-neutral-400">
                          <button
                            type="button"
                            onClick={(e) => handleEdit(e, album)}
                            title="Edit album"
                            id={`album-edit-btn-${album.id}`}
                            className="p-1 rounded-md hover:bg-neutral-100 hover:text-neutral-700 transition"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDelete(e, album)}
                            title="Delete album"
                            id={`album-delete-btn-${album.id}`}
                            className="p-1 rounded-md hover:bg-neutral-100 hover:text-red-600 transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    <p className="mt-2 text-xs leading-relaxed text-neutral-600 line-clamp-2">
                      {album.description || 'Curated series of high-quality photographs.'}
                    </p>
                  </div>

                  {/* Card Bottom / Link */}
                  <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {album.createdAt}
                    </span>

                    <Link
                      to={`/albums/${album.id}`}
                      className="inline-flex items-center gap-1 font-semibold text-neutral-900 group-hover:text-amber-600 transition"
                    >
                      <span>Explore</span>
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center">
          <FolderKanban className="h-10 w-10 text-neutral-400 mb-2" />
          <h3 className="text-base font-bold text-neutral-900">No albums found</h3>
          <p className="text-xs text-neutral-500 max-w-sm mt-1">
            {searchQuery
              ? `No albums match "${searchQuery}". Try a different keyword.`
              : 'No photo albums have been created yet.'}
          </p>
          {isAdmin && (
            <button
              type="button"
              onClick={() => {
                setAlbumToEdit(null);
                setIsModalOpen(true);
              }}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create First Album</span>
            </button>
          )}
        </div>
      )}

      {/* Create / Edit Album Modal */}
      {isModalOpen && (
        <AlbumModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setAlbumToEdit(null);
          }}
          albumToEdit={albumToEdit}
        />
      )}
    </div>
  );
};
