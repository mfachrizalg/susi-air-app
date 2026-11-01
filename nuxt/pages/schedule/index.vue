<script setup lang="ts">
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-vue-next';
import { usePilotStore } from '~/stores/pilot';
import { useScheduleStore } from '~/stores/schedule';
import { useToastStore } from '~/stores/toast';
import { MONTHS, monthTitle } from '~/utils/format';

const pilot = usePilotStore();
const schedule = useScheduleStore();
const toast = useToastStore();

if (schedule.year === null && pilot.profile) {
  const [year, month] = pilot.profile.today.split('-').map(Number);
  void schedule.show(year, month);
} else if (schedule.year !== null && schedule.month !== null) {
  void schedule.show(schedule.year, schedule.month);
}

const title = computed(() =>
  schedule.year !== null && schedule.month !== null ? monthTitle(schedule.year, schedule.month) : '',
);

const picking = ref(false);
const pickerYear = ref(new Date().getFullYear());

function togglePicker() {
  picking.value = !picking.value;
  if (schedule.year !== null) pickerYear.value = schedule.year;
}

function pickMonth(month: number) {
  picking.value = false;
  void changed(schedule.show(pickerYear.value, month));
}

// Failed month loads toast too. The inline error stays on the page.
async function changed(request: Promise<void>) {
  await request;
  if (schedule.error) toast.show(schedule.error);
}
</script>

<template>
  <div class="schedule">
    <header class="month">
      <button type="button" class="icon-btn" aria-label="Previous month" @click="changed(schedule.shift(-1))">
        <ChevronLeft :size="20" aria-hidden="true" />
      </button>
      <h1 class="month__title">
        <button
          type="button"
          class="month__trigger"
          aria-controls="month-picker"
          :aria-expanded="String(picking)"
          @click="togglePicker"
        >
          {{ title }}
          <ChevronDown :size="18" aria-hidden="true" />
        </button>
      </h1>
      <button type="button" class="icon-btn" aria-label="Next month" @click="changed(schedule.shift(1))">
        <ChevronRight :size="20" aria-hidden="true" />
      </button>
    </header>

    <section v-if="picking" id="month-picker" class="card picker" aria-label="Choose month">
      <div class="picker__year">
        <button type="button" class="icon-btn" aria-label="Previous year" @click="pickerYear -= 1">
          <ChevronLeft :size="20" aria-hidden="true" />
        </button>
        <span class="picker__year-label num">{{ pickerYear }}</span>
        <button type="button" class="icon-btn" aria-label="Next year" @click="pickerYear += 1">
          <ChevronRight :size="20" aria-hidden="true" />
        </button>
      </div>
      <div class="picker__months">
        <button
          v-for="(name, index) in MONTHS"
          :key="name"
          type="button"
          class="picker__month"
          :aria-pressed="String(pickerYear === schedule.year && index + 1 === schedule.month)"
          @click="pickMonth(index + 1)"
        >
          {{ name.slice(0, 3) }}
        </button>
      </div>
    </section>

    <p v-if="schedule.error" role="alert" class="status-text">{{ schedule.error }}</p>
    <p v-else-if="!schedule.data && pilot.error" role="status" class="status-text">{{ pilot.error }}</p>
    <div v-else-if="!schedule.data" role="status">
      <span class="sr-only">Loading schedule…</span>
      <span class="skeleton skeleton--calendar" aria-hidden="true" />
    </div>
    <template v-else>
      <ScheduleCalendar
        v-if="schedule.year !== null && schedule.month !== null"
        :year="schedule.year"
        :month="schedule.month"
        :schedules="schedule.data.schedules"
        :today="pilot.profile?.today ?? null"
      />
      <p v-if="schedule.data.schedules.length === 0" class="status-text">No duties this month.</p>
      <DutyLegend :entries="schedule.data.legend" />
    </template>
  </div>
</template>

<style lang="scss" scoped>
.schedule {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.month {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.month__title {
  margin: 0;
  font-size: 22px;
  font-weight: $font-weight-bold;
  color: $color-primary;
}

.month__trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border: 0;
  border-radius: $radius-pill;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid $color-primary;
    outline-offset: 2px;
  }
}

.picker {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.picker__year {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.picker__year-label {
  font-size: 18px;
  font-weight: $font-weight-bold;
  color: $color-primary;
}

.picker__months {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.picker__month {
  padding: 10px 0;
  border: 0;
  border-radius: $radius-control;
  background: #eef0f4;
  color: $color-text-secondary;
  font: inherit;
  font-size: 14px;
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

.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: $color-card;
  color: $color-primary;
  box-shadow: $shadow-card;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid $color-primary;
    outline-offset: 2px;
  }
}
</style>
