/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-800 mb-4">
        <Camera className="h-8 w-8" />
      </div>
      <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-neutral-600">
        404 Not Found
      </span>
      <h1 className="mt-3 text-3xl font-extrabold text-neutral-900">
        Frame Not Found
      </h1>
      <p className="mt-2 max-w-sm text-sm text-neutral-500">
        The gallery view or photograph you navigated to does not exist or has been relocated.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-neutral-800 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Return to Gallery</span>
      </Link>
    </div>
  );
};
