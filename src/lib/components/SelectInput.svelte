<script lang="ts">
	import * as Select from '$lib/components/ui/select';

	export interface Option {
		value: string;
		label: string;
	}

	interface Props {
		value: string;
		options: Option[];
		placeholder?: string;
		id?: string;
		invalid?: boolean;
	}

	let {
		value = $bindable(''),
		options,
		placeholder = 'Select…',
		id,
		invalid = false
	}: Props = $props();

	let selectedLabel = $derived(options.find((o) => o.value === value)?.label ?? '');
</script>

<Select.Root type="single" bind:value>
	<Select.Trigger {id} class="w-full" aria-invalid={invalid}>
		{#if selectedLabel}
			{selectedLabel}
		{:else}
			<span class="text-muted-foreground">{placeholder}</span>
		{/if}
	</Select.Trigger>
	<Select.Content>
		{#each options as option (option.value)}
			<Select.Item value={option.value}>{option.label}</Select.Item>
		{/each}
	</Select.Content>
</Select.Root>
