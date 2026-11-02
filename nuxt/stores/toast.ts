import { defineStore } from 'pinia';

const LIFETIME_MS = 4000;

export type ToastKind = 'error' | 'success';

export const useToastStore = defineStore('toast', () => {
  const items = ref<{ id: number; message: string; kind: ToastKind }[]>([]);
  let nextId = 0;

  function show(message: string, kind: ToastKind) {
    const id = ++nextId;
    items.value.push({ id, message, kind });
    setTimeout(() => {
      items.value = items.value.filter((item: { id: number }) => item.id !== id);
    }, LIFETIME_MS);
  }

  return { items, show };
});
