<script lang="ts">
	import type { Call } from '$lib/types';
	import Audio from '$lib/components/Audio.svelte';
	import { Peer } from 'peerjs';
	import type { Peer as _Peer } from '$lib/types';

	export let call: Call;

	import { onMount } from 'svelte';

	let localStream: any;
	let remotes: _Peer[] = [];

	let peer = new Peer();

    const resolve = (c) => {
        c.on('stream', (stream) => {
			let r = remotes.find((r) => r.peer === c.peer);
			if (r) {
				r.stream = stream;
			} else {
				remotes.push({ stream, peer: c.peer, ref: undefined });
			}
		});
    }

	onMount(() => {
		navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then((stream) => {
			localStream = stream;
		});
		call.ids.forEach((id) => {
			let c = peer.call(id, localStream);
			resolve(c)
		});
	});

	peer.on('call', (c) => {
		c.answer(localStream);
		resolve(c)
	});
</script>

{#each remotes as r}
	<Audio bind:r />
{/each}
