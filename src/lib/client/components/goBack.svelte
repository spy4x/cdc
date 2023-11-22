<script lang="ts">
  import { IconBack } from '@components';

  function goBack() {
    window.history.back();
  }
</script>

<button class="shrink-0" type="button" on:click={goBack}>
  <IconBack />
</button>
