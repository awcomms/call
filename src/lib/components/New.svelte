<script lang="ts">
    export let open = false

    import type { _Tag } from "$lib/components/Tag"
    import { Button, Modal, TextInput } from 'carbon-components-svelte'
    import { Tags } from "$lib/components/Tag"
	import { req } from '$lib/util/req';
	import { goto } from '$app/navigation';

    let tags: _Tag[] = []
    let name = ""

    const send = async() => {
        let res = await req({Call: {New: {options :{name, tags: tags.map(t => t.value)}}}})
        if (res.error) {
            console.log("send error", res.error)
        }
        goto(`/call/${res.id}`);
    }
</script>

<Modal bind:open passiveModal modalHeading="New">
    <TextInput labelText="name" bind:value={name} />
    <Tags bind:tags />
    <Button on:click={send}>Create</Button>
</Modal>