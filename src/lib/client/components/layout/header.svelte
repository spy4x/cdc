<script lang="ts">
  import { auth, AuthOperation } from '@stores';
  import { AsyncOperationStatus } from '@shared';
  import { IconBurger, IconUser, Loading } from '@components';

  function openMobileMenu(): void {
    // drawerStore.open({ id: MOBILE_MENU_DRAWER_ID, position: 'left' });
  }
</script>

<button
  on:click={() => {
    openMobileMenu();
  }}
  type="button"
  class="p-4 lg:hidden"
>
  <IconBurger />
</button>

<a href="/" class="items-center gap-4 hidden lg:flex">
  <img src="/img/logo-black.webp" class="w-28" alt="Roley. Let's make a movie!" />
</a>

<div class="flex justify-center items-center">
  <a href="/" class="inline-flex lg:hidden">
    <img src="/img/logo-black.webp" class="w-28" alt="Roley. Let's make a movie!" />
  </a>
</div>

<div class="flex items-center gap-4 lg:gap-8">
  {#if $auth.user}
    <a href="/profile" class="btn-icon border-2 border-roley-purple h-9 w-9 mr-4 lg:mr-0">
      {#if $auth.status === AsyncOperationStatus.IN_PROGRESS && ($auth.operation === AuthOperation.SIGN_OUT || $auth.operation === AuthOperation.FETCH_ME)}
        <Loading isIcon={true} />
      {:else if $auth.user.photoUrl}
        <img src={$auth.user.photoUrl} class="w-6 h-6 rounded-full" alt="avatar" />
      {:else}
        <IconUser />
      {/if}
    </a>
  {:else}
    <div class="relative z-0">
      <a class="btn px-2 lg:px-4 mr-2 lg:mr-0" href="/auth">
        <span class="lg:hidden">
          <IconUser />
        </span>
        <span class="hidden lg:inline">Sign in / up </span>
      </a>
    </div>
  {/if}
</div>
