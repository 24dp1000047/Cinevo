import { Suspense } from 'react';
import type { Metadata } from 'next';
import DiscoverClient from './DiscoverClient';

export const metadata: Metadata = {
  title: 'Discover & Genre Explorer — Cinevo',
  description: 'Filter, explore, and stream movies and TV series by genre, release year, rating, and moods on Cinevo.',
};

export default function DiscoverPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070709] flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <DiscoverClient />
    </Suspense>
  );
}
