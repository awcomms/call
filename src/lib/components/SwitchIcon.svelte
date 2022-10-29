<script lang="ts">
	export let loading = false, on = false,
		kind:
			| 'ghost'
			| 'primary'
			| 'secondary'
			| 'tertiary'
			| 'danger'
			| 'danger-tertiary'
			| 'danger-ghost'
			| undefined = 'ghost',
		size: 'small' | 'default' | 'field' | 'lg' | 'xl' | undefined = 'small',
		on_icon,
		off_icon,
		on_label = '',
		off_label = '';

	import { InlineLoading, Button } from 'carbon-components-svelte';
</script>

{#if loading}
	<InlineLoading />
{:else if on}
	<Button icon={on_icon} {kind} {size} iconDescription={on_label} />
{:else}
	<Button icon={off_icon} {kind} {size} iconDescription={off_label} />
{/if}
