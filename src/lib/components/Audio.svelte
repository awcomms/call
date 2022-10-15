<script lang="ts">
	import type { _Remote } from '$lib/types';
	export let r: _Remote;

	let ref;
	$: if (ref) ref.srcObject = r?.stream;
</script>

{#if r?.stream}
	<audio class="audio" autoplay={true} bind:this={ref} />
{/if}
<!-- <style lang="sass">
    .audio
        display: none
</style> -->
