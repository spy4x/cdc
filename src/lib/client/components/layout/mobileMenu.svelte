<!--<script lang="ts">-->
<!--  import { auth, AuthOperation } from '@stores';-->
<!--  import { navigating, page } from '$app/stores';-->
<!--  import { AsyncOperationStatus, UserPermission } from '@shared';-->
<!--  import { IconCross, Loading } from '@components';-->
<!--  import { onMount } from 'svelte';-->

<!--  async function signOut() {-->
<!--    await auth.signOut();-->
<!--    drawerStore.close();-->
<!--  }-->

<!--  onMount(() => {-->
<!--    // if page changes - close drawer-->
<!--    navigating.subscribe(value => {-->
<!--      value && drawerStore.close();-->
<!--    });-->
<!--  });-->
<!--</script>-->

<!--<div class="relative py-10 px-5">-->
<!--  <nav>-->
<!--    <ul class="mt-4 space-y-4">-->
<!--      <li>-->
<!--        <a class="hover:underline underline-offset-2" href="/" class:underline={$page.url.pathname === '/'}> Home </a>-->
<!--      </li>-->
<!--      <li>-->
<!--        <a class="hover:underline underline-offset-2" href="/demo" class:underline={$page.url.pathname === '/demo'}>-->
<!--          Demo-->
<!--        </a>-->
<!--      </li>-->
<!--      <li>-->
<!--        <a-->
<!--          class="hover:underline underline-offset-2"-->
<!--          href="/about"-->
<!--          class:underline={$page.url.pathname.startsWith('/about')}>About</a-->
<!--        >-->
<!--      </li>-->
<!--      <li>-->
<!--        <a-->
<!--          class="hover:underline underline-offset-2"-->
<!--          href="/scripts"-->
<!--          class:underline={$page.url.pathname.startsWith('/scripts')}>Scripts</a-->
<!--        >-->
<!--      </li>-->
<!--      {#if $auth.user}-->
<!--        {#if $auth.user.permission === UserPermission.ADMIN}-->
<!--          <li>-->
<!--            <a-->
<!--              class="hover:underline underline-offset-2"-->
<!--              class:underline={$page.url.pathname.startsWith('/admin/boxes')}-->
<!--              href="/admin/boxes"-->
<!--            >-->
<!--              [Admin Boxes]-->
<!--            </a>-->
<!--          </li>-->
<!--          <li>-->
<!--            <a-->
<!--              class="hover:underline underline-offset-2"-->
<!--              class:underline={$page.url.pathname.startsWith('/admin/scripts')}-->
<!--              href="/admin/scripts"-->
<!--            >-->
<!--              [Admin Scripts]-->
<!--            </a>-->
<!--          </li>-->
<!--        {/if}-->
<!--        <li>-->
<!--          <a-->
<!--            class="hover:underline underline-offset-2"-->
<!--            class:underline={$page.url.pathname.startsWith('/movies')}-->
<!--            href="/movies"-->
<!--          >-->
<!--            My movies-->
<!--          </a>-->
<!--        </li>-->
<!--        <li>-->
<!--          <a-->
<!--            class="hover:underline underline-offset-2"-->
<!--            href="/profile"-->
<!--            class:underline={$page.url.pathname.startsWith('/profile')}-->
<!--          >-->
<!--            Profile-->
<!--          </a>-->
<!--        </li>-->
<!--        <li>-->
<!--          <button on:click={signOut} type="button" class="hover:underline underline-offset-2">-->
<!--            {#if $auth.status === AsyncOperationStatus.IN_PROGRESS && ($auth.operation === AuthOperation.SIGN_OUT || $auth.operation === AuthOperation.FETCH_ME)}-->
<!--              <Loading /> Processing...-->
<!--            {:else}-->
<!--              Sign out-->
<!--            {/if}-->
<!--          </button>-->
<!--        </li>-->
<!--      {:else}-->
<!--        <li>-->
<!--          <a-->
<!--            class="hover:underline underline-offset-2"-->
<!--            href="/auth"-->
<!--            class:underline={$page.url.pathname.startsWith('/auth')}-->
<!--          >-->
<!--            Sign in / up-->
<!--          </a>-->
<!--        </li>-->
<!--      {/if}-->
<!--    </ul>-->
<!--  </nav>-->

<!--  <button on:click={drawerStore.close} class="p-4 absolute left-0 top-0">-->
<!--    <IconCross />-->
<!--  </button>-->
<!--</div>-->
