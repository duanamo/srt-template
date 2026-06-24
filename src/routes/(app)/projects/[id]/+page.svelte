<script lang="ts">
	import { page } from '$app/stores';
	import { store } from '$lib/data/store.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import ProjectFormDialog from '$lib/components/projects/ProjectFormDialog.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { ArrowLeft, Pencil, FolderX } from '@lucide/svelte';
	import { formatPeriod, overallStatusTone, projectStatusTone } from '$lib/utils/format';

	let id = $derived($page.params.id ?? '');
	let project = $derived(store.projectById(id));
	let owner = $derived(project ? store.userById(project.ownerId) : undefined);
	let reports = $derived(
		store.reports
			.filter((r) => r.projectId === id)
			.sort((a, b) => b.reportingPeriod.localeCompare(a.reportingPeriod))
	);

	let formOpen = $state(false);
</script>

<svelte:head>
	<title>{project ? project.name : 'Project'} · Status Report Tracker</title>
</svelte:head>

<div class="mx-auto max-w-[1000px] space-y-6">
	<a
		href="/projects"
		class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
	>
		<ArrowLeft size={15} /> Back to Projects
	</a>

	{#if !project}
		<EmptyState
			icon={FolderX}
			title="Project not found"
			description="This project may have been deleted."
		/>
	{:else}
		<PageHeader title={project.name}>
			{#snippet actions()}
				<Button variant="outline" onclick={() => (formOpen = true)}>
					<Pencil size={15} /> Edit
				</Button>
			{/snippet}
		</PageHeader>

		<Card.Root>
			<Card.Content class="space-y-4 p-5 text-sm">
				<div class="flex flex-wrap gap-x-10 gap-y-3">
					<div>
						<p class="text-muted-foreground text-xs">Status</p>
						<div class="mt-1">
							<StatusBadge label={project.status} tone={projectStatusTone(project.status)} />
						</div>
					</div>
					<div>
						<p class="text-muted-foreground text-xs">Owner</p>
						<p class="mt-1 font-medium">
							{#if owner}
								<a href={`/users/${owner.id}`} class="hover:underline">{owner.name}</a>
							{:else}
								Unknown
							{/if}
						</p>
					</div>
				</div>
				{#if project.description}
					<div>
						<p class="text-muted-foreground text-xs">Description</p>
						<p class="mt-1">{project.description}</p>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title class="text-base">Status Reports ({reports.length})</Card.Title>
			</Card.Header>
			<Card.Content>
				{#if reports.length === 0}
					<p class="text-muted-foreground text-sm">No reports have been filed for this project.</p>
				{:else}
					<ul class="divide-border divide-y">
						{#each reports as report (report.id)}
							{@const author = store.userById(report.authorId)}
							<li class="flex items-center justify-between py-2">
								<a href={`/reports/${report.id}`} class="font-medium hover:underline">
									{formatPeriod(report.reportingPeriod)}
									<span class="text-muted-foreground font-normal"
										>· {author?.name ?? 'Unknown'}</span
									>
								</a>
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

		<ProjectFormDialog bind:open={formOpen} {project} />
	{/if}
</div>
