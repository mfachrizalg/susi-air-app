import { defineStore } from 'pinia';
import type { components } from '~/types/api';

export type FlightHoursSummary = components['schemas']['FlightHoursSummaryDto'];
export type Range = FlightHoursSummary['range'];

export const useFlightHoursStore = defineStore('flightHours', () => {
  const api = useNuxtApp().$api;
  const range = ref<Range>('1w');
  const summary = ref<FlightHoursSummary | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  let latest = 0;

  /** Loads one range. Only the newest request writes state, so a fast toggle cannot show stale data. */
  async function load(next: Range = range.value) {
    const id = ++latest;
    range.value = next;
    loading.value = true;
    error.value = null;
    try {
      const data = await api<FlightHoursSummary>('/flight-hours/summary', { query: { range: next } });
      if (id === latest) summary.value = data;
    } catch {
      if (id === latest) {
        summary.value = null;
        error.value = 'Could not load flight hours.';
      }
    } finally {
      if (id === latest) loading.value = false;
    }
  }

  return { range, summary, loading, error, load };
});
