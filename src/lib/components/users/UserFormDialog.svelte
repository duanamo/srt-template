<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import FormField from '$lib/components/FormField.svelte';
	import SelectInput from '$lib/components/SelectInput.svelte';
	import { store } from '$lib/data/store.svelte';
	import { toast } from '$lib/toast.svelte';
	import { ROLES, type FieldErrors, type User, type UserDraft } from '$lib/types';

	interface Props {
		open: boolean;
		user?: User | null;
	}

	let { open = $bindable(false), user = null }: Props = $props();

	let name = $state('');
	let email = $state('');
	let role = $state('');
	let errors = $state<FieldErrors>({});
	let wasOpen = false;

	const roleOptions = ROLES.map((r) => ({ value: r, label: r }));

	// Re-seed the form fields each time the dialog opens, from the user being edited
	// (or blank for a new user).
	$effect(() => {
		if (open && !wasOpen) {
			name = user?.name ?? '';
			email = user?.email ?? '';
			role = user?.role ?? '';
			errors = {};
		}
		wasOpen = open;
	});

	function submit() {
		const draft: UserDraft = { name, email, role };
		const result = user ? store.updateUser(user.id, draft) : store.createUser(draft);

		if (result.ok) {
			toast.success(user ? 'User updated' : 'User created');
			open = false;
		} else {
			errors = result.errors;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>{user ? 'Edit User' : 'New User'}</Dialog.Title>
			<Dialog.Description>
				{user ? 'Update this user’s details.' : 'Add a new user to the directory.'}
			</Dialog.Description>
		</Dialog.Header>

		<form
			class="space-y-4"
			onsubmit={(e) => {
				e.preventDefault();
				submit();
			}}
		>
			<FormField id="user-name" label="Name" error={errors.name} required>
				<Input
					id="user-name"
					bind:value={name}
					placeholder="Jane Doe"
					aria-invalid={!!errors.name}
				/>
			</FormField>

			<FormField id="user-email" label="Email" error={errors.email} required>
				<Input
					id="user-email"
					type="email"
					bind:value={email}
					placeholder="jane@dynamo.works"
					aria-invalid={!!errors.email}
				/>
			</FormField>

			<FormField id="user-role" label="Role" error={errors.role} required>
				<SelectInput
					id="user-role"
					bind:value={role}
					options={roleOptions}
					placeholder="Select a role"
					invalid={!!errors.role}
				/>
			</FormField>

			<Dialog.Footer>
				<Dialog.Close>
					{#snippet child({ props }: { props: Record<string, unknown> })}
						<Button type="button" variant="outline" {...props}>Cancel</Button>
					{/snippet}
				</Dialog.Close>
				<Button type="submit">{user ? 'Save Changes' : 'Create User'}</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
