<script setup lang="ts">
import { Check } from 'lucide-vue-next';
import type { components } from '~/types/api';
import { dayOfMonth, formatDate } from '~/utils/format';

type ScheduleRow = components['schemas']['ScheduleDto'];

const props = defineProps<{ date: string | null; row?: ScheduleRow; isToday: boolean }>();

const NAVY = '#0e2138';
const WHITE = '#ffffff';

// WCAG relative luminance, for contrast text on base_color.
const channel = (hex: string, offset: number) => {
  const c = parseInt(hex.slice(offset, offset + 2), 16) / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const luminance = (hex: string) => 0.2126 * channel(hex, 1) + 0.7152 * channel(hex, 3) + 0.0722 * channel(hex, 5);
const contrast = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

// Navy or white text, whichever contrasts more with the cell colour.
const textOn = (hex: string) => {
  const bg = luminance(hex);
  return contrast(bg, luminance(NAVY)) >= contrast(bg, luminance(WHITE)) ? NAVY : WHITE;
};

const cellStyle = computed(() =>
  props.row ? { backgroundColor: props.row.base_color, color: textOn(props.row.base_color) } : undefined,
);

const linkLabel = computed(() => {
  if (!props.date) return '';
  if (!props.row) return `${formatDate(props.date)}, no duty`;
  const left = props.row.remaining === 0 ? 'all logged' : `${props.row.remaining} remaining`;
  return `${formatDate(props.date)}, ${props.row.label}, ${left}`;
});
</script>

<template>
  <td class="cell" :class="{ 'cell--today': isToday }">
    <NuxtLink
      v-if="date"
      class="cell__link"
      :to="`/schedule/${date}`"
      :style="cellStyle"
      :aria-label="linkLabel"
    >
      <span class="cell__day">{{ dayOfMonth(date) }}</span>
      <template v-if="row">
        <span class="cell__label">{{ row.label }}</span>
        <span class="cell__badge" aria-hidden="true">
          <Check v-if="row.remaining === 0" :size="12" />
          <template v-else>{{ row.remaining }}</template>
        </span>
      </template>
    </NuxtLink>
  </td>
</template>

<style lang="scss" scoped>
.cell {
  padding: 0;
  vertical-align: top;
}

.cell__link {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: 60px;
  padding: 6px;
  border-radius: 10px;
  background: $color-card;
  color: $color-primary;
  box-shadow: inset 0 0 0 1px #e5e7eb;
  font-size: 12px;
  text-decoration: none;

  &:focus-visible {
    outline: 3px solid $color-primary;
    outline-offset: 2px;
  }
}

// Today is outlined with a brand ring.
.cell--today .cell__link {
  box-shadow: 0 0 0 2px $color-card, 0 0 0 4px $color-brand;
}

.cell__day {
  font-size: 12px;
  font-weight: $font-weight-semibold;
  font-variant-numeric: tabular-nums;
}

.cell__label {
  overflow: hidden;
  font-size: 13px;
  font-weight: $font-weight-bold;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cell__badge {
  position: absolute;
  top: 4px;
  right: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: 9px;
  background: $color-card;
  color: $color-primary;
  font-size: 11px;
  font-weight: $font-weight-bold;
}

@media (max-width: 480px) {
  .cell__link {
    min-height: 52px;
    padding: 4px;
  }

  .cell__label {
    font-size: 10px;
  }

  .cell__badge {
    top: 2px;
    right: 2px;
    min-width: 16px;
    height: 16px;
    font-size: 10px;
  }
}
</style>
