<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import FormField from '$lib/components/FormField.svelte';
	import SelectInput from '$lib/components/SelectInput.svelte';
	import { store } from '$lib/data/store.svelte';
	import { toast } from '$lib/toast.svelte';
	import { currentPeriod } from '$lib/utils/format';
	import {
		OVERALL_STATUSES,
		type FieldErrors,
		type ReportDraft,
		type StatusReport
	} from '$lib/types';

	interface Props {
		open: boolean;
		report?: StatusReport | null;
	}

	let { open = $bindable(false), report = null }: Props = $props();

	let projectId = $state('');
	let authorId = $state('');
	let reportingPeriod = $state('');
	let overallStatus = $state('');
	let accomplishments = $state('');
	let blockers = $state('');
	let nextSteps = $state('');
	let errors = $state<FieldErrors>({});
	let wasOpen = false;

	const statusOptions = OVERALL_STATUSES.map((s) => ({ value: s, label: s }));
	let projectOptions = $derived(store.projects.map((p) => ({ value: p.id, label: p.name })));
	let authorOptions = $derived(
		store.users.map((u) => ({ value: u.id, label: `${u.name} · ${u.role}` }))
	);

	$effect(() => {
		if (open && !wasOpen) {
			projectId = report?.projectId ?? '';
			authorId = report?.authorId ?? '';
			reportingPeriod = report?.reportingPeriod ?? currentPeriod(new Date());
			overallStatus = report?.overallStatus ?? '';
			accomplishments = report?.accomplishments ?? '';
			blockers = report?.blockers ?? '';
			nextSteps = report?.nextSteps ?? '';
			errors = {};
		}
		wasOpen = open;
	});

	function submit() {
		const draft: ReportDraft = {
			projectId,
			authorId,
			reportingPeriod,
			overallStatus,
			accomplishments,
			blockers,
			nextSteps
		};
		const result = report ? store.updateReport(report.id, draft) : store.createReport(draft);

		if (result.ok) {
			toast.success(report ? 'Report updated' : 'Report created');
			open = false;
		} else {
			errors = result.errors;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-lg">
		<Dialog.Header>
			<Dialog.Title>{report ? 'Edit Status Report' : 'New Status Report'}</Dialog.Title>
			<Dialog.Description>
				{report ? 'Update this status report.' : 'Record a status report for a project.'}
			</Dialog.Description>
		</Dialog.Header>

		<form
			class="max-h-[70vh] space-y-4 overflow-y-auto pr-1"
			onsubmit={(e) => {
				e.preventDefault();
				submit();
			}}
		>
			<div class="grid gap-4 sm:grid-cols-2">
				<FormField id="report-project" label="Project" error={errors.projectId} required>
					<SelectInput
						id="report-project"
						bind:value={projectId}
						options={projectOptions}
						placeholder="Select a project"
						invalid={!!errors.projectId}
					/>
				</FormField>

				<FormField id="report-author" label="Author" error={errors.authorId} required>
					<SelectInput
						id="report-author"
						bind:value={authorId}
						options={authorOptions}
						placeholder="Select an author"
						invalid={!!errors.authorId}
					/>
				</FormField>

				<FormField
					id="report-period"
					label="Reporting Period"
					error={errors.reportingPeriod}
					required
				>
					<Input
						id="report-period"
						type="month"
						bind:value={reportingPeriod}
						aria-invalid={!!errors.reportingPeriod}
					/>
				</FormField>

				<FormField id="report-status" label="Overall Status" error={errors.overallStatus} required>
					<SelectInput
						id="report-status"
						bind:value={overallStatus}
						options={statusOptions}
						placeholder="Select a status"
						invalid={!!errors.overallStatus}
					/>
				</FormField>
			</div>

			<FormField
				id="report-accomplishments"
				label="Accomplishments"
				error={errors.accomplishments}
				required
			>
				<Textarea id="report-accomplishments" bind:value={accomplishments} rows={3} />
			</FormField>

			<FormField id="report-blockers" label="Blockers" error={errors.blockers}>
				<Textarea
					id="report-blockers"
					bind:value={blockers}
					rows={2}
					placeholder="Leave blank if there are none"
				/>
			</FormField>

			<FormField id="report-next" label="Next Steps" error={errors.nextSteps} required>
				<Textarea id="report-next" bind:value={nextSteps} rows={3} />
			</FormField>

			<Dialog.Footer>
				<Dialog.Close>
					{#snippet child({ props }: { props: Record<string, unknown> })}
						<Button type="button" variant="outline" {...props}>Cancel</Button>
					{/snippet}
				</Dialog.Close>
				<Button type="submit">{report ? 'Save Changes' : 'Create Report'}</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
