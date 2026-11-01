/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  createdAt: string;
}

export interface Photo {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnailUrl?: string;
  category: string;
  albumId?: string;
  tags: string[];
  likes: number;
  views: number;
  photographer: string;
  location?: string;
  camera?: string;
  resolution?: string;
  createdAt: string;
}

export interface Album {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  category: string;
  createdAt: string;
}

export interface GalleryStats {
  totalPhotos: number;
  totalAlbums: number;
  totalUsers: number;
  totalLikes: number;
}
