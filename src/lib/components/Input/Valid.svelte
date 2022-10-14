<script lang="ts">
    export let ref = null
    export let value = ''
    export let password = ''

    import {
        PasswordInput,
        TextInput
    } from 'carbon-components-svelte'
</script>

{#if password}
    <PasswordInput
        on:input
        on:keydown
        bind:ref
        bind:value
        {...$$restProps}
    />
{:else}
    <TextInput
        on:input
        on:keydown
        bind:ref
        bind:value
        {...$$restProps} 
    />
{/if}