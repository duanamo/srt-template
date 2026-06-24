<script lang="ts">
	import { store } from '$lib/data/store.svelte';
	import { toast } from '$lib/toast.svelte';
	import { Button } from '$lib/components/ui/button';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import { RotateCcw, Trash2 } from '@lucide/svelte';

	let resetOpen = $state(false);
	let clearOpen = $state(false);

	function resetData() {
		store.reset();
		toast.success('Data reset to the seed dataset');
	}

	function clearData() {
		store.clear();
		toast.success('All data cleared');
	}
</script>

<Button variant="outline" size="sm" onclick={() => (resetOpen = true)}>
	<RotateCcw size={15} />
	Reset data
</Button>
<Button variant="ghost" size="sm" onclick={() => (clearOpen = true)}>
	<Trash2 size={15} />
	Clear data
</Button>

<ConfirmDialog
	bind:open={resetOpen}
	title="Reset to seed data?"
	description="This replaces all current users, projects, and reports with the original seed dataset."
	confirmLabel="Reset data"
	onConfirm={resetData}
/>

<ConfirmDialog
	bind:open={clearOpen}
	title="Clear all data?"
	description="This removes every user, project, and report. This cannot be undone."
	confirmLabel="Clear data"
	destructive
	onConfirm={clearData}
/>
