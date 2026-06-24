import { describe, it, expect } from 'vitest';
import { SrtStore, type SaveResult } from './store.svelte';

function makeStore(iso = '2026-06-15T12:00:00.000Z'): SrtStore {
	return new SrtStore(() => new Date(iso));
}

// Unwraps a successful save result and returns the new id, failing loudly otherwise.
function idOf<T extends { id: string }>(result: SaveResult<T>): string {
	if (!result.ok) {
		throw new Error(`expected success, got errors: ${JSON.stringify(result.errors)}`);
	}
	return result.value.id;
}

const developer = { name: 'Jane Doe', email: 'jane@dynamo.works', role: 'Developer' };

describe('SrtStore — users CRUD', () => {
	it('starts empty when no persisted data exists', () => {
		const store = makeStore();
		expect(store.users).toEqual([]);
		expect(store.projects).toEqual([]);
		expect(store.reports).toEqual([]);
	});

	it('creates a valid user with a generated id', () => {
		const store = makeStore();
		const result = store.createUser(developer);

		expect(result.ok).toBe(true);
		expect(store.users).toHaveLength(1);
		expect(idOf(result)).toBeTruthy();
		expect(store.users[0].name).toBe('Jane Doe');
	});

	it('rejects an invalid user and leaves the store untouched', () => {
		const store = makeStore();
		const result = store.createUser({ name: '', email: 'nope', role: 'Developer' });

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.errors.name).toBeTruthy();
			expect(result.errors.email).toBeTruthy();
		}
		expect(store.users).toHaveLength(0);
	});

	it('updates an existing user', () => {
		const store = makeStore();
		const id = idOf(store.createUser(developer));

		const result = store.updateUser(id, {
			name: 'Janet Doe',
			email: 'janet@dynamo.works',
			role: 'Executive'
		});

		expect(result.ok).toBe(true);
		expect(store.userById(id)?.name).toBe('Janet Doe');
		expect(store.userById(id)?.role).toBe('Executive');
	});

	it('deletes a user referenced by nothing', () => {
		const store = makeStore();
		const id = idOf(store.createUser(developer));

		expect(store.deleteUser(id)).toEqual({ ok: true });
		expect(store.users).toHaveLength(0);
	});
});

describe('SrtStore — referential integrity', () => {
	it('blocks deleting a user who owns a project', () => {
		const store = makeStore();
		const ownerId = idOf(
			store.createUser({ name: 'Owner', email: 'owner@dynamo.works', role: 'Project Manager' })
		);
		store.createProject({ name: 'Apollo', description: '', status: 'Active', ownerId });

		const result = store.deleteUser(ownerId);
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.reason).toContain('project');
		}
		expect(store.users).toHaveLength(1);
	});

	it('blocks deleting a user who authored a report, and the project it references', () => {
		const store = makeStore();
		const ownerId = idOf(
			store.createUser({ name: 'Owner', email: 'owner@dynamo.works', role: 'Project Manager' })
		);
		const authorId = idOf(store.createUser(developer));
		const projectId = idOf(
			store.createProject({ name: 'Apollo', description: '', status: 'Active', ownerId })
		);
		store.createReport({
			projectId,
			authorId,
			reportingPeriod: '2026-06',
			overallStatus: 'Green',
			accomplishments: 'Shipped',
			blockers: '',
			nextSteps: 'Next'
		});

		expect(store.deleteUser(authorId).ok).toBe(false);
		expect(store.deleteProject(projectId).ok).toBe(false);
	});

	it('allows deleting a project no report references', () => {
		const store = makeStore();
		const ownerId = idOf(
			store.createUser({ name: 'Owner', email: 'owner@dynamo.works', role: 'Project Manager' })
		);
		const projectId = idOf(
			store.createProject({ name: 'Free', description: '', status: 'On Hold', ownerId })
		);

		expect(store.deleteProject(projectId)).toEqual({ ok: true });
		expect(store.projects).toHaveLength(0);
	});
});

describe('SrtStore — reports CRUD and timestamps', () => {
	it('rejects a report referencing a missing project or author', () => {
		const store = makeStore();
		const result = store.createReport({
			projectId: 'ghost',
			authorId: 'ghost',
			reportingPeriod: '2026-06',
			overallStatus: 'Green',
			accomplishments: 'x',
			blockers: '',
			nextSteps: 'y'
		});

		expect(result.ok).toBe(false);
		expect(store.reports).toHaveLength(0);
	});

	it('deletes a report unconditionally', () => {
		const store = makeStore();
		const ownerId = idOf(
			store.createUser({ name: 'Owner', email: 'owner@dynamo.works', role: 'Project Manager' })
		);
		const projectId = idOf(
			store.createProject({ name: 'Apollo', description: '', status: 'Active', ownerId })
		);
		const reportId = idOf(
			store.createReport({
				projectId,
				authorId: ownerId,
				reportingPeriod: '2026-06',
				overallStatus: 'Green',
				accomplishments: 'x',
				blockers: '',
				nextSteps: 'y'
			})
		);

		store.deleteReport(reportId);
		expect(store.reports).toHaveLength(0);
	});

	it('sets createdAt and updatedAt equal on create, and bumps only updatedAt on edit', () => {
		const store = makeStore('2026-06-01T00:00:00.000Z');
		const ownerId = idOf(
			store.createUser({ name: 'Owner', email: 'owner@dynamo.works', role: 'Project Manager' })
		);
		const projectId = idOf(
			store.createProject({ name: 'Apollo', description: '', status: 'Active', ownerId })
		);
		const reportId = idOf(
			store.createReport({
				projectId,
				authorId: ownerId,
				reportingPeriod: '2026-06',
				overallStatus: 'Green',
				accomplishments: 'First',
				blockers: '',
				nextSteps: 'Next'
			})
		);

		const created = store.reportById(reportId);
		expect(created?.createdAt).toBe(created?.updatedAt);

		store.now = () => new Date('2026-06-02T09:30:00.000Z');
		const result = store.updateReport(reportId, {
			projectId,
			authorId: ownerId,
			reportingPeriod: '2026-06',
			overallStatus: 'Yellow',
			accomplishments: 'Updated',
			blockers: 'A blocker',
			nextSteps: 'Next again'
		});

		expect(result.ok).toBe(true);
		const updated = store.reportById(reportId);
		expect(updated?.createdAt).toBe(created?.createdAt);
		expect(updated?.updatedAt).not.toBe(created?.updatedAt);
		expect(updated?.overallStatus).toBe('Yellow');
	});
});

describe('SrtStore — reset and clear', () => {
	it('reset loads the seed dataset', () => {
		const store = makeStore();
		store.reset();

		expect(store.users.length).toBeGreaterThanOrEqual(4);
		expect(store.projects).toHaveLength(4);
		expect(store.reports.length).toBeGreaterThanOrEqual(8);
	});

	it('clear empties every collection', () => {
		const store = makeStore();
		store.reset();
		store.clear();

		expect(store.users).toEqual([]);
		expect(store.projects).toEqual([]);
		expect(store.reports).toEqual([]);
	});
});
