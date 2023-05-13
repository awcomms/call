<script>
	import { Content, Grid, Theme } from 'carbon-components-svelte';
	import 'carbon-components-svelte/css/all.css';
	import { browser } from '$app/environment';
	import { Header, SideNav } from '$lib/components/Nav';
	import { theme, theme_key } from '$lib/stores';
	import { onMount } from 'svelte';

	if (browser && navigator && navigator.serviceWorker)
		navigator.serviceWorker.ready.then((registration) => registration.update());

	onMount(() => {
		if (window.matchMedia) {
			window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
				e.matches ? theme.set('g100') : theme.set('white');
			});
		}
	});
</script>

<Theme persist persistKey={theme_key} theme={$theme} />
<Header />
<Content style="background: none; padding: 4rem 1rem 0 1rem; height: 100%">
	<SideNav />
	<Grid>
		<slot />
	</Grid>
</Content>
