<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import FormField from '$lib/components/FormField.svelte';
	import SelectInput from '$lib/components/SelectInput.svelte';
	import { store } from '$lib/data/store.svelte';
	import { toast } from '$lib/toast.svelte';
	import { PROJECT_STATUSES, type FieldErrors, type Project, type ProjectDraft } from '$lib/types';

	interface Props {
		open: boolean;
		project?: Project | null;
	}

	let { open = $bindable(false), project = null }: Props = $props();

	let name = $state('');
	let description = $state('');
	let status = $state('');
	let ownerId = $state('');
	let errors = $state<FieldErrors>({});
	let wasOpen = false;

	const statusOptions = PROJECT_STATUSES.map((s) => ({ value: s, label: s }));
	let ownerOptions = $derived(
		store.users.map((u) => ({ value: u.id, label: `${u.name} · ${u.role}` }))
	);

	$effect(() => {
		if (open && !wasOpen) {
			name = project?.name ?? '';
			description = project?.description ?? '';
			status = project?.status ?? '';
			ownerId = project?.ownerId ?? '';
			errors = {};
		}
		wasOpen = open;
	});

	function submit() {
		const draft: ProjectDraft = { name, description, status, ownerId };
		const result = project ? store.updateProject(project.id, draft) : store.createProject(draft);

		if (result.ok) {
			toast.success(project ? 'Project updated' : 'Project created');
			open = false;
		} else {
			errors = result.errors;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>{project ? 'Edit Project' : 'New Project'}</Dialog.Title>
			<Dialog.Description>
				{project ? 'Update this project’s details.' : 'Create a new project and assign an owner.'}
			</Dialog.Description>
		</Dialog.Header>

		<form
			class="space-y-4"
			onsubmit={(e) => {
				e.preventDefault();
				submit();
			}}
		>
			<FormField id="project-name" label="Name" error={errors.name} required>
				<Input
					id="project-name"
					bind:value={name}
					placeholder="Apollo Platform"
					aria-invalid={!!errors.name}
				/>
			</FormField>

			<FormField id="project-description" label="Description" error={errors.description}>
				<Textarea
					id="project-description"
					bind:value={description}
					rows={3}
					placeholder="What is this project about?"
				/>
			</FormField>

			<FormField id="project-status" label="Status" error={errors.status} required>
				<SelectInput
					id="project-status"
					bind:value={status}
					options={statusOptions}
					placeholder="Select a status"
					invalid={!!errors.status}
				/>
			</FormField>

			<FormField id="project-owner" label="Owner" error={errors.ownerId} required>
				<SelectInput
					id="project-owner"
					bind:value={ownerId}
					options={ownerOptions}
					placeholder="Select an owner"
					invalid={!!errors.ownerId}
				/>
			</FormField>

			<Dialog.Footer>
				<Dialog.Close>
					{#snippet child({ props }: { props: Record<string, unknown> })}
						<Button type="button" variant="outline" {...props}>Cancel</Button>
					{/snippet}
				</Dialog.Close>
				<Button type="submit">{project ? 'Save Changes' : 'Create Project'}</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
