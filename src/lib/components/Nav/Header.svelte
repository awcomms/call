<script lang="ts">
	import Login from '$lib/components/Login.svelte';
	import SideNavLink from './SideNavLink.svelte';
	// import { page } from "$app/stores";
	// import url8 from "$lib/util/url8";
	import { goto } from '$app/navigation';
	import { navigating, page } from '$app/stores';
	import { isSideNavOpen, loginOpen, token, user } from '$lib/store';
	import {
		InlineLoading,
		SkipToContent,
		SideNavMenu,
		SideNavItems,
		SideNav,
		Header
	} from 'carbon-components-svelte';

	let show: boolean;
	let installPrompt: Event;

	const installed = () => {
		show = false;
	};

	$: console.log($loginOpen);

	const before = (e: Event) => {
		show = true;
		e.preventDefault();
		installPrompt = e;
	};

	const install = () => {
		installPrompt.prompt();
		installPrompt.userChoice.then((choice) => {
			if (choice.outcome === 'accepted') {
				show = false;
			}
		});
	};

	/*
  const getSub = () => {
    navigator.serviceWorker.ready
      .then((registration) => {
        return registration.pushManager.getSubscription().then(async (sub) => {
          if (sub) {
            return sub;
          }

          const response = await fetch(`get`);
          const vapidKey = await response.text();
          let int8VapidKey = url8(vapidKey);
          const options = {
            userVisibleOnly: true,
            applicationServerKey: int8VapidKey,
          };
          return registration.pushManager.subscribe(options);
        });
      })
      .then((sub) => {
        api.post("subs", { id: $token.id, sub: sub });
      });
  };

  if (typeof window != "undefined") {
    if (navigator && navigator.serviceWorker && $token) {
      getSub();
    }
  }
  */

	const exit = () => {
		$token = '';
		goto('/');
	};
</script>

<svelte:window on:appinstalled={installed} on:beforeinstallprompt={before} />

<Login />

<Header
	persistentHamburgerMenu={true}
	company=""
	bind:isSideNavOpen={$isSideNavOpen}
	href="/"
>
	{#if $navigating}
		<InlineLoading />
	{/if}
	<div slot="skip-to-content">
		<SkipToContent />
	</div>
</Header>

<SideNav bind:isOpen={$isSideNavOpen}>
	<SideNavItems>
		{#if show}
			<SideNavLink on:click={install} href={null} text="Add Webapp To Homescreen" />
		{/if}
		{#if $user}
			<SideNavLink text="Logout" href={null} on:click={exit} />
		{:else}
			<SideNavLink href={null} on:click={() => ($loginOpen = true)} text="Login" />
		{/if}
	</SideNavItems>
</SideNav>
