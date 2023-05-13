<script lang="ts">
	export let open = false;

	import type { _Tag } from '$lib/components/Tag';
	import { Button, Modal, TextInput } from 'carbon-components-svelte';
	import { Tags } from '$lib/components/Tag';
	import { createEventDispatcher } from 'svelte';
	import { v4 } from 'uuid';
	import axios from 'axios';
	import type { Id } from '$lib/types';
	// import { goto } from '$app/navigation';

	const dispatch = createEventDispatcher();

	let metadata: { name: string; tags: _Tag[]; ids: Id[] } = {
		name: '',
		tags: [],
		ids: []
	};

	const send = async () => {
		let id = v4();
		await axios.post('/embedding', JSON.stringify(metadata)).then(async ({ data: values }) => {
			await axios.post('/pinecone', {
				act: 'upsert',
				arg: {
					upsertRequest: {
						vectors: [{ id, values, metadata }],
						namespace: "call"
					}
				}
			}).then(r => {
				console.log(r)
				dispatch('add', { detail: { id, ...metadata } });
				open = false;
			});
		});
		
	};
</script>

<Modal bind:open passiveModal modalHeading="New">
	<TextInput labelText="name" bind:value={metadata.name} />
	<Tags bind:tags={metadata.tags} />
	<br />
	<Button on:click={send}>Create</Button>
</Modal>
