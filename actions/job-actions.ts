'use server';

import { refresh } from 'next/cache';

import { roomSewaRequest, type RoomSewaResponse } from '@/lib/roomsewa-api';
import type {
  ApplicationStatus,
  JobApplication,
  JobFilterParams,
  JobOptions,
  JobVacancy,
  PaginatedBody,
} from '@/types/roomsewa';

/**
 * Server Actions wrapping all 12 Room Sewa Business Jobs endpoints.
 *
 * Every exported function here is a publicly reachable endpoint, so all
 * arguments are treated as untrusted and validated before hitting the API.
 * Each action resolves to a `RoomSewaResponse<T>` (never throws).
 */

/* -------------------------------------------------------------------------- */
/*                                 Validation                                 */
/* -------------------------------------------------------------------------- */

const APPLICATION_STATUSES: readonly ApplicationStatus[] = ['APPLIED', 'SHORTLISTED', 'REJECTED', 'HIRED', 'WITHDRAWN'];
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function invalid(message: string): RoomSewaResponse<never> {
  return { success: false, message, body: null, status: 400 };
}

/** Returns the ID as a string if it is a positive integer, otherwise null. */
function toId(value: string | number | undefined | null): string | null {
  if (value === undefined || value === null) return null;
  const str = String(value).trim();
  return /^[1-9]\d*$/.test(str) ? str : null;
}

function toPage(pageNumber: number | undefined): number {
  return Number.isInteger(pageNumber) && (pageNumber as number) > 0 ? (pageNumber as number) : 1;
}

function toLimit(limit: number | undefined): number {
  return Number.isInteger(limit) && (limit as number) > 0 ? Math.min(limit as number, MAX_LIMIT) : DEFAULT_LIMIT;
}

function isApplicationStatus(value: string): value is ApplicationStatus {
  return (APPLICATION_STATUSES as readonly string[]).includes(value);
}

/** Refresh the client router after a successful mutation. */
function refreshOnSuccess<T>(result: RoomSewaResponse<T>): RoomSewaResponse<T> {
  if (result.success) refresh();
  return result;
}

/* -------------------------------------------------------------------------- */
/*                                Public / Shared                             */
/* -------------------------------------------------------------------------- */

/** 1. `GET /options` — enum values for categories, job types, workplaces, salary periods. */
export async function getJobOptionsAction(): Promise<RoomSewaResponse<JobOptions>> {
  return roomSewaRequest<JobOptions>('/options');
}

/** 2. `GET /` — paginated list of open vacancies. */
export async function getOpenJobsAction(
  filters: JobFilterParams = {},
): Promise<RoomSewaResponse<PaginatedBody<JobVacancy>>> {
  return roomSewaRequest<PaginatedBody<JobVacancy>>('/', {
    params: {
      pageNumber: toPage(filters.pageNumber),
      limit: toLimit(filters.limit),
      search: filters.search,
      category: filters.category,
      jobType: filters.jobType,
      workplace: filters.workplace,
    },
  });
}

/** 3. `GET /{id}` — vacancy detail. Pass `seekerUserId` to include `myApplication`. */
export async function getJobByIdAction(
  jobId: string | number,
  seekerUserId?: string | number,
): Promise<RoomSewaResponse<JobVacancy>> {
  const id = toId(jobId);
  if (!id) return invalid('Invalid job ID.');

  let userId: string | undefined;
  if (seekerUserId !== undefined) {
    const parsed = toId(seekerUserId);
    if (!parsed) return invalid('Invalid seeker user ID.');
    userId = parsed;
  }

  return roomSewaRequest<JobVacancy>(`/${id}`, { userId });
}

/* -------------------------------------------------------------------------- */
/*                                  Employer                                  */
/* -------------------------------------------------------------------------- */

/** 4. `GET /mine` — vacancies posted by the employer. */
export async function getEmployerJobsAction(
  employerUserId: string | number,
  pageNumber = 1,
  limit = DEFAULT_LIMIT,
): Promise<RoomSewaResponse<PaginatedBody<JobVacancy>>> {
  const userId = toId(employerUserId);
  if (!userId) return invalid('Invalid employer user ID.');

  return roomSewaRequest<PaginatedBody<JobVacancy>>('/mine', {
    userId,
    params: { pageNumber: toPage(pageNumber), limit: toLimit(limit) },
  });
}

/** 5. `POST /save` (multipart) — create, or update when `jobId` is given (`?id=`). */
export async function saveJobVacancyAction(
  formData: FormData,
  employerUserId: string | number,
  jobId?: string | number,
): Promise<RoomSewaResponse<JobVacancy>> {
  if (!(formData instanceof FormData)) return invalid('Invalid form submission.');

  const userId = toId(employerUserId);
  if (!userId) return invalid('Invalid employer user ID.');

  let id: string | undefined;
  if (jobId !== undefined && jobId !== '') {
    const parsed = toId(jobId);
    if (!parsed) return invalid('Invalid job ID.');
    id = parsed;
  }

  if (!formData.get('title')?.toString().trim()) return invalid('Job title is required.');

  return refreshOnSuccess(
    await roomSewaRequest<JobVacancy>('/save', { method: 'POST', userId, formData, params: { id } }),
  );
}

/** 6. `POST /{id}/close?closed=` — close or reopen a vacancy. */
export async function toggleCloseJobAction(
  jobId: string | number,
  closed: boolean,
  employerUserId: string | number,
): Promise<RoomSewaResponse<JobVacancy>> {
  const id = toId(jobId);
  if (!id) return invalid('Invalid job ID.');
  const userId = toId(employerUserId);
  if (!userId) return invalid('Invalid employer user ID.');
  if (typeof closed !== 'boolean') return invalid('`closed` must be true or false.');

  return refreshOnSuccess(
    await roomSewaRequest<JobVacancy>(`/${id}/close`, { method: 'POST', userId, params: { closed } }),
  );
}

/** 7. `POST /{id}/delete` — delete a vacancy. */
export async function deleteJobAction(
  jobId: string | number,
  employerUserId: string | number,
): Promise<RoomSewaResponse<unknown>> {
  const id = toId(jobId);
  if (!id) return invalid('Invalid job ID.');
  const userId = toId(employerUserId);
  if (!userId) return invalid('Invalid employer user ID.');

  return refreshOnSuccess(await roomSewaRequest<unknown>(`/${id}/delete`, { method: 'POST', userId }));
}

/** 10. `GET /{id}/applicants` — applicants for one of the employer's vacancies. */
export async function getJobApplicantsAction(
  jobId: string | number,
  employerUserId: string | number,
  status?: string,
  pageNumber = 1,
  limit = DEFAULT_LIMIT,
): Promise<RoomSewaResponse<PaginatedBody<JobApplication>>> {
  const id = toId(jobId);
  if (!id) return invalid('Invalid job ID.');
  const userId = toId(employerUserId);
  if (!userId) return invalid('Invalid employer user ID.');
  if (status && !isApplicationStatus(status)) return invalid('Invalid application status.');

  return roomSewaRequest<PaginatedBody<JobApplication>>(`/${id}/applicants`, {
    userId,
    params: { status: status || undefined, pageNumber: toPage(pageNumber), limit: toLimit(limit) },
  });
}

/** 11. `POST /applications/{id}/status?status=` — shortlist / reject / hire an applicant. */
export async function updateApplicationStatusAction(
  applicationId: string | number,
  status: string,
  employerUserId: string | number,
): Promise<RoomSewaResponse<JobApplication>> {
  const id = toId(applicationId);
  if (!id) return invalid('Invalid application ID.');
  const userId = toId(employerUserId);
  if (!userId) return invalid('Invalid employer user ID.');
  if (!isApplicationStatus(status)) return invalid('Invalid application status.');

  return refreshOnSuccess(
    await roomSewaRequest<JobApplication>(`/applications/${id}/status`, {
      method: 'POST',
      userId,
      params: { status },
    }),
  );
}

/* -------------------------------------------------------------------------- */
/*                                 Job Seeker                                 */
/* -------------------------------------------------------------------------- */

/** 8. `POST /{id}/apply` (multipart) — apply to a vacancy (note, CV file, etc.). */
export async function applyToJobAction(
  jobId: string | number,
  formData: FormData,
  seekerUserId: string | number,
): Promise<RoomSewaResponse<JobApplication>> {
  const id = toId(jobId);
  if (!id) return invalid('Invalid job ID.');
  if (!(formData instanceof FormData)) return invalid('Invalid form submission.');
  const userId = toId(seekerUserId);
  if (!userId) return invalid('Invalid seeker user ID.');

  return refreshOnSuccess(
    await roomSewaRequest<JobApplication>(`/${id}/apply`, { method: 'POST', userId, formData }),
  );
}

/** 9. `GET /applications/mine` — the seeker's own applications. */
export async function getMyApplicationsAction(
  seekerUserId: string | number,
  pageNumber = 1,
  limit = DEFAULT_LIMIT,
): Promise<RoomSewaResponse<PaginatedBody<JobApplication>>> {
  const userId = toId(seekerUserId);
  if (!userId) return invalid('Invalid seeker user ID.');

  return roomSewaRequest<PaginatedBody<JobApplication>>('/applications/mine', {
    userId,
    params: { pageNumber: toPage(pageNumber), limit: toLimit(limit) },
  });
}

/** 12. `POST /applications/{id}/withdraw` — withdraw the seeker's application. */
export async function withdrawApplicationAction(
  applicationId: string | number,
  seekerUserId: string | number,
): Promise<RoomSewaResponse<JobApplication>> {
  const id = toId(applicationId);
  if (!id) return invalid('Invalid application ID.');
  const userId = toId(seekerUserId);
  if (!userId) return invalid('Invalid seeker user ID.');

  return refreshOnSuccess(
    await roomSewaRequest<JobApplication>(`/applications/${id}/withdraw`, { method: 'POST', userId }),
  );
}

