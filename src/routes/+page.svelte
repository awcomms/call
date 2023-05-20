<script lang="ts">
	import { Button, ButtonSet, Column, Modal, Row, TextInput } from 'carbon-components-svelte';
	import axios from 'axios';
	import type Peer from 'peerjs';
	import { onMount } from 'svelte';
	import { namespace } from '$lib/constants';
	import { description } from '$lib/stores';
	import { io } from 'socket.io-client';

	const socket = io();
	let description_open = false,
		local_stream: MediaStream,
		remote_stream: MediaStream,
		// peerjs id of the match to attempt to call
		saved_target = '',
		// set to false when description is updated, so recursive searching is halted
		may_search = true,
		self_id: string,
		updating = false,
		searching = false,
		double_stream_ref: HTMLVideoElement,
		remote_stream_ref: HTMLVideoElement,
		local_stream_ref: HTMLVideoElement,
		may_edit = false,
		peer: Peer;

	$: if (remote_stream_ref && remote_stream) remote_stream_ref.srcObject = remote_stream;
	$: if (local_stream_ref && local_stream) local_stream_ref.srcObject = local_stream;
	// $: if (double_stream_ref && local_stream) double_stream_ref.srcObject = local_stream;

	onMount(() => {
		navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then((stream) => {
			local_stream = stream;
			import('peerjs').then(async ({ default: Peer }) => {
				peer = new Peer();
				peer.on('open', (id) => {
					self_id = id;
					console.log(`your peerjs id is ${id}`);
					socket.emit('peer_id', id, () => {
						may_edit = true;
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
									act: 'delete1',
									arg: { ids: [id], namespace }
								});
							}
							//  create it with the description embedding
							await axios.post('/pinecone', {
								act: 'upsert',
								arg: {
									upsertRequest: {
										id,
										vectors: [{ id, values: await embedding() }],
										namespace
									}
								}
							});
							await search();
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

	const embedding = async () => {
		return await axios.post('/embedding', $description).then((r) => r.data);
	};

	const call = (id: string) => {
		peer
			.call(id, local_stream)
			.on('stream', async (s) => {
				remote_stream = s;
				console.log('added remote_stream');
				searching = false;
			})
			.on('close', async () => {
				console.log('call closed');
				await search();
			})
			.on('error', (e) => {
				console.log(`encountered an error: ${JSON.stringify(e)}`);
			});
	};

	const search = async () => {
		searching = true;
		if (!may_search) return;
		await axios
			.post('/pinecone', {
				act: 'query',
				arg: {
					queryRequest: { topK: 2, id: peer.id, includeValues: true, namespace }
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
				console.log(`saved a target: ${saved_target}`);
				socket.emit('call', saved_target, async (response: number) => {
					if (response === 1) {
						call(saved_target);
					} else {
						await search();
					}
				});
			})
			.finally(() => (searching = false));
	};

	const description_change = async () => {
		may_search = false;
		updating = true;

		// edit id in pinecone with description embedding
		await embedding();
		await axios
			.post('/pinecone', {
				act: 'update',
				arg: { updateRequest: { id: self_id, values: await embedding(), namespace: 'call' } }
			})
			.then(async (r) => {
				updating = false;
				console.log('updated description');
				may_search = true;
				await search();
			})
			.finally(() => {
				updating = false;
				searching = false;
			});
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

<Row>
	<Column>
		<div class="container">
			{#if may_edit}
				<div class="controls">
					<ButtonSet>
						<Button on:click={() => (description_open = true)}>edit description</Button>
						{#if searching}
							<Button on:click={() => (may_search = false)}>Stop searching</Button>
						{:else}
							<Button
								on:click={() => {
									may_search = true;
									search();
								}}>Search</Button
							>
						{/if}
					</ButtonSet>
				</div>
			{/if}
			<div class="videos">
				{#if remote_stream}
					<div class="video_container">
						<video autoplay={true} bind:this={remote_stream_ref} />
					</div>
				{/if}
				{#if local_stream}
					<div class="video_container">
						<video autoplay={true} bind:this={local_stream_ref} />
					</div>
					<!-- <div class="video_container">
						<video autoplay={true} bind:this={double_stream_ref} />
					</div> -->
				{/if}
			</div>
		</div>
	</Column>
</Row>

<style lang="scss">
	.video_container {
		height: 370px;
	}
</style>
