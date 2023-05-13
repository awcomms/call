<script lang="ts">
	import { req } from '$lib/req';
	import { Row, Column, ButtonSet, Button } from 'carbon-components-svelte';
	import { New, Call, CallEntry } from '$lib/components';
	import type { _Tag } from '$lib/components/Tag';
	import type { Call as _Call } from '$lib/types';
	import { searchTags } from '$lib/stores';
	import SearchOptions from '$lib/components/SearchOptions.svelte';
	import axios from 'axios';

	// $: search(favorite, saved);

	let calls: _Call[] = [];
	let open = false;
	let current: _Call;
	let leave_trigger: boolean;

	let saved = false;
	let favorite = false;

	let searchOptionsOpen = false;

	const search = async () => {
		console.log('sa');
		await axios
			.post('/embedding', JSON.stringify({ tags: $searchTags }))
			.then(async ({ data: vector }) => {
				await axios
					.post('/pinecone', {
						act: 'query',
						arg: { queryRequest: { topK: 3, vector, includeValues: true, namespace: 'call' } }
					})
					.then(({ data }) => {
						calls = data.matches.map((match) => {
							return {
								id: match.id,
								name: match.metadata.name,
								tags: match.metadata.tags,
								ids: match.metadata.ids,
							};
						})
					});
			});
		console.log('sa');
	};
</script>

<SearchOptions bind:open={searchOptionsOpen} on:change={search} />

<New bind:open on:add={({ detail }) => (current = detail)} />
<Call bind:leave_trigger bind:call={current} />

<Row>
	<Column>
		{#if current}
			<p>current call: {current.id}</p>
		{/if}
		<ButtonSet stacked>
			<Button size="small" on:click={() => (searchOptionsOpen = true)}>open search options</Button>
			<Button size="small" on:click={() => (open = true)}>new</Button>
		</ButtonSet>
	</Column>
</Row>

<Row>
	<Column>
		<ButtonSet stacked>
			{#each calls as call}
				<CallEntry
					on:click={() => {
						if (current) leave_trigger = !leave_trigger;
						current = call;
					}}
					bind:call
				/>
			{/each}
		</ButtonSet>
	</Column>
</Row>
