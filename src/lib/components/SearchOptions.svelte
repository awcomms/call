<script lang="ts">
	export let open = false;
	// export let saved = false;
	// export let favorite = false;

	import { Checkbox, Modal } from 'carbon-components-svelte';
	import { Tags } from '$lib/components/Tag';
	import { searchTags } from '$lib/stores';
</script>

<Modal modalHeading="search options" passiveModal hasForm bind:open>
	<Tags on:change={() => console.log('s')} on:change bind:tags={$searchTags} />
	<!-- {#if $user}
		<Checkbox bind:checked={saved} labelText="include saved calls" />
		<Checkbox bind:checked={favorite} labelText="include favorite calls" />
	{/if} -->
</Modal>
