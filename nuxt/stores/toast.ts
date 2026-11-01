import { defineStore } from 'pinia';

const LIFETIME_MS = 4000;

export const useToastStore = defineStore('toast', () => {
  const items = ref<{ id: number; message: string }[]>([]);
  let nextId = 0;

  function show(message: string) {
    const id = ++nextId;
    items.value.push({ id, message });
    setTimeout(() => {
      items.value = items.value.filter((item: { id: number }) => item.id !== id);
    }, LIFETIME_MS);
  }

  return { items, show };
});
