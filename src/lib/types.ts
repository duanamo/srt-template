// Domain model for the Status Report Tracker. This is a frontend-only MVP, so
// these hand-written types are the single source of truth (there is no database
// to generate from). Components import from here, never from internal modules.

export const ROLES = ['Developer', 'Project Manager', 'Executive'] as const;
export type Role = (typeof ROLES)[number];

export const PROJECT_STATUSES = ['Active', 'At Risk', 'Complete', 'On Hold'] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const OVERALL_STATUSES = ['Green', 'Yellow', 'Red'] as const;
export type OverallStatus = (typeof OVERALL_STATUSES)[number];

export interface User {
	id: string;
	name: string;
	email: string;
	role: Role;
}

export interface Project {
	id: string;
	name: string;
	description: string;
	status: ProjectStatus;
	ownerId: string;
}

export interface StatusReport {
	id: string;
	projectId: string;
	authorId: string;
	reportingPeriod: string; // 'YYYY-MM'
	accomplishments: string;
	blockers: string;
	nextSteps: string;
	overallStatus: OverallStatus;
	createdAt: string; // ISO 8601
	updatedAt: string; // ISO 8601
}

export interface DataState {
	users: User[];
	projects: Project[];
	reports: StatusReport[];
}

// Draft shapes are what forms produce: untrusted, all-string fields validated at
// the store boundary before they become typed domain objects.
export interface UserDraft {
	name: string;
	email: string;
	role: string;
}

export interface ProjectDraft {
	name: string;
	description: string;
	status: string;
	ownerId: string;
}

export interface ReportDraft {
	projectId: string;
	authorId: string;
	reportingPeriod: string;
	accomplishments: string;
	blockers: string;
	nextSteps: string;
	overallStatus: string;
}

export type FieldErrors = Record<string, string>;
