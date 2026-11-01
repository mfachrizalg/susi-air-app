<script setup lang="ts">
import type { components } from '~/types/api';

type LegendEntry = components['schemas']['LegendEntryDto'];

defineProps<{ entries: LegendEntry[] }>();
</script>

<template>
  <section class="legend" aria-labelledby="legend-title">
    <h2 id="legend-title" class="section-title">Legend</h2>
    <ul class="legend__list">
      <li v-for="entry in entries" :key="entry.code" class="legend__item">
        <span class="legend__swatch" :style="{ backgroundColor: entry.color }" aria-hidden="true" />
        <span class="legend__code">{{ entry.code }}</span>
        <span class="legend__label">{{ entry.label }}</span>
      </li>
    </ul>
  </section>
</template>

<style lang="scss" scoped>
.legend {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.legend__list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 16px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.legend__item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: $color-text;
}

.legend__swatch {
  flex-shrink: 0;
  width: 14px;
  height: 14px;
  border-radius: 4px;
}

.legend__code {
  font-weight: $font-weight-bold;
}

.legend__label {
  color: $color-text-secondary;
}
</style>
