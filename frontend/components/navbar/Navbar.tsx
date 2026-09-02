'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Film, Bookmark, Clock, User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../lib/authContext';
import { SearchOverlay } from '../search/SearchOverlay';
import { useWatchlist } from '../../hooks/useMedia';

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
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

          {/* Right: Search, Guest indicator & User Profile */}
          <div className="flex items-center gap-4">
            {/* Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 p-2.5 rounded-full hover:bg-white/10 text-zinc-300 hover:text-white transition"
              title="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Auth / Profile */}
            {isAuthenticated && user ? (
              <div className="relative group">
                <Link
                  href="/profile"
                  className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full bg-zinc-800/80 hover:bg-zinc-700/80 border border-white/10 text-sm font-medium transition"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-red text-white flex items-center justify-center font-bold text-xs uppercase">
                    {user.name ? user.name.charAt(0) : user.email.charAt(0)}
                  </div>
                  <span className="hidden sm:inline text-zinc-200 max-w-[100px] truncate">
                    {user.name || user.email.split('@')[0]}
                  </span>
                </Link>

                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 py-2 rounded-xl bg-zinc-900 border border-white/10 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="px-4 py-2 border-b border-white/10 text-xs text-zinc-400">
                    Signed in as <strong className="text-white block truncate">{user.email}</strong>
                  </div>
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition"
                  >
                    <User className="w-4 h-4" /> Profile & Settings
                  </Link>
                  <Link
                    href="/my-list"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition"
                  >
                    <Bookmark className="w-4 h-4" /> My List
                  </Link>
                  <Link
                    href="/history"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition"
                  >
                    <Clock className="w-4 h-4" /> History
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition mt-1 border-t border-white/5"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="hidden lg:inline text-xs text-zinc-500 uppercase tracking-widest font-semibold">
                  Guest Mode
                </span>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-semibold text-white border border-white/10 transition hover:scale-105"
                >
                  Sign In
                </Link>
              </div>
            )}

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
          </div>
        )}
      </header>

      {/* Global Search Overlay */}
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
