<script lang="ts">
	import type { Call } from '$lib/types';

    export let call: Call

    import { onMount } from 'svelte'

    let self = ""
    let peer = new Peer();

    onMount(()=> {
        join(self)
    })

    let getUserMedia = navigator.getUserMedia;

    peer.on('call', (_call) => {
        getUserMedia({audio: true}, (_stream) => {
            _call.answer(stream);
            _call.on('stream', (remoteStream) => {
                
            })
        })
    })

    const join = (id: string) => {
        getUserMedia({audio: true}, () => {
            for (let id of call.ids) {
            let call = peer.call(id, stream);
            call.on('stream', (remoteStream) => {

            })
        }
        })
    }

    for (let id of call.ids) {
        join(id)
    }
</script>