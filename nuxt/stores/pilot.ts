import { defineStore } from 'pinia';
import type { components } from '~/types/api';

type PilotMe = components['schemas']['PilotMeDto'];

export const usePilotStore = defineStore('pilot', () => {
  const api = useNuxtApp().$api;
  const profile = ref<PilotMe | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  let pending: Promise<void> | null = null;

  async function fetchProfile() {
    loading.value = true;
    error.value = null;
    try {
      profile.value = await api<PilotMe>('/pilot/me');
    } catch (err) {
      error.value = 'Could not load your profile.';
      throw err;
    } finally {
      loading.value = false;
      pending = null;
    }
  }

  /** Fetches the profile once. Rejects on failure so the auth middleware can read the status. */
  function load() {
    if (profile.value) return Promise.resolve();
    pending ??= fetchProfile();
    return pending;
  }

  return { profile, loading, error, load };
});
