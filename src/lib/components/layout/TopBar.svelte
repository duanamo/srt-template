<script lang="ts">
	import { Moon, Sun } from '@lucide/svelte';
	import DataControls from '$lib/components/DataControls.svelte';

	let dark = $state(false);

	$effect(() => {
		const stored = localStorage.getItem('theme');
		if (
			stored === 'dark' ||
			(!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)
		) {
			document.documentElement.classList.add('dark');
			dark = true;
		}
	});

	function toggleTheme() {
		document.documentElement.classList.toggle('dark');
		dark = !dark;
		localStorage.setItem('theme', dark ? 'dark' : 'light');
	}
</script>

<header
	class="bg-white dark:bg-dark-600 border-b border-gray-200 dark:border-dark-400 sticky top-0 z-30 flex h-14 items-center justify-between px-6"
>
	<div class="text-muted-foreground text-sm font-medium">Status Report Tracker</div>

	<div class="flex items-center gap-2">
		<DataControls />
		<button
			onclick={toggleTheme}
			aria-label="Toggle theme"
			class="text-muted-foreground hover:bg-gray-100 dark:hover:bg-dark-500 rounded-lg p-2 transition-colors"
		>
			{#if dark}
				<Sun size={18} />
			{:else}
				<Moon size={18} />
			{/if}
		</button>
	</div>
</header>
