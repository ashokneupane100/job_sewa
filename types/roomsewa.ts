/**
 * Type definitions for the Room Sewa Business Jobs API.
 * Base URL: https://api.roomsewa.com.np/rsewa/api/v1/business/jobs
 */

/* -------------------------------------------------------------------------- */
/*                               Enums / Unions                               */
/* -------------------------------------------------------------------------- */

export type JobCategory =
  | 'IT_SOFTWARE'
  | 'SALES_MARKETING'
  | 'HOSPITALITY'
  | 'EDUCATION'
  | 'HEALTHCARE'
  | 'DRIVING_DELIVERY'
  | 'CONSTRUCTION'
  | 'OFFICE_ADMIN'
  | 'ACCOUNTING_FINANCE'
  | 'SECURITY'
  | 'DOMESTIC_HELP'
  | 'OTHER';

export type JobType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'FREELANCE';

export type WorkplaceType = 'ON_SITE' | 'REMOTE' | 'HYBRID';

export type SalaryPeriod = 'MONTH' | 'DAY' | 'HOUR';

export type ApplicationStatus = 'APPLIED' | 'SHORTLISTED' | 'REJECTED' | 'HIRED' | 'WITHDRAWN';

/* -------------------------------------------------------------------------- */
/*                              Response Wrappers                             */
/* -------------------------------------------------------------------------- */

/**
 * Envelope returned by every endpoint (HTTP 200 even for validation errors).
 * Always check `success` — and treat HTTP 401 separately (bad/missing token).
 *
 * Note: the live API omits `message` on most successful responses, and omits
 * `body` on failures, so `message` is optional here.
 */
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  body: T;
}

/** Body shape for paginated list endpoints (`pageNumber` starts at 1). */
export interface PaginatedBody<T> {
  data: T[];
  total: number;
}

/* -------------------------------------------------------------------------- */
/*                                Domain Models                               */
/* -------------------------------------------------------------------------- */

/** Response body of `GET /options`. */
export interface JobOptions {
  categories?: string[];
  jobTypes?: string[];
  workplaces?: string[];
  salaryPeriods?: string[];
  applicationStatuses?: string[];
  [key: string]: unknown;
}

export interface JobVacancy {
  id: number | string;
  title: string;
  description?: string;
  category?: JobCategory;
  jobType?: JobType;
  workplace?: WorkplaceType;
  openings?: number;
  salaryMin?: number;
  salaryMax?: number;
  salaryPeriod?: SalaryPeriod;
  negotiable?: boolean;
  experience?: string;
  education?: string;
  skills?: string;
  deadline?: string;
  companyName?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  contactNumber?: string;
  photoUrl?: string;
  filePhoto?: string;
  closed?: boolean;
  approved?: boolean;
  employerId?: number | string;
  applicantCount?: number;
  createdAt?: string;
  myApplication?: JobApplication | null;
  [key: string]: unknown;
}

export interface JobApplication {
  id: number | string;
  jobId?: number | string;
  userId?: number | string;
  status: ApplicationStatus;
  note?: string;
  cvFile?: string;
  applicantName?: string;
  applicantPhone?: string;
  applicantEmail?: string;
  createdAt?: string;
  vacancy?: JobVacancy;
  [key: string]: unknown;
}

/** Query params accepted by the paginated job list endpoint (`GET /`). */
export interface JobFilterParams {
  search?: string;
  category?: string;
  jobType?: string;
  workplace?: string;
  pageNumber?: number;
  limit?: number;
}

