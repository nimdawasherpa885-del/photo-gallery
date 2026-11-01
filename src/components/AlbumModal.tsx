/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, FolderPlus, AlertCircle, Check } from 'lucide-react';
import { Album } from '../types.ts';
import { useGallery } from '../context/GalleryContext.tsx';

interface AlbumModalProps {
  isOpen: boolean;
  onClose: () => void;
  albumToEdit?: Album | null;
}

export const AlbumModal: React.FC<AlbumModalProps> = ({
  isOpen,
  onClose,
  albumToEdit,
}) => {
  const { categories, createAlbum, updateAlbum, photos } = useGallery();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [category, setCategory] = useState('Landscape');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (albumToEdit) {
      setTitle(albumToEdit.title);
      setDescription(albumToEdit.description || '');
      setCoverUrl(albumToEdit.coverUrl || '');
      setCategory(albumToEdit.category || 'Landscape');
    } else {
      setTitle('');
      setDescription('');
      setCoverUrl(photos[0]?.url || '');
      setCategory('Landscape');
    }
    setErrors({});
  }, [albumToEdit, isOpen, photos]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) {
      newErrors.title = 'Album title is required.';
    } else if (title.trim().length < 3) {
      newErrors.title = 'Album title must be at least 3 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (albumToEdit) {
      await updateAlbum(albumToEdit.id, {
        title: title.trim(),
        description: description.trim(),
        coverUrl: coverUrl.trim(),
        category,
      });
    } else {
      await createAlbum({
        title: title.trim(),
        description: description.trim(),
        coverUrl: coverUrl.trim(),
        category,
      });
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      id="album-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-900 text-white">
              <FolderPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900">
                {albumToEdit ? 'Edit Album' : 'Create New Album'}
              </h2>
              <p className="text-xs text-neutral-500">
                Organize photographs into themed collections
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
              Album Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="album-title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Icelandic Glaciers"
              className={`w-full rounded-lg border px-3 py-2 text-sm transition focus:outline-none focus:ring-2 ${
                errors.title
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                  : 'border-neutral-300 focus:border-neutral-900 focus:ring-neutral-200'
              }`}
            />
            {errors.title && (
              <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                <AlertCircle className="h-3 w-3" />
                {errors.title}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              id="album-category-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-800 focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-200"
            >
              {categories
                .filter((c) => c !== 'All')
                .map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
              Album cover (optional)
            </label>
            <select
              id="album-cover-input"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-800 focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-200"
            >
              <option value="">No cover image</option>
              {photos.map((photo) => (
                <option key={photo.id} value={photo.url}>{photo.title}</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-neutral-500">Covers can only use photos already uploaded to this gallery.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              rows={2}
              id="album-desc-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A short summary of this photo series..."
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-200"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="album-submit-btn"
              className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-neutral-800"
            >
              <Check className="h-4 w-4" />
              <span>{albumToEdit ? 'Update Album' : 'Create Album'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
