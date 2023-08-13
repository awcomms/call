<script>
	import ConnectionSignalOff from 'carbon-icons-svelte/lib/ConnectionSignalOff.svelte';
	import { HeaderGlobalAction } from 'carbon-components-svelte';
	import { offline } from './stores';
</script>

{#if $offline}
    <HeaderGlobalAction aria-label="No internet connection" icon={ConnectionSignalOff} />
{/if}
