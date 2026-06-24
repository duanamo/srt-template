<script lang="ts">
	import Sidebar from '$lib/components/layout/Sidebar.svelte';
	import TopBar from '$lib/components/layout/TopBar.svelte';
	import Toaster from '$lib/components/Toaster.svelte';

	let { children } = $props();
</script>

<div class="bg-background flex min-h-screen">
	<Sidebar />
	<div class="flex flex-1 flex-col transition-all duration-300 md:ml-64">
		<TopBar />
		<main class="flex-1 overflow-auto p-6">
			{@render children()}
		</main>
	</div>
</div>

<Toaster />
