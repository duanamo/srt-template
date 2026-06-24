<script lang="ts">
	import { store } from '$lib/data/store.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import KpiCard from '$lib/components/KpiCard.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { FolderKanban, Activity, CalendarCheck, ClipboardList } from '@lucide/svelte';
	import {
		currentPeriod,
		formatPeriod,
		formatDateTime,
		overallStatusTone
	} from '$lib/utils/format';
	import type { OverallStatus } from '$lib/types';

	const period = currentPeriod(new Date());

	let totalProjects = $derived(store.projects.length);
	let activeProjects = $derived(store.projects.filter((p) => p.status === 'Active').length);
	let reportsThisPeriod = $derived(
		store.reports.filter((r) => r.reportingPeriod === period).length
	);

	let statusCounts = $derived({
		Green: store.reports.filter((r) => r.overallStatus === 'Green').length,
		Yellow: store.reports.filter((r) => r.overallStatus === 'Yellow').length,
		Red: store.reports.filter((r) => r.overallStatus === 'Red').length
	} as Record<OverallStatus, number>);

	let recentReports = $derived(
		[...store.reports].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5)
	);

	const statusOrder: OverallStatus[] = ['Green', 'Yellow', 'Red'];
</script>

<svelte:head>
	<title>Dashboard · Status Report Tracker</title>
</svelte:head>

<div class="mx-auto max-w-[1400px] space-y-6">
	<PageHeader title="Dashboard" description={`Reporting period ${formatPeriod(period)}`} />

	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
		<KpiCard title="Total Projects" value={totalProjects} icon={FolderKanban} />
		<KpiCard title="Active Projects" value={activeProjects} icon={Activity} />
		<KpiCard
			title="Reports This Period"
			value={reportsThisPeriod}
			icon={CalendarCheck}
			hint={formatPeriod(period)}
		/>
		<KpiCard title="Total Reports" value={store.reports.length} icon={ClipboardList} />
	</div>

	<div class="grid gap-4 lg:grid-cols-3">
		<Card.Root class="lg:col-span-1">
			<Card.Header>
				<Card.Title class="text-base">Report Health</Card.Title>
				<Card.Description>Across all reporting periods</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-3">
				{#each statusOrder as status (status)}
					<div class="flex items-center justify-between">
						<StatusBadge label={status} tone={overallStatusTone(status)} />
						<span class="text-foreground text-lg font-semibold">{statusCounts[status]}</span>
					</div>
				{/each}
			</Card.Content>
		</Card.Root>

		<Card.Root class="lg:col-span-2">
			<Card.Header>
				<Card.Title class="text-base">Recent Reports</Card.Title>
				<Card.Description>Most recently updated</Card.Description>
			</Card.Header>
			<Card.Content>
				{#if recentReports.length === 0}
					<EmptyState
						icon={ClipboardList}
						title="No reports yet"
						description="Create a status report to see it here."
					/>
				{:else}
					<ul class="divide-border divide-y">
						{#each recentReports as report (report.id)}
							{@const project = store.projectById(report.projectId)}
							{@const author = store.userById(report.authorId)}
							<li class="flex items-center justify-between gap-3 py-2.5">
								<div class="min-w-0">
									<a href={`/reports/${report.id}`} class="font-medium hover:underline">
										{project?.name ?? 'Unknown project'}
									</a>
									<p class="text-muted-foreground truncate text-xs">
										{author?.name ?? 'Unknown'} · {formatPeriod(report.reportingPeriod)} · updated {formatDateTime(
											report.updatedAt
										)}
									</p>
								</div>
								<StatusBadge
									label={report.overallStatus}
									tone={overallStatusTone(report.overallStatus)}
								/>
							</li>
						{/each}
					</ul>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>

	{#if totalProjects === 0}
		<Card.Root>
			<Card.Content class="flex flex-wrap items-center justify-between gap-3 p-5">
				<div>
					<p class="font-medium">No data loaded</p>
					<p class="text-muted-foreground text-sm">
						Load the seed dataset to explore the app, or start by adding users and projects.
					</p>
				</div>
				<Button onclick={() => store.reset()}>Load seed data</Button>
			</Card.Content>
		</Card.Root>
	{/if}
</div>
