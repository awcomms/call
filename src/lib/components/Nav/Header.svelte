<script lang="ts">
	import { navigating } from '$app/stores';
	import { isSideNavOpen } from './store';
	import {
		InlineLoading,
		SkipToContent,
		Header,
		HeaderUtilities,
		HeaderAction
	} from 'carbon-components-svelte';
	import Sun from 'carbon-icons-svelte/lib/Sun.svelte';
	import Moon from 'carbon-icons-svelte/lib/Moon.svelte';
	import { theme } from '$lib/theme_store';

	$: isOpen = false;
	$: icon = $theme === 'g100' ? Sun : Moon;
</script>

<Header persistentHamburgerMenu={true} company="Quiz" bind:isSideNavOpen={$isSideNavOpen} href="/">
	{#if $navigating}
		<InlineLoading />
	{/if}
	<svelte:fragment slot="skip-to-content">
		<SkipToContent />
	</svelte:fragment>
	<HeaderUtilities>
		<HeaderAction
			on:click={(e) => {
				$theme = $theme === 'g100' ? 'white' : 'g100';
			}}
			on:open={(e) => {
				isOpen = false;
			}}
			bind:isOpen
			{icon}
			closeIcon={icon}
		/>
	</HeaderUtilities>
</Header>
