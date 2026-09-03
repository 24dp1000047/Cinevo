import TVDetailsClient from './TVDetailsClient';

export function generateStaticParams() {
  return [{ id: '1' }];
}

export default async function TVDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolved = await params;
  return <TVDetailsClient id={resolved?.id} />;
}
