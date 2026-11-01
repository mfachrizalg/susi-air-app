<script setup lang="ts">
import type { components } from '~/types/api';
import { formatHours, formatLimit } from '~/utils/format';

type Card = components['schemas']['SummaryCardDto'];

const props = defineProps<{ card: Card }>();

const percent = computed(() => Math.min(100, (props.card.hours / props.card.limit) * 100));

const over = computed(() => props.card.hours > props.card.limit);
</script>

<template>
  <article class="limit">
    <h3 class="limit__label">{{ card.label }}</h3>
    <p class="limit__value">
      <span class="limit__hours num">{{ formatHours(card.hours) }}</span>
      <span class="limit__of">of {{ formatLimit(card.limit) }} h</span>
    </p>
    <div
      class="limit__track"
      role="progressbar"
      :aria-label="`${card.label} hours`"
      aria-valuemin="0"
      :aria-valuemax="card.limit"
      :aria-valuenow="card.hours"
      :aria-valuetext="`${formatHours(card.hours)} of ${formatLimit(card.limit)} hours`"
    >
      <span class="limit__fill" :class="{ 'limit__fill--over': over }" :style="{ width: `${percent}%` }" />
    </div>
  </article>
</template>

<style lang="scss" scoped>
.limit {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 16px;
  background: $color-card;
  border-radius: $radius-card;
  box-shadow: $shadow-card;
}

.limit__label {
  margin: 0;
  font-size: 13px;
  font-weight: $font-weight-semibold;
  color: $color-text-secondary;
}

.limit__value {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  margin: 0;
  color: $color-primary;
}

.limit__hours {
  font-size: 26px;
  line-height: 1.1;
}

.limit__of {
  font-size: 13px;
  color: $color-text-secondary;
}

.limit__track {
  height: 8px;
  margin-top: 4px;
  border-radius: $radius-pill;
  background: #e5e7eb;
  overflow: hidden;
}

.limit__fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: $color-chart;
}

.limit__fill--over {
  background: $color-danger;
}
</style>
