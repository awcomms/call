<script lang="ts">
    export let open = false

    import type { _Tag } from "$lib/components/Tag"
    import { Button, Modal, TextInput } from 'carbon-components-svelte'
    import { Tags } from "$lib/components/Tag"
	import { req } from '$lib/req';
    import { createEventDispatcher } from 'svelte'
	// import { goto } from '$app/navigation';

    const dispatch = createEventDispatcher()

    let tags: _Tag[] = []
    let name = ""

    const send = async() => {
        let res = await req({Call: {New: {options :{name, tags: tags.map(t => t.value)}}}})
        if (res.error) {
            console.log("send error", res.error)
            return
        }
        open = false;
        // goto(`/call/${res.id}`);
        dispatch('add', res);
    }
</script>

<Modal bind:open passiveModal modalHeading="New">
    <TextInput labelText="name" bind:value={name} />
    <Tags bind:tags />
    <br />
    <Button on:click={send}>Create</Button>
</Modal>