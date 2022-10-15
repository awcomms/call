<script lang="ts">
	import type { _Call } from '$lib/types';
	import Audio from '$lib/components/Audio.svelte';
	import type { _Remote } from '$lib/types';
	import { PEER_SERVER } from '$lib/env';
	import type { MediaConnection, Peer as _Peer } from 'peerjs';
	import { peer } from "$lib/store"

	export let call: _Call;

	export let leave_id: string;

	$: leave(leave_id);

	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { req } from '$lib/req';

	$: if (call && browser) init();

	let localStream: any;
	let remotes: _Remote[] = [];

	const leave = (id: string) => {
		if (!id) return;
		req({ Call: { Set: { id: call.id, options: { remove_ids: [id] } } } });
	};

	const join = () => {
		req({ Call: { Set: { id: call.id, options: { add_ids: [$peer.id] } } } });
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
			console.log('got stream')
			let r = remotes.find((_) => _.peer === c.peer);
			if (r) {
				console.log('existing peer', r.peer);
				r.stream = stream;
			} else {
				console.log('new peer', c.peer)
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
				let id = await req('Id');
				if (id.error) {
					console.log(id);
					return;
				}
				$peer = new peerjs.Peer(id, { host: PEER_SERVER });
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
