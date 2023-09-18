<script lang="ts">
	import { PUBLIC_OPENAI_EMBEDDING_MAX_INPUT_TOKENS } from '$env/static/public';
	export let value: string, disabled: boolean, labelText: string;
	import { TextArea } from 'carbon-components-svelte';
	import { encode } from 'gpt-tokenizer';

	let invalid: boolean,
		invalidText: string;

	$: token_count = encode(value).length;

	$: if (token_count > Number(PUBLIC_OPENAI_EMBEDDING_MAX_INPUT_TOKENS)) {
		invalidText = 'Maximum tokens exceeded';
		invalid = true;
	}
</script>

<TextArea
	{invalid}
	{invalidText}
	{disabled}
	rows={7}
	bind:value
	{labelText}
/>
