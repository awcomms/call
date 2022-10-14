<script>
  import Login from "$lib/components/Login.svelte";
	import SideNavLink from './SideNavLink.svelte';
	// import { page } from "$app/stores";
	// import url8 from "$lib/util/url8";
	import { goto } from '$app/navigation';
	import { navigating, page } from '$app/stores';
	import { isSideNavOpen, loginOpen, token } from '$lib/store';
	import {
		InlineLoading,
		SkipToContent,
		SideNavMenu,
		SideNavItems,
		SideNav,
		Header
	} from 'carbon-components-svelte';

	let show;
	let installPrompt;

	const installed = () => {
		show = false;
	};

	$: console.log($loginOpen);

	const before = (e) => {
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
		$token = ""
		goto('/');
	};
</script>

<svelte:window on:appinstalled={installed} on:beforeinstallprompt={before} />

<Login />

<Header
	persistentHamburgerMenu={true}
	company="AngelWings Comprehensive College"
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
		<SideNavLink text="Events" />
		<SideNavLink text="About" />
		<SideNavLink text="Fees" />
		<SideNavLink text="Newsletter" />
		<SideNavLink text="Contact" />
		<SideNavMenu text="Extracurricular">
			<SideNavMenu text="Clubs">
				<SideNavLink menuItem text="JET" href="/extracurricular/clubs/jet" />
			</SideNavMenu>
			<SideNavLink menuItem text="Chess" href="/extracurricular/chess" />
			<SideNavLink menuItem text="Sports" href="/extracurricular/sports" />
		</SideNavMenu>
		{#if show}
			<SideNavLink on:click={install} href={null} text="Add To Homescreen" />
		{/if}
		{#if $token}
			<SideNavLink text="Current result" href="result" />
			<!-- {#if $user.role === 'admin'}
				<SideNavLink text="Results" />
				<SideNavLink text="Add Images" />
			{/if} -->
			<SideNavLink text="Exit" href="" on:click={exit} />
		{/if}

		{#if !$token}
		<SideNavLink href={null} on:click={()=> $loginOpen = true} text="Login" />
		{/if}
		<!-- {#if $token}
      <SideNavLink isSelected={$page.url.pathname === `/u/${$token.username}`} text="Me" href="/u/{$token.username}" />
      <SideNavLink href="/edit" text="Edit Profile" />
      <SideNavLink text="Exit" href={null} on:click={exit} />
    {/if} -->
	</SideNavItems>
</SideNav>
