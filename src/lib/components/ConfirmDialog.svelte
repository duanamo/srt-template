<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';

	interface Props {
		open: boolean;
		title: string;
		description: string;
		confirmLabel?: string;
		destructive?: boolean;
		// When true the action is not allowed (e.g. blocked by referential integrity):
		// the dialog explains why and offers only a dismiss button.
		blocked?: boolean;
		onConfirm?: () => void;
	}

	let {
		open = $bindable(false),
		title,
		description,
		confirmLabel = 'Confirm',
		destructive = false,
		blocked = false,
		onConfirm
	}: Props = $props();

	function confirm() {
		onConfirm?.();
		open = false;
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>{title}</Dialog.Title>
			<Dialog.Description>{description}</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			{#if blocked}
				<Dialog.Close>
					{#snippet child({ props }: { props: Record<string, unknown> })}
						<Button {...props}>Understood</Button>
					{/snippet}
				</Dialog.Close>
			{:else}
				<Dialog.Close>
					{#snippet child({ props }: { props: Record<string, unknown> })}
						<Button variant="outline" {...props}>Cancel</Button>
					{/snippet}
				</Dialog.Close>
				<Button variant={destructive ? 'destructive' : 'default'} onclick={confirm}>
					{confirmLabel}
				</Button>
			{/if}
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
