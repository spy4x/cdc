<script lang="ts">
  import { goto } from '$app/navigation';
  import {
    auth,
    AUTH_REDIRECT_ACTION_NAVIGATE_DEFAULT_PAGE,
    AUTH_REDIRECT_ACTION_NAVIGATE_FOR_NEW_USER,
    AUTH_REDIRECT_ACTION_QUERY_PARAM,
    AuthOperation,
    AuthRedirectAction,
  } from '@stores';
  import { onMount } from 'svelte';
  import type { AuthEmailPasswordSchema, ValidationError } from '@shared';
  import { AsyncOperationStatus } from '@shared';
  import { page } from '$app/stores';
  import { get } from 'svelte/store';
  import { FormError, IconGoogle, Loading } from '@components';

  let redirectAction: null | AuthRedirectAction;
  let email = '';
  let password = '';
  $: validationError = $auth.error?.body as ValidationError<typeof AuthEmailPasswordSchema>;

  function signIn() {
    void auth.signIn(email, password);
  }

  function signUp() {
    void auth.signUp(email, password);
  }

  function forgotPassword() {
    void auth.passwordResetRequest(email);
  }

  async function redirect() {
    // switch (redirectAction) {
    // case AuthRedirectAction.CREATE_MOVIE:
    //   if (redirectActionScriptId) {
    //     const desiredDay = await desiredDays.create(redirectActionScriptId);
    //     if (desiredDay) {
    //       await goto(`/desired-days/${desiredDay.id}`);
    //       localStorage.removeItem(AUTH_REDIRECT_ACTION_QUERY_PARAM);
    //       return;
    //     }
    //   }
    // }
    const { user } = get(auth);
    if (!user) {
      await goto(AUTH_REDIRECT_ACTION_NAVIGATE_DEFAULT_PAGE);
      return;
    }
    // if user was created in last 2 minutes - redirect to / page
    if (user.createdAt) {
      const createdAt = new Date(user.createdAt);
      const now = new Date();
      const diff = now.getTime() - createdAt.getTime();
      if (diff < 2 * 60 * 1000) {
        await goto(AUTH_REDIRECT_ACTION_NAVIGATE_FOR_NEW_USER);
        return;
      }
    }
    await goto(AUTH_REDIRECT_ACTION_NAVIGATE_DEFAULT_PAGE);
  }

  onMount(() => {
    redirectAction =
      ($page.url.searchParams.get(AUTH_REDIRECT_ACTION_QUERY_PARAM) as AuthRedirectAction) ||
      (localStorage.getItem(AUTH_REDIRECT_ACTION_QUERY_PARAM) as AuthRedirectAction);
    if (redirectAction) {
      localStorage.setItem(AUTH_REDIRECT_ACTION_QUERY_PARAM, redirectAction);
    }
    // redirectActionScriptId = parseInt(
    //   $page.url.searchParams.get(AUTH_REDIRECT_ACTION_URL_PARAM_SCRIPT_ID) ||
    //     localStorage.getItem(AUTH_REDIRECT_ACTION_URL_PARAM_SCRIPT_ID) ||
    //     '-1',
    //   10,
    // );
    // if (redirectActionScriptId) {
    //   localStorage.setItem(AUTH_REDIRECT_ACTION_URL_PARAM_SCRIPT_ID, redirectActionScriptId.toString());
    // }

    if ($auth.user) {
      redirect();
    }
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
    class="flex flex-col gap-5 max-w-md mx-auto bg-gray-50 p-6 lg:p-8 card"
    on:submit|preventDefault={signUp}
  >
    <div data-e2e="email-and-password" class="flex flex-col gap-5">
      <label>
        <span>Email</span>
        <!-- add onKeyUp Enter - execute signUp -->
        <input
          on:keyup={e => e.key === 'Enter' && signUp()}
          bind:value={email}
          class="input"
          type="email"
          placeholder="Enter email"
        />
        <FormError error={validationError} field="email" />
      </label>
      <label>
        <span>Password</span>
        <input
          on:keyup={e => e.key === 'Enter' && signUp()}
          bind:value={password}
          class="input"
          type="password"
          placeholder="Enter password"
        />
        <FormError error={validationError} field="password" />
      </label>

      <!-- Grid of two 50% columns -->
      <div class="grid grid-cols-2 gap-3 pt-1 relative z-0">
        <button on:click={signIn} type="button" class="btn variant-filled-primary">
          {#if $auth.status === AsyncOperationStatus.IN_PROGRESS && $auth.operation === AuthOperation.SIGN_IN}
            <Loading />
            <span>Signing in...</span>
          {:else}
            Sign in
          {/if}
        </button>
        <button on:click={signUp} type="button" class="btn variant-filled-tertiary">
          {#if $auth.status === AsyncOperationStatus.IN_PROGRESS && $auth.operation === AuthOperation.SIGN_UP}
            <Loading />
            <span>Signing up...</span>
          {:else}
            Sign up
          {/if}
        </button>
      </div>
      {#if $auth.status === AsyncOperationStatus.ERROR}
        <p class="text-center variant-ghost-error text-orange-600 p-4 rounded-3xl">
          {$auth.error?.body?.message || 'Operation failed'}
        </p>
      {/if}
    </div>

    <p class="text-center">Or continue with</p>

    <div class="grid grid-cols-2 gap-3">
      <a
        on:click={() => auth.oauth(AuthOperation.GOOGLE)}
        href={auth.signInWithGoogleURL}
        class="btn variant-filled-surface"
      >
        {#if $auth.status === AsyncOperationStatus.IN_PROGRESS && $auth.operation === AuthOperation.GOOGLE}
          <Loading />
        {:else}
          <IconGoogle size={6} />
        {/if}
        Google
      </a>
      <a
        on:click={() => auth.oauth(AuthOperation.FACEBOOK)}
        href={auth.signInWithFacebookURL}
        class="btn variant-filled-surface"
      >
        {#if $auth.status === AsyncOperationStatus.IN_PROGRESS && $auth.operation === AuthOperation.FACEBOOK}
          <Loading />
        {:else}
          <img src="/img/facebook.svg" class="w-6 h-6 mr-1" alt="Facebook logo" />
        {/if}
        Facebook
      </a>
    </div>

    <button
      type="button"
      on:click={forgotPassword}
      class="mt-4 underline decoration-dashed underline-offset-4 mx-auto hover:underline-offset-2 transition-all"
    >
      {#if $auth.status === AsyncOperationStatus.IN_PROGRESS && $auth.operation === AuthOperation.PASSWORD_RESET_REQUEST}
        <Loading />
        Sending you an email...
      {:else}
        I forgot my password
      {/if}
    </button>
  </form>
</div>
