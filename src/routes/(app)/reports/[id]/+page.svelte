<script lang="ts">
	import { page } from '$app/stores';
	import { store } from '$lib/data/store.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import ReportFormDialog from '$lib/components/reports/ReportFormDialog.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { ArrowLeft, Pencil, FileX } from '@lucide/svelte';
	import { formatPeriod, formatDateTime, overallStatusTone } from '$lib/utils/format';

	let id = $derived($page.params.id ?? '');
	let report = $derived(store.reportById(id));
	let project = $derived(report ? store.projectById(report.projectId) : undefined);
	let author = $derived(report ? store.userById(report.authorId) : undefined);

	let formOpen = $state(false);
</script>

<svelte:head>
	<title>Status Report · Status Report Tracker</title>
</svelte:head>

<div class="mx-auto max-w-[900px] space-y-6">
	<a
		href="/reports"
		class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
	>
		<ArrowLeft size={15} /> Back to Status Reports
	</a>

	{#if !report}
		<EmptyState
			icon={FileX}
			title="Report not found"
			description="This report may have been deleted."
		/>
	{:else}
		<PageHeader
			title={project?.name ?? 'Unknown project'}
			description={`${formatPeriod(report.reportingPeriod)} · ${author?.name ?? 'Unknown author'}`}
		>
			{#snippet actions()}
				<Button variant="outline" onclick={() => (formOpen = true)}>
					<Pencil size={15} /> Edit
				</Button>
			{/snippet}
		</PageHeader>

		<Card.Root>
			<Card.Content class="flex flex-wrap items-center gap-x-10 gap-y-3 p-5 text-sm">
				<div>
					<p class="text-muted-foreground text-xs">Overall Status</p>
					<div class="mt-1">
						<StatusBadge
							label={report.overallStatus}
							tone={overallStatusTone(report.overallStatus)}
						/>
					</div>
				</div>
				<div>
					<p class="text-muted-foreground text-xs">Project</p>
					<p class="mt-1 font-medium">
						{#if project}
							<a href={`/projects/${project.id}`} class="hover:underline">{project.name}</a>
						{:else}
							Unknown
						{/if}
					</p>
				</div>
				<div>
					<p class="text-muted-foreground text-xs">Author</p>
					<p class="mt-1 font-medium">
						{#if author}
							<a href={`/users/${author.id}`} class="hover:underline">{author.name}</a>
						{:else}
							Unknown
						{/if}
					</p>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Content class="space-y-5 p-5 text-sm">
				<div>
					<h3 class="text-foreground font-semibold">Accomplishments</h3>
					<p class="mt-1 whitespace-pre-wrap">{report.accomplishments}</p>
				</div>
				<div>
					<h3 class="text-foreground font-semibold">Blockers</h3>
					<p class="mt-1 whitespace-pre-wrap">
						{report.blockers || 'None reported.'}
					</p>
				</div>
				<div>
					<h3 class="text-foreground font-semibold">Next Steps</h3>
					<p class="mt-1 whitespace-pre-wrap">{report.nextSteps}</p>
				</div>
			</Card.Content>
		</Card.Root>

		<p class="text-muted-foreground text-xs">
			Created {formatDateTime(report.createdAt)} · Last updated {formatDateTime(report.updatedAt)}
		</p>

		<ReportFormDialog bind:open={formOpen} {report} />
	{/if}
</div>
