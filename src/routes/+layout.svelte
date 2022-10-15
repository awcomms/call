<script>
	export const prerender = true;
	
	import { Content, Grid } from 'carbon-components-svelte';
	import 'carbon-components-svelte/css/white.css';
	// import Header from '$lib/components/Nav/Header.svelte';
	import Theme from '$lib/components/Theme.svelte';
</script>

<Theme persist theme="g10">
	<!-- <Header /> -->
	<Content style="background: none; padding: 1rem">
		<Grid>
			<slot />
		</Grid>
	</Content>
</Theme>
