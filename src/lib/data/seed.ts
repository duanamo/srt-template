import type { DataState, Project, StatusReport, User } from '$lib/types';
import { currentPeriod, previousPeriod } from '$lib/utils/format';

const uuid = () => crypto.randomUUID();

// A noon-UTC timestamp on a fixed day inside the given reporting period, so seeded
// reports carry plausible createdAt/updatedAt values that line up with the period.
function periodTimestamp(period: string, day: number): string {
	const [year, month] = period.split('-').map(Number);
	return new Date(Date.UTC(year, month - 1, day, 12, 0, 0)).toISOString();
}

// Builds the initial dataset relative to `now` so "this period" is always populated.
// Referential-integrity coverage is intentional:
//   - Evan Brooks authors no reports and owns no project   -> deletable user
//   - "Drake Internal Tools" is referenced by no report     -> deletable project
//   - Everyone/everything else is referenced                -> deletion blocked
export function createSeedData(now: Date): DataState {
	const current = currentPeriod(now);
	const previous = previousPeriod(now);

	const alice: User = {
		id: uuid(),
		name: 'Alice Nguyen',
		email: 'alice.nguyen@dynamo.works',
		role: 'Project Manager'
	};
	const ben: User = {
		id: uuid(),
		name: 'Ben Carter',
		email: 'ben.carter@dynamo.works',
		role: 'Developer'
	};
	const carla: User = {
		id: uuid(),
		name: 'Carla Reyes',
		email: 'carla.reyes@dynamo.works',
		role: 'Developer'
	};
	const dana: User = {
		id: uuid(),
		name: 'Dana White',
		email: 'dana.white@dynamo.works',
		role: 'Executive'
	};
	const evan: User = {
		id: uuid(),
		name: 'Evan Brooks',
		email: 'evan.brooks@dynamo.works',
		role: 'Executive'
	};
	const users = [alice, ben, carla, dana, evan];

	const apollo: Project = {
		id: uuid(),
		name: 'Apollo Platform',
		description: 'Core customer-facing platform and shared services.',
		status: 'Active',
		ownerId: alice.id
	};
	const borealis: Project = {
		id: uuid(),
		name: 'Borealis Migration',
		description: 'Migration of legacy reporting workloads to the new stack.',
		status: 'At Risk',
		ownerId: ben.id
	};
	const cobalt: Project = {
		id: uuid(),
		name: 'Cobalt Analytics',
		description: 'Self-serve analytics dashboards for internal teams.',
		status: 'Complete',
		ownerId: carla.id
	};
	const drake: Project = {
		id: uuid(),
		name: 'Drake Internal Tools',
		description: 'Internal tooling backlog, currently paused.',
		status: 'On Hold',
		ownerId: dana.id
	};
	const projects = [apollo, borealis, cobalt, drake];

	function report(
		project: Project,
		author: User,
		period: string,
		day: number,
		overallStatus: StatusReport['overallStatus'],
		fields: Pick<StatusReport, 'accomplishments' | 'blockers' | 'nextSteps'>
	): StatusReport {
		const ts = periodTimestamp(period, day);
		return {
			id: uuid(),
			projectId: project.id,
			authorId: author.id,
			reportingPeriod: period,
			overallStatus,
			createdAt: ts,
			updatedAt: ts,
			...fields
		};
	}

	const reports: StatusReport[] = [
		report(apollo, alice, current, 3, 'Green', {
			accomplishments: 'Shipped the new onboarding flow and cut signup drop-off by 12%.',
			blockers: '',
			nextSteps: 'Begin work on SSO support for enterprise customers.'
		}),
		report(apollo, ben, current, 9, 'Yellow', {
			accomplishments: 'Refactored the billing service and added integration tests.',
			blockers: 'Waiting on the payments vendor to enable the sandbox webhook.',
			nextSteps: 'Wire up webhook handling once sandbox access is granted.'
		}),
		report(borealis, ben, current, 11, 'Red', {
			accomplishments: 'Mapped the remaining legacy tables and drafted the cutover plan.',
			blockers: 'Source database exports are failing intermittently, blocking validation.',
			nextSteps: 'Escalate export failures to infrastructure and re-run validation.'
		}),
		report(cobalt, carla, current, 6, 'Green', {
			accomplishments: 'Closed out the final dashboard and completed UAT sign-off.',
			blockers: '',
			nextSteps: 'Hand off to support and archive the project workspace.'
		}),
		report(apollo, alice, previous, 5, 'Green', {
			accomplishments: 'Delivered the redesigned settings area ahead of schedule.',
			blockers: '',
			nextSteps: 'Start the onboarding flow rework.'
		}),
		report(borealis, carla, previous, 14, 'Yellow', {
			accomplishments: 'Built the schema diff tooling used for the migration.',
			blockers: 'Limited test coverage on the legacy side slowed verification.',
			nextSteps: 'Expand validation coverage before the next batch.'
		}),
		report(cobalt, carla, previous, 18, 'Green', {
			accomplishments: 'Rolled out the first three dashboards to pilot teams.',
			blockers: '',
			nextSteps: 'Collect pilot feedback and finalize remaining dashboards.'
		}),
		report(borealis, ben, previous, 22, 'Red', {
			accomplishments: 'Completed a dry-run migration in staging.',
			blockers: 'Dry-run revealed data drift that needs reconciliation.',
			nextSteps: 'Reconcile drifted records and schedule a second dry-run.'
		})
	];

	return { users, projects, reports };
}
