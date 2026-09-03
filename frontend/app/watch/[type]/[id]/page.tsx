import { Suspense } from 'react';
import WatchClient from './WatchClient';

export function generateStaticParams() {
  return [{ type: 'movie', id: '1' }];
}

export default async function WatchPage({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  const resolved = await params;
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070709] flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <WatchClient type={resolved?.type} id={resolved?.id} />
    </Suspense>
  );
}
