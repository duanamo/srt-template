<script lang="ts">
	import { store } from '$lib/data/store.svelte';
	import { toast } from '$lib/toast.svelte';
	import { canDeleteProject } from '$lib/utils/integrity';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import ProjectFormDialog from '$lib/components/projects/ProjectFormDialog.svelte';
	import * as Table from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import { Plus, Pencil, Trash2, FolderKanban } from '@lucide/svelte';
	import { projectStatusTone } from '$lib/utils/format';
	import type { Project } from '$lib/types';

	let formOpen = $state(false);
	let editing = $state<Project | null>(null);

	let confirmOpen = $state(false);
	let target = $state<Project | null>(null);
	let blocked = $state(false);
	let reason = $state('');

	let projects = $derived([...store.projects].sort((a, b) => a.name.localeCompare(b.name)));
	let hasUsers = $derived(store.users.length > 0);

	function openNew() {
		editing = null;
		formOpen = true;
	}

	function openEdit(project: Project) {
		editing = project;
		formOpen = true;
	}

	function askDelete(project: Project) {
		const check = canDeleteProject(project.id, store.reports);
		target = project;
		blocked = !check.ok;
		reason = check.ok
			? `This permanently removes ${project.name}. This cannot be undone.`
			: (check.reason ?? '');
		confirmOpen = true;
	}

	function confirmDelete() {
		if (!target) {
			return;
		}
		const result = store.deleteProject(target.id);
		if (result.ok) {
			toast.success('Project deleted');
		} else {
			toast.error(result.reason);
		}
	}
</script>

<svelte:head>
	<title>Projects · Status Report Tracker</title>
</svelte:head>

<div class="mx-auto max-w-[1400px] space-y-6">
	<PageHeader title="Projects" description="Initiatives tracked through status reports.">
		{#snippet actions()}
			<Button onclick={openNew} disabled={!hasUsers}>
				<Plus size={16} />
				New Project
			</Button>
		{/snippet}
	</PageHeader>

	{#if !hasUsers}
		<p class="text-muted-foreground text-sm">Add at least one user before creating a project.</p>
	{/if}

	{#if projects.length === 0}
		<EmptyState
			icon={FolderKanban}
			title="No projects yet"
			description="Create a project and assign it an owner."
		>
			{#snippet action()}
				<Button onclick={openNew} disabled={!hasUsers}>
					<Plus size={16} />
					New Project
				</Button>
			{/snippet}
		</EmptyState>
	{:else}
		<div class="rounded-lg border">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Name</Table.Head>
						<Table.Head>Status</Table.Head>
						<Table.Head>Owner</Table.Head>
						<Table.Head class="text-center">Reports</Table.Head>
						<Table.Head class="text-right">Actions</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each projects as project (project.id)}
						{@const owner = store.userById(project.ownerId)}
						{@const reportCount = store.reports.filter((r) => r.projectId === project.id).length}
						<Table.Row>
							<Table.Cell class="font-medium">
								<a href={`/projects/${project.id}`} class="hover:underline">{project.name}</a>
							</Table.Cell>
							<Table.Cell>
								<StatusBadge label={project.status} tone={projectStatusTone(project.status)} />
							</Table.Cell>
							<Table.Cell>
								{#if owner}
									<a href={`/users/${owner.id}`} class="hover:underline">{owner.name}</a>
								{:else}
									<span class="text-muted-foreground">Unknown</span>
								{/if}
							</Table.Cell>
							<Table.Cell class="text-center">{reportCount}</Table.Cell>
							<Table.Cell class="text-right">
								<div class="flex justify-end gap-1">
									<Button
										variant="ghost"
										size="icon-sm"
										aria-label={`Edit ${project.name}`}
										onclick={() => openEdit(project)}
									>
										<Pencil size={15} />
									</Button>
									<Button
										variant="ghost"
										size="icon-sm"
										aria-label={`Delete ${project.name}`}
										onclick={() => askDelete(project)}
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
</div>

<ProjectFormDialog bind:open={formOpen} project={editing} />

<ConfirmDialog
	bind:open={confirmOpen}
	title={blocked ? 'Cannot delete project' : 'Delete project?'}
	description={reason}
	confirmLabel="Delete"
	destructive
	{blocked}
	onConfirm={confirmDelete}
/>
