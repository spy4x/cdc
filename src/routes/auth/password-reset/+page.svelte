<script lang="ts">
  import { goto } from '$app/navigation';
  import { auth, AUTH_REDIRECT_ACTION_NAVIGATE_DEFAULT_PAGE, AuthOperation } from '@stores';
  import { onMount } from 'svelte';
  import { AsyncOperationStatus } from '@shared';
  import { Loading } from '@components';

  let password = '';
  let confirmPassword = '';
  let token = '';

  function passwordReset() {
    void auth.passwordReset(token, password);
  }

  function redirect() {
    goto(AUTH_REDIRECT_ACTION_NAVIGATE_DEFAULT_PAGE);
  }

  onMount(() => {
    if ($auth.user) {
      redirect();
    }
    // get token from URL query
    const urlParams = new URLSearchParams(window.location.search);
    token = urlParams.get('token') || '';
    // subscribe to state and redirect on success as well as remove the subscription
    const unsubscribe = auth.onAuthStateChange(user => {
      if (user) {
        redirect();
        setTimeout(() => unsubscribe());
      }
    });
  });
</script>

<div class="container h-full mx-auto flex justify-center items-center py-4 lg:py-6">
  <form
    data-e2e="sign-in-providers-form"
    class="flex flex-col gap-5 max-w-sm mx-auto bg-gray-50 p-6 lg:p-8 rounded-3xl border-2 border-gray-300"
    on:submit|preventDefault={passwordReset}
  >
    <div data-e2e="email-and-password" class="flex flex-col gap-5">
      <label>
        <span>Password</span>
        <input
          on:keyup={e => e.key === 'Enter' && passwordReset()}
          bind:value={password}
          class="input"
          type="password"
          placeholder="Enter password"
        />
        {#if $auth.error?.body?.errors?.password}
          <div class="text-red-500">{$auth.error?.body?.errors?.password}</div>
        {/if}
      </label>
      <label>
        <span>Confirm password</span>
        <input
          on:keyup={e => e.key === 'Enter' && passwordReset()}
          bind:value={confirmPassword}
          class="input"
          type="password"
          placeholder="Confirm password"
        />

        {#if password !== confirmPassword}
          <div class="text-red-500">Passwords do not match</div>
        {/if}
      </label>

      <div class="relative z-0">
        <button class="btn w-full variant-filled-error">
          {#if $auth.status === AsyncOperationStatus.IN_PROGRESS && $auth.operation === AuthOperation.PASSWORD_RESET}
            <Loading />
            <span>Resetting password...</span>
          {:else}
            Reset password
          {/if}
        </button>
      </div>
      {#if $auth.status === AsyncOperationStatus.ERROR}
        <p class="text-center variant-ghost-error text-orange-600 p-4 rounded-3xl">
          {$auth.error?.body?.message || 'Operation failed'}
        </p>
      {/if}

      {#if $auth.error?.body?.errors?.token}
        <div class="text-red-500">{$auth.error?.body?.errors?.token}</div>
      {/if}
    </div>
  </form>
</div>
