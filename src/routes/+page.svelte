<script lang="ts">
  import { auth } from '$lib/client/stores';
  import { DesiredDays } from '@components';
</script>

<div class="container mx-auto flex flex-col justify-center items-center">
  <div class="py-4 md:p-8">
    <div class="max-w-3xl mx-auto text-xl flex flex-col items-center text-center space-y-6 lg:space-y-10 text-balance">
      {#if $auth.user}
        <DesiredDays />
        <>
      {:else}
        <h2><a href="/auth" class="underline">Sign in or create account</a></h2>
      {/if}
    </div>
  </div>
</div>
