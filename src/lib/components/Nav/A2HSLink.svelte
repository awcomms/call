<script lang="ts">
	import SideNavLink from './SideNavLink.svelte';
	import { showA2HS } from './store';

	let installPrompt: BeforeInstallPromptEvent;

	type UserChoice = Promise<'accepted' | 'dismissed'>;

	interface BeforeInstallPromptEvent extends Event {
		platforms: string[];
		userChoice: UserChoice;
		prompt: () => Promise<{ userChoice: UserChoice; platforms: string[] }>;
	}

	const installed = () => {
		$showA2HS = false;
	};

	const before = (e: BeforeInstallPromptEvent) => {
		$showA2HS = true;
		e.preventDefault();
		installPrompt = e;
	};

	const install = () => {
		installPrompt.prompt();
		installPrompt.userChoice.then((choice) => {
			if (choice === 'accepted') {
				$showA2HS = false;
			}
		});
	};
</script>

<svelte:window on:appinstalled={installed} on:beforeinstallprompt={before} />

{#if $showA2HS}
	<SideNavLink on:click={install} href={null} text="Add To Homescreen" />
{/if}
