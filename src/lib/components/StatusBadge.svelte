<script lang="ts">
	import type { Tone } from '$lib/utils/format';
	import { cn } from '$lib/utils';

	interface Props {
		label: string;
		tone: Tone;
	}

	let { label, tone }: Props = $props();

	const toneClasses: Record<Tone, string> = {
		green: 'border-success/20 bg-success/10 text-success',
		yellow: 'border-warning/30 bg-warning/10 text-warning',
		red: 'border-danger/20 bg-danger/10 text-danger',
		blue: 'border-info/20 bg-info/10 text-info',
		gray: 'border-border bg-muted text-muted-foreground'
	};
</script>

<span
	class={cn(
		'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium',
		toneClasses[tone]
	)}
>
	<span class="size-1.5 rounded-full bg-current"></span>
	{label}
</span>
