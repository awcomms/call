<script>

	import { Layout, VercelAnalyticsInject } from "sveltekit-carbon-utils";

</script>

<VercelAnalyticsInject />
<Layout platformName="vidchat" company=''>
	<svelte:fragment slot="content-grid">
		<slot />
	</svelte:fragment>
</Layout>