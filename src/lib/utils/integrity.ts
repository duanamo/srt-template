import type { Project, StatusReport } from '$lib/types';

export interface DeleteCheck {
	ok: boolean;
	reason?: string;
}

export function reportsByAuthor(reports: readonly StatusReport[], userId: string): StatusReport[] {
	return reports.filter((r) => r.authorId === userId);
}

export function reportsByProject(
	reports: readonly StatusReport[],
	projectId: string
): StatusReport[] {
	return reports.filter((r) => r.projectId === projectId);
}

export function projectsByOwner(projects: readonly Project[], userId: string): Project[] {
	return projects.filter((p) => p.ownerId === userId);
}

function pluralize(count: number, noun: string): string {
	return `${count} ${noun}${count === 1 ? '' : 's'}`;
}

// A user cannot be removed while still referenced as a report author or a project
// owner — deleting them would leave those records pointing at a missing user.
export function canDeleteUser(
	userId: string,
	projects: readonly Project[],
	reports: readonly StatusReport[]
): DeleteCheck {
	const authored = reportsByAuthor(reports, userId).length;
	const owned = projectsByOwner(projects, userId).length;

	if (authored === 0 && owned === 0) {
		return { ok: true };
	}

	const parts: string[] = [];
	if (authored > 0) {
		parts.push(pluralize(authored, 'status report'));
	}
	if (owned > 0) {
		parts.push(pluralize(owned, 'project'));
	}

	return {
		ok: false,
		reason: `This user is referenced by ${parts.join(' and ')}. Reassign or delete those first.`
	};
}

// A project cannot be removed while reports still reference it.
export function canDeleteProject(projectId: string, reports: readonly StatusReport[]): DeleteCheck {
	const referencing = reportsByProject(reports, projectId).length;

	if (referencing === 0) {
		return { ok: true };
	}

	return {
		ok: false,
		reason: `This project is referenced by ${pluralize(referencing, 'status report')}. Delete those reports first.`
	};
}
