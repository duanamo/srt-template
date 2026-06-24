<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Component } from 'svelte';

	interface Props {
		icon?: Component;
		title: string;
		description?: string;
		action?: Snippet;
	}

	let { icon: Icon, title, description, action }: Props = $props();
</script>

<div
	class="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-12 text-center"
>
	{#if Icon}
		<Icon size={28} class="text-muted-foreground" />
	{/if}
	<div>
		<p class="text-foreground font-medium">{title}</p>
		{#if description}
			<p class="text-muted-foreground mt-1 text-sm">{description}</p>
		{/if}
	</div>
	{#if action}
		{@render action()}
	{/if}
</div>
