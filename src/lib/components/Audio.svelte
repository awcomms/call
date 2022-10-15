<script lang='ts'>
    import type {Peer } from "$lib/types"
    export let r: Peer

    $: r.ref.srcObject = r.stream
</script>

<audio class="audio" autoplay={true} bind:this={r.ref} />

<style lang="sass">
    .audio
        display: none
</style>