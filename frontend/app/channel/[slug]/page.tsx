import { CHANNELS_LIST } from '../../../lib/channels';
import ChannelClient from './ChannelClient';

export function generateStaticParams() {
  return CHANNELS_LIST.map((c) => ({ slug: c.slug }));
}

export default async function ChannelPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolved = await params;
  return <ChannelClient slug={resolved?.slug || 'netflix'} />;
}
