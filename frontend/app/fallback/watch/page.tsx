import { Suspense } from 'react';
import WatchClient from '../../watch/[type]/[id]/WatchClient';

export default function WatchFallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070709] flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <WatchClient />
    </Suspense>
  );
}
