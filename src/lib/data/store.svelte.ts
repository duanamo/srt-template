import { browser } from '$app/environment';
import type {
	DataState,
	FieldErrors,
	OverallStatus,
	Project,
	ProjectDraft,
	ProjectStatus,
	ReportDraft,
	Role,
	StatusReport,
	User,
	UserDraft
} from '$lib/types';
import { createSeedData } from './seed';
import { canDeleteProject, canDeleteUser } from '$lib/utils/integrity';
import { hasErrors, validateProject, validateReport, validateUser } from '$lib/utils/validation';

const STORAGE_KEY = 'srt:data';

export type SaveResult<T> = { ok: true; value: T } | { ok: false; errors: FieldErrors };
export type DeleteResult = { ok: true } | { ok: false; reason: string };

// The single reactive owner of all app data. State lives in `$state` arrays so any
// component reading them updates automatically; every mutation persists the whole
// dataset back to localStorage under one key. A `now` clock is injectable so tests
// can assert deterministic timestamps.
export class SrtStore {
	users = $state<User[]>([]);
	projects = $state<Project[]>([]);
	reports = $state<StatusReport[]>([]);
	now: () => Date;

	// The clock returns a plain Date used only to derive an ISO timestamp or a
	// reporting period; it is never stored in reactive state, so SvelteDate (which
	// the lint rule prefers) would be inappropriate here.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	constructor(now: () => Date = () => new Date()) {
		this.now = now;
		this.load();
	}

	load(): void {
		if (!browser) {
			return;
		}

		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) {
			this.reset();
			return;
		}

		try {
			const parsed = JSON.parse(raw) as Partial<DataState>;
			this.users = parsed.users ?? [];
			this.projects = parsed.projects ?? [];
			this.reports = parsed.reports ?? [];
		} catch {
			this.reset();
		}
	}

	private persist(): void {
		if (!browser) {
			return;
		}

		const data: DataState = {
			users: this.users,
			projects: this.projects,
			reports: this.reports
		};
		localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
	}

	reset(): void {
		const seed = createSeedData(this.now());
		this.users = seed.users;
		this.projects = seed.projects;
		this.reports = seed.reports;
		this.persist();
	}

	clear(): void {
		this.users = [];
		this.projects = [];
		this.reports = [];
		this.persist();
	}

	userById(id: string): User | undefined {
		return this.users.find((u) => u.id === id);
	}

	projectById(id: string): Project | undefined {
		return this.projects.find((p) => p.id === id);
	}

	reportById(id: string): StatusReport | undefined {
		return this.reports.find((r) => r.id === id);
	}

	// Users
	createUser(draft: UserDraft): SaveResult<User> {
		const errors = validateUser(draft);
		if (hasErrors(errors)) {
			return { ok: false, errors };
		}

		const user: User = {
			id: crypto.randomUUID(),
			name: draft.name.trim(),
			email: draft.email.trim(),
			role: draft.role as Role
		};
		this.users = [...this.users, user];
		this.persist();
		return { ok: true, value: user };
	}

	updateUser(id: string, draft: UserDraft): SaveResult<User> {
		const errors = validateUser(draft);
		if (hasErrors(errors)) {
			return { ok: false, errors };
		}

		const existing = this.userById(id);
		if (!existing) {
			return { ok: false, errors: { form: 'User not found' } };
		}

		const updated: User = {
			...existing,
			name: draft.name.trim(),
			email: draft.email.trim(),
			role: draft.role as Role
		};
		this.users = this.users.map((u) => (u.id === id ? updated : u));
		this.persist();
		return { ok: true, value: updated };
	}

	deleteUser(id: string): DeleteResult {
		const check = canDeleteUser(id, this.projects, this.reports);
		if (!check.ok) {
			return { ok: false, reason: check.reason ?? 'Cannot delete this user' };
		}

		this.users = this.users.filter((u) => u.id !== id);
		this.persist();
		return { ok: true };
	}

	// Projects
	createProject(draft: ProjectDraft): SaveResult<Project> {
		const errors = validateProject(draft, this.users);
		if (hasErrors(errors)) {
			return { ok: false, errors };
		}

		const project: Project = {
			id: crypto.randomUUID(),
			name: draft.name.trim(),
			description: draft.description.trim(),
			status: draft.status as ProjectStatus,
			ownerId: draft.ownerId
		};
		this.projects = [...this.projects, project];
		this.persist();
		return { ok: true, value: project };
	}

	updateProject(id: string, draft: ProjectDraft): SaveResult<Project> {
		const errors = validateProject(draft, this.users);
		if (hasErrors(errors)) {
			return { ok: false, errors };
		}

		const existing = this.projectById(id);
		if (!existing) {
			return { ok: false, errors: { form: 'Project not found' } };
		}

		const updated: Project = {
			...existing,
			name: draft.name.trim(),
			description: draft.description.trim(),
			status: draft.status as ProjectStatus,
			ownerId: draft.ownerId
		};
		this.projects = this.projects.map((p) => (p.id === id ? updated : p));
		this.persist();
		return { ok: true, value: updated };
	}

	deleteProject(id: string): DeleteResult {
		const check = canDeleteProject(id, this.reports);
		if (!check.ok) {
			return { ok: false, reason: check.reason ?? 'Cannot delete this project' };
		}

		this.projects = this.projects.filter((p) => p.id !== id);
		this.persist();
		return { ok: true };
	}

	// Status reports
	createReport(draft: ReportDraft): SaveResult<StatusReport> {
		const errors = validateReport(draft, this.projects, this.users);
		if (hasErrors(errors)) {
			return { ok: false, errors };
		}

		const ts = this.now().toISOString();
		const report: StatusReport = {
			id: crypto.randomUUID(),
			projectId: draft.projectId,
			authorId: draft.authorId,
			reportingPeriod: draft.reportingPeriod,
			accomplishments: draft.accomplishments.trim(),
			blockers: draft.blockers.trim(),
			nextSteps: draft.nextSteps.trim(),
			overallStatus: draft.overallStatus as OverallStatus,
			createdAt: ts,
			updatedAt: ts
		};
		this.reports = [...this.reports, report];
		this.persist();
		return { ok: true, value: report };
	}

	updateReport(id: string, draft: ReportDraft): SaveResult<StatusReport> {
		const errors = validateReport(draft, this.projects, this.users);
		if (hasErrors(errors)) {
			return { ok: false, errors };
		}

		const existing = this.reportById(id);
		if (!existing) {
			return { ok: false, errors: { form: 'Report not found' } };
		}

		const updated: StatusReport = {
			...existing,
			projectId: draft.projectId,
			authorId: draft.authorId,
			reportingPeriod: draft.reportingPeriod,
			accomplishments: draft.accomplishments.trim(),
			blockers: draft.blockers.trim(),
			nextSteps: draft.nextSteps.trim(),
			overallStatus: draft.overallStatus as OverallStatus,
			updatedAt: this.now().toISOString()
		};
		this.reports = this.reports.map((r) => (r.id === id ? updated : r));
		this.persist();
		return { ok: true, value: updated };
	}

	// Reports are leaf records — nothing references them — so deletion always succeeds.
	deleteReport(id: string): void {
		this.reports = this.reports.filter((r) => r.id !== id);
		this.persist();
	}
}

export const store = new SrtStore();
