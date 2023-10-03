<script lang="ts">
	import { onMount } from 'svelte';

	export let remote: boolean, ref: HTMLVideoElement, stream: MediaStream  ;

	onMount(() => {
		if (ref) ref.srcObject = stream;
	});
</script>

<video muted={!remote} autoplay={true} bind:this={ref} />
