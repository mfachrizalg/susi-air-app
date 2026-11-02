<script setup lang="ts">
import type { EChartsOption } from 'echarts';
import { BarChart } from 'echarts/charts';
import { GridComponent, MarkLineComponent, TooltipComponent } from 'echarts/components';
import { use } from 'echarts/core';
import { SVGRenderer } from 'echarts/renderers';
import VChart from 'vue-echarts';
import { useFlightHoursStore, type Range } from '~/stores/flightHours';
import { useToastStore } from '~/stores/toast';
import { dayOfMonth, formatDate, formatHours } from '~/utils/format';

use([BarChart, GridComponent, MarkLineComponent, TooltipComponent, SVGRenderer]);

const RANGES: { value: Range; label: string }[] = [
  { value: '1w', label: '1W' },
  { value: '1m', label: '1M' },
  { value: '3m', label: '3M' },
  { value: '6m', label: '6M' },
  { value: '1y', label: '1Y' },
];
const ACCENT = '#22C5E8';
const DANGER = '#E63757';
const INIT_OPTIONS = { renderer: 'svg' } as const;

const store = useFlightHoursStore();
const toast = useToastStore();

// Skeleton while a range loads. The previous summary stays in the store until the new one lands,
// so compare its range with the requested one.
const rangeLoading = computed(() => store.loading && store.summary?.range !== store.range);

async function pickRange(next: Range) {
  await store.load(next);
  if (store.error) toast.show(store.error, 'error');
}

const projectedFrom = computed(() => {
  const first = store.summary?.points.find((point) => point.projected);
  return first ? formatDate(first.date) : '';
});

const option = computed<EChartsOption>(() => {
  const summary = store.summary;
  if (!summary) return {};
  return {
    grid: { left: 40, right: 16, top: 24, bottom: 28 },
    tooltip: { trigger: 'axis', valueFormatter: (value) => `${value} h` },
    xAxis: {
      type: 'category',
      data: summary.points.map((point) => dayOfMonth(point.date)),
      axisTick: { show: false },
      axisLabel: { color: '#6B7280', fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: summary.max,
      axisLabel: { color: '#6B7280', fontSize: 11 },
      splitLine: { lineStyle: { color: '#EEF0F4' } },
    },
    series: [
      {
        type: 'bar',
        barMaxWidth: 16,
        data: summary.points.map((point) => ({
          value: point.hours,
          itemStyle: { color: ACCENT, opacity: point.projected ? 0.4 : 1 },
        })),
        markLine: {
          symbol: 'none',
          silent: true,
          lineStyle: { type: 'dashed', color: DANGER, width: 2 },
          label: { show: false },
          data: [{ yAxis: summary.limit }],
        },
      },
    ],
  };
});
</script>

<template>
  <section class="chart" aria-labelledby="trend-title">
    <div class="chart__head">
      <h3 id="trend-title" class="chart__title">Flight hours trend</h3>
      <div class="toggle" role="group" aria-label="Chart range">
        <button
          v-for="r in RANGES"
          :key="r.value"
          type="button"
          class="toggle__btn"
          :aria-pressed="String(store.range === r.value)"
          @click="pickRange(r.value)"
        >
          {{ r.label }}
        </button>
      </div>
    </div>

    <template v-if="rangeLoading">
      <span class="skeleton chart__canvas" aria-hidden="true" />
      <p role="status" class="sr-only">Loading flight hours trend…</p>
    </template>
    <template v-else-if="store.summary">
      <VChart :option="option" :init-options="INIT_OPTIONS" autoresize class="chart__canvas" />
      <ul class="chart__key">
        <li>
          <span class="chart__swatch chart__swatch--projected" aria-hidden="true" />
          Projected (planned hours) from {{ projectedFrom }}
        </li>
        <li>
          <span class="chart__line" aria-hidden="true" />
          Limit {{ store.summary.limit }} h
        </li>
      </ul>
      <div class="sr-only">
        <table>
          <caption>
            Rolling {{ store.summary.windowDays }}-day flight hours for each day shown. Limit
            {{ store.summary.limit }} h.
          </caption>
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Hours</th>
              <th scope="col">Projected</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="point in store.summary.points" :key="point.date">
              <td>{{ formatDate(point.date) }}</td>
              <td>{{ formatHours(point.hours) }}</td>
              <td>{{ point.projected ? 'Yes' : 'No' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </section>
</template>

<style lang="scss" scoped>
.chart {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: $color-card;
  border-radius: $radius-card;
  box-shadow: $shadow-card;
}

.chart__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.chart__title {
  margin: 0;
  font-size: 15px;
  font-weight: $font-weight-semibold;
  color: $color-primary;
}

.toggle {
  display: inline-flex;
  gap: 2px;
  padding: 3px;
  border-radius: $radius-pill;
  background: #eef0f4;
}

.toggle__btn {
  padding: 6px 10px;
  border: 0;
  border-radius: $radius-pill;
  background: transparent;
  color: $color-text-secondary;
  font: inherit;
  font-size: 13px;
  font-weight: $font-weight-semibold;
  cursor: pointer;

  &[aria-pressed='true'] {
    background: $color-primary;
    color: $color-card;
  }

  &:focus-visible {
    outline: 2px solid $color-primary;
    outline-offset: 2px;
  }
}

.chart__canvas {
  width: 100%;
  height: 260px;
}

.chart__key {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 16px;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 13px;
  color: $color-text-secondary;

  li {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.chart__swatch {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  background: $color-chart;
}

.chart__swatch--projected {
  opacity: 0.4;
}

.chart__line {
  width: 16px;
  border-top: 2px dashed $color-danger;
}
</style>
