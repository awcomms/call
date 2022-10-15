<script lang="ts">
  export let prefix = '';
  export let hide = false;
  export let text = "";
  export let editable = true;
  export let showHiddenCount = false;
  export let showUseOptions = false;
  export let useOptions = false;
  export let hidable = false;
  export let open = false;
  export let tags:_Tag[] = [];

  import type { _Tag } from "$lib/components/Tag"
  import Tag from "$lib/components/Tag/Tag.svelte";
  import Add from "carbon-icons-svelte/lib/Add.svelte";
  import CaretDown from "carbon-icons-svelte/lib/CaretDown.svelte";
  import CaretUp from "carbon-icons-svelte/lib/CaretUp.svelte";
  import { onMount, createEventDispatcher } from "svelte";
  import {
    Button,
    Checkbox,
    ContextMenu,
    ContextMenuOption,
  } from "carbon-components-svelte";

  $: if (ref && is_focused) ref.focus();
  $: hiddenTags = tags.filter(t => t.hide)

  const dispatch = createEventDispatcher();

  onMount(() => {
    let lastTagRef = tags[tags.length - 1]?.ref;
    if (lastTagRef) lastTagRef.focus()
  });

  let focused;
  let ref;

  const keydown = (e) => {
    switch (e.keyCode) {
      case 13:
        if (focused) {
          add();
        }
    }
  };

  const toggleOpen = () => {
    open = !open;
  };

  const add = () => {
    if (tags.find((t) => t.value === "")) {
      let timeout = 2000;
      // $notify = {
      //   kind: "warning",
      //   timeout,
      //   title: "Tag not added because of presence of empty tag in tags",
      //   subtitle: "Remove or edit the empty tag before trying adding a new one",
      // };
    }
    tags = [
      ...tags,
      { label: "", value: "", inputRef: null, ref: null, exact: false },
    ];
    // }
  };

  const del = (tag) => {
    tags = tags.filter((t) => t != tag);
    dispatch("change");
  };

  const clear = () => {
    tags = [];
    open = false;
  };
</script>

<svelte:window on:keydown={keydown} />

{#if text}<p>{text}</p>{/if}

<div class="head">
  <p class="title" on:click={toggleOpen}>
    {#if open}
      <CaretUp />
    {:else}
      <CaretDown />
    {/if}
    {tags.length}
    {`${tags.length === 1 ? `${prefix}tag` : `${prefix}tags`}`}
  </p>
  {#if showHiddenCount && hiddenTags.length > 0}
     <pre>{tags.length} hidden</pre>
  {/if}
  {#if editable}
  <Button
    kind="ghost"
    size="small"
    hasIconOnly
    icon={Add}
    on:click={() => {
      add();
      if (!open) toggleOpen();
    }}
    iconDescription="Add a tag"
  />
  {/if}
</div>
<slot />

{#if showUseOptions}
  <Checkbox bind:checked={useOptions} labelText="Use options" />
{/if}

{#if open}
  {#if editable && tags.length > 0}
    <Tag on:click on:click={clear} type="magenta">Clear</Tag>
  {/if}
  {#each tags as tag}
    {#if (hide && !tag.hide) || !hide}
      {#if editable && hidable}
        <ContextMenu target={tag.ref}>
          <ContextMenuOption selectable labelText="Hide" bind:selected={tag.hide} />
        </ContextMenu>
      {/if}
      <Tag
        inputEventDelay={2100}
        on:input={() => dispatch("change")}
        on:enter={add}
        bind:label={tag.label}
        bind:value={tag.value}
        bind:inputRef={tag.inputRef}
        bind:ref={tag.ref}
        bind:filter={editable}
        focusOnMount
        bind:editable
        bind:focused
        on:close={del(tag)}
      />
    {/if}
  {/each}
{/if}

<style>
  /* p {
    font-size: 1rem;
  } */
  .head {
    display: grid;
    grid-template-columns: repeat(2, min-content);
  }

  .title {
    width: max-content;
    display: flex;
    align-items: center;
  }
</style>
