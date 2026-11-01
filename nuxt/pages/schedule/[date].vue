<script setup lang="ts">
import { ChevronLeft } from 'lucide-vue-next';
</script>

<template>
  <section class="detail">
    <h1 class="detail__title">Detail page coming soon</h1>
    <NuxtLink to="/schedule" class="detail__back">
      <ChevronLeft :size="18" aria-hidden="true" />
      <span>Back to schedule</span>
    </NuxtLink>
  </section>
</template>

<style lang="scss" scoped>
.detail {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  background: $color-card;
  border-radius: $radius-card;
  box-shadow: $shadow-card;
}

.detail__title {
  margin: 0;
  font-size: 20px;
  font-weight: $font-weight-bold;
  color: $color-primary;
}

.detail__back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: $font-weight-semibold;
  color: $color-primary;
}
</style>
