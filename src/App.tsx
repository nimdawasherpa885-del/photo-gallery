/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { GalleryProvider } from './context/GalleryContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { PhotoUploadModal } from './components/PhotoUploadModal.tsx';
import { ProtectedRoute } from './components/ProtectedRoute.tsx';

import { GalleryPage } from './pages/GalleryPage.tsx';
import { AlbumsPage } from './pages/AlbumsPage.tsx';
import { AlbumDetailPage } from './pages/AlbumDetailPage.tsx';
import { FavoritesPage } from './pages/FavoritesPage.tsx';
import { AdminDashboardPage } from './pages/AdminDashboardPage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { ResetPasswordPage } from './pages/ResetPasswordPage.tsx';
import { NotFoundPage } from './pages/NotFoundPage.tsx';

function AppLayout() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const { isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-neutral-900" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50/40 text-neutral-900 selection:bg-neutral-900 selection:text-white font-sans antialiased">
      {/* Global Navigation Bar */}
      <Navbar onOpenUpload={isAdmin ? () => setIsUploadOpen(true) : undefined} />

      {/* Main Routed Page Content */}
      <main className="flex-1 pb-16">
        <Routes>
          <Route path="/" element={<GalleryPage />} />
          <Route path="/albums" element={<AlbumsPage />} />
          <Route path="/albums/:albumId" element={<AlbumDetailPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {/* Footer */}
      <Footer />

      {/* Global Quick Upload Modal for Admin */}
      {isAdmin && (
        <PhotoUploadModal
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <GalleryProvider>
          <AppLayout />
        </GalleryProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

