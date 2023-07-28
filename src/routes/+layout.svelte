<script lang='ts'>
	import { Content, Grid, Theme } from 'carbon-components-svelte';
	import 'carbon-components-svelte/css/all.css';
	import { browser } from '$app/environment';
	import { Header } from '$lib/components/Nav';
	import { onMount } from 'svelte';
	import { dev } from '$app/environment';
	import { inject } from '@vercel/analytics';
	import { theme, theme_key } from '$lib/theme_store';

	inject({ mode: dev ? 'development' : 'production' });

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
	<Grid>
		<slot />
	</Grid>
</Content>
