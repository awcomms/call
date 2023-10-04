<script lang="ts">
	import {
		Button,
		ButtonSet,
		Column,
		Modal,
		Row,
		InlineLoading,
		RadioButtonGroup,
		RadioButton,
		Toggle,
		NumberInput
	} from 'carbon-components-svelte';
	import Edit from 'carbon-icons-svelte/lib/Edit.svelte';
	import Close from 'carbon-icons-svelte/lib/Close.svelte';
	import Search from 'carbon-icons-svelte/lib/Search.svelte';
	import Checkmark from 'carbon-icons-svelte/lib/Checkmark.svelte';
	import axios from 'axios';
	import type Peer from 'peerjs';
	import { onMount } from 'svelte';
	import WatchPosition from '$lib/WatchPosition.svelte';
	import { description, gender, id, offline, search_gender } from '$lib/stores';
	import { notify, stringStore } from 'sveltekit-carbon-utils';
	import Feed from '$lib/Feed.svelte';
	import Description from '$lib/Description.svelte';
	import type { Gender } from '$lib/types';
	import type { DataConnection } from 'peerjs';

	let edit_open = false,
		local_stream: MediaStream,
		remote_stream: MediaStream,
		target: string,
		chat_open = false,
		editing = false,
		use_distance = true,
		searching = false,
		data_connection: DataConnection,
		geolocation_available = false,
		// just_deleted: string,
		allow = true,
		use_position = false,
		distance = 0,
		remote_stream_ref: HTMLVideoElement,
		local_stream_ref: HTMLVideoElement,
		// last_used_description = '',
		old_description = stringStore('old_description'),
		peer: Peer;

	$: if (remote_stream_ref && remote_stream) {
		remote_stream_ref.srcObject = remote_stream;
		remote_stream.addEventListener('inactive', () => {
			console.log('remote_stream went inactive');
		});
	}
	$: if (local_stream_ref && local_stream) local_stream_ref.srcObject = local_stream;

	// onDestroy(async () => {
	// if (peer?.id) await del(peer.id);
	// });

	onMount(() => {
		navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then((stream) => {
			local_stream = stream;
			import('peerjs').then(async ({ default: Peer }) => {
				try {
					if ($id) {
						const { data } = await axios.get(`users/${$id}/exists`);
						if (!data) {
							console.log('!data')
							update({ id: $id });
							edit_open = true;
						}
					} else {
						console.log('!id')
						$id = await axios.get('/peer_id').then((r) => r.data);
						update({ id: $id });
						edit_open = true;
					}
					console.log('t id', $id)
					peer = new Peer($id, { host: 'https://peerjs-server-gt0g.onrender.com' });
				} catch (e) {
					console.error('Initialization error: ', e);
					notify({
						kind: 'error',
						title: 'Please reload the page'
					});
					allow = false;
				}

				peer.on('error', async (e) => {
					const error = e.toString();
					console.error('peer error:', error);
					if (/ID\s".+"\sis\sinvalid/.test(error)) {
						try {
							$id = await axios.get('/peer_id').then((r) => r.data);
							update({ id: $id });
							peer = new Peer($id, { host: 'https://peerjs-server-gt0g.onrender.com' });
							edit_open = true;
						} catch (e) {
							notify({ kind: 'error', title: 'Please reload this page' });
						}
					}

					// if (error.includes(target) && target !== just_deleted) {
					// await del(target).then(() => (just_deleted = target));
					// }
				});

				peer.on('connection', (c) => (data_connection = c));

				peer.on('call', async (c) => {
					if (target && c.peer !== target) {
						c.close();
						return; //TODO - do we need to return after closing call?
					}
					c.answer(stream);
					data_connection = peer.connect(c.peer);
					// data_connection.on('data', (t) => {
					// 	messages = [...messages, { s: data_connection.peer, t: t as string }];
					// 	// chat.scroll
					// });
					c.on('stream', (s) => {
						remote_stream = s;
					});
				});
			});
		});
	});

	// const del = (id: string) =>
	// 	axios
	// 		.delete(`users/${id}`)
	// 		.then(() => {
	// 			console.log(`deleted ${id}`);
	// 		})
	// 		.catch((e) => console.error(`failed to delete ${id}. error:`, e));

	const search = async () => {
		if (!allow) return;
		if (searching) {
			return;
		}
		searching = true;
		let found = false;
		while (!found && searching && allow) {
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
					notify({ kind: 'error', title: 'We experienced an error while searching', timeout: 432 });
				} else if (data === 'no_description') {
					edit_open = true;
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
				allow = false;
				console.error('search error', e);
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
		if (found && searching && allow) handleCall(target);
	};

	const handleCall = async (target: string) => {
		let call = peer.call(target, local_stream);
		call.on('stream', (s) => {
			remote_stream = s;
		});
		call.on('close', () => {
			console.log('remote closed');
		});
		call.on('error', (e) => {
			notify({
				kind: 'error',
				title: 'Error while trying to connect with found user',
				subtitle: e.toString()
			});
			console.log(`encountered an error: ${e}`);
		});
	};

	interface Update {
		id: string;
		text?: string;
		gender?: Gender;
		search_gender?: Gender;
	}

	const update = async (
		arg: Update = {
			id: $id,
			text: $description === $old_description ? undefined : $old_description,
			gender: $gender,
			search_gender: $search_gender
		}
	) => {
		editing = true;
		try {
			await axios.put(`/users/${arg.id}`, {
				text: arg.text,
				gender: arg.gender,
				search_gender: arg.search_gender
			});
			if (!allow) allow = true;
			if (arg.text) $description = $old_description;
			notify({ title: 'Detail updated', timeout: 1111 });
		} catch (e: any) {
			console.log('Detail update error', e);
			notify({ kind: 'error', title: 'Detail update error', subtitle: e, timeout: 1111 });
		}
		editing = false;
	};
</script>

<WatchPosition
	on:not_available={() => (geolocation_available = false)}
	on:available={() => (geolocation_available = true)}
	on:change={({ detail }) =>
		axios.put(`/users/${peer.id}`, {
			position: `${detail.position.coords.longitude},${detail.position.coords.latitude}`
		})}
/>

<Modal
	on:submit={() => {
		edit_open = false;
		update();
	}}
	primaryButtonDisabled={editing}
	primaryButtonIcon={editing ? InlineLoading : Checkmark}
	primaryButtonText="Save"
	on:click:button--secondary={() => (edit_open = false)}
	bind:open={edit_open}
	hasForm
	modalHeading="edit"
>
	<div class="modal">
		<RadioButtonGroup
			legendText="I am"
			on:change={({ detail: gender }) => update({ id: $id, gender: gender })}
			bind:selected={$gender}
		>
			<RadioButton labelText="female" value="2" />
			<RadioButton labelText="male" value="1" />
			<!-- TODO - explain what `rather not say` does -->
			<RadioButton labelText="rather not say" value="0" />
		</RadioButtonGroup>
		<RadioButtonGroup
			legendText="Search for"
			on:change={({ detail: search_gender }) => update({ id: $id, search_gender: search_gender })}
			bind:selected={$search_gender}
		>
			<RadioButton labelText="female" value="2" />
			<RadioButton labelText="male" value="1" />
			<RadioButton labelText="any" value="0" />
		</RadioButtonGroup>
		<Toggle bind:toggled={use_position} labelText="Nearby" />
		{#if use_position}
			<Toggle bind:toggled={use_distance} labelText="Within" />
			{#if use_distance}
				<NumberInput bind:value={distance} label="Within {distance} miles" />
			{/if}
		{/if}
		{#if !(use_position && !distance)}
			<Description
				disabled={editing}
				bind:value={$old_description}
				labelText="Description{$description === $old_description ? '' : ' (unsaved)'}"
			/>
		{/if}
	</div>
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
						on:click={() => (edit_open = true)}
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
				</ButtonSet>
			{/if}
		</div>
		<div class="videos">
			<Feed {data_connection} remote stream={remote_stream} />
			<Feed {data_connection} remote={false} stream={local_stream} />
		</div>
	</Column>
</Row>

<style lang="sass">
	@use '@carbon/layout'
	.modal
		display: flex
		flex-direction: column
		row-gap: layout.$spacing-07
	.controls
		display: flex
		min-height: 3rem
	.videos
		display: grid
		grid-template-columns: 1fr
		grid-template-rows: calc((100vh - 10rem) / 2) calc((100vh - 10rem) / 2)
</style>
