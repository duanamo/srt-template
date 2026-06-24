import {
	OVERALL_STATUSES,
	PROJECT_STATUSES,
	ROLES,
	type FieldErrors,
	type OverallStatus,
	type Project,
	type ProjectDraft,
	type ProjectStatus,
	type ReportDraft,
	type Role,
	type User,
	type UserDraft
} from '$lib/types';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PERIOD_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

export function isValidEmail(email: string): boolean {
	return EMAIL_RE.test(email.trim());
}

export function hasErrors(errors: FieldErrors): boolean {
	return Object.keys(errors).length > 0;
}

export function validateUser(draft: UserDraft): FieldErrors {
	const errors: FieldErrors = {};

	if (!draft.name.trim()) {
		errors.name = 'Name is required';
	}

	if (!draft.email.trim()) {
		errors.email = 'Email is required';
	} else if (!isValidEmail(draft.email)) {
		errors.email = 'Enter a valid email address';
	}

	if (!draft.role) {
		errors.role = 'Role is required';
	} else if (!ROLES.includes(draft.role as Role)) {
		errors.role = 'Select a valid role';
	}

	return errors;
}

export function validateProject(draft: ProjectDraft, users: readonly User[]): FieldErrors {
	const errors: FieldErrors = {};

	if (!draft.name.trim()) {
		errors.name = 'Name is required';
	}

	if (!draft.status) {
		errors.status = 'Status is required';
	} else if (!PROJECT_STATUSES.includes(draft.status as ProjectStatus)) {
		errors.status = 'Select a valid status';
	}

	if (!draft.ownerId) {
		errors.ownerId = 'Owner is required';
	} else if (!users.some((u) => u.id === draft.ownerId)) {
		errors.ownerId = 'Selected owner does not exist';
	}

	return errors;
}

export function validateReport(
	draft: ReportDraft,
	projects: readonly Project[],
	users: readonly User[]
): FieldErrors {
	const errors: FieldErrors = {};

	if (!draft.projectId) {
		errors.projectId = 'Project is required';
	} else if (!projects.some((p) => p.id === draft.projectId)) {
		errors.projectId = 'Selected project does not exist';
	}

	if (!draft.authorId) {
		errors.authorId = 'Author is required';
	} else if (!users.some((u) => u.id === draft.authorId)) {
		errors.authorId = 'Selected author does not exist';
	}

	if (!draft.reportingPeriod) {
		errors.reportingPeriod = 'Reporting period is required';
	} else if (!PERIOD_RE.test(draft.reportingPeriod)) {
		errors.reportingPeriod = 'Use the format YYYY-MM';
	}

	if (!draft.overallStatus) {
		errors.overallStatus = 'Overall status is required';
	} else if (!OVERALL_STATUSES.includes(draft.overallStatus as OverallStatus)) {
		errors.overallStatus = 'Select a valid status';
	}

	if (!draft.accomplishments.trim()) {
		errors.accomplishments = 'Accomplishments are required';
	}

	if (!draft.nextSteps.trim()) {
		errors.nextSteps = 'Next steps are required';
	}

	return errors;
}
