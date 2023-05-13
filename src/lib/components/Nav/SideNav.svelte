<script>
	import { SideNav, SideNavItems, SideNavMenu } from 'carbon-components-svelte';
	import SideNavLink from './SideNavLink.svelte';

	import { isSideNavOpen } from './store';

	import A2HsLink from './A2HSLink.svelte';
</script>

<SideNav bind:isOpen={$isSideNavOpen}>
	<SideNavItems>
		<A2HsLink />
		<!-- <SideNavMenu text="Quiz"> -->
			<SideNavLink text="Attempt" />
			<SideNavLink text="Create and Edit" href="/edit" />
		<!-- </SideNavMenu> -->
	</SideNavItems>
</SideNav>
