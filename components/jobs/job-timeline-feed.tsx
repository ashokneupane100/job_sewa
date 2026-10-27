'use client';

import React, { useState, useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import type { JobVacancy, SalaryPeriod } from '@/types/roomsewa';
import { getJobByIdAction } from '@/actions/job-actions';
import { useAppShell } from '@/components/providers/app-shell-provider';

export function JobTimelineFeed({
  jobs = [],
  total = 0,
  currentPage = 1,
  limit = 20,
}: {
  jobs: JobVacancy[];
  total: number;
  currentPage: number;
  limit?: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const { persona, activeUserId } = useAppShell();
  const [selectedJob, setSelectedJob] = useState<JobVacancy | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [fontSize, setFontSize] = useState<number>(16);

  const totalPages = Math.ceil(total / limit) || 1;

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('pageNumber', String(newPage));
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenDetail = async (job: JobVacancy) => {
    setSelectedJob(job);
    setLoadingDetail(true);
    try {
      const res = await getJobByIdAction(job.id, persona === 'seeker' ? activeUserId : undefined);
      if (res.success && res.body) {
        setSelectedJob(res.body);
      }
    } catch (e) {
      console.warn('Could not fetch enhanced job details:', e);
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <div>
      {/* Vacancy Feed List */}
      {jobs.length === 0 ? (
        <div className="p-12 text-center text-[var(--text-secondary)] space-y-3">
          <div className="text-4xl">💼</div>
          <h3 className="text-base font-bold text-[var(--text-primary)]">No vacancies found</h3>
          <p className="text-xs max-w-sm mx-auto">
            Try adjusting your search criteria, selecting another category, or resetting all filters.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[var(--border-color)]">
          {jobs.map((job) => (
            <article
              key={String(job.id)}
              onClick={() => handleOpenDetail(job)}
              className="p-4 hover:bg-[var(--bg-hover)] transition cursor-pointer flex gap-3 text-left group"
            >
              {/* Company Avatar / Initials */}
              <div className="shrink-0">
                {job.photoUrl || job.filePhoto ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={job.photoUrl || job.filePhoto}
                    alt={job.companyName ?? 'Company'}
                    className="w-10 h-10 rounded-full object-cover border border-[var(--border-color)]"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center font-bold text-sm text-[var(--accent-color)]">
                    {(job.companyName || job.title || 'J').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Job Body */}
              <div className="flex-1 min-w-0 space-y-1.5">
                {/* Top Row: Title, Company, Date */}
                <div className="flex items-baseline justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                    <h2 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-color)] transition truncate">
                      {job.title}
                    </h2>
                    <span className="text-[var(--text-secondary)] text-xs truncate">
                      @{job.companyName || 'Verified Employer'}
                    </span>
                    <span className="text-[var(--text-secondary)] text-xs">·</span>
                    <span className="text-[var(--text-secondary)] text-xs">
                      {formatDate(job.createdAt || job.deadline)}
                    </span>
                  </div>
                  {job.openings && job.openings > 1 && (
                    <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)]">
                      {job.openings} Openings
                    </span>
                  )}
                </div>

                {/* Metadata Badges */}
                <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                  {job.category && (
                    <span className="px-2 py-0.5 rounded-full bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)] font-medium">
                      {humanizeLabel(job.category)}
                    </span>
                  )}
                  {job.jobType && (
                    <span className="px-2 py-0.5 rounded-full bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)] font-medium">
                      {humanizeLabel(job.jobType)}
                    </span>
                  )}
                  {job.workplace && (
                    <span className="px-2 py-0.5 rounded-full bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)] font-medium">
                      {humanizeLabel(job.workplace)}
                    </span>
                  )}
                  {job.address && (
                    <span className="text-[var(--text-secondary)] flex items-center gap-0.5">
                      <span>📍</span>
                      <span className="truncate max-w-[150px]">{job.address}</span>
                    </span>
                  )}
                </div>

                {/* Salary Highlight Bar */}
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="text-xs font-bold text-[var(--text-primary)]">
                    {formatNprSalary(job.salaryMin, job.salaryMax, job.salaryPeriod)}
                  </span>
                  {job.negotiable && (
                    <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      Salary Negotiable
                    </span>
                  )}
                </div>

                {/* Truncated Description */}
                {job.description && (
                  <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>
                )}

                {/* Skills tags */}
                {job.skills && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {job.skills
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean)
                      .slice(0, 4)
                      .map((skill) => (
                        <span
                          key={skill}
                          className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-[var(--bg-secondary)] text-[var(--text-secondary)]"
                        >
                          #{skill}
                        </span>
                      ))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Pagination Bar */}
      {total > 0 && (
        <div className="p-4 border-t border-[var(--border-color)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <div>
            Showing <span className="font-bold text-[var(--text-primary)]">{(currentPage - 1) * limit + 1}</span> -{' '}
            <span className="font-bold text-[var(--text-primary)]">{Math.min(currentPage * limit, total)}</span> of{' '}
            <span className="font-bold text-[var(--text-primary)]">{total}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="px-3 py-1.5 rounded-full border border-[var(--border-color)] font-semibold hover:bg-[var(--bg-hover)] disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
            >
              ← Previous
            </button>
            <span className="font-mono text-xs">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className="px-3 py-1.5 rounded-full border border-[var(--border-color)] font-semibold hover:bg-[var(--bg-hover)] disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Slide-Over / Modal Job Detail Drawer */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between sticky top-0 bg-[var(--bg-primary)] z-10">
              <div className="min-w-0 pr-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--accent-color)] flex items-center gap-1.5">
                  <span>Job Detail · #{selectedJob.id}</span>
                  {loadingDetail && <span className="animate-spin text-xs">🌀</span>}
                </span>
                <h2 className="text-lg font-black text-[var(--text-primary)] truncate">
                  {selectedJob.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedJob(null)}
                className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)] flex items-center justify-center text-sm font-bold transition shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-left">
              {/* Top Overview Card */}
              <div className="rounded-xl p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <div className="font-bold text-base text-[var(--text-primary)]">
                      {selectedJob.companyName || 'Verified Employer'}
                    </div>
                    {selectedJob.address && (
                      <div className="text-xs text-[var(--text-secondary)] flex items-center gap-1 mt-0.5">
                        <span>📍</span>
                        <span>{selectedJob.address}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-base font-extrabold text-[var(--accent-color)]">
                      {formatNprSalary(selectedJob.salaryMin, selectedJob.salaryMax, selectedJob.salaryPeriod)}
                    </div>
                    {selectedJob.negotiable && (
                      <span className="text-[10px] font-bold text-emerald-500 uppercase">
                        Salary Negotiable
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2 border-t border-[var(--border-color)] text-xs font-semibold text-[var(--text-secondary)]">
                  {selectedJob.category && (
                    <span className="bg-[var(--bg-primary)] px-2.5 py-1 rounded-md border border-[var(--border-color)]">
                      📂 {humanizeLabel(selectedJob.category)}
                    </span>
                  )}
                  {selectedJob.jobType && (
                    <span className="bg-[var(--bg-primary)] px-2.5 py-1 rounded-md border border-[var(--border-color)]">
                      ⏰ {humanizeLabel(selectedJob.jobType)}
                    </span>
                  )}
                  {selectedJob.workplace && (
                    <span className="bg-[var(--bg-primary)] px-2.5 py-1 rounded-md border border-[var(--border-color)]">
                      🏢 {humanizeLabel(selectedJob.workplace)}
                    </span>
                  )}
                  {selectedJob.openings && (
                    <span className="bg-[var(--bg-primary)] px-2.5 py-1 rounded-md border border-[var(--border-color)]">
                      👥 {selectedJob.openings} Openings
                    </span>
                  )}
                  {selectedJob.deadline && (
                    <span className="bg-[var(--bg-primary)] px-2.5 py-1 rounded-md border border-[var(--border-color)]">
                      ⏳ Deadline: {formatDate(selectedJob.deadline)}
                    </span>
                  )}
                </div>
              </div>

              {/* Font Resizer Control Bar */}
              <div className="flex items-center justify-between bg-[var(--bg-secondary)] px-3 py-2 rounded-xl border border-[var(--border-color)] text-xs">
                <span className="text-[var(--text-secondary)] font-medium flex items-center gap-1">
                  <span>🔤</span>
                  <span>Description Font Size:</span>
                  <strong className="text-[var(--text-primary)] font-mono">{fontSize}px</strong>
                </span>
                <div className="flex items-center gap-1.5 font-bold font-mono">
                  <button
                    type="button"
                    onClick={() => setFontSize((s) => Math.max(14, s - 2))}
                    disabled={fontSize <= 14}
                    className="w-7 h-7 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] hover:bg-[var(--bg-hover)] disabled:opacity-40 flex items-center justify-center transition"
                    title="Decrease font size"
                  >
                    −
                  </button>
                  <button
                    type="button"
                    onClick={() => setFontSize(16)}
                    className="w-7 h-7 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] hover:bg-[var(--bg-hover)] flex items-center justify-center transition text-[11px]"
                    title="Reset to 16px"
                  >
                    ↺
                  </button>
                  <button
                    type="button"
                    onClick={() => setFontSize((s) => Math.min(28, s + 2))}
                    disabled={fontSize >= 28}
                    className="w-7 h-7 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] hover:bg-[var(--bg-hover)] disabled:opacity-40 flex items-center justify-center transition"
                    title="Increase font size"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Full Description with dynamic font-size */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Job Description & Roles
                </h3>
                <div
                  style={{ fontSize: `${fontSize}px`, lineHeight: 1.75 }}
                  className="whitespace-pre-wrap text-[var(--text-primary)] font-normal select-text leading-relaxed"
                >
                  {selectedJob.description || 'No detailed description provided by the employer.'}
                </div>
              </div>

              {/* Requirements: Education & Experience */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedJob.education && (
                  <div className="p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-1">
                    <span className="text-[11px] font-bold uppercase text-[var(--text-secondary)]">
                      🎓 Education Required
                    </span>
                    <p className="text-xs font-semibold text-[var(--text-primary)]">
                      {selectedJob.education}
                    </p>
                  </div>
                )}
                {selectedJob.experience && (
                  <div className="p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-1">
                    <span className="text-[11px] font-bold uppercase text-[var(--text-secondary)]">
                      💼 Experience Required
                    </span>
                    <p className="text-xs font-semibold text-[var(--text-primary)]">
                      {selectedJob.experience}
                    </p>
                  </div>
                )}
              </div>

              {/* Skills required */}
              {selectedJob.skills && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                    Required Skills & Competencies
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.skills
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean)
                      .map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 rounded-full bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] text-xs font-semibold"
                        >
                          {skill}
                        </span>
                      ))}
                  </div>
                </div>
              )}

              {/* Contact Information */}
              {selectedJob.contactNumber && (
                <div className="p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-1">
                  <span className="text-[11px] font-bold uppercase text-[var(--text-secondary)]">
                    📞 Employer Contact
                  </span>
                  <p className="text-xs font-bold text-[var(--text-primary)]">
                    {selectedJob.contactNumber}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Action Footer */}
            <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-secondary)] flex items-center justify-between gap-4">
              <div className="text-xs text-[var(--text-secondary)]">
                {persona === 'seeker' ? (
                  <span>Zero fee application under Nepal Labour Act 2074</span>
                ) : (
                  <span>Employer mode active (#{activeUserId})</span>
                )}
              </div>

              {persona === 'seeker' ? (
                <button
                  type="button"
                  onClick={() => alert(`Applying to Job #${selectedJob.id} is arriving in Step 3 (CV Upload Modal)!`)}
                  className="px-6 py-2.5 rounded-full bg-[var(--accent-color)] text-white text-sm font-bold hover:opacity-90 transition shadow-sm"
                >
                  Apply Now →
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)]">
                    {selectedJob.closed ? 'Closed' : 'Active Vacancy'}
                  </span>
                  <button
                    type="button"
                    onClick={() => alert(`Job management for Job #${selectedJob.id} is arriving in Step 4!`)}
                    className="px-4 py-2 rounded-full bg-[var(--accent-color)] text-white text-xs font-bold hover:opacity-90 transition"
                  >
                    Manage Vacancy
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function humanizeLabel(val: string): string {
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

const nprFormat = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

function formatNprSalary(min?: number, max?: number, period?: SalaryPeriod): string {
  const hasMin = typeof min === 'number' && min > 0;
  const hasMax = typeof max === 'number' && max > 0;
  if (!hasMin && !hasMax) return 'NPR Negotiable';

  const periodStr = period ? ` / ${period.toLowerCase()}` : ' / month';

  if (hasMin && hasMax && min !== max) {
    return `NPR ${nprFormat.format(min)} - ${nprFormat.format(max)}${periodStr}`;
  }
  return `NPR ${nprFormat.format((hasMin ? min : max) as number)}${periodStr}`;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return 'Recently';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}
