import type { Metadata } from 'next';
import './globals.css';
import { QueryProvider } from '../lib/queryProvider';
import { AuthProvider } from '../lib/authContext';
import { Navbar } from '../components/navbar/Navbar';

export const metadata: Metadata = {
  title: 'Cinevo — Public-First Streaming Experience',
  description: 'Watch movies and television series instantly with zero friction. Powered by TMDB and authorized streaming sources.',
  keywords: ['streaming', 'movies', 'tv shows', 'cinema', 'hls player', 'cinevo'],
  authors: [{ name: 'Cinevo Team' }],
  openGraph: {
    title: 'Cinevo — Instant Cinematic Streaming',
    description: 'Stream trending movies, explore popular series, and enjoy cinematic entertainment without an account.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#09090b] text-zinc-100 min-h-screen flex flex-col selection:bg-brand-red selection:text-white">
        <QueryProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-1 shrink-0 pb-16 w-full">{children}</main>

            {/* Footer */}
            <footer className="shrink-0 border-t border-white/5 bg-[#08080a] py-12 px-6 md:px-16 text-xs text-zinc-500 w-full relative z-10">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white tracking-wider text-sm uppercase">
                    CINE<span className="text-brand-red">VO</span>
                  </span>
                  <span>•</span>
                  <span>Public-First Streaming Platform</span>
                </div>
                <div className="flex flex-wrap gap-6 text-zinc-400">
                  <span>Authorized Test Streams</span>
                  <span>TMDB Metadata</span>
                  <span>Guest & Cloud Sync</span>
                  <span>Adaptive HLS</span>
                </div>
                <div>
                  © {new Date().getFullYear()} Cinevo. Built for pair-programming demonstration.
                </div>
              </div>
            </footer>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
