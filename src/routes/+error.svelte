<script context="module">
    export const load = async ({ error, status }) => {
    let message;
    try {
      message = JSON.parse(error.message);
    } catch {}
    return {
      props: {
        message,
        error,
        status
      }}
  }
</script>

<script lang="ts">

import { page } from "$app/stores"
  import { Row, Column, Link } from "carbon-components-svelte";
</script>

<Row noGutter>
  <Column lg={16}>
    <h1>HTTP error code: {$page.status}</h1>
    <div>
      <!-- {#if message}
        <p>{message.message}</p>
        {#if message.guide}
          <Link href={message.guide.route}>{message.guide.message}</Link>
        {/if}
      {:else}
        <p>{error.message}</p>
      {/if} -->
      {$page.message}
    </div>
    <!-- {#if error && dev && error.stack}
      <div>
        <pre>{error.stack}</pre>
      </div>
    {/if} -->
  </Column>
</Row>
