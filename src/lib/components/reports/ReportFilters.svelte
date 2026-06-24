<script lang="ts">
	import SelectInput, { type Option } from '$lib/components/SelectInput.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { OVERALL_STATUSES } from '$lib/types';
	import { formatPeriod } from '$lib/utils/format';

	interface Props {
		projectId: string;
		authorId: string;
		period: string;
		status: string;
		projectOptions: Option[];
		authorOptions: Option[];
		periods: string[];
	}

	let {
		projectId = $bindable('all'),
		authorId = $bindable('all'),
		period = $bindable('all'),
		status = $bindable('all'),
		projectOptions,
		authorOptions,
		periods
	}: Props = $props();

	const ALL = { value: 'all', label: 'All' };

	let projectChoices = $derived([ALL, ...projectOptions]);
	let authorChoices = $derived([ALL, ...authorOptions]);
	let periodChoices = $derived([
		ALL,
		...periods.map((p) => ({ value: p, label: formatPeriod(p) }))
	]);
	const statusChoices = [ALL, ...OVERALL_STATUSES.map((s) => ({ value: s, label: s }))];

	let isFiltered = $derived(
		projectId !== 'all' || authorId !== 'all' || period !== 'all' || status !== 'all'
	);

	function clear() {
		projectId = 'all';
		authorId = 'all';
		period = 'all';
		status = 'all';
	}
</script>

<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
	<div class="space-y-1.5">
		<Label for="filter-project">Project</Label>
		<SelectInput id="filter-project" bind:value={projectId} options={projectChoices} />
	</div>
	<div class="space-y-1.5">
		<Label for="filter-author">Author</Label>
		<SelectInput id="filter-author" bind:value={authorId} options={authorChoices} />
	</div>
	<div class="space-y-1.5">
		<Label for="filter-period">Reporting Period</Label>
		<SelectInput id="filter-period" bind:value={period} options={periodChoices} />
	</div>
	<div class="space-y-1.5">
		<Label for="filter-status">Overall Status</Label>
		<SelectInput id="filter-status" bind:value={status} options={statusChoices} />
	</div>
</div>

{#if isFiltered}
	<div class="mt-3">
		<Button variant="ghost" size="sm" onclick={clear}>Clear filters</Button>
	</div>
{/if}
