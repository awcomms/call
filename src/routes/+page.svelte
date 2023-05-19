<script lang="ts">
	import { Button, Modal, TextInput } from 'carbon-components-svelte';
	import axios from 'axios';
	import type Peer from 'peerjs';
	import { onMount } from 'svelte';
	import { namespace } from '$lib/constants';
	import { description } from '$lib/stores';
	import { io } from 'socket.io-client';
	import { arrayStore } from '$lib/util/store';
	import { empty_string_embedding } from '$lib/constants';

	const socket = io();
	let description_embedding = arrayStore<number>('description_embedding', empty_string_embedding),
		logs: string[] = [],
		description_open = false,
		local_stream: MediaStream,
		remote_stream: MediaStream,
		// peerjs id of the match to attempt to call
		saved_target = '',
		// set to false when description is updated, so recursive searching is halted
		should_call = true,
		loading = false,
		ref: HTMLVideoElement,
		can_edit = false,
		peer: Peer;

	$: if (logs.length) console.log(logs[logs.length - 1]);
	$: if (ref && remote_stream) ref.srcObject = remote_stream;
	// $: set_description_embedding($description);

	onMount(() => {
		navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then((stream) => {
			local_stream = stream;
			import('peerjs').then(async ({ default: Peer }) => {
				peer = new Peer();
				peer.on('open', (id) => {
					logs = [...logs, `your peerjs id is ${id}`];
					socket.emit('peer_id', id, () => {
						can_edit = true;
					});
					// check if this peer's id exists in pinecone in the call namespace
					axios
						.post('/pinecone', {
							act: 'fetch',
							arg: { ids: [id], namespace }
						})
						.then(async ({ data }) => {
							// if it is, delete it
							if (data.vectors[id]) {
								await axios.post('/pinecone', {
									act: 'delet1',
									arg: { ids: [id], namespace }
								});
							}
							//  create it with the description embedding
							await axios.post('/pinecone', {
								act: 'upsert',
								arg: {
									upsertRequest: {
										id,
										vectors: [{ id, values: $description_embedding }],
										namespace
									}
								}
							});
							if ($description_embedding !== empty_string_embedding) {
								await search()
							} 
						});
				});

				peer.on('connection', (connection) => {
					connection.on('data', (data) => {
						if (data === 'call' && connection.peer === saved_target) {
						}
					});
				});

				peer.on('call', (c) => {
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

	// const set_description_embedding = async (d: string) => {
	// 	$description_embedding = await axios.post('/embedding', d).then((r) => r.data);
	// };

	const embedding = async () => {
		$description_embedding = await axios.post('/embedding', $description).then((r) => r.data);
	};

	const call = (id: string) => {
		peer
			.call(id, local_stream)
			.on('stream', async(s) => {
				remote_stream = s;
				logs = [...logs, 'added remote_stream'];
				loading = false;
			})
			.on('close', async() => {
				logs = [...logs, 'call closed'];
				await search();
			})
			.on('error', (e) => {
				logs = [...logs, `encountered an error: ${JSON.stringify(e)}`];
			});
	};

	const search = async () => {
		loading = true
		if (!should_call) return;
		await axios
			.post('/pinecone', {
				act: 'query',
				arg: {
					queryRequest: { topK: 2, vector: $description_embedding, includeValues: true, namespace }
				}
			})
			.then(({ data }) => {
				if (!data.matches.length) return alert('no one available');
				saved_target = data.matches[0].id;
				if (saved_target === peer.id) {
					if (data.matches.length > 1) {
						saved_target = data.matches[1].id;
					} else {
						return alert('no one available');
					}
				}
				logs = [...logs, `saved a target: ${saved_target}`];
				socket.emit('call', saved_target, async (response: number) => {
					if (response === 1) {
						call(saved_target);
					} else {
						if (response === -1) {
							console.log('to delete', saved_target);
							await axios.post('/pinecone', {
								act: 'delete1',
								arg: { ids: [saved_target], namespace }
							});
						}
						await search();
					}
				});
			}).finally(() => loading = false);
	};

	const description_change = async () => {
		should_call = false;
		loading = true;

		// edit id in pinecone with description embedding
		await embedding();
		await axios
			.post('/pinecone', {
				act: 'update',
				arg: { updateRequest: { id: peer.id, values: $description_embedding, namespace: 'call' } }
			})
			.then(async (r) => {
				logs = [...logs, 'updated description'];
				should_call = true;
				await search();
			}).finally(() => loading = false);
	};
</script>

<Modal bind:open={description_open} passiveModal modalHeading="edit description">
	<TextInput bind:value={$description} labelText="Description" />
	<Button
		on:click={() => {
			description_open = false;
			description_change();
		}}>Set</Button
	>
</Modal>

{#if loading}
	<p>searching...</p>
{/if}

{#if can_edit}
	<Button on:click={() => (description_open = true)}>edit description</Button>
{/if}

{#if remote_stream}
	<video autoplay={true} bind:this={ref} />
{/if}

<!-- {#if logs.length}
	<div class="logs">
		{#each logs as log}
			<p>{log}</p>
		{/each}
	</div>
{/if} -->

<style lang="scss">
	.logs {
		font-family: monospace;
	}
</style>
