<script lang="ts">
	export let leave_trigger: boolean;

	import type { Call as _Call } from '$lib/types';
	import Audio from '$lib/components/Audio.svelte';
	import type { _Remote } from '$lib/types';
	import type { MediaConnection, Peer as _Peer } from 'peerjs';
	import { peer } from '$lib/stores';
	import axios from 'axios';

	export let call: _Call;

	$: leave(leave_trigger);

	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { v4 } from 'uuid';

	$: if (call && browser) init();

	let localStream: any;
	let remotes: _Remote[] = [];

	const leave = async (..._trigger: any[]) => {
		if (!call) return;
		await axios.post('/pinecone', {
			act: 'update',
			arg: {
				updateRequest: {
					id: call.id,
					setMetadata: { ids: call.ids.filter((i) => i !== $peer.id) },
					namespace: 'call'
				}
			}
		});
	};

	const join = async () => {
		await axios.post('/pinecone', {
			act: 'update',
			arg: {
				updateRequest: {
					id: call.id,
					setMetadata: { ids: [...call.ids, $peer.id] },
					namespace: 'call'
				}
			}
		});
	};

	const init = () => {
		console.log('call changed', call);
		join();
		remotes = [];
		call.ids.forEach((id) => {
			let c = $peer.call(id, localStream);
			resolve(c);
		});
	};

	const resolve = (c: MediaConnection) => {
		c.on('stream', (stream: MediaStream) => {
			console.log('got stream');
			let r = remotes.find((_) => _.peer === c.peer);
			if (r) {
				console.log('existing peer', r.peer);
				r.stream = stream;
			} else {
				console.log('new peer', c.peer);
				remotes.push({ stream, peer: c.peer });
				remotes = remotes;
			}
		});
	};

	onMount(() => {
		navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then((stream) => {
			localStream = stream;
		});
		import('peerjs').then(async (peerjs) => {
			if (browser) {
				$peer = new peerjs.Peer();
				$peer.on('call', (c) => {
					c.answer(localStream);
					resolve(c);
				});
			}
		});
	});

	onDestroy(() => {
		leave(call?.id);
	});
</script>

{#each remotes as r}
	<Audio bind:r />
{/each}
