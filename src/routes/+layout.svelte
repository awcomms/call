<script>
	import Offline from '$lib/Offline.svelte';
	import OfflineHeaderUtility from '$lib/OfflineHeaderUtility.svelte';
	import { onMount } from 'svelte';

	import { Layout, VercelAnalyticsInject } from 'sveltekit-carbon-utils';

	onMount(() => {
		localStorage.clear()
	})
</script>

<Offline />
<VercelAnalyticsInject />
<Layout platformName="vidchat" company="">
		<svelte:fragment slot="header">
		</svelte:fragment>
		<svelte:fragment slot="header-utilities">
			<OfflineHeaderUtility />
		</svelte:fragment>
	<svelte:fragment slot="content-grid">
		<slot />
	</svelte:fragment>
</Layout>
