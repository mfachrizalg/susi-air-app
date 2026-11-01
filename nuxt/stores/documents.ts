import { defineStore } from 'pinia';
import type { components } from '~/types/api';

type Documents = components['schemas']['DocumentsDto'];

export const useDocumentsStore = defineStore('documents', () => {
  const api = useNuxtApp().$api;
  const data = ref<Documents | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function load() {
    loading.value = true;
    error.value = null;
    try {
      data.value = await api<Documents>('/documents');
    } catch {
      data.value = null;
      error.value = 'Could not load your documents.';
    } finally {
      loading.value = false;
    }
  }

  return { data, loading, error, load };
});
