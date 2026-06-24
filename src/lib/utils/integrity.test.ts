import { describe, it, expect } from 'vitest';
import { canDeleteProject, canDeleteUser } from './integrity';
import type { Project, StatusReport } from '$lib/types';

const projects: Project[] = [
	{ id: 'p1', name: 'Apollo', description: '', status: 'Active', ownerId: 'owner' },
	{ id: 'p2', name: 'Borealis', description: '', status: 'On Hold', ownerId: 'someone-else' }
];

const reports: StatusReport[] = [
	{
		id: 'r1',
		projectId: 'p1',
		authorId: 'author',
		reportingPeriod: '2026-06',
		accomplishments: 'x',
		blockers: '',
		nextSteps: 'y',
		overallStatus: 'Green',
		createdAt: '2026-06-01T00:00:00.000Z',
		updatedAt: '2026-06-01T00:00:00.000Z'
	}
];

describe('canDeleteUser', () => {
	it('blocks a user who authored a report', () => {
		const check = canDeleteUser('author', projects, reports);
		expect(check.ok).toBe(false);
		expect(check.reason).toContain('status report');
	});

	it('blocks a user who owns a project even with no reports', () => {
		const check = canDeleteUser('owner', projects, reports);
		expect(check.ok).toBe(false);
		expect(check.reason).toContain('project');
	});

	it('allows a user referenced by nothing', () => {
		expect(canDeleteUser('nobody', projects, reports)).toEqual({ ok: true });
	});
});

describe('canDeleteProject', () => {
	it('blocks a project referenced by a report', () => {
		const check = canDeleteProject('p1', reports);
		expect(check.ok).toBe(false);
		expect(check.reason).toContain('status report');
	});

	it('allows a project no report references', () => {
		expect(canDeleteProject('p2', reports)).toEqual({ ok: true });
	});
});
