import type { OverallStatus, ProjectStatus } from '$lib/types';

export type Tone = 'green' | 'yellow' | 'red' | 'blue' | 'gray';

// 'YYYY-MM' for the calendar month containing `now`.
export function currentPeriod(now: Date): string {
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, '0');
	return `${year}-${month}`;
}

export function previousPeriod(now: Date): string {
	return currentPeriod(new Date(now.getFullYear(), now.getMonth() - 1, 1));
}

// '2026-06' -> 'June 2026'
export function formatPeriod(period: string): string {
	const [year, month] = period.split('-').map(Number);
	if (!year || !month) {
		return period;
	}
	return new Date(year, month - 1, 1).toLocaleDateString('en-US', {
		month: 'long',
		year: 'numeric'
	});
}

export function formatDateTime(iso: string): string {
	return new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
}

export function overallStatusTone(status: OverallStatus): Tone {
	switch (status) {
		case 'Green':
			return 'green';
		case 'Yellow':
			return 'yellow';
		case 'Red':
			return 'red';
	}
}

export function projectStatusTone(status: ProjectStatus): Tone {
	switch (status) {
		case 'Active':
			return 'green';
		case 'At Risk':
			return 'yellow';
		case 'Complete':
			return 'blue';
		case 'On Hold':
			return 'gray';
	}
}
