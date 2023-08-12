<script lang="ts">
	import {
		Button,
		ButtonSet,
		Column,
		Modal,
		Row,
		TextArea,
		InlineLoading
	} from 'carbon-components-svelte';
	import Edit from 'carbon-icons-svelte/lib/Edit.svelte';
	import Search from 'carbon-icons-svelte/lib/Search.svelte';
	import Checkmark from 'carbon-icons-svelte/lib/Checkmark.svelte';
	import axios from 'axios';
	import type Peer from 'peerjs';
	import { onDestroy, onMount } from 'svelte';
	import { description } from '$lib/stores';
	import { notify } from 'sveltekit-carbon-utils';

	let description_open = false,
		local_stream: MediaStream,
		remote_stream: MediaStream,
		target: string,
		editing = false,
		searching = false,
		remote_stream_ref: HTMLVideoElement,
		local_stream_ref: HTMLVideoElement,
		similarity_error = false,
		last_used_description = '',
		similarity = '',
		may_edit = false,
		may_search = false,
		peer: Peer;

	$: if (remote_stream_ref && remote_stream) remote_stream_ref.srcObject = remote_stream;
	$: if (local_stream_ref && local_stream) local_stream_ref.srcObject = local_stream;

	onDestroy(async () => {
		if (peer?.id) await del(peer.id);
	});

	onMount(() => {
		navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then((stream) => {
			local_stream = stream;
			import('peerjs').then(async ({ default: Peer }) => {
				peer = new Peer();
				peer.on('open', async (id) => {
					console.log(`your peerjs id is ${id}`);
					may_edit = true;
					if ($description) 
						await update(id).then(() => (may_search = true)).catch((e) => notify({kind: 'error', title: 'Error while updating description', subtitle: e}));
				});

				peer.on('error', async (e) => {
					const error = e.toString();
					console.error('peer error:', error);
					if (error.includes(target)) {
						del(target).then(async () => await search());
					}
				});

				peer.on('call', async (c) => {
					if (c.peer !== target) {
						c.close();
						return; //TODO - do we need to return after closing call?
					}
					c.answer(stream);
					c.on('stream', (s) => {
						remote_stream = s;
					});
					last_used_description = $description;
					similarity = await axios
						.post(`/users/${peer.id}/similarity`, $description)
						.then((r) => r.data)
						.catch(() => (similarity_error = true));
				});
			});
		});
	});

	const del = (id: string) =>
		axios
			.delete(`users/${id}`)
			.then(() => console.log(`deleted ${id}`))
			.catch((e) => console.error(`failed to delete ${id}. error:`, e));

	const search = async () => {
		if (searching) {
			may_search = false;
			return;
		}
		if (!may_search) return;
		searching = true;
		await axios
			.get('/users/search', {
				params: { id: peer.id }
			})
			.then(async ({ data }) => {
				if (data.no_description) {
					description_open = true;
					return;
				}
				if (data.no_users) {
					notify({ kind: 'info', title: 'There seem to be currently no users to match with' });
					return;
				}
				console.log(data);
				// if (!data) return await search();
				target = data;
				console.log(`target is ${target}`);

				console.log(`calling ${target}`);
				// await del(target);
				let call = peer.call(target, local_stream);
				call.on('stream', (s) => {
					console.log('remote stream');
					remote_stream = s;
				});
				call.on('close', async () => {
					console.log('remote closed');
					await search();
				});
				// call.on('error', async (e) => {
				// 	console.log(`encountered an error: ${JSON.stringify(e)}, deleting {$target}`);
				// 	// search();
				// });
			})
			.finally(() => (searching = false));
	};

	const update = async (id: string) => {
		console.log('update id', id)
		await axios.put(`/users/${id}`, $description);
	};

	const change_description = async () => {
		editing = true;

		await update(peer.id)
			.then(async () => {
				// await search();
			})
			.catch((e) => {
				console.log(e);
				// notify
				alert('encountered error while editiing');
			})
			.finally(() => {
				// may_search = true;
				editing = false;
			});
	};
</script>

<Modal bind:open={description_open} passiveModal hasForm modalHeading="edit description">
	<p>
		Really describe yourself. Your ambitions, hobbies, personality, whatever, so you will be matched
		to a similar user
	</p>
	<TextArea disabled={editing} rows={7} bind:value={$description} labelText="Description" />
	<Button
		disabled={editing}
		icon={editing ? InlineLoading : Checkmark}
		on:click={async () => {
			description_open = false;
			await change_description();
		}}>Set</Button
	>
</Modal>

<Row>
	<Column>
		<div class="container">
			{#if may_edit}
				<div class="controls">
					<ButtonSet stacked>
						<Button
							disabled={editing}
							icon={editing ? InlineLoading : Edit}
							on:click={() => (description_open = true)}>edit description</Button
						>
						<Button disabled={editing} icon={searching ? InlineLoading : Search} on:click={search}
							>{searching ? 'stop searching' : 'search'}</Button
						>
					</ButtonSet>
				</div>
			{/if}
			<div class="videos">
				{#if remote_stream}
					{#if similarity}
						<p>{similarity}</p>
					{/if}
					<div class="video_container">
						<video muted={false} autoplay={true} bind:this={remote_stream_ref} />
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
