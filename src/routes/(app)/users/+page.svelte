<script lang="ts">
	import { store } from '$lib/data/store.svelte';
	import { toast } from '$lib/toast.svelte';
	import { canDeleteUser } from '$lib/utils/integrity';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import UserFormDialog from '$lib/components/users/UserFormDialog.svelte';
	import * as Table from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Plus, Pencil, Trash2, Users } from '@lucide/svelte';
	import type { User } from '$lib/types';

	let formOpen = $state(false);
	let editing = $state<User | null>(null);

	let confirmOpen = $state(false);
	let target = $state<User | null>(null);
	let blocked = $state(false);
	let reason = $state('');

	let users = $derived([...store.users].sort((a, b) => a.name.localeCompare(b.name)));

	function openNew() {
		editing = null;
		formOpen = true;
	}

	function openEdit(user: User) {
		editing = user;
		formOpen = true;
	}

	function askDelete(user: User) {
		const check = canDeleteUser(user.id, store.projects, store.reports);
		target = user;
		blocked = !check.ok;
		reason = check.ok
			? `This permanently removes ${user.name}. This cannot be undone.`
			: (check.reason ?? '');
		confirmOpen = true;
	}

	function confirmDelete() {
		if (!target) {
			return;
		}
		const result = store.deleteUser(target.id);
		if (result.ok) {
			toast.success('User deleted');
		} else {
			toast.error(result.reason);
		}
	}
</script>

<svelte:head>
	<title>Users · Status Report Tracker</title>
</svelte:head>

<div class="mx-auto max-w-[1400px] space-y-6">
	<PageHeader title="Users" description="People who own projects and author status reports.">
		{#snippet actions()}
			<Button onclick={openNew}>
				<Plus size={16} />
				New User
			</Button>
		{/snippet}
	</PageHeader>

	{#if users.length === 0}
		<EmptyState icon={Users} title="No users yet" description="Add your first user to get started.">
			{#snippet action()}
				<Button onclick={openNew}>
					<Plus size={16} />
					New User
				</Button>
			{/snippet}
		</EmptyState>
	{:else}
		<div class="rounded-lg border">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Name</Table.Head>
						<Table.Head>Email</Table.Head>
						<Table.Head>Role</Table.Head>
						<Table.Head class="text-center">Projects</Table.Head>
						<Table.Head class="text-center">Reports</Table.Head>
						<Table.Head class="text-right">Actions</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each users as user (user.id)}
						{@const owned = store.projects.filter((p) => p.ownerId === user.id).length}
						{@const authored = store.reports.filter((r) => r.authorId === user.id).length}
						<Table.Row>
							<Table.Cell class="font-medium">
								<a href={`/users/${user.id}`} class="hover:underline">{user.name}</a>
							</Table.Cell>
							<Table.Cell class="text-muted-foreground">{user.email}</Table.Cell>
							<Table.Cell><Badge variant="outline">{user.role}</Badge></Table.Cell>
							<Table.Cell class="text-center">{owned}</Table.Cell>
							<Table.Cell class="text-center">{authored}</Table.Cell>
							<Table.Cell class="text-right">
								<div class="flex justify-end gap-1">
									<Button
										variant="ghost"
										size="icon-sm"
										aria-label={`Edit ${user.name}`}
										onclick={() => openEdit(user)}
									>
										<Pencil size={15} />
									</Button>
									<Button
										variant="ghost"
										size="icon-sm"
										aria-label={`Delete ${user.name}`}
										onclick={() => askDelete(user)}
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

<UserFormDialog bind:open={formOpen} user={editing} />

<ConfirmDialog
	bind:open={confirmOpen}
	title={blocked ? 'Cannot delete user' : 'Delete user?'}
	description={reason}
	confirmLabel="Delete"
	destructive
	{blocked}
	onConfirm={confirmDelete}
/>
