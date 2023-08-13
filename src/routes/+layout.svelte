<script>
	import Online from "$lib/Offline.svelte";


	import { Layout, VercelAnalyticsInject } from "sveltekit-carbon-utils";

</script>

<VercelAnalyticsInject />
<Layout platformName="vidchat" company=''>
	<svelte:fragment slot="content-grid">
		<Online />
		<slot />
	</svelte:fragment>
</Layout>