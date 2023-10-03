<script lang="ts">
	import type { Message } from './types';

	export let message: Message;
</script>

<p class="r">{message.s}</p>
<p class="t">{message.t}</p>

<style lang="sass">
    @use '@carbon/type'
    .r
        @include type.type-style('label-01')
    .t
        @include type.type-style('body-compact-01')

</style>
