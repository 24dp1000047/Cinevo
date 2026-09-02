'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Film, Bookmark, Settings, Menu, X } from 'lucide-react';
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

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Movies', href: '/movies' },
    { name: 'Series', href: '/series' },
    { name: 'My List', href: '/my-list', badge: watchlist.length > 0 ? watchlist.length : undefined },
    { name: 'History', href: '/history' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled ? 'glass-nav py-3' : 'bg-gradient-to-b from-black/90 via-black/40 to-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
          {/* Left: Brand Logo & Navigation */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-red to-red-500 flex items-center justify-center shadow-lg shadow-red-900/40 group-hover:scale-105 transition-transform">
                <Film className="w-5 h-5 text-white" />
              </span>
              <span className="text-2xl font-black tracking-wider text-white uppercase">
                CINE<span className="text-brand-red">VO</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`relative py-1 transition-colors flex items-center gap-1.5 ${
                      isActive ? 'text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span>{link.name}</span>
                    {link.badge !== undefined && (
                      <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-brand-red text-white font-bold">
                        {link.badge}
                      </span>
                    )}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-red rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Search, My List & Preferences */}
          <div className="flex items-center gap-3">
            {/* Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 p-2.5 rounded-full hover:bg-white/10 text-zinc-300 hover:text-white transition"
              title="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Quick My List Link */}
            <Link
              href="/my-list"
              className="hidden sm:flex items-center gap-1.5 p-2 rounded-full hover:bg-white/10 text-zinc-300 hover:text-white transition relative"
              title="My Bookmarks"
            >
              <Bookmark className="w-5 h-5" />
              {watchlist.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-red text-white text-[10px] font-bold flex items-center justify-center">
                  {watchlist.length}
                </span>
              )}
            </Link>

            {/* Preferences / Settings Link */}
            <Link
              href="/profile"
              className="flex items-center gap-2 p-2.5 rounded-full hover:bg-white/10 text-zinc-300 hover:text-white transition"
              title="Preferences & Settings"
            >
              <Settings className="w-5 h-5" />
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-zinc-300 hover:text-white"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden glass-card mt-3 mx-4 p-4 rounded-2xl flex flex-col gap-3 animate-scale-in">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center justify-between py-2 px-3 rounded-lg text-sm font-medium ${
                  pathname === link.href ? 'bg-brand-red text-white' : 'text-zinc-300 hover:bg-white/5'
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
