'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppShell, type AppTheme } from '@/components/providers/app-shell-provider';

export function ThreeColumnShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, setTheme, persona, setPersona, activeUserId, setActiveUserId } = useAppShell();

  return (
    <div className="mx-auto min-h-screen max-w-7xl grid grid-cols-1 md:grid-cols-12 bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Left Navigation Rail */}
      <aside className="md:col-span-3 lg:col-span-3 border-r border-[var(--border-color)] sticky top-0 h-screen p-4 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex flex-col gap-1">
            <Link href="/" className="group flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight flex items-center gap-1.5">
                <span className="text-[var(--accent-color)]">💼</span>
                <span>Job Sewa</span>
              </span>
            </Link>
            <div className="flex items-center gap-1.5 pl-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--accent-color)] animate-pulse" />
              <span className="text-[11px] font-medium tracking-wide uppercase text-[var(--text-secondary)]">
                Powered by Room Sewa
              </span>
            </div>
          </div>

          {/* Persona Switcher Pill */}
          <div className="bg-[var(--bg-secondary)] p-1 rounded-full border border-[var(--border-color)] flex items-center">
            <button
              type="button"
              onClick={() => setPersona('seeker')}
              className={`flex-1 py-1.5 px-3 rounded-full text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                persona === 'seeker'
                  ? 'bg-[var(--accent-color)] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <span>🔍</span>
              <span>Seeker</span>
            </button>
            <button
              type="button"
              onClick={() => setPersona('employer')}
              className={`flex-1 py-1.5 px-3 rounded-full text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                persona === 'employer'
                  ? 'bg-[var(--accent-color)] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <span>🏢</span>
              <span>Employer</span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <Link
              href="/"
              className={`flex items-center gap-3.5 px-3 py-2.5 rounded-full text-base font-semibold transition ${
                pathname === '/'
                  ? 'bg-[var(--bg-hover)] text-[var(--accent-color)] font-bold'
                  : 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              <span className="text-lg">🧭</span>
              <span>Explore Jobs</span>
            </Link>

            {persona === 'seeker' ? (
              <div
                className="flex items-center justify-between px-3 py-2.5 rounded-full text-base font-semibold text-[var(--text-secondary)] opacity-80 cursor-not-allowed group"
                title="Step 3 feature coming next"
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-lg">📄</span>
                  <span>My Applications</span>
                </div>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                  Step 3
                </span>
              </div>
            ) : (
              <div
                className="flex items-center justify-between px-3 py-2.5 rounded-full text-base font-semibold text-[var(--text-secondary)] opacity-80 cursor-not-allowed group"
                title="Step 4 feature coming next"
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-lg">📊</span>
                  <span>Employer Vacancies</span>
                </div>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                  Step 4
                </span>
              </div>
            )}
          </nav>
        </div>

        {/* Footer controls: Active User ID & Theme Switcher */}
        <div className="space-y-4 pt-4 border-t border-[var(--border-color)]">
          {/* Active User ID indicator */}
          <div className="bg-[var(--bg-secondary)] rounded-xl p-2.5 border border-[var(--border-color)] text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[var(--text-secondary)] font-medium">Active {persona === 'seeker' ? 'Seeker' : 'Employer'} ID:</span>
              <span className="font-mono font-bold text-[var(--accent-color)]">#{activeUserId}</span>
            </div>
            <div className="flex gap-1 items-center">
              <input
                type="text"
                value={activeUserId}
                onChange={(e) => setActiveUserId(e.target.value)}
                placeholder="Team User ID"
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded px-2 py-1 text-xs font-mono focus:outline-none focus:border-[var(--accent-color)]"
              />
            </div>
          </div>

          {/* 3-Mode Theme Switcher Dock */}
          <div>
            <div className="text-[11px] uppercase font-bold tracking-wider text-[var(--text-secondary)] mb-2 px-1">
              Theme Mode
            </div>
            <div className="grid grid-cols-3 gap-1.5 bg-[var(--bg-secondary)] p-1 rounded-xl border border-[var(--border-color)]">
              {(
                [
                  { id: 'default', label: 'Default', icon: '☀️' },
                  { id: 'dim', label: 'Dim', icon: '🌙' },
                  { id: 'lights-out', label: 'Black', icon: '🌑' },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTheme(t.id as AppTheme)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex flex-col items-center justify-center gap-0.5 transition ${
                    theme === t.id
                      ? 'bg-[var(--accent-color)] text-white shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                  }`}
                >
                  <span className="text-xs">{t.icon}</span>
                  <span className="text-[10px]">{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Center Timeline Column */}
      <main className="md:col-span-9 lg:col-span-6 border-r border-[var(--border-color)] min-h-screen pb-16">
        {/* Sticky blurred top header */}
        <div className="sticky top-0 z-30 backdrop-blur-md bg-[var(--bg-primary)]/80 border-b border-[var(--border-color)] px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-extrabold tracking-tight">Verified Job Timeline</h1>
            <p className="text-xs text-[var(--text-secondary)]">Nepal Tech, Corporate & Service Opportunities</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)]">
            Live Feed
          </span>
        </div>
        {children}
      </main>

      {/* Right Utility Sidebar */}
      <aside className="hidden lg:block lg:col-span-3 p-4 space-y-4 sticky top-0 h-screen overflow-y-auto">
        {/* Labour Act Note */}
        <div className="rounded-2xl p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)]">
          <div className="flex items-center gap-2 mb-2 text-emerald-500 font-bold text-xs uppercase tracking-wide">
            <span>🛡️</span>
            <span>Nepal Labour Act 2074</span>
          </div>
          <p className="text-xs font-medium text-[var(--text-primary)] leading-relaxed">
            Zero candidate placement fees — 100% free for all job seekers across Nepal. Never pay for job applications or interviews.
          </p>
        </div>

        {/* Quick RoomSewa Link Card */}
        <div className="rounded-2xl p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <span className="text-base">🏠</span>
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent-color)]">Room Sewa Nepal</span>
          </div>
          <h3 className="text-sm font-bold leading-snug">Relocating for your new job in Kathmandu?</h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Find verified rooms, flatmates, and apartments close to your workplace without agent commission.
          </p>
          <a
            href="https://roomsewa.com.np"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 text-center py-2 px-3 rounded-full text-xs font-bold bg-[var(--accent-color)] text-white hover:opacity-90 transition"
          >
            Explore Rooms & Flats →
          </a>
        </div>

        {/* Quick Tips */}
        <div className="rounded-2xl p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs text-[var(--text-secondary)] space-y-2">
          <div className="font-bold text-[var(--text-primary)]">Quick Search Tips</div>
          <p>• Filter by Workplace (Remote vs On-Site) to find jobs compatible with your location.</p>
          <p>• Look for the green <strong className="text-emerald-500 font-semibold">Negotiable</strong> badge to discuss competitive salary packages.</p>
        </div>

        {/* Footer Meta */}
        <div className="px-2 text-[11px] text-[var(--text-secondary)] space-y-1">
          <div className="flex gap-2 flex-wrap">
            <a href="https://roomsewa.com.np/terms" target="_blank" rel="noreferrer" className="hover:underline">Terms</a>
            <span>·</span>
            <a href="https://roomsewa.com.np/privacy" target="_blank" rel="noreferrer" className="hover:underline">Privacy</a>
            <span>·</span>
            <span>Room Sewa API v1</span>
          </div>
          <p>© 2026 Room Sewa Business Solutions</p>
        </div>
      </aside>
    </div>
  );
}

