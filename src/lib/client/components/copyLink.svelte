<!--<script lang="ts">-->
<!--  import { IconShare } from '@components';-->

<!--  export let url: string;-->
<!--  export let background = 'variant-filled-primary';-->
<!--  export let toastBackground = background;-->
<!--  export let text = '';-->
<!--</script>-->

<!--<button-->
<!--  use:clipboard={url}-->
<!--  on:click={() =>-->
<!--    toastStore.trigger({-->
<!--      message: 'Link copied to clipboard',-->
<!--      background: toastBackground,-->
<!--      action: {-->
<!--        label: 'Open in new tab',-->
<!--        response: () => {-->
<!--          window.open(url || 'something went wrong', '_blank');-->
<!--        },-->
<!--      },-->
<!--    })}-->
<!--  type="button"-->
<!--  class="btn {background}"-->
<!--  title="Copy link to clipboard"-->
<!--&gt;-->
<!--  <IconShare class={text ? 'mr-1' : ''} />-->
<!--  {text}-->
<!--</button>-->
