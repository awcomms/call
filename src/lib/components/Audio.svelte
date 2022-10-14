<script lang='ts'>
    import type {Peer} from "$lib/types"
    export let r: Peer

    $: r.ref.srcObject = r.stream
</script>

<audio bind:this={r.ref} />