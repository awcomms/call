<script lang="ts">
	import VolumeMute from 'carbon-icons-svelte/lib/VolumeMute.svelte';
	import VolumeUp from 'carbon-icons-svelte/lib/VolumeUp.svelte';
	import Video from 'carbon-icons-svelte/lib/Video.svelte';
	import Chat from 'carbon-icons-svelte/lib/Chat.svelte';
	import VideoOff from 'carbon-icons-svelte/lib/VideoOff.svelte';

	import { Button, ButtonSet } from 'carbon-components-svelte';
	import { chat_open } from './stores';

	export let audio: MediaStreamTrack, video: MediaStreamTrack, remote: boolean;

	const mute = () => {
		if (!audio) return;
		audio.enabled = false;
	};

	const unmute = () => {
		if (!audio) return;
		audio.enabled = true;
	};

	const hide = () => {
		if (!video) return;
		video.enabled = false;
	};

	const show = () => {
		if (!video) return;
		video.enabled = true;
	};

	const toggle_video = () => {
		console.debug('tv', video?.enabled)
		video?.enabled ? hide() : show()
	}
</script>

<ButtonSet>
	<Button
		iconDescription={`Your video is ${video?.enabled ? 'on' : 'off'}`}
		size="small"
		on:click={toggle_video}
		icon={video?.enabled ? Video : VideoOff}
	/>
	<Button
		iconDescription={`Your audio is ${audio?.enabled ? 'on' : 'off'}`}
		size="small"
		on:click={() => (audio?.enabled ? mute() : unmute())}
		icon={audio?.enabled ? VolumeUp : VolumeMute}
	/>
	{#if !remote}
		<Button
			size="small"
			on:click={() => ($chat_open = !$chat_open)}
			icon={Chat}
			iconDescription="Open chat"
		/>
	{/if}
</ButtonSet>
