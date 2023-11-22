<script lang="ts">
  import { auth } from '@stores';
  import { page } from '$app/stores';
  import { UserPermission } from '@shared';
  import { IconInstagram } from '@components';
</script>

<div class="grid lg:grid-cols-4 text-sm gap-y-4 p-4 bg-black text-white relative mt-10">
  <div>© 2023 Roley Creative LLC</div>
  <ul class="list-none space-y-1.5">
    <li>
      <a
        class="hover:underline underline-offset-2"
        href="/about"
        class:underline={$page.url.pathname.startsWith('/about')}>About</a
      >
    </li>
    <li>
      <a
        class="hover:underline underline-offset-2"
        href="/scripts"
        class:underline={$page.url.pathname.startsWith('/scripts')}>Scripts</a
      >
    </li>
    {#if $auth.user}
      {#if $auth.user.permission === UserPermission.ADMIN}
        <li>
          <a
            class="hover:underline underline-offset-2"
            href="/admin/boxes"
            class:underline={$page.url.pathname.startsWith('/admin/boxes')}>[Admin Boxes]</a
          >
        </li>
        <li>
          <a
            class="hover:underline underline-offset-2"
            href="/admin/scripts"
            class:underline={$page.url.pathname.startsWith('/scenarios')}>[Admin Scripts]</a
          >
        </li>
      {/if}
      <li>
        <a
          class="hover:underline underline-offset-2"
          href="/movies"
          class:underline={$page.url.pathname.startsWith('/movies')}>My movies</a
        >
      </li>
    {/if}
  </ul>
  <ul class="list-none space-y-1.5">
    {#if !$auth.user}
      <li>
        <a
          class="hover:underline underline-offset-2"
          href="/auth"
          class:underline={$page.url.pathname.startsWith('/auth')}>Sign up / Sign in</a
        >
      </li>
    {/if}
    <li>
      <a
        class="hover:underline underline-offset-2"
        href="/terms-of-service"
        class:underline={$page.url.pathname.startsWith('/terms-of-service')}>Terms of Service</a
      >
    </li>
    <li>
      <a
        class="hover:underline underline-offset-2"
        href="/privacy-policy"
        class:underline={$page.url.pathname.startsWith('/privacy-policy')}>Privacy Policy</a
      >
    </li>
  </ul>

  <div class="text-right absolute top-4 right-4 lg:relative lg:top-0 lg:right-0">
    <a href="https://instagram.com/makearoley" target="_blank">
      <IconInstagram />
    </a>
  </div>
</div>
