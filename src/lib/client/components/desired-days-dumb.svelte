<script lang="ts">
  import type { DesiredDay } from '@shared';
  import { createEventDispatcher, onMount } from 'svelte';
  import Loading from './loading.svelte';

  export let days: DesiredDay[] = [];
  export let saveInProgress = false;
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  let vm: DayVM[] = [];
  const dispatch = createEventDispatcher();

  function isDayActive(index: number): boolean {
    return days.find(d => d.dayOfWeek === index);
  }

  interface DayVM {
    dayOfWeek: number;
    isActive: boolean;
    startAtHour: number;
    startAtMinute: number;
    endAtHour: number;
    endAtMinute: number;
  }

  onMount(() => {
    daysOfWeek.forEach((_, index) => {
      const day = days.find(d => d.dayOfWeek === index);
      const isActive = isDayActive(index);
      vm.push({
        dayOfWeek: index,
        isActive,
        startAtHour: day?.startAtHour ?? 10,
        startAtMinute: day?.startAtMinute ?? 0,
        endAtHour: day?.endAtHour ?? 20,
        endAtMinute: day?.endAtMinute ?? 0,
      });
    });
    vm = vm;
  });

  function displayTime(hourOrMinute: number): string {
    return hourOrMinute < 10 ? `0${hourOrMinute}` : `${hourOrMinute}`;
  }

  function save() {
    const desiredDays: DesiredDay[] = [];
    vm.forEach(day => {
      if (day.isActive) {
        desiredDays.push({
          dayOfWeek: day.dayOfWeek,
          startAtHour: day.startAtHour,
          startAtMinute: day.startAtMinute,
          endAtHour: day.endAtHour,
          endAtMinute: day.endAtMinute,
        });
      }
    });
    dispatch('save', desiredDays);
  }
</script>

<div class="space-y-2">
  {#each vm as day}
    <label class="flex items-center gap-x-2 cursor-pointer {!day.isActive && 'text-gray-400'}">
      <input type="checkbox" bind:checked={day.isActive} />
      <span class="w-28 text-left">{daysOfWeek[day.dayOfWeek]}</span>
      <span class="w-36 text-left">
        {displayTime(day.startAtHour)}:{displayTime(day.startAtMinute)} - {displayTime(day.endAtHour)}:{displayTime(
          day.endAtMinute,
        )}
      </span>
    </label>
  {/each}
</div>

<button on:click={save} disabled={saveInProgress} class="btn variant-filled-primary mt-3">
  {#if saveInProgress}
    <Loading />
    Saving...
  {:else}
    Save
  {/if}
</button>
