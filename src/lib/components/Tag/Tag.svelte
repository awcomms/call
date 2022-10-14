<script lang="ts">
  let input;

  export let inputEventDelay = 0;
  export let warning = false;
  export let filter;
  // export let label = ""
  export let value = "";
  export let type = "cool-gray";
  export let editable = false;
  // export {labelInput as labelRef}
  export { input as valueRef };
  // export let o
  export let ref;

  import { Tag } from "carbon-components-svelte";
  import WarningAlt from "carbon-icons-svelte/lib/WarningAlt.svelte";
  // import TrashCan from "carbon-icons-svelte/lib/TrashCan.svelte";

  import { onMount, createEventDispatcher } from "svelte";

  // $: shI(input)

  // const shI = () => input ? input.size = input.value.length || 1 : {}

  $: if (warning && input) {
    input.focus();
  }

  onMount(() => {
    input ? input.focus() : {};
  });

  let s;

  const dispatch = createEventDispatcher();

  let delayId;

  const keydownEvent = (e) => {
    if (e.key === "Enter") dispatch("enter");
  };

  const inputEvent = ({ target }) => {
    if (s) {
      s.innerText = target.value;
      // let { width } = s.getBoundingClientRect();
      let { width } = window.getComputedStyle(s);
      target.style.width = `${parseFloat(width.split("px")[0]) + 10}px`;
    }

    typeof delayId === "number" ? clearTimeout(delayId) : {};
    delayId = setTimeout(() => {
      dispatch("input");
    }, inputEventDelay);
  };
</script>

<div class="s" bind:this={s}>{value}</div>

<Tag bind:ref {type} {filter} on:close on:click>
  {#if editable}
    <!-- <input
      on:input={inputEvent}
      on:keydown={()=>dispatch('keydown')}
      on:blur={() => dispatch("blur")}
      bind:this={labelInput}
      bind:value={label}
    /> -->
    <input
      spellcheck="false"
      on:input={inputEvent}
      on:keydown={keydownEvent}
      on:blur={() => dispatch("blur")}
      bind:this={input}
      bind:value
    />
    <!-- {#if editing}
      <input class="bx--tag__label" bind:this={input} value={text} />
      <slot />
      <Button
        hasIconOnly
        icon={Checkmark}
        size="small"
        kind="ghost"
        on:click={() => {
          dispatch("accept", input.value);
          // toggleEditing();
        }}
      />
    {:else}
      {text}
      <slot />
      <Button
        hasIconOnly
        icon={Edit}
        size="small"
        kind="ghost"
        on:click={() => {
        //   input.focus();
          dispatch("edit");
          // toggleEditing();
        }}
      />
    {/if} -->
    {#if warning}
      <WarningAlt />
    {/if}
  {:else}
    {value}
    <slot />
  {/if}
</Tag>

<style lang="sass">
  @use '@carbon/type'

  .s
    @include type.type-style('label-01')
    // box-sizing: border-box
    visibility: hidden
    height: 0
    // display: none
    width: fit-content

  input
    @include type.type-style('label-01')
    margin: 0 0
    outline: none
    appearance: none
    border: none
    background-color: rgba(0, 0, 0, 0)

  input:focus
    outline: none
    // appearance: none
    border: none
</style>
