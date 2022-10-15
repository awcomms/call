<script lang="ts">
	import { req } from '$lib/req';
	import { Row, Column, ButtonSet, Button } from 'carbon-components-svelte';
	import { New, Call } from '$lib/components';
	import { Tags } from '$lib/components/Tag';
	import type { _Tag } from '$lib/components/Tag';
	import type { _Call } from '$lib/types';

	let tags: _Tag[] = [];
	let calls: _Call[] = [];
	let open = false;
	let current: _Call;
	let leave_id: string;

	const search = async () => {
		calls = await req({ Call: { Search: { options: { tags: tags.map((t) => t.value) } } } });
	};
</script>

<Tags on:change={search} bind:tags />
<New bind:open on:add={({ detail }) => (current = detail)} />
<Call bind:leave_id bind:call={current} />

<Row>
	<Column>
		{#if current}
			<p>current call: {current.id}</p>
		{/if}
		<Button size="small" on:click={() => (open = true)}>New</Button>
	</Column>
</Row>

<Row>
	<Column>
		<ButtonSet stacked>
			{#each calls as call}
				<Button
					kind="ghost"
					on:click={() => {
						if (current) leave_id = current.id;
						current = call;
					}}>{call.id}</Button
				>
			{/each}
		</ButtonSet>
	</Column>
</Row>
