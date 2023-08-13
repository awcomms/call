<script lang="ts">
	import { Button, ButtonSet } from 'carbon-components-svelte';
	import VolumeMute from 'carbon-icons-svelte/lib/VolumeMute.svelte';
	import VolumeUp from 'carbon-icons-svelte/lib/VolumeUp.svelte';
	import Video from 'carbon-icons-svelte/lib/Video.svelte';
	import VideoOff from 'carbon-icons-svelte/lib/VideoOff.svelte';

	export let ref: HTMLVideoElement | undefined = undefined,
		remote = false,
		stream: MediaStream;
	let audio: MediaStreamTrack,
		video: MediaStreamTrack;

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

	const stream_update = (stream: MediaStream) => {
		if (!stream) return;
		if (ref) ref.srcObject = stream;
		audio = stream.getAudioTracks()[0];
		video = stream.getVideoTracks()[0];
	};

	$: stream_update(stream);
</script>

<div class="all" class:remote class:local={!remote}>
	<video muted={!remote} autoplay={true} bind:this={ref} />
	{#if stream}
		{#if !remote}
			<!-- <div class="icons">
				<div class="indicator">
					{#if video?.enabled}
						<VideoOff />
					{:else}
						<Video />
					{/if}
				</div>
				<div class="indicator">
					{#if audio?.enabled}
						<VolumeMute />
					{:else}
						<VolumeUp />
					{/if}
				</div>
			</div>
		{:else} -->
			<ButtonSet stacked>
				<Button
					iconDescription={`Your video is ${video?.enabled ? 'on' : 'off'}`}
					size="small"
					on:click={() => (video?.enabled ? hide() : show())}
					icon={video?.enabled ? Video : VideoOff}
				/>
				<Button
					iconDescription={`Your audio is ${audio?.enabled ? 'on' : 'off'}`}
					size="small"
					on:click={() => (audio?.enabled ? mute() : unmute())}
					icon={audio?.enabled ? VolumeUp : VolumeMute}
				/>
			</ButtonSet>
		{/if}
	{/if}
</div>

<style lang="scss">
	@use '@carbon/layout';
	.all {
		/* max-height: calc((100vh - 13rem) / 2); */
		grid-row: 2 / 3;
		display: grid;
		grid-template-columns: 1fr auto;
		height: 100%;
		/* max-height: calc((100vh - 13rem) / 2); */
	}

	.remote {
		grid-row: 1 / 2;
	}

	.local {
		grid-row: 2 / 3;
	}

	// .indicator {
	// 	padding: layout.$spacing-03;
	// }
	video {
		/* max-height: calc((100vh - 13rem) / 2); */
		/* max-width: 100vh; */
		max-inline-size: 100%;
		max-block-size: calc((100vh - 10rem) / 2);
	}
</style>
