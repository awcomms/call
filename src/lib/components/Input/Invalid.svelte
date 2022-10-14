<script lang="ts">
    export let autoFocusInvalid = true
    export let ref = null
    export let value = ''
    export let password = ''
    import {
        onMount
    } from 'svelte'

    onMount(() => {
        if (autoFocusInvalid) ref.focus()
    })

    import {
        PasswordInput,
        TextInput
    } from 'carbon-components-svelte'
</script>

{#if password}
    <PasswordInput
        on:input
        on:keydown
        invalid
        bind:ref
        bind:value
        {...$$restProps}
    />
{:else}
    <TextInput
        on:input
        on:keydown
        invalid
        bind:ref
        bind:value
        {...$$restProps}
    />
{/if}