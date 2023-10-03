<script lang="ts">
	import type { DataConnection } from 'peerjs';
	import type { Message as _Message } from '$lib/types';
	import Message from './Message.svelte';
	import Send from 'carbon-icons-svelte/lib/Send.svelte';
	import { OnEnter } from '@edge37/svelte-utils';
	import { Button, TextInput } from 'carbon-components-svelte';
	import { chat_open } from './stores';

	export let data_connection: DataConnection,
		messages: _Message[] = [];
	let text_input_ref: HTMLInputElement, chat: HTMLDivElement, value: string;

	const send = () => {
		messages = [
			...messages,
			{
				s: 'You',
				// data_connection.peer,
				t:
					//t as string
					value
			}
		];

		// data_connection.send(value);
	};
</script>

<OnEnter
	on:enter={() => {
		if (document.activeElement === text_input_ref) send();
	}}
/>

<div class:hide={!$chat_open} class="chat">
	<div bind:this={chat} class="messages">
		{#each messages as message}
			<Message {message} />
		{/each}
	</div>

	<div class="input">
		<TextInput bind:ref={text_input_ref} bind:value /><Button
			size="field"
			on:click={send}
			icon={Send}
		/>
	</div>
</div>

<style>
	.chat {
		position: absolute;
		max-height: 100%;
		overflow: scroll;
	}

	.input {
		display: flex;
		flex-direction: row;
	}
</style>
