import { describe, it, expect } from 'vitest';
import { isValidEmail, validateUser, validateProject, validateReport } from './validation';
import type { Project, ReportDraft, User } from '$lib/types';

const users: User[] = [{ id: 'u1', name: 'Ada', email: 'ada@dynamo.works', role: 'Developer' }];
const projects: Project[] = [
	{ id: 'p1', name: 'Apollo', description: '', status: 'Active', ownerId: 'u1' }
];

const validReport: ReportDraft = {
	projectId: 'p1',
	authorId: 'u1',
	reportingPeriod: '2026-06',
	overallStatus: 'Green',
	accomplishments: 'Did things',
	blockers: '',
	nextSteps: 'Do more things'
};

describe('isValidEmail', () => {
	it('accepts a well-formed address', () => {
		expect(isValidEmail('jane.doe@dynamo.works')).toBe(true);
	});

	it('rejects malformed addresses', () => {
		expect(isValidEmail('jane.doe')).toBe(false);
		expect(isValidEmail('jane@')).toBe(false);
		expect(isValidEmail('jane@dynamo')).toBe(false);
		expect(isValidEmail('jane doe@dynamo.works')).toBe(false);
	});
});

describe('validateUser', () => {
	it('passes a complete, valid user', () => {
		expect(validateUser({ name: 'Jane', email: 'jane@dynamo.works', role: 'Developer' })).toEqual(
			{}
		);
	});

	it('flags a missing name', () => {
		const errors = validateUser({ name: '  ', email: 'jane@dynamo.works', role: 'Developer' });
		expect(errors.name).toBeTruthy();
	});

	it('flags an invalid email format', () => {
		const errors = validateUser({ name: 'Jane', email: 'not-an-email', role: 'Developer' });
		expect(errors.email).toBeTruthy();
	});

	it('rejects a role outside the allowed enum', () => {
		const errors = validateUser({ name: 'Jane', email: 'jane@dynamo.works', role: 'Wizard' });
		expect(errors.role).toBeTruthy();
	});
});

describe('validateProject', () => {
	it('passes a valid project whose owner exists', () => {
		expect(
			validateProject({ name: 'Apollo', description: 'x', status: 'Active', ownerId: 'u1' }, users)
		).toEqual({});
	});

	it('flags a missing name and an invalid status', () => {
		const errors = validateProject(
			{ name: '', description: '', status: 'Paused', ownerId: 'u1' },
			users
		);
		expect(errors.name).toBeTruthy();
		expect(errors.status).toBeTruthy();
	});

	it('rejects an owner id that does not exist', () => {
		const errors = validateProject(
			{ name: 'Apollo', description: '', status: 'Active', ownerId: 'ghost' },
			users
		);
		expect(errors.ownerId).toBeTruthy();
	});
});

describe('validateReport', () => {
	it('passes a valid report with optional blockers blank', () => {
		expect(validateReport(validReport, projects, users)).toEqual({});
	});

	it('rejects an unknown project or author', () => {
		const errors = validateReport(
			{ ...validReport, projectId: 'ghost', authorId: 'ghost' },
			projects,
			users
		);
		expect(errors.projectId).toBeTruthy();
		expect(errors.authorId).toBeTruthy();
	});

	it('rejects a malformed reporting period', () => {
		expect(
			validateReport({ ...validReport, reportingPeriod: '2026-6' }, projects, users)
		).toHaveProperty('reportingPeriod');
		expect(
			validateReport({ ...validReport, reportingPeriod: '2026-13' }, projects, users)
		).toHaveProperty('reportingPeriod');
		expect(
			validateReport({ ...validReport, reportingPeriod: 'June' }, projects, users)
		).toHaveProperty('reportingPeriod');
	});

	it('requires accomplishments and next steps but not blockers', () => {
		const errors = validateReport(
			{ ...validReport, accomplishments: '', nextSteps: '' },
			projects,
			users
		);
		expect(errors.accomplishments).toBeTruthy();
		expect(errors.nextSteps).toBeTruthy();
		expect(errors.blockers).toBeUndefined();
	});

	it('rejects an overall status outside the allowed enum', () => {
		const errors = validateReport({ ...validReport, overallStatus: 'Blue' }, projects, users);
		expect(errors.overallStatus).toBeTruthy();
	});
});
