<script lang="ts">
	import { req } from '$lib/util/req';
	import { Row, Column, Link, Button } from 'carbon-components-svelte';
	import New from '$lib/components/New.svelte';
	import { Tags } from '$lib/components/Tag';
	import type { _Tag } from '$lib/components/Tag';
	import type { Call } from '$lib/types';

	let tags: _Tag[] = [];
	let calls: Call[] = [];
	let open = false;

	const search = async() => {
		calls = await req({ Call: { Search: { options: { tags: tags.map((t) => t.value) } } } });
	};
</script>

<Tags bind:tags />
<New bind:open />

<Row>
	<Column>
		<Button size="small" on:click={() => (open = true)}>New</Button>
		{#each calls as call}
			<Link href="/call/{call.id}">{call.name}</Link>
		{/each}
	</Column>
</Row>
