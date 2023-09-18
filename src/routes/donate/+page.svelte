<script lang="ts">
	import { Paystack, notify } from 'sveltekit-carbon-utils';
	import { Button, NumberInput, Select, SelectItem, TextInput } from 'carbon-components-svelte';
	import { pay_email } from '$lib/stores';
	import type { Currency } from '@edge37/paystack-utils/dist/currencies';
	import { currencies } from '@edge37/paystack-utils';

	let paystack: Paystack,
		currency: Currency = 'USD',
		amount: number = 0;
</script>

<Paystack on:pay={() => notify('Thanks')} bind:this={paystack} />

<NumberInput label="Donation amount" bind:value={amount} />
<Select bind:selected={currency}>
	{#each currencies as { name, value }}
		<SelectItem {value} text={name} />
	{/each}
</Select>
<TextInput labelText="email" bind:value={$pay_email}></TextInput>
<Button on:click={() => paystack.request_payment({ email: $pay_email, amount, currency })}
	>Donate</Button
>
