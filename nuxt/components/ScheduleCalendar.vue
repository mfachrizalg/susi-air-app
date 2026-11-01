<script setup lang="ts">
import type { components } from '~/types/api';
import { WEEKDAYS, monthWeeks } from '~/utils/format';

type ScheduleRow = components['schemas']['ScheduleDto'];

const props = defineProps<{
  year: number;
  month: number;
  schedules: ScheduleRow[];
  today: string | null;
}>();

// Blank cells get unique keys so Vue can track every cell of the grid.
const weeks = computed(() =>
  monthWeeks(props.year, props.month).map((week, row) =>
    week.map((date, column) => ({ key: date ?? `blank-${row}-${column}`, date })),
  ),
);

const rowsByDate = computed(
  () => new Map(props.schedules.map((row): [string, ScheduleRow] => [row.duty_date, row])),
);
</script>

<template>
  <div class="card calendar-card">
    <table class="calendar">
      <thead>
        <tr>
          <th v-for="day in WEEKDAYS" :key="day" scope="col" class="calendar__head">{{ day }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(week, index) in weeks" :key="index">
          <DayCell
            v-for="cell in week"
            :key="cell.key"
            :date="cell.date"
            :row="cell.date ? rowsByDate.get(cell.date) : undefined"
            :is-today="cell.date !== null && cell.date === today"
          />
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style lang="scss" scoped>
.calendar-card {
  padding: 12px;
}

.calendar {
  width: 100%;
  table-layout: fixed;
  border-collapse: separate;
  border-spacing: 4px;
}

.calendar__head {
  padding: 0 0 6px;
  font-size: 12px;
  font-weight: $font-weight-semibold;
  color: $color-text-secondary;
  text-align: center;
}
</style>
