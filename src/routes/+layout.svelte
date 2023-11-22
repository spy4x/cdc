<script lang="ts">
  import '../app.postcss';
  import { auth } from '@stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { Footer, Header } from '@components';

  onMount(() => {
    return auth.onAuthStateChange(user => {
      if (!user) {
        goto('/auth');
      }
    });
  });
</script>

<!--<MobileMenu />-->

<Header />

<div class="container mx-auto h-full p-4 lg:p-8">
  <slot />
</div>

<Footer />
