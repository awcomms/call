<script lang="ts">
	import { Button, Modal, TextInput } from 'carbon-components-svelte';
	import axios from 'axios';
	import type { Call } from '$lib/types';
	import type Peer from 'peerjs';
	import { onMount } from 'svelte';
	import { PUBLIC_PEER_SERVER } from '$env/static/public';
	import { v4 } from 'uuid';
	import type { MediaConnection } from 'peerjs';
	import { stringStore } from '$lib/util/store';

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
			import('peerjs').then(async ({ default: Peer }) => {
				peer = new Peer();

				// check if this peer's id exists in pinecone in the call namespace
				// CHECK IF THIS WORKS
				await axios
					.post('/pinecone', {
						act: 'fetch',
						arg: [[peer.id], 'call']
					})
					.then(async ({ data }) => {
						if (!Object.keys(data.vectors).length) {
							// if it doesn't, create a new id in pinecone with an empty embedding
							await axios.post('/embedding', '').then(async ({ data: values }) => {
								await axios.post('/pinecone', {
									act: 'update',
									arg: { updateRequest: { id: peer.id, values, namespace: 'call' } }
								});
							});
						}
					});
				// edit embedding of this id in pinecone to be of an empty string

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

	const search = async (vector: number[]) => {
		if (!should_call) return;
		await axios
			.post('/pinecone', {
				act: 'query',
				arg: { queryRequest: { topK: 1, vector, includeValues: true, namespace: 'call' } }
			})
			.then(({ data }) => {
				if (!data.matches.length) return alert('no matches');
				saved_target = data.matches[0].id;
				peer
					.call(peer.id, local_stream)
					.on('stream', (s) => {
						remote_stream = s;
					})
					.on('close', () => {
						search(vector);
					});
			});
	};

	const description_change = async () => {
		should_call = false;
		await axios.post('/embedding', description).then(async ({ data: vector }) => {
			// edit id in pinecone with this embedding
			await axios.post('/pinecone', {
				act: 'update',
				arg: { updateRequest: { id: peer.id, values: vector, namespace: 'call' } }
			});
			should_call = true;
			// query pinecone for first match
			search(vector);
		});
	};
</script>

<Modal bind:open={description_open} passiveModal modalHeading="Edit description">
	<TextInput bind:value={description} labelText="Description" />
	<Button on:click={description_change}>Set</Button>
</Modal>

<Button on:click={() => (description_open = true)}>edit description</Button>

{#if remote_stream}
	<audio class="audio" autoplay={true} bind:this={ref} />
{/if}
