<script>
	import { InlineNotification } from 'carbon-components-svelte';
	import { createEventDispatcher, onMount } from 'svelte';
	import { offline } from '$lib/stores';

	const dispatch = createEventDispatcher();

	onMount(() => {
		window.addEventListener('offline', () => {
			dispatch('offline');
			$offline = true;
		});
		window.addEventListener('online', () => {
			dispatch('online');
			$offline = true;
		});
	});
</script>
