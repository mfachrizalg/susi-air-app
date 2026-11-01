<script setup lang="ts">
import { useToastStore } from '~/stores/toast';

const toasts = useToastStore();
</script>

<template>
  <div class="toaster" role="status" aria-live="polite">
    <p v-for="item in toasts.items" :key="item.id" class="toast">{{ item.message }}</p>
  </div>
</template>

<style lang="scss" scoped>
.toaster {
  position: fixed;
  top: 16px;
  left: 50%;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: min(calc(100% - 32px), 528px);
  transform: translateX(-50%);
  pointer-events: none;
}

.toast {
  margin: 0;
  padding: 12px 16px;
  border-radius: $radius-control;
  background: $color-primary;
  color: $color-card;
  box-shadow: $shadow-card;
  font-size: 14px;
  text-align: center;
}
</style>
