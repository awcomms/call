<script lang="ts">
	import type { _Call } from '$lib/types';
	import { SwitchIcon } from '$lib/components';
	import { ButtonSet, Button } from 'carbon-components-svelte';
	import Save from 'carbon-icons-svelte/lib/Save.svelte';
	import Unsaved from 'carbon-icons-svelte/lib/Unsaved.svelte';
	import Favorite from 'carbon-icons-svelte/lib/Favorite.svelte';
	import FavoriteFilled from 'carbon-icons-svelte/lib/FavoriteFilled.svelte';
	export let call: _Call;

	let save_loading;
	let favorite_loading;
</script>

<ButtonSet>
	<Button kind="ghost" on:click>{call.id} {call.name}</Button>
	<SwitchIcon
		on_icon={Unsaved}
		off_icon={Save}
		on_label="unsave"
		off_label="save"
		loading={call.save_loading}
		on={call.saved}
	/>
	<SwitchIcon
		on_icon={FavoriteFilled}
		off_icon={Favorite}
		on_label="remove from favorites"
		off_label="add to favorites"
		loading={call.favorite_loading}
		on={call.favorite}
	/>
</ButtonSet>
