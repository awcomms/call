<script>
	import Offline from '$lib/Offline.svelte';
	import { offline } from '$lib/stores';
	import { HeaderAction } from 'carbon-components-svelte';
	import ConnectionSignalOff from 'carbon-icons-svelte/lib/ConnectionSignalOff.svelte';

	import { Layout, VercelAnalyticsInject } from 'sveltekit-carbon-utils';

	$: isOpen = false;
</script>

<Offline />
<VercelAnalyticsInject />
<Layout platformName="vidchat" company="">
	{#if $offline}
		<!-- <svelte:fragment slot="header-utilities">
			<HeaderAction
				bind:isOpen
				icon={ConnectionSignalOff}
				closeIcon={ConnectionSignalOff}
				on:open={() => (isOpen = false)}
			/>
		</svelte:fragment> -->
	{/if}
	<svelte:fragment slot="content-grid">
		<slot />
	</svelte:fragment>
</Layout>
