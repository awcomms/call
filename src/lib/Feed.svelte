<script lang="ts">
	import type { DataConnection } from 'peerjs';
	import Chat from './Chat.svelte';
	import Controls from './Controls.svelte';
	import { chat_open } from './stores';
	import type { Message } from './types';
	export let data_connection: DataConnection;

	export let ref: HTMLVideoElement | undefined = undefined,
		remote: boolean,
		stream: MediaStream;
	let audio: MediaStreamTrack, video: MediaStreamTrack, messages: Message[], chat: HTMLDivElement;

	const stream_update = (stream: MediaStream) => {
		console.log('s');
		if (!stream) return;
		if (ref) ref.srcObject = stream;
		audio = stream.getAudioTracks()[0];
		video = stream.getVideoTracks()[0];
	};

	$: console.log(remote, audio?.enabled, video?.enabled);
	$: stream_update(stream);
</script>

<div class="all" class:remote class:local={!remote}>
	{#if remote}
		<video muted={!remote} autoplay={true} bind:this={ref} />
	{:else}
		<div class="d">
			<Chat bind:messages {data_connection} />
			<video class:hide={$chat_open} class="s" muted={!remote} autoplay={true} bind:this={ref} />
		</div>
		<Controls bind:video bind:audio {remote} />

		<!-- <Video stream={local_stream} /> -->
	{/if}
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
		{/if}
	{/if}
</div>

<style lang="scss">
	@use '@carbon/layout';
	.d {
		position: relative;
	}

	.s {
		position: absolute;
	}

	.all {
		/* max-height: calc((100vh - 13rem) / 2); */
		grid-row: 2 / 3;
		display: grid;
		grid-template-rows: 1fr auto;
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
