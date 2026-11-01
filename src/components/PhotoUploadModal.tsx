/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, AlertCircle, Check, ShieldAlert } from 'lucide-react';
import { Photo } from '../types.ts';
import { useGallery } from '../context/GalleryContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  photoToEdit?: Photo | null;
}

export const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({
  isOpen,
  onClose,
  photoToEdit,
}) => {
  const { categories, albums, addPhoto, updatePhoto } = useGallery();
  const { isAdmin } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Landscape');
  const [customCategory, setCustomCategory] = useState('');
  const [albumId, setAlbumId] = useState('');
  const [tagsString, setTagsString] = useState('');
  const [photographer, setPhotographer] = useState('');
  const [location, setLocation] = useState('');
  const [camera, setCamera] = useState('');

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewUrl, setPreviewUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Populate data when editing
  useEffect(() => {
    if (photoToEdit) {
      setTitle(photoToEdit.title);
      setDescription(photoToEdit.description || '');
      setPreviewUrl(photoToEdit.url);
      setCategory(photoToEdit.category);
      setAlbumId(photoToEdit.albumId || '');
      setTagsString(photoToEdit.tags ? photoToEdit.tags.join(', ') : '');
      setPhotographer(photoToEdit.photographer || '');
      setLocation(photoToEdit.location || '');
      setCamera(photoToEdit.camera || '');
      setSelectedFile(null);
    } else {
      // Reset form
      setTitle('');
      setDescription('');
      setPreviewUrl('');
      setSelectedFile(null);
      setCategory(categories[1] || 'Landscape');
      setCustomCategory('');
      setAlbumId('');
      setTagsString('');
      setPhotographer('');
      setLocation('');
      setCamera('');
    }
    setErrors({});
  }, [photoToEdit, isOpen, categories]);

  // Handle local file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setSelectedFile(null);
      setErrors((prev) => ({ ...prev, file: 'Please select a valid image file.' }));
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setPreviewUrl(dataUrl);
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.file;
        return copy;
      });
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required.';
    } else if (title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters.';
    }

    if (!photoToEdit && !selectedFile) {
      newErrors.file = 'Choose an image file to upload.';
    }

    if (category === 'Custom' && !customCategory.trim()) {
      newErrors.category = 'Please specify a category name.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    const finalCategory = category === 'Custom' ? customCategory.trim() : category;
    const parsedTags = tagsString
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    try {
      if (photoToEdit) {
        await updatePhoto(photoToEdit.id, {
          title: title.trim(),
          description: description.trim(),
          file: selectedFile ?? undefined,
          category: finalCategory,
          albumId: albumId || undefined,
          tags: parsedTags,
          photographer: photographer.trim() || 'Curator',
          location: location.trim() || undefined,
          camera: camera.trim() || undefined,
        });
      } else {
        await addPhoto({
          title: title.trim(),
          description: description.trim(),
          file: selectedFile!,
          category: finalCategory,
          albumId: albumId || undefined,
          tags: parsedTags,
          photographer: photographer.trim() || 'Curator',
          location: location.trim() || undefined,
          camera: camera.trim() || undefined,
        });
      }
      onClose();
    } catch (err) {
      setErrors((prev) => ({ ...prev, file: err instanceof Error ? err.message : 'Upload failed.' }));
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Hard gate: if somehow a non-admin opens this modal, show a block screen
  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
        <div className="w-full max-w-sm rounded-2xl border border-red-200 bg-white p-8 text-center shadow-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600 mb-4">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-bold text-neutral-900">Admin Access Required</h2>
          <p className="mt-2 text-sm text-neutral-500">Only administrators can upload photos to the gallery.</p>
          <button
            type="button"
            onClick={onClose}
            className="mt-5 w-full rounded-xl bg-neutral-900 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 transition"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      id="photo-upload-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150 my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">
              {photoToEdit ? 'Edit Photo Details' : 'Upload New Photo'}
            </h2>
            <p className="text-xs text-neutral-500">
              {photoToEdit
                ? 'Update titles, metadata, and tags for this photograph'
                : 'Add high-res photography to the Lumina collection'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            id="close-upload-modal-btn"
            className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Admin supplied image file */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
              {photoToEdit ? 'Replace image (optional)' : 'Upload image'}
            </label>
            <input
              ref={fileInputRef}
              type="file"
              id="upload-photo-file-input"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full cursor-pointer rounded-lg border border-neutral-300 bg-neutral-50 text-sm text-neutral-600 file:mr-4 file:border-0 file:bg-neutral-900 file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-white hover:file:bg-neutral-800"
            />
            <p className="mt-1 text-xs text-neutral-500">Images are stored in this gallery’s Supabase Storage.</p>
            {errors.file && (
              <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                <AlertCircle className="h-3 w-3" />
                {errors.file}
              </p>
            )}

            {/* Quick Live Preview */}
            {previewUrl && (
              <div className="mt-3 flex items-center gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-2">
                <img
                  src={previewUrl}
                  alt="Preview"
                  referrerPolicy="no-referrer"
                  className="h-14 w-14 rounded-md object-cover border border-neutral-200"
                />
                <div className="truncate text-xs text-neutral-600">
                  <p className="font-medium text-neutral-800">Preview ready</p>
                  <p className="truncate text-neutral-400">{previewUrl}</p>
                </div>
              </div>
            )}
          </div>

          {/* Title & Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                Photo Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="upload-photo-title-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Autumn Light in Kyoto"
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
                id="upload-photo-category-select"
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
                <option value="Custom">+ Create New Category</option>
              </select>

              {category === 'Custom' && (
                <input
                  type="text"
                  placeholder="Type new category..."
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-neutral-200"
                />
              )}
              {errors.category && (
                <p className="mt-1 text-xs text-red-600">{errors.category}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              rows={2}
              id="upload-photo-desc-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the mood, subject, lighting, or inspiration..."
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-200"
            />
          </div>

          {/* Album Selection & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                Assign to Album (Optional)
              </label>
              <select
                id="upload-photo-album-select"
                value={albumId}
                onChange={(e) => setAlbumId(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-800 focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-200"
              >
                <option value="">No Album (Standalone)</option>
                {albums.map((alb) => (
                  <option key={alb.id} value={alb.id}>
                    {alb.title} ({alb.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                Tags (Comma separated)
              </label>
              <input
                type="text"
                id="upload-photo-tags-input"
                value={tagsString}
                onChange={(e) => setTagsString(e.target.value)}
                placeholder="sunset, ocean, minimal, film"
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-200"
              />
            </div>
          </div>

          {/* Technical / Credit Metadata (Collapsible or compact grid) */}
          <div className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-3.5 space-y-3">
            <span className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider">
              Photographer & Equipment Details (Optional)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-neutral-500 mb-0.5">Photographer</label>
                <input
                  type="text"
                  value={photographer}
                  onChange={(e) => setPhotographer(e.target.value)}
                  placeholder="Artist name"
                  className="w-full rounded-md border border-neutral-300 bg-white px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              </div>
              <div>
                <label className="block text-[11px] text-neutral-500 mb-0.5">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, Country"
                  className="w-full rounded-md border border-neutral-300 bg-white px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              </div>
              <div>
                <label className="block text-[11px] text-neutral-500 mb-0.5">Camera / Lens</label>
                <input
                  type="text"
                  value={camera}
                  onChange={(e) => setCamera(e.target.value)}
                  placeholder="Sony A7R V · 35mm"
                  className="w-full rounded-md border border-neutral-300 bg-white px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="upload-photo-submit-btn"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-neutral-800 transition disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              <span>{submitting ? 'Uploading...' : photoToEdit ? 'Save Changes' : 'Publish Photo'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
