import { Suspense } from 'react';
import { connection } from 'next/server';

import { getJobOptionsAction, getOpenJobsAction } from '@/actions/job-actions';
import { JobFilterBar } from '@/components/jobs/job-filter-bar';
import { JobTimelineFeed } from '@/components/jobs/job-timeline-feed';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    category?: string;
    jobType?: string;
    workplace?: string;
    pageNumber?: string;
  }>;
}) {
  await connection();
  const resolvedSearchParams = await searchParams;

  const search = resolvedSearchParams.search;
  const category = resolvedSearchParams.category;
  const jobType = resolvedSearchParams.jobType;
  const workplace = resolvedSearchParams.workplace;
  const currentPage = Number(resolvedSearchParams.pageNumber) || 1;

  const [optionsRes, jobsRes] = await Promise.all([
    getJobOptionsAction(),
    getOpenJobsAction({
      search,
      category,
      jobType,
      workplace,
      pageNumber: currentPage,
      limit: 20,
    }),
  ]);

  const options = optionsRes.success ? optionsRes.body : undefined;
  const jobs = jobsRes.success && jobsRes.body?.data ? jobsRes.body.data : [];
  const total = jobsRes.success && typeof jobsRes.body?.total === 'number' ? jobsRes.body.total : 0;

  return (
    <div className="w-full">
      <Suspense fallback={<FilterBarSkeleton />}>
        <JobFilterBar options={options} />
      </Suspense>

      <JobTimelineFeed
        jobs={jobs}
        total={total}
        currentPage={currentPage}
        limit={20}
      />
    </div>
  );
}

function FilterBarSkeleton() {
  return (
    <div className="sticky top-[57px] z-20 backdrop-blur-md bg-[var(--bg-primary)]/80 border-b border-[var(--border-color)] px-4 py-3 space-y-3">
      <div className="h-9 w-full rounded-full bg-[var(--bg-secondary)] animate-pulse" />
      <div className="flex gap-2">
        <div className="h-7 w-24 rounded-full bg-[var(--bg-secondary)] animate-pulse" />
        <div className="h-7 w-20 rounded-full bg-[var(--bg-secondary)] animate-pulse" />
        <div className="h-7 w-24 rounded-full bg-[var(--bg-secondary)] animate-pulse" />
      </div>
    </div>
  );
}
