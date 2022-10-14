<script>
	export const prerender = true;

	import { Content, Grid } from 'carbon-components-svelte';
	import 'carbon-components-svelte/css/white.css';
	import Header from '$lib/components/Nav/Header.svelte';
	import Theme from '$lib/components/Theme.svelte';
</script>

<slot />
