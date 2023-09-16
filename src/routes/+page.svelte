<script lang="ts">
	import {
		Button,
		ButtonSet,
		Column,
		Modal,
		Row,
		TextArea,
		InlineLoading,
		RadioButtonGroup,
		RadioButton,
		Toggle
	} from 'carbon-components-svelte';
	import Edit from 'carbon-icons-svelte/lib/Edit.svelte';
	import Close from 'carbon-icons-svelte/lib/Close.svelte';
	import Search from 'carbon-icons-svelte/lib/Search.svelte';
	import Checkmark from 'carbon-icons-svelte/lib/Checkmark.svelte';
	import axios from 'axios';
	import type Peer from 'peerjs';
	import { onDestroy, onMount } from 'svelte';
	import WatchPosition from '$lib/WatchPosition.svelte';
	import { description, gender, offline, search_gender, use_description } from '$lib/stores';
	import { notify, stringStore } from 'sveltekit-carbon-utils';
	import Video from '$lib/Video.svelte';

	let description_open = false,
		local_stream: MediaStream,
		remote_stream: MediaStream,
		target: string,
		editing = false,
		use_distance = false,
		searching = false,
		geolocation_available = false,
		just_deleted: string,
		allow = true,
		use_position = true,
		distance = 0,
		show_similarity = false,
		remote_stream_ref: HTMLVideoElement,
		local_stream_ref: HTMLVideoElement,
		similarity_error = false,
		// last_used_description = '',
		old_description = stringStore('old_description'),
		similarity = '',
		peer: Peer;

	$: if (remote_stream_ref && remote_stream) {
		remote_stream_ref.srcObject = remote_stream;
		remote_stream.addEventListener('inactive', () => {
			console.log('remote_stream went inactive');
		});
	}
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
					if ($description) {
						try {
							await update(id, $description);
							console.log('update');
							allow = true;
							console.log('allow', allow);
						} catch (e) {
							notify({
								kind: 'error',
								title: 'Error while updating description',
								subtitle: (() => {
									return e instanceof Error ? e.toString() : '';
								})()
							});
						}
					} else {
						description_open = true;
					}
				});

				peer.on('error', async (e) => {
					const error = e.toString();
					console.error('peer error:', error);
					if (error.includes(target) && target !== just_deleted) {
						await del(target).then(() => (just_deleted = target));
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
						// console.log('received stream');
						remote_stream = s;
					});
					// last_used_description = $description;
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
			return;
		}
		searching = true;
		let found = false;
		while (!found && searching) {
			try {
				let params: { id: string; use_position?: number | string } = { id: peer.id };
				if (use_position) {
					if (use_distance && distance > 0) {
						params.use_position = distance;
					} else {
						params.use_position = '';
					}
				}
				const { data } = await axios.get('/users/search', {
					params
				});
				if (!data) {
					notify({ kind: 'error', title: 'We experienced an error while searching' });
				} else if (data === 'no_description') {
					description_open = true;
				} else if (data === 'no_users') {
					// notify({
					// 	kind: 'info',
					// 	title: 'There seem to be currently no users to match with',
					// 	timeout: 1000
					// });
				} else {
					target = data;
					found = true;
				}
			} catch (e) {
				if (e instanceof Error) {
					notify({ kind: 'error', title: 'Search error', subtitle: e.toString(), timeout: 1000 });
				} else {
					notify({
						kind: 'error',
						title: 'Search error',
						subtitle: 'An unknown error occurred',
						timeout: 1000
					});
				}
			}
		}
		if (found && searching) handleCall(target);
	};

	const handleCall = async (target: string) => {
		let call = peer.call(target, local_stream);
		call.on('stream', (s) => {
			remote_stream = s;
		});
		call.on('close', () => {
			console.log('remote closed');
			search();
		});
		call.on('error', (e) => {
			notify({
				kind: 'error',
				title: 'Error while trying to connect with found user',
				subtitle: e.toString()
			});
			console.log(`encountered an error: ${e}`);
			search();
		});
	};

	const update = (id: string, text: string) =>
		axios.put(`/users/${id}`, { text, gender: $gender, search_gender: $search_gender });

	const update_details = (text: string) => {
		editing = true;

		update(peer.id, text)
			.then(() => {
				if (!allow) allow = true;
				notify('description updated');
			})
			.catch((e) => {
				console.log(e);
				notify({ kind: 'error', title: 'Error while updating description', subtitle: e });
			})
			.finally(() => {
				editing = false;
			});
	};

	$: console.log('allow', allow);
</script>

<!-- <Modal bind:open={show_similarity} passiveModal modalHeading="Similarity between descriptions">
	<p>{similarity}</p>
</Modal> -->

<WatchPosition
	on:not_available={() => (geolocation_available = false)}
	on:available={() => (geolocation_available = true)}
	on:change={({ detail }) =>
		axios.put(`/users/${peer.id}`, {
			position: `${detail.position.coords.longitude},${detail.position.coords.latitude}`
		})}
/>

<Modal
	on:submit={async () => {
		$description = $old_description;
		description_open = false;
		await update_details($description);
	}}
	primaryButtonDisabled={editing}
	primaryButtonIcon={editing ? InlineLoading : Checkmark}
	primaryButtonText="Save"
	on:click:button--secondary={() => (description_open = false)}
	bind:open={description_open}
	hasForm
	modalHeading="edit description"
>
	<RadioButtonGroup
		legendText="I am"
		on:change={({ detail: gender }) => axios.put(`users/${peer.id}`, { gender })}
		bind:selected={$gender}
	>
		<RadioButton labelText="female" value="2" />
		<RadioButton labelText="male" value="1" />
		<RadioButton
			labelText="would rather not say (matches you with only people searching for 'any')"
			value="0"
		/>
	</RadioButtonGroup>
	<RadioButtonGroup
		legendText="Search for"
		on:change={({ detail: search_gender }) => axios.put(`users/${peer.id}`, { search_gender })}
		bind:selected={$search_gender}
	>
		<RadioButton labelText="female" value="2" />
		<RadioButton labelText="male" value="1" />
		<RadioButton labelText="any" value="0" />
	</RadioButtonGroup>

	<!-- <Toggle
		bind:toggled={$use_description}
		labelText="Use a description of yourself to be matched with users with similar descriptions"
	/> -->
	<Toggle
		disabled
		bind:toggled={$use_description}
		labelText="Use a description of yourself to be matched with users with similar descriptions"
	/>
	{#if $use_description}
		<TextArea
			disabled={editing}
			rows={7}
			bind:value={$old_description}
			labelText="description{$description === $old_description ? '' : ' (unsaved)'}"
		/>
	{/if}
</Modal>

<Row>
	<Column>
		<div class="controls">
			{#if allow && !$offline}
				<ButtonSet>
					<Button
						iconDescription="edit"
						disabled={editing}
						icon={editing ? InlineLoading : Edit}
						on:click={() => (description_open = true)}
					/>
					<Button
						iconDescription="search"
						disabled={editing}
						icon={searching ? Close : Search}
						on:click={() => (searching ? (searching = false) : search())}
					>
						{#if searching}
							<InlineLoading />
						{/if}
					</Button>

					<!-- {#if remote_stream && similarity}
						<Button on:click={() => show_similarity}>user similarity</Button>
					{/if} -->
				</ButtonSet>
			{/if}
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
		min-height: 3rem
	.videos
		display: grid
		grid-template-columns: 1fr
		grid-template-rows: calc((100vh - 10rem) / 2) calc((100vh - 10rem) / 2)
</style>
