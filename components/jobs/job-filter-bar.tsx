'use client';

import React, { useTransition, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import type { JobOptions } from '@/types/roomsewa';

export function JobFilterBar({ options }: { options?: JobOptions }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSearch = searchParams.get('search') ?? '';
  const currentCategory = searchParams.get('category') ?? '';
  const currentJobType = searchParams.get('jobType') ?? '';
  const currentWorkplace = searchParams.get('workplace') ?? '';

  const [searchInput, setSearchInput] = useState(currentSearch);
  const [prevSearch, setPrevSearch] = useState(currentSearch);

  // Sync state when URL searchParam changes during navigation/reset (recommended React pattern)
  if (currentSearch !== prevSearch) {
    setPrevSearch(currentSearch);
    setSearchInput(currentSearch);
  }

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value.trim() !== '') {
      params.set(key, value.trim());
    } else {
      params.delete(key);
    }
    params.set('pageNumber', '1');

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam('search', searchInput);
  };

  const handleResetFilters = () => {
    setSearchInput('');
    startTransition(() => {
      router.push(pathname);
    });
  };

  const activeFiltersCount = [
    currentSearch,
    currentCategory,
    currentJobType,
    currentWorkplace,
  ].filter(Boolean).length;

  const categories = options?.categories ?? [];
  const jobTypes = options?.jobTypes ?? [];
  const workplaces = options?.workplaces ?? [];

  return (
    <div className="sticky top-[57px] z-20 backdrop-blur-md bg-[var(--bg-primary)]/80 border-b border-[var(--border-color)] px-4 py-3 space-y-3">
      {/* Search Input Bar */}
      <form onSubmit={handleSearchSubmit} className="relative flex items-center">
        <span className="absolute left-3.5 text-[var(--text-secondary)] text-sm">🔍</span>
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search jobs, skills, or companies in Nepal..."
          className="w-full bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] text-sm rounded-full pl-10 pr-24 py-2 border border-[var(--border-color)] focus:outline-none focus:border-[var(--accent-color)] transition"
        />
        <div className="absolute right-2 flex items-center gap-1">
          {searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput('');
                updateParam('search', '');
              }}
              className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-1.5 py-0.5 rounded-full hover:bg-[var(--bg-hover)]"
              title="Clear search"
            >
              ✕
            </button>
          )}
          <button
            type="submit"
            className="text-xs font-bold bg-[var(--accent-color)] text-white px-3 py-1.5 rounded-full hover:opacity-90 transition disabled:opacity-50"
            disabled={isPending}
          >
            {isPending ? '...' : 'Search'}
          </button>
        </div>
      </form>

      {/* Filter Selectors / Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
        {/* Category Dropdown */}
        <div className="relative shrink-0">
          <select
            value={currentCategory}
            onChange={(e) => updateParam('category', e.target.value)}
            className={`appearance-none bg-[var(--bg-secondary)] border rounded-full px-3.5 py-1.5 pr-7 font-medium cursor-pointer focus:outline-none transition ${
              currentCategory
                ? 'border-[var(--accent-color)] text-[var(--accent-color)] font-bold'
                : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <option value="">Category: All</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {humanize(cat)}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[var(--text-secondary)]">
            ▼
          </span>
        </div>

        {/* Job Type Dropdown */}
        <div className="relative shrink-0">
          <select
            value={currentJobType}
            onChange={(e) => updateParam('jobType', e.target.value)}
            className={`appearance-none bg-[var(--bg-secondary)] border rounded-full px-3.5 py-1.5 pr-7 font-medium cursor-pointer focus:outline-none transition ${
              currentJobType
                ? 'border-[var(--accent-color)] text-[var(--accent-color)] font-bold'
                : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <option value="">Type: All</option>
            {jobTypes.map((type) => (
              <option key={type} value={type}>
                {humanize(type)}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[var(--text-secondary)]">
            ▼
          </span>
        </div>

        {/* Workplace Dropdown */}
        <div className="relative shrink-0">
          <select
            value={currentWorkplace}
            onChange={(e) => updateParam('workplace', e.target.value)}
            className={`appearance-none bg-[var(--bg-secondary)] border rounded-full px-3.5 py-1.5 pr-7 font-medium cursor-pointer focus:outline-none transition ${
              currentWorkplace
                ? 'border-[var(--accent-color)] text-[var(--accent-color)] font-bold'
                : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <option value="">Workplace: All</option>
            {workplaces.map((wp) => (
              <option key={wp} value={wp}>
                {humanize(wp)}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[var(--text-secondary)]">
            ▼
          </span>
        </div>

        {/* Active Filter Counter & Reset */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-1.5 shrink-0 ml-auto">
            <span className="text-[11px] font-bold text-[var(--accent-color)] bg-[var(--accent-color)]/10 px-2 py-0.5 rounded-full">
              {activeFiltersCount} active
            </span>
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[11px] font-semibold text-[var(--text-secondary)] hover:text-red-500 underline transition cursor-pointer"
            >
              Reset
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function humanize(val: string): string {
  if (val === 'IT_SOFTWARE') return 'IT & Software';
  if (val === 'SALES_MARKETING') return 'Sales & Marketing';
  if (val === 'FULL_TIME') return 'Full Time';
  if (val === 'PART_TIME') return 'Part Time';
  if (val === 'ON_SITE') return 'On-Site';
  return val
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

