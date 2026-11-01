import { defineStore } from 'pinia';
import type { components } from '~/types/api';
import { shiftMonth } from '~/utils/format';

type Schedules = components['schemas']['SchedulesDto'];

export const useScheduleStore = defineStore('schedule', () => {
  const api = useNuxtApp().$api;
  const year = ref<number | null>(null);
  const month = ref<number | null>(null);
  const data = ref<Schedules | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  let latest = 0;

  async function show(nextYear: number, nextMonth: number) {
    const id = ++latest;
    year.value = nextYear;
    month.value = nextMonth;
    loading.value = true;
    error.value = null;
    try {
      const result = await api<Schedules>('/schedules', {
        query: { year: String(nextYear), month: String(nextMonth).padStart(2, '0') },
      });
      if (id === latest) data.value = result;
    } catch {
      if (id === latest) {
        data.value = null;
        error.value = 'Could not load the schedule.';
      }
    } finally {
      if (id === latest) loading.value = false;
    }
  }

  function shift(delta: number) {
    if (year.value === null || month.value === null) return Promise.resolve();
    const next = shiftMonth(year.value, month.value, delta);
    return show(next.year, next.month);
  }

  return { year, month, data, loading, error, show, shift };
});
