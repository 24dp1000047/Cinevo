import MovieDetailsClient from './MovieDetailsClient';

export function generateStaticParams() {
  return [{ id: '1' }];
}

export default async function MovieDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolved = await params;
  return <MovieDetailsClient id={resolved?.id} />;
}
