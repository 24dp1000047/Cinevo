import React from 'react';
import { cn } from '../../lib/utils';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('skeleton-shimmer rounded-md bg-zinc-800/60', className)} {...props} />;
}

export function MovieCardSkeleton() {
  return (
    <div className="flex-shrink-0 w-44 md:w-52 space-y-2">
      <Skeleton className="w-full aspect-[2/3] rounded-xl" />
      <Skeleton className="h-4 w-3/4 rounded" />
      <Skeleton className="h-3 w-1/2 rounded" />
    </div>
  );
}

export function MovieRowSkeleton() {
  return (
    <div className="space-y-4 px-4 md:px-12 my-8">
      <Skeleton className="h-7 w-48 rounded-md" />
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <MovieCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="relative w-full h-[75vh] md:h-[85vh] bg-zinc-900 skeleton-shimmer flex items-end p-6 md:p-16">
      <div className="space-y-4 max-w-2xl w-full">
        <Skeleton className="h-12 w-3/4 rounded-lg" />
        <Skeleton className="h-5 w-1/3 rounded" />
        <Skeleton className="h-20 w-full rounded-md" />
        <div className="flex gap-4 pt-2">
          <Skeleton className="h-12 w-36 rounded-xl" />
          <Skeleton className="h-12 w-36 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
