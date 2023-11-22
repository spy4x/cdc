<script lang="ts">
  import { desiredDays } from '@stores';
  import List from './desired-days-dumb.svelte';
  import Loading from './loading.svelte';
  import FormError from './formError.svelte';
</script>

{#if !$desiredDays.operations.load[0].result && !$desiredDays.operations.load[0].error}
  <div class="flex justify-center items-center h-full">
    <Loading />
  </div>
{:else if $desiredDays.operations.load[0].error}
  <div class="text-center pt-2 pb-10 sm:px-4">
    <h1 class="h2">Failed to load days settings</h1>
    <p class="text-lg">Please try again later</p>
  </div>
{:else if $desiredDays.operations.load[0].result}
  <div class="flex flex-wrap w-full justify-center items-center">
    <h2 class="h2">Days settings</h2>
  </div>
  <List
    days={$desiredDays.list.data}
    saveInProgress={$desiredDays.operations.save[0].inProgress}
    on:save={e => desiredDays.save(e.detail, $desiredDays.list.data)}
  />

  {#if $desiredDays.operations.save[0].error}
    <FormError message="Save failed" />
  {/if}
{/if}
