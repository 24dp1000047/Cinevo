'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Search,
  Clapperboard,
  Tv,
  Compass,
  Bookmark,
  Clock,
  Settings,
  Film,
  Menu,
  X,
} from 'lucide-react';
import { SearchOverlay } from '../search/SearchOverlay';
import { useWatchlist } from '../../hooks/useMedia';

export function Navbar() {
  const pathname = usePathname();
  const { data: watchlist = [] } = useWatchlist();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Global Ctrl+K or Cmd+K shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navItems = [
    { name: 'Home', href: '/', icon: Home, match: (p: string) => p === '/' },
    { name: 'Movies', href: '/movies', icon: Clapperboard, match: (p: string) => p.startsWith('/movies') || p.startsWith('/movie/') },
    { name: 'Series', href: '/series', icon: Tv, match: (p: string) => p.startsWith('/series') || p.startsWith('/tv/') },
    { name: 'Discover', href: '/discover', icon: Compass, match: (p: string) => p.startsWith('/discover') },
    {
      name: 'My List',
      href: '/my-list',
      icon: Bookmark,
      badge: watchlist.length > 0 ? watchlist.length : undefined,
      match: (p: string) => p.startsWith('/my-list'),
    },
    { name: 'History', href: '/history', icon: Clock, match: (p: string) => p.startsWith('/history') },
  ];

  return (
    <>
      {/* Desktop Left Vertical Sidebar Rail */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-20 z-40 bg-[#0b0b0e] border-r border-white/5 flex-col items-center justify-between py-5 select-none">
        {/* Top Brand Badge */}
        <Link
          href="/"
          title="Cinevo Home"
          className="w-12 h-12 rounded-2xl bg-[#16161b] border border-white/10 hover:border-brand-red/50 flex flex-col items-center justify-center shadow-lg transition group"
        >
          <span className="text-lg font-black leading-none text-brand-red group-hover:scale-110 transition-transform">
            C
          </span>
          <span className="text-[8px] font-extrabold tracking-widest text-zinc-300 mt-0.5">
            CINEVO
          </span>
        </Link>

        {/* Center Navigation Icons */}
        <nav className="flex flex-col items-center gap-3 w-full">
          {/* Home */}
          {(() => {
            const item = navItems[0];
            const Icon = item.icon;
            const isActive = item.match(pathname);
            return (
              <Link
                key={item.name}
                href={item.href}
                title={item.name}
                className="relative w-full flex items-center justify-center group"
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 rounded-r-full bg-amber-400" />
                )}
                <span
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                    isActive
                      ? 'bg-[#222228] text-white shadow-md'
                      : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-5 h-5 stroke-[1.8]" />
                </span>
              </Link>
            );
          })()}

          {/* Search Trigger */}
          <button
            onClick={() => setIsSearchOpen(true)}
            title="Search (Ctrl+K)"
            className="relative w-full flex items-center justify-center group cursor-pointer"
          >
            <span
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                isSearchOpen
                  ? 'bg-[#222228] text-white shadow-md'
                  : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              <Search className="w-5 h-5 stroke-[1.8]" />
            </span>
          </button>

          {/* Remaining Nav Links */}
          {navItems.slice(1).map((item) => {
            const Icon = item.icon;
            const isActive = item.match(pathname);
            return (
              <Link
                key={item.name}
                href={item.href}
                title={item.name}
                className="relative w-full flex items-center justify-center group"
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 rounded-r-full bg-amber-400" />
                )}
                <span
                  className={`relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                    isActive
                      ? 'bg-[#222228] text-white shadow-md'
                      : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-5 h-5 stroke-[1.8]" />
                  {item.badge !== undefined && (
                    <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-brand-red text-white text-[9px] font-bold flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Preferences / Settings */}
        <Link
          href="/profile"
          title="Preferences & Settings"
          className="relative w-full flex items-center justify-center group"
        >
          {pathname.startsWith('/profile') && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 rounded-r-full bg-amber-400" />
          )}
          <span
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 ${
              pathname.startsWith('/profile')
                ? 'bg-[#222228] text-white shadow-md'
                : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'
            }`}
          >
            <Settings className="w-5 h-5 stroke-[1.8]" />
          </span>
        </Link>
      </aside>

      {/* Mobile Top Header */}
      <header
        className={`md:hidden fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled ? 'glass-nav py-3' : 'bg-gradient-to-b from-black/90 via-black/40 to-transparent py-4'
        }`}
      >
        <div className="px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-red to-red-500 flex items-center justify-center shadow-lg shadow-red-900/40">
              <Film className="w-4 h-4 text-white" />
            </span>
            <span className="text-xl font-black tracking-wider text-white uppercase">
              CINE<span className="text-brand-red">VO</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 rounded-full bg-white/5 border border-white/10 text-zinc-300 hover:text-white"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-zinc-300 hover:text-white"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="glass-card mt-3 mx-4 p-4 rounded-2xl flex flex-col gap-2 animate-scale-in">
            {navItems.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center justify-between py-2 px-3 rounded-lg text-sm font-medium ${
                  link.match(pathname) ? 'bg-brand-red text-white' : 'text-zinc-300 hover:bg-white/5'
                }`}
              >
                <span>{link.name}</span>
                {link.badge !== undefined && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-white/20 text-white font-bold">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
            <Link
              href="/profile"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 py-2 px-3 rounded-lg text-sm font-medium text-zinc-300 hover:bg-white/5 border-t border-white/5 pt-3"
            >
              <Settings className="w-4 h-4" /> Preferences
            </Link>
          </div>
        )}
      </header>

      {/* Global Search Overlay */}
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
