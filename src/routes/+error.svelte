<script lang="ts">
	import { page } from '$app/stores';
	import { Row, Column } from 'carbon-components-svelte';
</script>

<Row noGutter>
	<Column lg={16}>
		<h1>{$page.status}: {$page.error?.message}</h1>
	</Column>
</Row>