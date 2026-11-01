/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  ShieldCheck,
  Image as ImageIcon,
  FolderKanban,
  Users,
  Heart,
  Plus,
  Search,
  Edit3,
  Trash2,
  Tag,
  Eye,
  FolderPlus,
  ExternalLink,
  Shield,
  User as UserIcon,
} from 'lucide-react';
import { useGallery } from '../context/GalleryContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { supabase } from '../lib/supabase.ts';
import { PhotoUploadModal } from '../components/PhotoUploadModal.tsx';
import { AlbumModal } from '../components/AlbumModal.tsx';
import { Photo, Album, User } from '../types.ts';
import { Link } from 'react-router-dom';

export const AdminDashboardPage: React.FC = () => {
  const {
    photos,
    albums,
    categories,
    stats,
    deletePhoto,
    deleteAlbum,
    addCategory,
    renameCategory,
    deleteCategory,
  } = useGallery();
  const { user: currentUser } = useAuth();
  const [usersList, setUsersList] = useState<User[]>([]);

  useEffect(() => {
    supabase
      .from('profiles')
      .select('id, name, email, role, avatar, created_at')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) {
          setUsersList(data.map((r) => ({
            id: r.id,
            name: r.name,
            email: r.email,
            role: r.role,
            avatar: '',
            createdAt: r.created_at?.split('T')[0] ?? '',
          })));
        }
      });
  }, []);

  // Active Admin Tab: 'photos' | 'albums' | 'categories' | 'users'
  const [activeTab, setActiveTab] = useState<'photos' | 'albums' | 'categories' | 'users'>('photos');

  // Search queries within tabs
  const [photoSearch, setPhotoSearch] = useState('');
  const [albumSearch, setAlbumSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modals state
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [photoToEdit, setPhotoToEdit] = useState<Photo | null>(null);

  const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);
  const [albumToEdit, setAlbumToEdit] = useState<Album | null>(null);

  // Category management inline states
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [renameCategoryValue, setRenameCategoryValue] = useState('');

  // Filtered Photos for management table
  const managedPhotos = useMemo(() => {
    return photos.filter((p) => {
      if (categoryFilter !== 'All' && p.category !== categoryFilter) return false;
      if (photoSearch.trim()) {
        const q = photoSearch.toLowerCase().trim();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchPhotographer = (p.photographer || '').toLowerCase().includes(q);
        const matchTag = p.tags && p.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchPhotographer && !matchTag) return false;
      }
      return true;
    });
  }, [photos, categoryFilter, photoSearch]);

  // Filtered Albums
  const managedAlbums = useMemo(() => {
    return albums.filter((a) => {
      if (albumSearch.trim()) {
        const q = albumSearch.toLowerCase().trim();
        return (
          a.title.toLowerCase().includes(q) ||
          (a.description || '').toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [albums, albumSearch]);

  const handleDeletePhoto = (photo: Photo) => {
    if (window.confirm(`Are you sure you want to permanently delete "${photo.title}"?`)) {
      deletePhoto(photo.id);
    }
  };

  const handleDeleteAlbum = (album: Album) => {
    if (
      window.confirm(
        `Are you sure you want to delete the album "${album.title}"? Photos assigned to this album will remain in the gallery.`
      )
    ) {
      deleteAlbum(album.id);
    }
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    addCategory(newCategoryName.trim());
    setNewCategoryName('');
  };

  const handleRenameCategorySubmit = (oldName: string) => {
    if (!renameCategoryValue.trim() || renameCategoryValue.trim() === oldName) {
      setEditingCategory(null);
      return;
    }
    renameCategory(oldName, renameCategoryValue.trim());
    setEditingCategory(null);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-neutral-200 pb-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-amber-900 border border-amber-200">
              <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
              Administrator Control Room
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            Manage photo collections, upload works, configure albums, edit taxonomy, and monitor gallery stats.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            id="admin-top-upload-btn"
            onClick={() => {
              setPhotoToEdit(null);
              setIsPhotoModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Upload Photo</span>
          </button>

          <button
            type="button"
            id="admin-top-create-album-btn"
            onClick={() => {
              setAlbumToEdit(null);
              setIsAlbumModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-800 shadow-xs hover:bg-neutral-50 transition"
          >
            <FolderPlus className="h-4 w-4 text-neutral-600" />
            <span>Create Album</span>
          </button>
        </div>
      </div>

      {/* 4 Key Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Photos Card */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Total Photos
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <ImageIcon className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-extrabold text-neutral-900">{stats.totalPhotos}</p>
          <div className="mt-2 flex items-center justify-between text-xs text-neutral-500">
            <span>In {categories.length - 1} categories</span>
            <button
              type="button"
              onClick={() => {
                setPhotoToEdit(null);
                setIsPhotoModalOpen(true);
              }}
              className="font-semibold text-blue-600 hover:underline"
            >
              + Add new
            </button>
          </div>
        </div>

        {/* Total Albums Card */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Total Albums
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <FolderKanban className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-extrabold text-neutral-900">{stats.totalAlbums}</p>
          <div className="mt-2 flex items-center justify-between text-xs text-neutral-500">
            <span>Structured series</span>
            <button
              type="button"
              onClick={() => {
                setAlbumToEdit(null);
                setIsAlbumModalOpen(true);
              }}
              className="font-semibold text-amber-600 hover:underline"
            >
              + Create
            </button>
          </div>
        </div>

        {/* Total Registered Users Card */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Total Users
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-extrabold text-neutral-900">{usersList.length}</p>
          <div className="mt-2 text-xs text-neutral-500 flex items-center gap-1.5">
            <span className="font-medium text-emerald-700">
              {usersList.filter((u) => u.role === 'admin').length} Admins
            </span>
            <span>•</span>
            <span>
              {usersList.filter((u) => u.role === 'user').length} Members
            </span>
          </div>
        </div>

        {/* Engagement Stats Card */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Engagement
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <Heart className="h-5 w-5 fill-rose-500 text-rose-500" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-extrabold text-neutral-900">{stats.totalLikes}</p>
          <div className="mt-2 flex items-center gap-2 text-xs text-neutral-500">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {stats.totalViews} total views
            </span>
          </div>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="mb-6 flex border-b border-neutral-200">
        <button
          type="button"
          id="admin-tab-photos"
          onClick={() => setActiveTab('photos')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${
            activeTab === 'photos'
              ? 'border-neutral-900 text-neutral-900'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <ImageIcon className="h-4 w-4" />
          <span>Photos Management ({photos.length})</span>
        </button>

        <button
          type="button"
          id="admin-tab-albums"
          onClick={() => setActiveTab('albums')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${
            activeTab === 'albums'
              ? 'border-neutral-900 text-neutral-900'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <FolderKanban className="h-4 w-4" />
          <span>Albums Management ({albums.length})</span>
        </button>

        <button
          type="button"
          id="admin-tab-categories"
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${
            activeTab === 'categories'
              ? 'border-neutral-900 text-neutral-900'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <Tag className="h-4 w-4" />
          <span>Categories & Tags</span>
        </button>

        <button
          type="button"
          id="admin-tab-users"
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${
            activeTab === 'users'
              ? 'border-neutral-900 text-neutral-900'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Users Directory</span>
        </button>
      </div>

      {/* TAB 1: Photos Management */}
      {activeTab === 'photos' && (
        <div className="space-y-4">
          {/* Photos Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-neutral-200">
            <div className="flex flex-1 items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  value={photoSearch}
                  onChange={(e) => setPhotoSearch(e.target.value)}
                  placeholder="Filter by title, tag, artist..."
                  className="w-full rounded-lg border border-neutral-300 pl-9 pr-3 py-1.5 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-200"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs text-neutral-800 focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => {
                setPhotoToEdit(null);
                setIsPhotoModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Upload Photo</span>
            </button>
          </div>

          {/* Photos Table */}
          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-neutral-600">
                <thead className="border-b border-neutral-200 bg-neutral-50/80 text-[11px] uppercase tracking-wider text-neutral-500 font-semibold">
                  <tr>
                    <th scope="col" className="px-4 py-3">Photo</th>
                    <th scope="col" className="px-4 py-3">Category</th>
                    <th scope="col" className="px-4 py-3">Album</th>
                    <th scope="col" className="px-4 py-3">Artist / Location</th>
                    <th scope="col" className="px-4 py-3">Likes / Views</th>
                    <th scope="col" className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {managedPhotos.map((photo) => {
                    const album = albums.find((a) => a.id === photo.albumId);
                    return (
                      <tr key={photo.id} className="hover:bg-neutral-50/60 transition">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={photo.url}
                              alt={photo.title}
                              referrerPolicy="no-referrer"
                              className="h-12 w-12 rounded-lg object-cover border border-neutral-200 shrink-0"
                            />
                            <div className="max-w-xs">
                              <p className="font-bold text-neutral-900 line-clamp-1">{photo.title}</p>
                              <p className="text-[11px] text-neutral-400 line-clamp-1">
                                {photo.tags?.join(', ') || 'No tags'}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-medium text-neutral-700">
                            {photo.category}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          {album ? (
                            <span className="font-medium text-neutral-800">{album.title}</span>
                          ) : (
                            <span className="text-neutral-400 italic">None</span>
                          )}
                        </td>

                        <td className="px-4 py-3">
                          <p className="font-medium text-neutral-800">{photo.photographer}</p>
                          <p className="text-[11px] text-neutral-400 truncate max-w-[120px]">
                            {photo.location || '—'}
                          </p>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3 text-neutral-700">
                            <span className="flex items-center gap-1 font-medium text-rose-600">
                              <Heart className="h-3 w-3 fill-current" />
                              {photo.likes}
                            </span>
                            <span className="flex items-center gap-1 text-neutral-400">
                              <Eye className="h-3 w-3" />
                              {photo.views}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setPhotoToEdit(photo);
                                setIsPhotoModalOpen(true);
                              }}
                              title="Edit photo"
                              className="rounded-md p-1.5 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePhoto(photo)}
                              title="Delete photo"
                              className="rounded-md p-1.5 text-red-600 hover:bg-red-50 hover:text-red-700 transition"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {managedPhotos.length === 0 && (
                <div className="p-8 text-center text-xs text-neutral-500">
                  No photographs found matching your criteria.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Albums Management */}
      {activeTab === 'albums' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-neutral-200">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                value={albumSearch}
                onChange={(e) => setAlbumSearch(e.target.value)}
                placeholder="Search albums..."
                className="w-full rounded-lg border border-neutral-300 pl-9 pr-3 py-1.5 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-200"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setAlbumToEdit(null);
                setIsAlbumModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create New Album</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {managedAlbums.map((album) => {
              const albumPhotos = photos.filter((p) => p.albumId === album.id);
              return (
                <div
                  key={album.id}
                  className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-16/9 overflow-hidden rounded-xl bg-neutral-100 mb-3">
                      {album.coverUrl ? (
                        <img src={album.coverUrl} alt={album.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-neutral-400"><ImageIcon className="h-8 w-8" /></div>
                      )}
                      <span className="absolute top-2 left-2 rounded-full bg-black/60 px-2.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-md">
                        {album.category}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-base text-neutral-900">{album.title}</h3>
                      <span className="shrink-0 rounded bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-600">
                        {albumPhotos.length} photos
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-neutral-500 line-clamp-2">
                      {album.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                    <Link
                      to={`/albums/${album.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-900 hover:text-amber-600 transition"
                    >
                      <span>View Album</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setAlbumToEdit(album);
                          setIsAlbumModalOpen(true);
                        }}
                        className="rounded-md p-1.5 text-neutral-600 hover:bg-neutral-100"
                        title="Edit album"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAlbum(album)}
                        className="rounded-md p-1.5 text-red-600 hover:bg-red-50"
                        title="Delete album"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: Categories & Taxonomy */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Category Form */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">
            <h3 className="text-base font-bold text-neutral-900 mb-1">Add New Category</h3>
            <p className="text-xs text-neutral-500 mb-4">
              Categories help organize the gallery into broad photographic genres.
            </p>

            <form onSubmit={handleAddCategorySubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g., Wildlife, Astrophotography"
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-200"
                />
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-neutral-900 py-2.5 text-xs font-semibold text-white hover:bg-neutral-800 transition"
              >
                <Plus className="h-4 w-4" />
                <span>Create Category</span>
              </button>
            </form>
          </div>

          {/* Existing Categories List */}
          <div className="lg:col-span-2 rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">
            <h3 className="text-base font-bold text-neutral-900 mb-1">Manage Categories</h3>
            <p className="text-xs text-neutral-500 mb-4">
              Rename or remove categories. Note: Deleting a category will reassign affected photos to "General".
            </p>

            <div className="divide-y divide-neutral-100">
              {categories.map((cat) => {
                const photoCount = photos.filter((p) => p.category === cat).length;
                const isAll = cat === 'All';

                return (
                  <div key={cat} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <Tag className="h-4 w-4 text-neutral-400" />
                      {editingCategory === cat ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={renameCategoryValue}
                            onChange={(e) => setRenameCategoryValue(e.target.value)}
                            className="rounded border border-neutral-300 px-2 py-1 text-xs"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleRenameCategorySubmit(cat)}
                            className="rounded bg-neutral-900 px-2 py-1 text-xs font-medium text-white"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCategory(null)}
                            className="text-xs text-neutral-500 hover:text-neutral-900"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div>
                          <span className="font-semibold text-sm text-neutral-900">{cat}</span>
                          <span className="ml-2 text-xs text-neutral-400">
                            ({isAll ? photos.length : photoCount} photos)
                          </span>
                        </div>
                      )}
                    </div>

                    {!isAll && editingCategory !== cat && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCategory(cat);
                            setRenameCategoryValue(cat);
                          }}
                          className="rounded p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
                          title="Rename category"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Delete category "${cat}"? Photos will be moved to General.`)) {
                              deleteCategory(cat);
                            }
                          }}
                          className="rounded p-1 text-red-500 hover:bg-red-50"
                          title="Delete category"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Users Directory */}
      {activeTab === 'users' && (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-neutral-900">Registered Accounts</h3>
              <p className="text-xs text-neutral-500">
                Audited user profiles registered in Lumina system.
              </p>
            </div>
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700">
              {usersList.length} Total Registered
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-600">
              <thead className="border-b border-neutral-200 bg-neutral-50 text-[11px] uppercase tracking-wider text-neutral-500 font-semibold">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Assigned Role</th>
                  <th className="px-4 py-3">Created On</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-neutral-50/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span aria-label={u.name} className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-neutral-100 text-xs font-semibold uppercase text-neutral-700">
                          {u.name.slice(0, 1)}
                        </span>
                        <span className="font-semibold text-neutral-900">{u.name}</span>
                        {currentUser?.id === u.id && (
                          <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-bold text-neutral-600">
                            Current
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-neutral-600">{u.email}</td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          u.role === 'admin'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-neutral-100 text-neutral-700'
                        }`}
                      >
                        {u.role === 'admin' ? <Shield className="h-3 w-3" /> : <UserIcon className="h-3 w-3" />}
                        {u.role}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-neutral-500">{u.createdAt}</td>

                    <td className="px-4 py-3 text-right">
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {isPhotoModalOpen && (
        <PhotoUploadModal
          isOpen={isPhotoModalOpen}
          onClose={() => {
            setIsPhotoModalOpen(false);
            setPhotoToEdit(null);
          }}
          photoToEdit={photoToEdit}
        />
      )}

      {isAlbumModalOpen && (
        <AlbumModal
          isOpen={isAlbumModalOpen}
          onClose={() => {
            setIsAlbumModalOpen(false);
            setAlbumToEdit(null);
          }}
          albumToEdit={albumToEdit}
        />
      )}
    </div>
  );
};
