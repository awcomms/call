<script lang="ts">
	import type { Call } from '$lib/types';
	import Audio from '$lib/components/Audio.svelte';
	import type { _Peer } from '$lib/types';

	export let call: Call;

	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	$: if (call && browser) init();

	let localStream: any;
	let remotes: _Peer[] = [];

	let peer;

	const init = () => {
		remotes = [];
		call.ids.forEach((id) => {
			let c = peer.call(id, localStream);
			resolve(c);
		});
	};

	const resolve = (c) => {
		c.on('stream', (stream: MediaStream) => {
			let r = remotes.find((r) => r.peer === c.peer);
			if (r) {
				r.stream = stream;
			} else {
				remotes.push({ stream, peer: c.peer, ref: undefined });
			}
		});
	};

	onMount(() => {
		navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then((stream) => {
			localStream = stream;
		});
		import('peerjs').then((peerjs) => {
			if (browser) {
				peer = new peerjs.Peer();
				peer = peer.on('call', (c) => {
					c.answer(localStream);
					resolve(c);
				});
			}
		});
	});
</script>

{#each remotes as r}
	<Audio bind:r />
{/each}
