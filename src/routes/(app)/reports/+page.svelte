<script lang="ts">
	import { store } from '$lib/data/store.svelte';
	import { toast } from '$lib/toast.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import ReportFormDialog from '$lib/components/reports/ReportFormDialog.svelte';
	import ReportFilters from '$lib/components/reports/ReportFilters.svelte';
	import * as Table from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import { Plus, Pencil, Trash2, ClipboardList } from '@lucide/svelte';
	import { formatPeriod, formatDateTime, overallStatusTone } from '$lib/utils/format';
	import type { StatusReport } from '$lib/types';

	let formOpen = $state(false);
	let editing = $state<StatusReport | null>(null);

	let confirmOpen = $state(false);
	let target = $state<StatusReport | null>(null);

	let fProject = $state('all');
	let fAuthor = $state('all');
	let fPeriod = $state('all');
	let fStatus = $state('all');

	let canCreate = $derived(store.projects.length > 0 && store.users.length > 0);

	let projectOptions = $derived(store.projects.map((p) => ({ value: p.id, label: p.name })));
	let authorOptions = $derived(store.users.map((u) => ({ value: u.id, label: u.name })));
	let periods = $derived(
		[...new Set(store.reports.map((r) => r.reportingPeriod))].sort((a, b) => b.localeCompare(a))
	);

	let filtered = $derived(
		store.reports
			.filter((r) => fProject === 'all' || r.projectId === fProject)
			.filter((r) => fAuthor === 'all' || r.authorId === fAuthor)
			.filter((r) => fPeriod === 'all' || r.reportingPeriod === fPeriod)
			.filter((r) => fStatus === 'all' || r.overallStatus === fStatus)
			.sort((a, b) => b.reportingPeriod.localeCompare(a.reportingPeriod))
	);

	function openNew() {
		editing = null;
		formOpen = true;
	}

	function openEdit(report: StatusReport) {
		editing = report;
		formOpen = true;
	}

	function askDelete(report: StatusReport) {
		target = report;
		confirmOpen = true;
	}

	function confirmDelete() {
		if (!target) {
			return;
		}
		store.deleteReport(target.id);
		toast.success('Report deleted');
	}
</script>

<svelte:head>
	<title>Status Reports · Status Report Tracker</title>
</svelte:head>

<div class="mx-auto max-w-[1400px] space-y-6">
	<PageHeader title="Status Reports" description="Per-project updates by reporting period.">
		{#snippet actions()}
			<Button onclick={openNew} disabled={!canCreate}>
				<Plus size={16} />
				New Report
			</Button>
		{/snippet}
	</PageHeader>

	{#if !canCreate}
		<p class="text-muted-foreground text-sm">
			Add at least one user and one project before creating a report.
		</p>
	{/if}

	{#if store.reports.length === 0}
		<EmptyState
			icon={ClipboardList}
			title="No reports yet"
			description="File a status report to start tracking project health."
		>
			{#snippet action()}
				<Button onclick={openNew} disabled={!canCreate}>
					<Plus size={16} />
					New Report
				</Button>
			{/snippet}
		</EmptyState>
	{:else}
		<ReportFilters
			bind:projectId={fProject}
			bind:authorId={fAuthor}
			bind:period={fPeriod}
			bind:status={fStatus}
			{projectOptions}
			{authorOptions}
			{periods}
		/>

		{#if filtered.length === 0}
			<EmptyState title="No reports match these filters" description="Try clearing some filters." />
		{:else}
			<div class="rounded-lg border">
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Project</Table.Head>
							<Table.Head>Author</Table.Head>
							<Table.Head>Period</Table.Head>
							<Table.Head>Status</Table.Head>
							<Table.Head>Updated</Table.Head>
							<Table.Head class="text-right">Actions</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each filtered as report (report.id)}
							{@const project = store.projectById(report.projectId)}
							{@const author = store.userById(report.authorId)}
							<Table.Row>
								<Table.Cell class="font-medium">
									<a href={`/reports/${report.id}`} class="hover:underline">
										{project?.name ?? 'Unknown'}
									</a>
								</Table.Cell>
								<Table.Cell>{author?.name ?? 'Unknown'}</Table.Cell>
								<Table.Cell>{formatPeriod(report.reportingPeriod)}</Table.Cell>
								<Table.Cell>
									<StatusBadge
										label={report.overallStatus}
										tone={overallStatusTone(report.overallStatus)}
									/>
								</Table.Cell>
								<Table.Cell class="text-muted-foreground text-xs">
									{formatDateTime(report.updatedAt)}
								</Table.Cell>
								<Table.Cell class="text-right">
									<div class="flex justify-end gap-1">
										<Button
											variant="ghost"
											size="icon-sm"
											aria-label="Edit report"
											onclick={() => openEdit(report)}
										>
											<Pencil size={15} />
										</Button>
										<Button
											variant="ghost"
											size="icon-sm"
											aria-label="Delete report"
											onclick={() => askDelete(report)}
										>
											<Trash2 size={15} />
										</Button>
									</div>
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</div>
		{/if}
	{/if}
</div>

<ReportFormDialog bind:open={formOpen} report={editing} />

<ConfirmDialog
	bind:open={confirmOpen}
	title="Delete report?"
	description="This permanently removes the status report. This cannot be undone."
	confirmLabel="Delete"
	destructive
	onConfirm={confirmDelete}
/>
