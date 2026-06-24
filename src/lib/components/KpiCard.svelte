<script lang="ts">
	import type { Component } from 'svelte';
	import * as Card from '$lib/components/ui/card';

	interface Props {
		title: string;
		value: string | number;
		icon?: Component;
		hint?: string;
	}

	let { title, value, icon: Icon, hint }: Props = $props();
</script>

<Card.Root>
	<Card.Content class="flex items-start justify-between gap-3 p-5">
		<div>
			<p class="text-muted-foreground text-sm font-medium">{title}</p>
			<p class="text-foreground mt-2 text-3xl font-bold">{value}</p>
			{#if hint}
				<p class="text-muted-foreground mt-1 text-xs">{hint}</p>
			{/if}
		</div>
		{#if Icon}
			<div class="bg-primary-50 dark:bg-primary-400/10 text-primary rounded-lg p-2">
				<Icon size={20} />
			</div>
		{/if}
	</Card.Content>
</Card.Root>
