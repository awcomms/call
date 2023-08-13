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
	import Video from '$lib/Video.svelte';

	let description_open = false,
		local_stream: MediaStream,
		remote_stream: MediaStream,
		target: string,
		editing = false,
		searching = false,
		just_deleted: string,
		show_similarity = false,
		remote_stream_ref: HTMLVideoElement,
		local_stream_ref: HTMLVideoElement,
		similarity_error = false,
		last_used_description = '',
		similarity = '',
		may_edit = false,
		may_search = false,
		peer: Peer;

	$: if (remote_stream_ref && remote_stream) {
		remote_stream_ref.srcObject = remote_stream;
		remote_stream.addEventListener('inactive', () => {
			console.log('remote_stream went inactive, peer id: ', peer.id);
		});
	}
	$: if (local_stream_ref && local_stream) local_stream_ref.srcObject = local_stream;
	$: may_search = !editing && !searching;

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
						await update(id)
							.then(() => (may_search = true))
							.catch((e) =>
								notify({ kind: 'error', title: 'Error while updating description', subtitle: e })
							);
				});

				peer.on('error', async (e) => {
					const error = e.toString();
					console.error('peer error:', error);
					if (error.includes(target)) {
						await del(target); //.then(() => just_deleted = target);
						await search();
					}
				});

				peer.on('call', async (c) => {
					if (target && c.peer !== target) {
						c.close();
						return; //TODO - do we need to return after closing call?
					}
					c.answer(stream);
					c.on('stream', (s) => {
						console.log('received stream');
						remote_stream = s;
					});
					last_used_description = $description;
					// await axios
					// 	.post(`/users/${peer.id}/similarity`, $description)
					// 	.then((r) => {
					// 		similarity = r.data;
					// 		console.log('similarity', similarity);
					// 	})
					// 	.catch(() => (similarity_error = true));
				});
			});
		});
	});

	const del = (id: string) =>
		axios
			.delete(`users/${id}`)
			.then(() => {
				console.log(`deleted ${id}`);
			})
			.catch((e) => console.error(`failed to delete ${id}. error:`, e));

	const search = async () => {
		if (searching) {
			// may_search = false;
			return;
		}
		// console.log('searching');
		// if (!may_search) return;
		searching = true;
		await axios
			.get('/users/search', {
				params: { id: peer.id }
			})
			.then(async ({ data }) => {
				if (data === 'no_description') {
					description_open = true;
					return;
				}
				if (data === 'no_users') {
					notify({ kind: 'info', title: 'There seem to be currently no users to match with' });
					return;
				}
				console.log(data);
				// if (!data) return await search();
				target = data;
				console.log(`target is ${target}`);

				console.log(`calling ${target}`);
				let call = peer.call(target, local_stream);
				call.on('stream', (s) => {
					remote_stream = s;
				});
				call.on('close', async () => {
					console.log('remote closed');
					may_search = true;
					await search();
				});
				call.on('error', async (e) => {
					notify({
						kind: 'error',
						title: 'Error while tring to connect with found user',
						subtitle: e.toString()
					});
					console.log(`encountered an error: ${e}`);
				});
				return;
			})
			.catch((subtitle) => {
				notify({ kind: 'error', title: 'Search error', subtitle });
			})
			.finally(() => (searching = false));
	};

	const update = async (id: string) => {
		console.log('update id', id);
		await axios.put(`/users/${id}`, $description);
	};

	const change_description = async () => {
		editing = true;

		await update(peer.id)
			.then(async () => {
				// await search();
				notify('description updated');
			})
			.catch((e) => {
				console.log(e);
				notify({ kind: 'error', title: 'Error while updating description', subtitle: e });
			})
			.finally(() => {
				// may_search = true;
				editing = false;
			});
	};
</script>

<Modal bind:open={show_similarity} passiveModal modalHeading="Similarity between descriptions">
	<p>{similarity}</p>
</Modal>

<Modal bind:open={description_open} passiveModal hasForm modalHeading="edit description">
	<p>The description will be used to match you to a user with a similar description</p>
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
		<div class="controls">
			<ButtonSet>
				{#if may_edit}
					<Button
						iconDescription="edit"
						size="small"
						disabled={editing}
						icon={editing ? InlineLoading : Edit}
						on:click={() => (description_open = true)}
					/>
				{/if}
				<Button
					iconDescription="search"
					size="small"
					disabled={editing}
					icon={searching ? InlineLoading : Search}
					on:click={search}
				/>
				<!-- {#if remote_stream && similarity}
					<Button on:click={() => show_similarity}>user similarity</Button>
				{/if} -->
			</ButtonSet>
		</div>
		<div class="videos">
			<Video remote stream={remote_stream} />
			<Video stream={local_stream} />
		</div>
	</Column>
</Row>

<style lang="sass">
	.controls
		display: flex
	.videos
		display: grid
		grid-template-columns: 1fr
		grid-template-rows: calc((100vh - 8rem) / 2) calc((100vh - 8rem) / 2)
</style>
