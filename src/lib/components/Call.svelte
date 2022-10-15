<script lang="ts">
	import type { _Call } from '$lib/types';
	import Audio from '$lib/components/Audio.svelte';
	import type { _Remote } from '$lib/types';
	import type { MediaConnection, Peer as Peer_ } from 'peerjs';

	export let call: _Call;

	export let leave_id: string;

	$: leave(leave_id);
	$: console.log('remotes', remotes);

	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { req } from '$lib/req';

	$: if (call && browser) init();

	let localStream: any;
	let remotes: _Remote[] = [];

	let peer: Peer_;

	const leave = (id: string) => {
		if (!id) return;
		req({ Call: { Set: { id: call.id, options: { remove_ids: [id] } } } });
	};

	const join = () => {
		req({ Call: { Set: { id: call.id, options: { add_ids: [peer.id] } } } });
	};

	const init = () => {
		console.log('call changed', call);
		join();
		remotes = [];
		call.ids.forEach((id) => {
			let c = peer.call(id, localStream);
			resolve(c);
		});
	};

	const resolve = (c: MediaConnection) => {
		console.log('incoming call', c.peer);
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
				peer = new peerjs.Peer(id, { host: '127.0.0.1' });
				console.log('self_id', peer.id);
				peer = peer.on('call', (c) => {
					c.answer(localStream);
					resolve(c);
				});
			}
		});
	});

	onDestroy(() => {
		console.log('destroy');
		leave(call?.id);
	});

	let new_call: string;
	let new_r: _Remote;
	let n_r: _Remote;

	const call_new = () => {
		const call = peer.call(new_call, localStream);

		call.on('stream', (stream) => {
			new_r = { stream, peer: call.peer };
		});
	};
</script>

<input bind:value={new_call} />
<button on:click={call_new}>call new</button>
<Audio bind:r={new_r} />
<Audio bind:r={n_r} />

{#each remotes as r}
	<Audio bind:r />
{/each}
