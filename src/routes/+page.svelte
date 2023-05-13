<script lang="ts">
	import { Button, Modal, TextInput } from 'carbon-components-svelte';
	import axios from 'axios';
	import type { Call } from '$lib/types';
	import type Peer from 'peerjs';
	import { onMount } from 'svelte';
	import { PUBLIC_PEER_SERVER } from '$env/static/public';
	import { v4 } from 'uuid';
	import type { MediaConnection } from 'peerjs';

	$: if (ref && remote_stream) ref.srcObject = remote_stream;

	let description_open = false,
		local_stream: MediaStream,
		remote_stream: MediaStream,
		description = '',
		saved_target = '',
		should_call = true,
		ref: HTMLAudioElement,
		peer: Peer;

	onMount(() => {
		navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then((stream) => {
			local_stream = stream;
			import('peerjs').then(({ default: Peer }) => {
				peer = new Peer();
				peer.on('call', (c: MediaConnection) => {
					if (c.peer === saved_target) {
						c.answer(stream);
						c.on('stream', (s) => {
							remote_stream = s;
						});
					} else {
						c.close();
					}
				});
			});
		});
	});

	const call = (id: string, stream: MediaStream) => {
		if (!should_call) return;
		let c = peer.call(id, stream);
		c.on('stream', (s) => {
			remote_stream = s;
		}).on('close', () => {
			call(id, stream);
		});
	};

	const search = async () => {
		should_call = false;
		await axios.post('/embedding', description).then(async ({ data: vector }) => {
			await axios
				.post('/pinecone', {
					act: 'query',
					arg: { queryRequest: { topK: 3, vector, includeValues: true, namespace: 'call' } }
				})
				.then(({ data }) => {
					if (!data.matches.length) return console.log('no matches');
					saved_target = data.matches[0].id;
					should_call = true;
					call(data.matches[0].id, local_stream);
				});
		});
	};
</script>

<Modal bind:open={description_open} passiveModal modalHeading="Edit description">
	<TextInput bind:value={description} labelText="Description" />
	<Button on:click={search}>Set</Button>
</Modal>

<Button on:click={() => (description_open = true)}>edit description</Button>

{#if remote_stream}
	<audio class="audio" autoplay={true} bind:this={ref} />
{/if}
