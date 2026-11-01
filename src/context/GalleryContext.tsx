import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabase.ts';
import { Photo, Album } from '../types.ts';
import { useAuth } from './AuthContext.tsx';

interface GalleryContextType {
  photos: Photo[];
  albums: Album[];
  categories: string[];
  favorites: string[];
  isLoading: boolean;
  addPhoto: (data: {
    title: string;
    description: string;
    file: File;
    category: string;
    albumId?: string;
    tags: string[];
    photographer?: string;
    location?: string;
    camera?: string;
  }) => Promise<Photo>;
  updatePhoto: (id: string, data: Partial<Photo> & { file?: File }) => Promise<void>;
  deletePhoto: (id: string) => Promise<void>;
  createAlbum: (data: { title: string; description: string; coverUrl: string; category: string }) => Promise<Album>;
  updateAlbum: (id: string, data: Partial<Album>) => Promise<void>;
  deleteAlbum: (id: string) => Promise<void>;
  addCategory: (name: string) => Promise<void>;
  renameCategory: (oldName: string, newName: string) => Promise<void>;
  deleteCategory: (name: string) => Promise<void>;
  toggleLike: (photoId: string) => Promise<void>;
  isFavorite: (photoId: string) => boolean;
  incrementViews: (photoId: string) => Promise<void>;
  getAlbumPhotos: (albumId: string) => Photo[];
  stats: { totalPhotos: number; totalAlbums: number; totalLikes: number; totalViews: number };
}

const GalleryContext = createContext<GalleryContextType | undefined>(undefined);

const rowToPhoto = (r: Record<string, unknown>): Photo => ({
  id: r.id as string,
  title: r.title as string,
  description: (r.description as string) ?? '',
  url: r.url as string,
  thumbnailUrl: (r.thumbnail_url as string) ?? undefined,
  category: r.category as string,
  albumId: (r.album_id as string) ?? undefined,
  tags: (r.tags as string[]) ?? [],
  likes: (r.likes as number) ?? 0,
  views: (r.views as number) ?? 0,
  photographer: (r.photographer as string) ?? 'Curator',
  location: (r.location as string) ?? undefined,
  camera: (r.camera as string) ?? undefined,
  resolution: (r.resolution as string) ?? undefined,
  createdAt: (r.created_at as string)?.split('T')[0] ?? '',
});

const rowToAlbum = (r: Record<string, unknown>): Album => ({
  id: r.id as string,
  title: r.title as string,
  description: (r.description as string) ?? '',
  coverUrl: (r.cover_url as string) ?? '',
  category: r.category as string,
  createdAt: (r.created_at as string)?.split('T')[0] ?? '',
});

export const GalleryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session } = useAuth();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ── Initial data load ──────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const [photosRes, albumsRes, catsRes] = await Promise.all([
        supabase.from('photos').select('*').order('created_at', { ascending: false }),
        supabase.from('albums').select('*').order('created_at', { ascending: false }),
        supabase.from('categories').select('name').order('name'),
      ]);
      if (photosRes.data) setPhotos(photosRes.data.map(rowToPhoto));
      if (albumsRes.data) setAlbums(albumsRes.data.map(rowToAlbum));
      if (catsRes.data) setCategories(['All', ...catsRes.data.map((c: { name: string }) => c.name)]);
      setIsLoading(false);
    };
    load();
  }, []);

  // ── Favorites (per-user) ───────────────────────────────────────────────────
  useEffect(() => {
    if (!session?.user) { setFavorites([]); return; }
    supabase
      .from('user_favorites')
      .select('photo_id')
      .eq('user_id', session.user.id)
      .then(({ data }) => {
        if (data) setFavorites(data.map((r: { photo_id: string }) => r.photo_id));
      });
  }, [session?.user?.id]);

  // ── Storage upload helper ──────────────────────────────────────────────────
  const uploadFile = async (file: File): Promise<string> => {
    const ext = file.name.split('.').pop();
    const path = `photos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('gallery').upload(path, file, { upsert: false });
    if (error) throw new Error(error.message);
    const { data } = supabase.storage.from('gallery').getPublicUrl(path);
    return data.publicUrl;
  };

  // ── Photo actions ──────────────────────────────────────────────────────────
  const addPhoto = async (data: {
    title: string; description: string; file: File;
    category: string; albumId?: string; tags: string[];
    photographer?: string; location?: string; camera?: string;
  }): Promise<Photo> => {
    const finalUrl = await uploadFile(data.file);
    const { data: row, error } = await supabase
      .from('photos')
      .insert({
        title: data.title, description: data.description, url: finalUrl,
        category: data.category, album_id: data.albumId || null,
        tags: data.tags, photographer: data.photographer || 'Curator',
        location: data.location || null, camera: data.camera || null,
        likes: 0, views: 1,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    const photo = rowToPhoto(row);
    setPhotos((prev) => [photo, ...prev]);
    if (data.category && !categories.includes(data.category)) {
      setCategories((prev) => [...prev, data.category]);
    }
    return photo;
  };

  const updatePhoto = async (id: string, data: Partial<Photo> & { file?: File }) => {
    const { file, ...photoData } = data;
    const patch: Record<string, unknown> = {};
    if (photoData.title !== undefined) patch.title = photoData.title;
    if (photoData.description !== undefined) patch.description = photoData.description;
    if (photoData.category !== undefined) patch.category = photoData.category;
    if (photoData.albumId !== undefined) patch.album_id = photoData.albumId;
    if (photoData.tags !== undefined) patch.tags = photoData.tags;
    if (photoData.photographer !== undefined) patch.photographer = photoData.photographer;
    if (photoData.location !== undefined) patch.location = photoData.location;
    if (photoData.camera !== undefined) patch.camera = photoData.camera;
    if (file) patch.url = await uploadFile(file);
    const { error } = await supabase.from('photos').update(patch).eq('id', id);
    if (error) throw new Error(error.message);
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, ...photoData, ...(patch.url ? { url: patch.url as string } : {}) } : p)));
  };

  const deletePhoto = async (id: string) => {
    const { error } = await supabase.from('photos').delete().eq('id', id);
    if (error) throw new Error(error.message);
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    setFavorites((prev) => prev.filter((fid) => fid !== id));
  };

  // ── Album actions ──────────────────────────────────────────────────────────
  const createAlbum = async (data: { title: string; description: string; coverUrl: string; category: string }): Promise<Album> => {
    const { data: row, error } = await supabase
      .from('albums')
      .insert({ title: data.title, description: data.description, cover_url: data.coverUrl || null, category: data.category })
      .select()
      .single();
    if (error) throw new Error(error.message);
    const album = rowToAlbum(row);
    setAlbums((prev) => [album, ...prev]);
    return album;
  };

  const updateAlbum = async (id: string, data: Partial<Album>) => {
    const patch: Record<string, unknown> = {};
    if (data.title !== undefined) patch.title = data.title;
    if (data.description !== undefined) patch.description = data.description;
    if (data.coverUrl !== undefined) patch.cover_url = data.coverUrl || null;
    if (data.category !== undefined) patch.category = data.category;
    const { error } = await supabase.from('albums').update(patch).eq('id', id);
    if (error) throw new Error(error.message);
    setAlbums((prev) => prev.map((a) => (a.id === id ? { ...a, ...data } : a)));
  };

  const deleteAlbum = async (id: string) => {
    const { error } = await supabase.from('albums').delete().eq('id', id);
    if (error) throw new Error(error.message);
    setAlbums((prev) => prev.filter((a) => a.id !== id));
    setPhotos((prev) => prev.map((p) => (p.albumId === id ? { ...p, albumId: undefined } : p)));
  };

  // ── Category actions ───────────────────────────────────────────────────────
  const addCategory = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || categories.includes(trimmed)) return;
    const { error } = await supabase.from('categories').insert({ name: trimmed });
    if (error) throw new Error(error.message);
    setCategories((prev) => [...prev, trimmed]);
  };

  const renameCategory = async (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed || oldName === 'All') return;
    const { error } = await supabase.from('categories').update({ name: trimmed }).eq('name', oldName);
    if (error) throw new Error(error.message);
    await supabase.from('photos').update({ category: trimmed }).eq('category', oldName);
    await supabase.from('albums').update({ category: trimmed }).eq('category', oldName);
    setCategories((prev) => prev.map((c) => (c === oldName ? trimmed : c)));
    setPhotos((prev) => prev.map((p) => (p.category === oldName ? { ...p, category: trimmed } : p)));
    setAlbums((prev) => prev.map((a) => (a.category === oldName ? { ...a, category: trimmed } : a)));
  };

  const deleteCategory = async (name: string) => {
    if (name === 'All') return;
    const { error } = await supabase.from('categories').delete().eq('name', name);
    if (error) throw new Error(error.message);
    await supabase.from('photos').update({ category: 'General' }).eq('category', name);
    setCategories((prev) => prev.filter((c) => c !== name));
    setPhotos((prev) => prev.map((p) => (p.category === name ? { ...p, category: 'General' } : p)));
  };

  // ── Favorites & interactions ───────────────────────────────────────────────
  const toggleLike = async (photoId: string) => {
    if (!session?.user) return;
    const isFav = favorites.includes(photoId);
    if (isFav) {
      await supabase.from('user_favorites').delete().eq('user_id', session.user.id).eq('photo_id', photoId);
      await supabase.from('photos').update({ likes: (photos.find((p) => p.id === photoId)?.likes ?? 1) - 1 }).eq('id', photoId);
      setFavorites((prev) => prev.filter((id) => id !== photoId));
      setPhotos((prev) => prev.map((p) => (p.id === photoId ? { ...p, likes: Math.max(0, p.likes - 1) } : p)));
    } else {
      await supabase.from('user_favorites').insert({ user_id: session.user.id, photo_id: photoId });
      await supabase.from('photos').update({ likes: (photos.find((p) => p.id === photoId)?.likes ?? 0) + 1 }).eq('id', photoId);
      setFavorites((prev) => [...prev, photoId]);
      setPhotos((prev) => prev.map((p) => (p.id === photoId ? { ...p, likes: p.likes + 1 } : p)));
    }
  };

  const isFavorite = useCallback((photoId: string) => favorites.includes(photoId), [favorites]);

  const incrementViews = async (photoId: string) => {
    const photo = photos.find((p) => p.id === photoId);
    if (!photo) return;
    await supabase.from('photos').update({ views: photo.views + 1 }).eq('id', photoId);
    setPhotos((prev) => prev.map((p) => (p.id === photoId ? { ...p, views: p.views + 1 } : p)));
  };

  const getAlbumPhotos = (albumId: string) => photos.filter((p) => p.albumId === albumId);

  const stats = useMemo(() => ({
    totalPhotos: photos.length,
    totalAlbums: albums.length,
    totalLikes: photos.reduce((acc, p) => acc + (p.likes || 0), 0),
    totalViews: photos.reduce((acc, p) => acc + (p.views || 0), 0),
  }), [photos, albums]);

  return (
    <GalleryContext.Provider value={{
      photos, albums, categories, favorites, isLoading,
      addPhoto, updatePhoto, deletePhoto,
      createAlbum, updateAlbum, deleteAlbum,
      addCategory, renameCategory, deleteCategory,
      toggleLike, isFavorite, incrementViews, getAlbumPhotos, stats,
    }}>
      {children}
    </GalleryContext.Provider>
  );
};

export const useGallery = () => {
  const context = useContext(GalleryContext);
  if (!context) throw new Error('useGallery must be used within a GalleryProvider');
  return context;
};
