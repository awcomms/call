<script lang="ts">
    export let autovalidate = true
    export let ref = null
    export let value = ''
    export let invalid = false

    import Invalid from './Invalid.svelte'
    import Valid from './Valid.svelte'

    let current = Valid

    $: if (autovalidate) {
        autovalid(value)
    }

    $: if (invalid) {
        current = Invalid
    } else {
        current = Valid
    }

    const autovalid = () => {
        invalid = false
    }
</script>

<svelte:component 
    bind:ref
    on:input
    on:keydown
    this={current}
    {...$$restProps}
    bind:value 
/>
