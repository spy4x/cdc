<script lang="ts">
  import { auth, AuthOperation } from '@stores';
  import { goto } from '$app/navigation';
  import { Debug } from '@components';
  import { toastStore } from '@stores/helpers';

  async function askForDeleteAccountConfirmation() {
    if (confirm('Are you sure? All your data will be lost permanently.')) {
      await deleteAccount();
    }
  }

  async function deleteAccount() {
    const isSuccess = await auth.delete();
    if (isSuccess) {
      toastStore.trigger({
        message: 'Account deleted',
        background: 'bg-roley-green',
        timeout: 10000,
      });
      await goto('/auth');
    } else {
      toastStore.trigger({
        message: 'Error deleting account',
        background: 'bg-roley-orange',
      });
    }
  }
</script>

{#if $auth.user}
  <header class="flex justify-center items-center h-20 lg:h-24 mb-4 lg:mb-8">
    <h1 class="h1">PROFILE</h1>
  </header>
  <div class="flex flex-col gap-6 max-w-sm mx-auto">
    <!--    <Avatar-->
    <!--      class="mx-auto"-->
    <!--      width="w-32"-->
    <!--      initials={$auth.user.firstName || $auth.user.email || '&#45;&#45;'}-->
    <!--      src={$auth.user.photoUrl ?? undefined}-->
    <!--      alt="User avatar"-->
    <!--    />-->

    <h1 class="h3 text-center">
      {$auth.user.firstName || ''}
      {$auth.user.lastName || ''}
      {#if $auth.user.email}
        <p class="h3">{$auth.user.email}</p>
      {/if}
    </h1>

    <div class="relative z-0">
      <button on:click={askForDeleteAccountConfirmation} type="button" class="btn w-full variant-filled-error">
        Delete account
      </button>
    </div>

    <div class="relative z-0">
      <button on:click={auth.signOut} type="button" class="btn w-full variant-filled-tertiary"> Sign out </button>
    </div>

    {#if $auth.operation === AuthOperation.DELETE && $auth.error}
      <p class="variant-ghost-error p-4">
        {#if $auth.error.body.message}
          {$auth.error.body.message}
        {:else}
          <Debug data={$auth.error} />
        {/if}
      </p>
    {/if}
  </div>
{/if}
