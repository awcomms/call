<script lang="ts">
	import { req } from '$lib/req';
	import { Row, Column, ButtonSet, Button } from 'carbon-components-svelte';
	import { New, Call } from '$lib/components';
	import type { _Tag } from '$lib/components/Tag';
	import type { _Call } from '$lib/types';
	import { user, searchTags } from '$lib/store';
	import SearchOptions from '$lib/components/SearchOptions.svelte';

	$: search(favorite, saved)

	let calls: _Call[] = [];
	let open = false;
	let current: _Call;
	let leave_id: string;

	let saved = false;
	let favorite = false;

	let searchOptionsOpen = false;

	const search = async () => {
		let res = await req({ Call: { Search: { options: { tags: $searchTags.map((t) => t.value), favorite, saved } } } });
		if (res.error) {
			console.log('calls search error', res.error)
		} else {
			calls = res
		}
	};
</script>

<SearchOptions bind:saved bind:favorite bind:open={searchOptionsOpen} on:change={search} />

<New bind:open on:add={({ detail }) => (current = detail)} />
<Call bind:leave_id bind:call={current} />

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
				<ButtonSet>
					<Button
						kind="ghost"
						on:click={() => {
							if (current) leave_id = current.id;
							current = call;
						}}>{call.id} {call.name}</Button
					>
					{#if $user}
						<!-- <Button
						kind="ghost"
						on:click={() => {
							if (current) leave_id = current.id;
							current = call;
						}}
						icon={}
					/> -->
					{/if}
				</ButtonSet>
			{/each}
		</ButtonSet>
	</Column>
</Row>
