<script lang="ts">
	import { toast } from '$lib/toast.svelte';
	import { cn } from '$lib/utils';
	import { CircleCheck, CircleX, X } from '@lucide/svelte';
</script>

<div class="pointer-events-none fixed top-4 right-4 z-[100] flex w-80 flex-col gap-2">
	{#each toast.items as item (item.id)}
		<div
			role="status"
			class={cn(
				'pointer-events-auto flex items-start gap-3 rounded-lg border p-3 shadow-md',
				item.type === 'success'
					? 'border-success/30 bg-success/10 text-foreground'
					: 'border-danger/30 bg-danger/10 text-foreground'
			)}
		>
			{#if item.type === 'success'}
				<CircleCheck size={18} class="text-success mt-0.5 shrink-0" />
			{:else}
				<CircleX size={18} class="text-danger mt-0.5 shrink-0" />
			{/if}
			<p class="flex-1 text-sm">{item.message}</p>
			<button
				onclick={() => toast.dismiss(item.id)}
				aria-label="Dismiss notification"
				class="text-muted-foreground hover:text-foreground shrink-0"
			>
				<X size={16} />
			</button>
		</div>
	{/each}
</div>
