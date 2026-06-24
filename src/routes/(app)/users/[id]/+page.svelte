<script lang="ts">
	import { page } from '$app/stores';
	import { store } from '$lib/data/store.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import UserFormDialog from '$lib/components/users/UserFormDialog.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { ArrowLeft, Pencil, UserX } from '@lucide/svelte';
	import { formatPeriod, overallStatusTone, projectStatusTone } from '$lib/utils/format';

	let id = $derived($page.params.id ?? '');
	let user = $derived(store.userById(id));
	let ownedProjects = $derived(store.projects.filter((p) => p.ownerId === id));
	let authoredReports = $derived(store.reports.filter((r) => r.authorId === id));

	let formOpen = $state(false);
</script>

<svelte:head>
	<title>{user ? user.name : 'User'} · Status Report Tracker</title>
</svelte:head>

<div class="mx-auto max-w-[1000px] space-y-6">
	<a
		href="/users"
		class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
	>
		<ArrowLeft size={15} /> Back to Users
	</a>

	{#if !user}
		<EmptyState
			icon={UserX}
			title="User not found"
			description="This user may have been deleted."
		/>
	{:else}
		<PageHeader title={user.name} description={user.email}>
			{#snippet actions()}
				<Button variant="outline" onclick={() => (formOpen = true)}>
					<Pencil size={15} /> Edit
				</Button>
			{/snippet}
		</PageHeader>

		<Card.Root>
			<Card.Content class="flex flex-wrap gap-x-10 gap-y-3 p-5 text-sm">
				<div>
					<p class="text-muted-foreground text-xs">Role</p>
					<Badge variant="outline" class="mt-1">{user.role}</Badge>
				</div>
				<div>
					<p class="text-muted-foreground text-xs">Email</p>
					<p class="mt-1 font-medium">{user.email}</p>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title class="text-base">Owned Projects ({ownedProjects.length})</Card.Title>
			</Card.Header>
			<Card.Content>
				{#if ownedProjects.length === 0}
					<p class="text-muted-foreground text-sm">This user does not own any projects.</p>
				{:else}
					<ul class="divide-border divide-y">
						{#each ownedProjects as project (project.id)}
							<li class="flex items-center justify-between py-2">
								<a href={`/projects/${project.id}`} class="font-medium hover:underline">
									{project.name}
								</a>
								<StatusBadge label={project.status} tone={projectStatusTone(project.status)} />
							</li>
						{/each}
					</ul>
				{/if}
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title class="text-base">Authored Reports ({authoredReports.length})</Card.Title>
			</Card.Header>
			<Card.Content>
				{#if authoredReports.length === 0}
					<p class="text-muted-foreground text-sm">This user has not authored any reports.</p>
				{:else}
					<ul class="divide-border divide-y">
						{#each authoredReports as report (report.id)}
							{@const project = store.projectById(report.projectId)}
							<li class="flex items-center justify-between py-2">
								<a href={`/reports/${report.id}`} class="font-medium hover:underline">
									{project?.name ?? 'Unknown project'}
									<span class="text-muted-foreground font-normal">
										· {formatPeriod(report.reportingPeriod)}
									</span>
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

		<UserFormDialog bind:open={formOpen} {user} />
	{/if}
</div>
