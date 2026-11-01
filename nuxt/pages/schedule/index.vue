<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';
import { usePilotStore } from '~/stores/pilot';
import { useScheduleStore } from '~/stores/schedule';
import { monthTitle } from '~/utils/format';

const pilot = usePilotStore();
const schedule = useScheduleStore();

if (schedule.year === null && pilot.profile) {
  const [year, month] = pilot.profile.today.split('-').map(Number);
  void schedule.show(year, month);
} else if (schedule.year !== null && schedule.month !== null) {
  void schedule.show(schedule.year, schedule.month);
}

const title = computed(() =>
  schedule.year !== null && schedule.month !== null ? monthTitle(schedule.year, schedule.month) : '',
);
</script>

<template>
  <div class="schedule">
    <header class="month">
      <button type="button" class="icon-btn" aria-label="Previous month" @click="schedule.shift(-1)">
        <ChevronLeft :size="20" aria-hidden="true" />
      </button>
      <h1 class="month__title">{{ title }}</h1>
      <button type="button" class="icon-btn" aria-label="Next month" @click="schedule.shift(1)">
        <ChevronRight :size="20" aria-hidden="true" />
      </button>
    </header>

    <p v-if="schedule.error" role="alert" class="status-text">{{ schedule.error }}</p>
    <p v-else-if="!schedule.data" role="status" class="status-text">
      {{ pilot.error ?? 'Loading schedule…' }}
    </p>
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
