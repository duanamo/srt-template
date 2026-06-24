<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Label } from '$lib/components/ui/label';

	interface Props {
		id: string;
		label: string;
		error?: string;
		required?: boolean;
		children: Snippet;
	}

	let { id, label, error = '', required = false, children }: Props = $props();
</script>

<div class="space-y-1.5">
	<Label for={id}>
		{label}{#if required}<span class="text-danger"> *</span>{/if}
	</Label>
	{@render children()}
	{#if error}
		<p class="text-danger text-xs">{error}</p>
	{/if}
</div>
