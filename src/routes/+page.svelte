<script lang="ts">
	import { Button, ButtonSet, Column, Modal, Row, TextArea } from 'carbon-components-svelte';
	import axios from 'axios';
	import type Peer from 'peerjs';
	import { onMount } from 'svelte';
	import { description } from '$lib/stores';

	let description_open = false,
		local_stream: MediaStream,
		remote_stream: MediaStream,
		target: string,
		may_search = true,
		updating = false,
		searching = false,
		remote_stream_ref: HTMLVideoElement,
		local_stream_ref: HTMLVideoElement,
		may_edit = false,
		peer: Peer;

	$: if (remote_stream_ref && remote_stream) remote_stream_ref.srcObject = remote_stream;
	$: if (local_stream_ref && local_stream) local_stream_ref.srcObject = local_stream;

	onMount(() => {
		navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then((stream) => {
			local_stream = stream;
			import('peerjs').then(async ({ default: Peer }) => {
				peer = new Peer();
				peer.on('open', async (id) => {
					console.log(`your peerjs id is ${id}`);
					may_edit = true;
				});

				peer.on('call', (c) => {
					if (c.peer !== target) {
						c.close();
						return; //TODO - do we need to return after closing call?
					}
					c.answer(stream);
					c.on('stream', (s) => {
						remote_stream = s;
					});
				});
			});
		});
	});

	const call = (id: string) => {
		peer
			.call(id, local_stream)
			.on('stream', async (s) => {
				console.log('remote stream');
				remote_stream = s;
			})
			.on('close', async () => {
				console.log('remote closed');
				search();
			})
			.on('error', async (e) => {
				console.log(`encountered an error: ${JSON.stringify(e)}, deleting {$id}`);
				await axios.delete(`users/${id}`);
				search();
			});
	};

	const search = async () => {
		if (!may_search) return;
		searching = true;
		await axios
			.get('/users/search', {
				params: { id: peer.id }
			})
			.then(async ({ data }) => {
				console.log(data);
				if (!data) return search();
				target = data
				console.log(`target is ${target}`);
				call(target);
			})
			.finally(() => (searching = false));
	};

	const update = async (id: string) => {
		return axios.put(`users/${id}`, {
			description
		});
	};

	const description_change = async () => {
		may_search = false;
		updating = true;

		await update(peer.id)
			.then(() => {
				search();
			})
			.catch((e) => {
				console.log(e);
				alert('encountered error updating embedding');
			})
			.finally(() => {
				may_search = true;
				updating = false;
			});
	};
</script>

<Modal bind:open={description_open} passiveModal modalHeading="edit description">
	<TextArea disabled={updating} rows={7} bind:value={$description} labelText="Description" />
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
							<Button on:click={() => (may_search = false)}>stop searching</Button>
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
				{/if}
			</div>
		</div>
	</Column>
</Row>

<style lang="sass">
	.videos
		display: flex
		flex-direction: column
		max-height: 67vh
	.video_container
		max-height: 50%
	video
		max-inline-size: auto
		max-block-size: 100%
</style>
