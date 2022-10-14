<script lang='ts'>
  import { page } from "$app/stores";

  export let href: string | null | undefined = ''
  export let text = ''
  export let menuItem = false
  export let isSelected = $page.url.pathname === href

  import { isSideNavOpen } from "$lib/store";
  import { SideNavLink, SideNavMenuItem } from "carbon-components-svelte";

  let component = menuItem ? SideNavMenuItem : SideNavLink

  let _href = href === null ? undefined : `/${text.toLowerCase().replace(" ", "-")}`;

  const click = () => {
    $isSideNavOpen = false;
  };
</script>

<svelte:component
  this={component}
  {isSelected}
  {...$$restProps}
  on:click
  on:click={click}
  href={_href}
  bind:text
/>
